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

    def test_no_deal_document_api_endpoint_GAP(self):
        """
        [GAP] There is no registered API endpoint for DealDocument.
        EXPECTED BEHAVIOR: POST /api/deal-documents/ should allow admin
                          to upload files with multipart form data.
        CURRENT BEHAVIOR:  The URL does not exist (404).

        The DealDocumentSerializer exists but no ViewSet is registered
        in core/urls.py.
        """
        response = self.admin_client.get('/api/deal-documents/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # -----------------------------------------------------------
    # GAP: progress endpoint is broken
    # -----------------------------------------------------------

    def test_progress_action_field_mismatch_GAP(self):
        """
        [GAP] POST /api/deals/{id}/progress/ uses nonexistent model fields.
        EXPECTED BEHAVIOR: Should update deal stage and create documents.
        CURRENT BEHAVIOR:  Crashes with AttributeError because:
          - Deal model has no 'current_stage' field (only 'status')
          - DealDocument has no 'document_name', 'file_url', 'stage', 'status'
            (it has 'filename', 'file', 'file_type')

        The progress endpoint needs to be rewritten to match actual model fields.
        """
        response = self.admin_client.post(
            f'/api/deals/{self.deal.id}/progress/',
            {'current_stage': 'IN_PROGRESS', 'status': 'Active'},
            format='json',
        )
        # This should fail with 500 because deal.current_stage doesn't exist
        self.assertIn(response.status_code, [
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            status.HTTP_400_BAD_REQUEST,
        ])
