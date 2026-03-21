"""
Step 7: Admin receives the signed document
===========================================
After the user signs and uploads, admin can see the signed
document in the deal details and in the activity feed.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import DealDocument, ActivityLog


class TestAdminReceivesSignedDocument(BaseE2ETestCase):
    """Admin views the signed document and activity after user upload."""

    def setUp(self):
        super().setUp()
        self.deal = self.create_deal()
        # Admin uploaded original
        self.original_doc = self.create_document(
            self.deal, filename='contract_original.pdf', file_type='CONTRACT',
        )
        # User uploaded signed version (via model -- no API yet)
        self.signed_doc = DealDocument.objects.create(
            deal=self.deal,
            user=self.user,
            filename='contract_signed.pdf',
            file_type='CONTRACT',
        )

    def test_admin_sees_both_documents_on_deal(self):
        """Admin GET /api/deals/{id}/ shows both original and signed docs."""
        response = self.admin_client.get(f'/api/deals/{self.deal.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['documents']), 2)
        filenames = [d['filename'] for d in response.data['documents']]
        self.assertIn('contract_original.pdf', filenames)
        self.assertIn('contract_signed.pdf', filenames)

    def test_activity_feed_shows_both_uploads(self):
        """Activity feed contains DOC_UPLOAD entries for both documents."""
        response = self.admin_client.get('/api/activity-feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        doc_uploads = [
            a for a in response.data
            if a['activity_type'] == 'DOC_UPLOAD'
        ]
        self.assertEqual(len(doc_uploads), 2)
        descriptions = [a['description'] for a in doc_uploads]
        self.assertTrue(
            any('contract_original.pdf' in d for d in descriptions)
        )
        self.assertTrue(
            any('contract_signed.pdf' in d for d in descriptions)
        )

    def test_activity_feed_is_read_only(self):
        """POST to activity feed should be rejected."""
        response = self.admin_client.post('/api/activity-feed/', {
            'activity_type': 'DEAL_CREATE',
            'description': 'Should not work',
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_activity_feed_limited_to_20(self):
        """Activity feed returns at most 20 entries."""
        # Already have some from setUp signals, add more
        for i in range(25):
            ActivityLog.objects.create(
                user=self.user,
                activity_type='DOC_UPLOAD',
                description=f'Extra activity {i}',
            )
        response = self.admin_client.get('/api/activity-feed/')
        self.assertLessEqual(len(response.data), 20)

    def test_activity_feed_shows_user_name(self):
        """Activity feed entries include the user's name."""
        response = self.admin_client.get('/api/activity-feed/')
        for entry in response.data:
            self.assertIn('user_name', entry)
