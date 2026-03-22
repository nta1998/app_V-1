"""
Step 8: Deal progresses to the next stage
==========================================
After document signing, the deal moves through stages:
ATTACHMENT → CONTRACT → SIGNING → CLOSING
Each stage is tracked via DealTransaction records.
"""
from rest_framework import status

from .base import BaseE2ETestCase
from core.models import DealTransaction, ActivityLog, Deal


class TestDealProgression(BaseE2ETestCase):
    """Deal advances through stages via DealTransaction records."""

    def setUp(self):
        super().setUp()
        self.deal = self.create_deal()

    # -----------------------------------------------------------
    # Transaction CRUD (works)
    # -----------------------------------------------------------

    def test_create_transaction_initial(self):
        """Admin creates ATTACHMENT stage transaction."""
        response = self.admin_client.post('/api/deal-transactions/', {
            'deal_id': self.deal.id,
            'stage': 'ATTACHMENT',
            'status': 'WAITING_CLIENT',
            'description': 'Waiting for client to review contract',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['stage'], 'ATTACHMENT')
        self.assertIn('stage_display', response.data)

    def test_create_transaction_contract(self):
        """Transaction with CONTRACT stage."""
        response = self.admin_client.post('/api/deal-transactions/', {
            'deal_id': self.deal.id,
            'stage': 'CONTRACT',
            'status': 'WAITING_CLIENT',
            'description': 'Client reviewing documents',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['stage_display'], 'חוזה')

    def test_transaction_creation_triggers_activity_log(self):
        """Creating a DealTransaction creates STATUS_CHANGE activity."""
        initial_count = ActivityLog.objects.filter(activity_type='STATUS_CHANGE').count()
        DealTransaction.objects.create(
            deal=self.deal, stage='CONTRACT', status='WAITING_CLIENT',
        )
        self.assertEqual(
            ActivityLog.objects.filter(activity_type='STATUS_CHANGE').count(),
            initial_count + 1,
        )

    def test_update_transaction_to_done(self):
        """Marking transaction as DONE triggers activity log with 'הושלמה'."""
        tx = DealTransaction.objects.create(
            deal=self.deal, stage='CONTRACT', status='WAITING_CLIENT',
        )
        initial_count = ActivityLog.objects.count()
        tx.status = 'DONE'
        tx.save()
        log = ActivityLog.objects.latest('created_at')
        self.assertIn('הושלמה', log.description)

    def test_transaction_with_document_link(self):
        """Transaction can reference a specific DealDocument."""
        doc = self.create_document(self.deal, filename='signed.pdf')
        response = self.admin_client.post('/api/deal-transactions/', {
            'deal_id': self.deal.id,
            'document_id': doc.id,
            'stage': 'CLOSING',
            'status': 'DONE',
            'description': 'Contract signed and verified',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_filter_transactions_by_deal(self):
        """?deal_id=X returns only transactions for that deal."""
        other_deal = self.create_deal(user=self.other_user)
        DealTransaction.objects.create(deal=self.deal, stage='ATTACHMENT')
        DealTransaction.objects.create(deal=other_deal, stage='CONTRACT')

        response = self.admin_client.get(
            f'/api/deal-transactions/?deal_id={self.deal.id}'
        )
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['stage'], 'ATTACHMENT')

    def test_deal_status_update_to_completed(self):
        """Admin can update deal status to Completed."""
        response = self.admin_client.patch(
            f'/api/deals/{self.deal.id}/',
            {'status': 'Completed'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.status, 'Completed')

    def test_full_stage_sequence(self):
        """Create transactions for all stages in sequence."""
        stages = ['ATTACHMENT', 'CONTRACT', 'SIGNING', 'CLOSING']
        for stage in stages:
            tx = DealTransaction.objects.create(
                deal=self.deal,
                stage=stage,
                status='DONE' if stage == 'CLOSING' else 'WAITING_CLIENT',
            )
        self.assertEqual(self.deal.transactions.count(), 4)

    # -----------------------------------------------------------
    # GAP: No automatic stage advancement
    # -----------------------------------------------------------

    def test_no_automatic_stage_advancement_GAP(self):
        """
        [GAP] Uploading a signed document does not auto-advance the deal stage.
        EXPECTED BEHAVIOR: When a user uploads a signed contract, the system
                          should automatically create or update a DealTransaction
                          moving the deal to the next stage.
        CURRENT BEHAVIOR:  No automatic progression. Admin must manually
                          create DealTransactions.
        """
        # Create initial transaction
        DealTransaction.objects.create(
            deal=self.deal, stage='ATTACHMENT', status='WAITING_CLIENT',
        )
        # Simulate user uploading signed document
        self.create_document(self.deal, filename='signed.pdf', user=self.user)
        # Transaction should still be ATTACHMENT -- no auto-advance
        tx = self.deal.transactions.first()
        self.assertEqual(tx.stage, 'ATTACHMENT')
        self.assertEqual(tx.status, 'WAITING_CLIENT')

    # -----------------------------------------------------------
    # GAP: progress endpoint is broken
    # -----------------------------------------------------------

    def test_progress_endpoint_works(self):
        """POST /api/deals/{id}/progress/ updates deal stage successfully."""
        response = self.admin_client.post(
            f'/api/deals/{self.deal.id}/progress/',
            {'current_stage': 'CLOSING', 'status': 'Completed'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.stage, 'CLOSING')
        self.assertEqual(self.deal.status, 'Completed')
