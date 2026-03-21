"""
Step 4: User receives notification about new document
=====================================================
When admin uploads a contract, the investor should be notified.
Currently, notifications must be created manually (no automatic trigger).
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import Notifications


class TestNotificationOnDocumentUpload(BaseE2ETestCase):
    """Notification flow when a document is uploaded to a deal."""

    def setUp(self):
        super().setUp()
        self.deal = self.create_deal()

    # -----------------------------------------------------------
    # GAP: No automatic notification on document upload
    # -----------------------------------------------------------

    def test_no_auto_notification_on_doc_upload_GAP(self):
        """
        [GAP] Uploading a DealDocument does NOT create a Notification.
        EXPECTED BEHAVIOR: When admin uploads a contract to a deal,
                          the deal's user should receive a Notification
                          automatically (e.g., via a Django signal).
        CURRENT BEHAVIOR:  No Notification is created. The signal in
                          core/signals.py only creates ActivityLog entries,
                          not Notifications.
        """
        initial_count = Notifications.objects.filter(user=self.user).count()
        self.create_document(self.deal, filename='contract.pdf')
        self.assertEqual(
            Notifications.objects.filter(user=self.user).count(),
            initial_count,  # unchanged -- no auto notification
        )

    # -----------------------------------------------------------
    # Manual notification flow (currently works)
    # -----------------------------------------------------------

    def test_admin_can_manually_create_notification(self):
        """Admin POSTs to /api/notifications/ to notify the user."""
        response = self.admin_client.post('/api/notifications/', {
            'user_id': str(self.user.id),
            'title': 'חוזה חדש זמין',
            'message': 'חוזה חדש הועלה לעסקה שלך. אנא היכנס לצפייה וחתימה.',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        notif = Notifications.objects.get(user=self.user)
        self.assertEqual(notif.title, 'חוזה חדש זמין')
        self.assertFalse(notif.is_read)

    def test_notification_defaults_unread(self):
        """New notifications have is_read=False."""
        notif = self.create_notification()
        self.assertFalse(notif.is_read)

    def test_user_sees_only_own_notifications(self):
        """User receives only their own notifications."""
        self.create_notification(user=self.user, title='For investor')
        self.create_notification(user=self.other_user, title='For other')
        self.create_notification(user=self.admin_user, title='For admin')

        response = self.user_client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'For investor')

    def test_user_marks_notification_as_read(self):
        """User can mark their notification as read."""
        notif = self.create_notification(user=self.user)
        response = self.user_client.post(f'/api/notifications/{notif.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_notification_ordering_newest_first(self):
        """Notifications are returned newest first."""
        self.create_notification(user=self.user, title='First')
        self.create_notification(user=self.user, title='Second')
        self.create_notification(user=self.user, title='Third')

        response = self.user_client.get('/api/notifications/')
        titles = [n['title'] for n in response.data]
        self.assertEqual(titles, ['Third', 'Second', 'First'])
