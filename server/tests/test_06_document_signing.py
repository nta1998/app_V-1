"""
Step 6: User signs document and uploads it back
================================================
The user reviews the contract, signs it, and uploads the
signed version back to the deal.
"""
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import DealDocument, ActivityLog


class TestUserDocumentSigning(BaseE2ETestCase):
    """User uploads a signed document back to their deal."""

    def setUp(self):
        super().setUp()
        self.deal = self.create_deal()
        # Admin uploaded the original contract
        self.original_doc = self.create_document(
            self.deal, filename='contract_unsigned.pdf', file_type='CONTRACT',
        )

    # -----------------------------------------------------------
    # GAP: No API endpoint for user to upload signed document
    # -----------------------------------------------------------

    def test_no_upload_endpoint_for_user_GAP(self):
        """
        [GAP] There is no endpoint allowing a user to upload a signed document.
        EXPECTED BEHAVIOR: User should be able to POST a signed file to an
                          endpoint like /api/deal-documents/ with their deal ID.
        CURRENT BEHAVIOR:  /api/deal-documents/ does not exist (404).

        The DealDocument model supports this (has user FK and file FileField),
        but no ViewSet is registered.
        """
        signed_file = SimpleUploadedFile(
            'contract_signed.pdf',
            b'%PDF-1.4 signed content',
            content_type='application/pdf',
        )
        response = self.user_client.post('/api/deal-documents/', {
            'deal': self.deal.id,
            'filename': 'contract_signed.pdf',
            'file': signed_file,
            'file_type': 'CONTRACT',
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # -----------------------------------------------------------
    # Model-level proof: signing WORKS at the ORM level
    # -----------------------------------------------------------

    def test_user_can_create_signed_document_via_model(self):
        """
        At the model level, a user can create a DealDocument
        representing a signed contract. This proves the data model
        supports the signing flow -- only the API layer is missing.
        """
        signed_file = SimpleUploadedFile(
            'contract_signed.pdf',
            b'%PDF-1.4 signed content',
            content_type='application/pdf',
        )
        signed_doc = DealDocument.objects.create(
            deal=self.deal,
            user=self.user,
            filename='contract_signed.pdf',
            file=signed_file,
            file_type='CONTRACT',
        )
        self.assertEqual(signed_doc.user, self.user)
        self.assertEqual(signed_doc.deal, self.deal)
        self.assertTrue(signed_doc.file)
        # Deal now has 2 documents: original + signed
        self.assertEqual(self.deal.documents.count(), 2)

    def test_signed_document_triggers_activity_log(self):
        """Signed document upload creates DOC_UPLOAD activity."""
        initial_count = ActivityLog.objects.filter(activity_type='DOC_UPLOAD').count()
        DealDocument.objects.create(
            deal=self.deal,
            user=self.user,
            filename='signed_contract.pdf',
            file_type='CONTRACT',
        )
        self.assertEqual(
            ActivityLog.objects.filter(activity_type='DOC_UPLOAD').count(),
            initial_count + 1,
        )
        log = ActivityLog.objects.filter(activity_type='DOC_UPLOAD').latest('created_at')
        self.assertIn('signed_contract.pdf', log.description)

    def test_original_and_signed_docs_coexist(self):
        """Both original (admin) and signed (user) docs exist on the deal."""
        DealDocument.objects.create(
            deal=self.deal,
            user=self.user,
            filename='contract_signed.pdf',
            file_type='CONTRACT',
        )
        docs = self.deal.documents.all()
        self.assertEqual(docs.count(), 2)
        uploaders = set(doc.user for doc in docs)
        self.assertIn(self.admin_user, uploaders)  # original
        self.assertIn(self.user, uploaders)  # signed
