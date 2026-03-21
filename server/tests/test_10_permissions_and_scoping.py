"""
Permissions & Data Scoping
==========================
Cross-cutting tests verifying authentication requirements,
admin-only actions, and user-level data isolation.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import Deal, DealTransaction, ActivityLog


class TestAuthenticationRequired(BaseE2ETestCase):
    """All endpoints require authentication."""

    def test_unauthenticated_blocked_from_all_endpoints(self):
        """Anonymous requests get 401 on every endpoint."""
        endpoints = [
            '/api/projects/',
            '/api/apartments/',
            '/api/deals/',
            '/api/deal-transactions/',
            '/api/notifications/',
            '/api/favorites/',
            '/api/activity-feed/',
        ]
        for endpoint in endpoints:
            response = self.anon_client.get(endpoint)
            self.assertEqual(
                response.status_code,
                status.HTTP_401_UNAUTHORIZED,
                f'Expected 401 for anonymous GET {endpoint}',
            )


class TestDataScoping(BaseE2ETestCase):
    """Data should be scoped per user where appropriate."""

    def test_notifications_scoped_to_user(self):
        """Users see only their own notifications (already works)."""
        self.create_notification(user=self.user, title='Mine')
        self.create_notification(user=self.other_user, title='Theirs')

        response = self.user_client.get('/api/notifications/')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Mine')

    def test_favorites_scoped_to_user(self):
        """Users see only their own favorites (already works)."""
        from core.models import UserFavorites
        UserFavorites.objects.create(user=self.user, apartment=self.apartment)
        UserFavorites.objects.create(user=self.other_user, apartment=self.apartment)

        response = self.user_client.get('/api/favorites/')
        self.assertEqual(len(response.data), 1)

    # -----------------------------------------------------------
    # GAP: Deals not scoped to user
    # -----------------------------------------------------------

    def test_deals_not_scoped_to_user_GAP(self):
        """
        [GAP] Regular user sees ALL deals in the system.
        EXPECTED: User should see only deals where deal.user == request.user.
        CURRENT:  DealViewSet.queryset = Deal.objects.all() for everyone.
        """
        self.create_deal(user=self.user)
        self.create_deal(user=self.other_user)

        response = self.user_client.get('/api/deals/')
        # User sees both deals -- GAP
        self.assertEqual(len(response.data), 2)

    # -----------------------------------------------------------
    # GAP: Activity feed not scoped
    # -----------------------------------------------------------

    def test_activity_feed_visible_to_all_users_GAP(self):
        """
        [GAP] Regular user can see ALL activity logs in the system.
        EXPECTED: Non-admin users should see only activities related
                 to their own deals.
        CURRENT:  ActivityLogViewSet returns all activities for everyone.
        """
        self.create_deal(user=self.user)  # creates DEAL_CREATE log
        self.create_deal(user=self.other_user)  # creates another DEAL_CREATE log

        response = self.user_client.get('/api/activity-feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # User sees activities for all deals -- GAP
        deal_creates = [
            a for a in response.data if a['activity_type'] == 'DEAL_CREATE'
        ]
        self.assertEqual(len(deal_creates), 2)


class TestAdminOnlyActions(BaseE2ETestCase):
    """Actions that should be restricted to admin users."""

    # -----------------------------------------------------------
    # GAP: No admin-only permission enforcement
    # -----------------------------------------------------------

    def test_regular_user_can_create_deal_GAP(self):
        """
        [GAP] Any authenticated user can create a deal.
        EXPECTED: Only admin/staff should create deals.
        """
        response = self.user_client.post('/api/deals/', {
            'user_id': str(self.other_user.id),
            'apartment_id': self.apartment.id,
            'project_id': self.project.id,
        })
        # Currently succeeds -- GAP
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_regular_user_can_create_transaction_GAP(self):
        """
        [GAP] Any authenticated user can create a DealTransaction.
        EXPECTED: Only admin/staff should manage deal transactions.
        """
        deal = self.create_deal()
        response = self.user_client.post('/api/deal-transactions/', {
            'deal_id': deal.id,
            'stage': 'IN_PROGRESS',
            'status': 'WAITING_CLIENT',
        })
        # Currently succeeds -- GAP
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_regular_user_can_delete_deal_GAP(self):
        """
        [GAP] Any authenticated user can delete ANY deal.
        EXPECTED: Only admin should delete deals. Users should not
                 be able to delete deals, especially others' deals.
        """
        deal = self.create_deal(user=self.other_user)
        response = self.user_client.delete(f'/api/deals/{deal.id}/')
        # Currently succeeds -- GAP
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_regular_user_can_delete_project_GAP(self):
        """
        [GAP] Any authenticated user can delete a project.
        EXPECTED: Only admin should manage projects.
        """
        response = self.user_client.delete(f'/api/projects/{self.project.id}/')
        # Currently succeeds -- GAP
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_admin_can_list_all_users(self):
        """Admin can GET /api/auth/users/ to see all users."""
        response = self.admin_client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # admin + user + other_user

    def test_regular_user_can_list_all_users_GAP(self):
        """
        [GAP] Regular user can see all users in the system.
        EXPECTED: User list should be admin-only.
        """
        response = self.user_client.get('/api/auth/users/')
        # Currently succeeds -- GAP
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
