"""
Step 5: User views/downloads the contract
==========================================
After receiving a notification, the user opens their deal
and sees the contract document ready for review.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import Deal


class TestUserDocumentAccess(BaseE2ETestCase):
    """User can access documents attached to their deal."""

    def setUp(self):
        super().setUp()
        self.deal = self.create_deal()
        self.doc = self.create_document(
            self.deal, filename='contract_for_signing.pdf', file_type='CONTRACT',
        )

    def test_deal_detail_includes_documents(self):
        """GET /api/deals/{id}/ includes the document in 'documents' list."""
        response = self.admin_client.get(f'/api/deals/{self.deal.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['documents']), 1)
        doc_data = response.data['documents'][0]
        self.assertEqual(doc_data['filename'], 'contract_for_signing.pdf')
        self.assertEqual(doc_data['file_type'], 'CONTRACT')
        self.assertIn('file', doc_data)

    def test_user_can_see_deal_detail(self):
        """User can GET their deal and see the contract document."""
        response = self.user_client.get(f'/api/deals/{self.deal.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['documents']), 1)
        self.assertEqual(response.data['documents'][0]['filename'], 'contract_for_signing.pdf')

    def test_deal_detail_includes_nested_apartment(self):
        """Deal detail includes apartment with price and address."""
        response = self.user_client.get(f'/api/deals/{self.deal.id}/')
        apt = response.data['apartment']
        self.assertEqual(float(apt['price']), 2500000.00)
        self.assertEqual(apt['apartment_specific_address'], 'Building A, Apt 12')

    def test_deal_detail_includes_nested_user(self):
        """Deal detail includes user info (name, email)."""
        response = self.admin_client.get(f'/api/deals/{self.deal.id}/')
        user_data = response.data['user']
        self.assertEqual(user_data['full_name'], 'Investor User')
        self.assertEqual(user_data['email'], 'investor@test.com')

    # -----------------------------------------------------------
    # GAP: Deals are not scoped to the requesting user
    # -----------------------------------------------------------

    def test_user_can_see_all_deals_GAP(self):
        """
        [GAP] User can see ALL deals in the system, not just their own.
        EXPECTED BEHAVIOR: GET /api/deals/ should return only deals
                          belonging to the requesting user (unless admin).
        CURRENT BEHAVIOR:  Returns all deals regardless of user.
        """
        # Create a deal for other_user
        other_deal = self.create_deal(user=self.other_user)

        response = self.user_client.get('/api/deals/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # User sees both deals -- this is the GAP
        self.assertEqual(len(response.data), 2)

    def test_user_can_access_other_users_deal_detail_GAP(self):
        """
        [GAP] User can access deal details of another user's deal.
        EXPECTED BEHAVIOR: Should return 403 or 404 for other user's deal.
        CURRENT BEHAVIOR:  Returns 200 with full deal details.
        """
        other_deal = self.create_deal(user=self.other_user)

        response = self.user_client.get(f'/api/deals/{other_deal.id}/')
        # Currently succeeds -- this is the GAP
        self.assertEqual(response.status_code, status.HTTP_200_OK)
