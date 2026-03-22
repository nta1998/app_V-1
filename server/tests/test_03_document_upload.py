"""
Step 3: Admin uploads contract document
========================================
After creating a deal, admin uploads a contract (DealDocument)
for the investor to review and sign.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import DealDocument, ActivityLog


class TestAdminDocumentUpload(BaseE2ETestCase):
    """Admin uploads a contract document to a deal."""

    def setUp(self):
        super().setUp()
        self.deal = self.create_deal()

    # -----------------------------------------------------------
    # Model-level (works)
    # -----------------------------------------------------------

    def test_admin_creates_deal_document_via_model(self):
        """DealDocument can be created at the model level with correct fields."""
        doc = self.create_document(self.deal, filename='contract_v1.pdf', file_type='CONTRACT')
        self.assertEqual(doc.filename, 'contract_v1.pdf')
        self.assertEqual(doc.file_type, 'CONTRACT')
        self.assertEqual(doc.deal, self.deal)
        self.assertEqual(doc.user, self.admin_user)
        self.assertTrue(doc.file)  # file field is populated

    def test_document_upload_triggers_activity_log(self):
        """Creating a DealDocument triggers ActivityLog with DOC_UPLOAD."""
        initial_count = ActivityLog.objects.filter(activity_type='DOC_UPLOAD').count()
        self.create_document(self.deal, filename='contract.pdf')
        self.assertEqual(
            ActivityLog.objects.filter(activity_type='DOC_UPLOAD').count(),
            initial_count + 1,
        )
        log = ActivityLog.objects.filter(activity_type='DOC_UPLOAD').latest('created_at')
        self.assertIn('contract.pdf', log.description)

    def test_deal_document_file_types(self):
        """Each file type has a Hebrew display name."""
        type_map = {
            'ID': 'תעודת זהות',
            'CONTRACT': 'חוזה',
            'PAYMENT': 'אישור תשלום',
            'OTHER': 'אחר',
        }
        for code, display in type_map.items():
            doc = DealDocument.objects.create(
                deal=self.deal, filename=f'test_{code}.pdf', file_type=code,
            )
            self.assertEqual(doc.get_file_type_display(), display)

    def test_multiple_documents_per_deal(self):
        """A deal can have multiple documents."""
        self.create_document(self.deal, filename='id_card.pdf', file_type='ID')
        self.create_document(self.deal, filename='contract.pdf', file_type='CONTRACT')
        self.create_document(self.deal, filename='payment.pdf', file_type='PAYMENT')
        self.assertEqual(self.deal.documents.count(), 3)

    # -----------------------------------------------------------
    # GAP: No API endpoint for DealDocument CRUD
    # -----------------------------------------------------------

    def test_deal_document_api_endpoint_exists(self):
        """The /api/deal-documents/ endpoint exists and supports POST to create a document."""
        from django.core.files.uploadedfile import SimpleUploadedFile

        pdf_file = SimpleUploadedFile(
            'contract_v2.pdf',
            b'%PDF-1.4 test content',
            content_type='application/pdf',
        )
        response = self.admin_client.post('/api/deal-documents/', {
            'deal': self.deal.id,
            'filename': 'contract_v2.pdf',
            'file': pdf_file,
            'file_type': 'CONTRACT',
        }, format='multipart')
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_201_CREATED,
        ])

    # -----------------------------------------------------------
    # GAP: progress endpoint is broken
    # -----------------------------------------------------------

    def test_progress_endpoint_works(self):
        """POST /api/deals/{id}/progress/ updates deal stage and status."""
        response = self.admin_client.post(
            f'/api/deals/{self.deal.id}/progress/',
            {'current_stage': 'CONTRACT', 'status': 'Active'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.stage, 'CONTRACT')
