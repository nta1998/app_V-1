"""
Step 1-8: Complete End-to-End Investment Flow
=============================================
A single sequential test that walks through the entire user story:

1. User browses available properties
2. Admin assigns apartment to user (creates Deal)
3. Admin uploads contract document
4. User receives notification (manual -- GAP: should be automatic)
5. User views deal and sees the contract
6. User signs and uploads the document back (via model -- GAP: no API)
7. Admin views signed document and activity feed
8. Admin advances deal to next stage

Each step includes assertions AND comments marking where the flow
works via API vs. workaround via model.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import (
    Deal, DealDocument, DealTransaction,
    Notifications, ActivityLog,
)


class TestEndToEndInvestmentFlow(BaseE2ETestCase):
    """Complete investment flow from property browsing to deal completion."""

    def test_complete_flow_steps_1_through_8(self):
        """Full sequential E2E test of the investment workflow."""

        # ============================================================
        # STEP 1: User browses available properties
        # ============================================================
        # [VIA API] -- works
        response = self.user_client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        project_id = response.data[0]['id']

        response = self.user_client.get(f'/api/apartments/?project_id={project_id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        apartment_data = response.data[0]
        apartment_id = apartment_data['id']
        self.assertEqual(float(apartment_data['price']), 2500000.00)

        # ============================================================
        # STEP 2: Admin assigns apartment to user (creates Deal)
        # ============================================================
        # [VIA API] -- works
        response = self.admin_client.post('/api/deals/', {
            'user_id': str(self.user.id),
            'apartment_id': apartment_id,
            'project_id': project_id,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        deal_id = response.data['id']
        deal = Deal.objects.get(id=deal_id)
        self.assertEqual(deal.status, 'Active')
        self.assertEqual(deal.user, self.user)

        # Verify ActivityLog for deal creation
        log = ActivityLog.objects.filter(activity_type='DEAL_CREATE').latest('created_at')
        self.assertIn('פתח תיק חדש', log.description)

        # Admin creates initial transaction stage
        response = self.admin_client.post('/api/deal-transactions/', {
            'deal_id': deal_id,
            'stage': 'ATTACHMENT',
            'status': 'WAITING_CLIENT',
            'description': 'Waiting for contract review',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # ============================================================
        # STEP 3: Admin uploads contract document
        # ============================================================
        # [VIA MODEL] -- GAP: no DealDocument API endpoint
        contract_doc = self.create_document(
            deal, filename='purchase_contract_v1.pdf', file_type='CONTRACT',
        )
        self.assertEqual(contract_doc.file_type, 'CONTRACT')

        # Verify ActivityLog for document upload
        doc_log = ActivityLog.objects.filter(activity_type='DOC_UPLOAD').latest('created_at')
        self.assertIn('purchase_contract_v1.pdf', doc_log.description)

        # ============================================================
        # STEP 4: User receives notification
        # ============================================================
        # [VIA API - MANUAL] -- GAP: should be automatic on doc upload
        response = self.admin_client.post('/api/notifications/', {
            'user_id': str(self.user.id),
            'title': 'חוזה חדש זמין לחתימה',
            'message': f'חוזה רכישה חדש הועלה לעסקה שלך. אנא היכנס לצפייה ולחתימה.',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # User checks notifications
        response = self.user_client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'חוזה חדש זמין לחתימה')
        self.assertFalse(response.data[0]['is_read'])

        # User marks notification as read
        notif_id = response.data[0]['id']
        response = self.user_client.post(f'/api/notifications/{notif_id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # ============================================================
        # STEP 5: User views deal and sees the contract
        # ============================================================
        # [VIA API] -- works
        response = self.user_client.get(f'/api/deals/{deal_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['documents']), 1)
        self.assertEqual(
            response.data['documents'][0]['filename'],
            'purchase_contract_v1.pdf',
        )
        # User can see who they're working with
        self.assertIn('user', response.data)
        self.assertIn('apartment', response.data)

        # ============================================================
        # STEP 6: User signs and uploads document back
        # ============================================================
        # [VIA MODEL] -- GAP: no upload endpoint for users
        signed_doc = DealDocument.objects.create(
            deal=deal,
            user=self.user,
            filename='purchase_contract_v1_SIGNED.pdf',
            file_type='CONTRACT',
        )
        self.assertEqual(signed_doc.user, self.user)

        # Verify activity log records the upload
        signed_log = ActivityLog.objects.filter(
            activity_type='DOC_UPLOAD'
        ).latest('created_at')
        self.assertIn('SIGNED', signed_log.description)

        # ============================================================
        # STEP 7: Admin views signed document and activity feed
        # ============================================================
        # [VIA API] -- works
        response = self.admin_client.get(f'/api/deals/{deal_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['documents']), 2)
        filenames = [d['filename'] for d in response.data['documents']]
        self.assertIn('purchase_contract_v1.pdf', filenames)
        self.assertIn('purchase_contract_v1_SIGNED.pdf', filenames)

        # Admin checks activity feed
        response = self.admin_client.get('/api/activity-feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        activity_types = [a['activity_type'] for a in response.data]
        self.assertIn('DEAL_CREATE', activity_types)
        self.assertIn('DOC_UPLOAD', activity_types)
        self.assertIn('STATUS_CHANGE', activity_types)

        # ============================================================
        # STEP 8: Admin advances deal to next stage
        # ============================================================
        # [VIA API] -- works (manual transaction creation)
        # Mark initial transaction as done
        tx = deal.transactions.first()
        tx.status = 'DONE'
        tx.save()

        # Create next stage transaction
        response = self.admin_client.post('/api/deal-transactions/', {
            'deal_id': deal_id,
            'stage': 'CONTRACT',
            'status': 'WAITING_APPROVAL',
            'description': 'Contract signed, awaiting legal approval',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Continue to completion
        response = self.admin_client.post('/api/deal-transactions/', {
            'deal_id': deal_id,
            'stage': 'CLOSING',
            'status': 'DONE',
            'description': 'Deal fully completed',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Update deal status to Completed
        response = self.admin_client.patch(
            f'/api/deals/{deal_id}/',
            {'status': 'Completed'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        deal.refresh_from_db()
        self.assertEqual(deal.status, 'Completed')

        # ============================================================
        # FINAL VERIFICATION: Everything is consistent
        # ============================================================
        self.assertEqual(deal.documents.count(), 2)
        self.assertEqual(deal.transactions.count(), 3)  # ATTACHMENT + CONTRACT + CLOSING
        self.assertEqual(Notifications.objects.filter(user=self.user).count(), 1)
        self.assertTrue(
            ActivityLog.objects.filter(deal=deal).count() >= 5
            # DEAL_CREATE + 2x DOC_UPLOAD + 3x STATUS_CHANGE (create) + completion
        )
