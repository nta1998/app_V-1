"""
Step 2: Deal Creation (Admin assigns apartment to user)
=======================================================
Admin creates a Deal linking a registered user to a specific apartment,
starting the investment process.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import Deal, ActivityLog


class TestDealCreation(BaseE2ETestCase):
    """Admin assigns an apartment to a user by creating a Deal."""

    def test_admin_creates_deal_for_user(self):
        """Admin POSTs to /api/deals/ with user, apartment, project."""
        response = self.admin_client.post('/api/deals/', {
            'user_id': str(self.user.id),
            'apartment_id': self.apartment.id,
            'project_id': self.project.id,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deal.objects.count(), 1)
        deal = Deal.objects.first()
        self.assertEqual(deal.user, self.user)
        self.assertEqual(deal.apartment, self.apartment)
        self.assertEqual(deal.project, self.project)

    def test_deal_default_status_is_active(self):
        """New deals default to 'Active' status."""
        deal = self.create_deal()
        self.assertEqual(deal.status, 'Active')

    def test_deal_creation_returns_nested_data(self):
        """Response includes nested user, apartment, project, documents, transactions."""
        response = self.admin_client.post('/api/deals/', {
            'user_id': str(self.user.id),
            'apartment_id': self.apartment.id,
            'project_id': self.project.id,
        })
        data = response.data
        self.assertIn('user', data)
        self.assertIn('apartment', data)
        self.assertIn('project', data)
        self.assertIn('documents', data)
        self.assertIn('transactions', data)
        self.assertEqual(data['documents'], [])
        self.assertEqual(data['transactions'], [])

    def test_deal_creation_triggers_activity_log(self):
        """Creating a deal triggers an ActivityLog with type DEAL_CREATE."""
        initial_count = ActivityLog.objects.count()
        self.create_deal()
        self.assertEqual(ActivityLog.objects.count(), initial_count + 1)
        log = ActivityLog.objects.latest('created_at')
        self.assertEqual(log.activity_type, 'DEAL_CREATE')
        self.assertIn('פתח תיק חדש', log.description)

    def test_deal_creation_without_user_fails(self):
        """POST without user_id returns 400."""
        response = self.admin_client.post('/api/deals/', {
            'apartment_id': self.apartment.id,
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_deal_creation_without_apartment_fails(self):
        """POST without apartment_id returns 400."""
        response = self.admin_client.post('/api/deals/', {
            'user_id': str(self.user.id),
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -----------------------------------------------------------
    # GAP: No admin-only restriction on deal creation
    # -----------------------------------------------------------

    def test_regular_user_can_create_deal_GAP(self):
        """
        [GAP] Regular (non-staff) user can currently create deals.
        EXPECTED BEHAVIOR: Only admin/staff should create deals.
        CURRENT BEHAVIOR:  Any authenticated user can create a deal (201).

        This test documents the gap. Once fixed, this test should
        assert 403 instead of 201.
        """
        response = self.user_client.post('/api/deals/', {
            'user_id': str(self.other_user.id),
            'apartment_id': self.apartment.id,
            'project_id': self.project.id,
        })
        # Currently succeeds -- this is the GAP
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
