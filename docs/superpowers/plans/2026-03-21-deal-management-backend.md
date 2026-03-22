# Deal Management Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deal stages, document signing workflow, payments, and team members to the Django backend so the existing React Native frontend can use real API endpoints.

**Architecture:** The frontend (`new-client/`) already has complete screens for deal management, document signing, notifications, and admin user management — all typed against API endpoints that don't fully exist yet on the backend. This plan builds out the missing backend models, serializers, views, and routes to match what the frontend expects.

**Tech Stack:** Django 5.x, Django REST Framework, SQLite (dev), Python 3.x

**Key Insight:** The frontend `services/api.ts` already defines types for `DealStage`, `SigningStatus`, `Payment`, `DealTeamMember`, and has API client methods for `dealDocumentsApi.sign()`, `paymentsApi`, `dealTeamApi`, etc. The backend just needs to catch up.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `server/core/models.py:101-161` | Add `stage` to Deal, signing fields to DealDocument, `type`/`deal` to Notifications, fix DealTransaction stages, new Payment + DealTeamMember models |
| Create | `server/core/migrations/0004_*.py` | Auto-generated migration |
| Modify | `server/core/serializers.py:79-82` | Update DealDocumentSerializer, add PaymentSerializer + DealTeamMemberSerializer, update DealSerializer with nested relations |
| Modify | `server/core/views.py:45-74` | Fix DealViewSet, add DealDocumentViewSet (with sign/approve/reject), PaymentViewSet, DealTeamMemberViewSet |
| Modify | `server/core/urls.py:3,14` | Register 3 new router entries |

**Files NOT modified** (already complete):
- `server/accounts/views.py` — Google auth, status check, user list, approve/block all exist
- `server/accounts/urls.py` — All auth endpoints already registered
- `server/config/urls.py` — Already includes both `accounts.urls` and `core.urls`
- `new-client/services/api.ts` — Already has full types and API methods
- `new-client/app/(tabs)/deal.tsx` — Already has complete deal screen
- `new-client/app/(tabs)/notifications.tsx` — Already has notifications screen
- `new-client/app/sign-document.tsx` — Already has signature screen
- `new-client/app/(admin)/users.tsx` — Already has approve/block

---

### Task 1: Add `stage` field to Deal model

**Files:**
- Modify: `server/core/models.py:101-115`

- [ ] **Step 1: Write the failing test**

Create test in `server/core/tests.py` (append to existing tests):

```python
from django.test import TestCase
from core.models import Deal
from accounts.models import User

class DealStageTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@test.com', password='pass123')
        # Need a project and apartment for the deal
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Test Address 1')
        self.apartment = Apartment.objects.create(project=self.project, price=500000)

    def test_deal_has_stage_field_with_default(self):
        deal = Deal.objects.create(user=self.user, apartment=self.apartment, project=self.project)
        self.assertEqual(deal.stage, 'ATTACHMENT')

    def test_deal_stage_choices(self):
        deal = Deal.objects.create(user=self.user, apartment=self.apartment, project=self.project)
        deal.stage = 'CONTRACT'
        deal.save()
        deal.refresh_from_db()
        self.assertEqual(deal.stage, 'CONTRACT')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealStageTest -v2`
Expected: FAIL — `Deal` has no field named `stage`

- [ ] **Step 3: Add stage field to Deal model**

In `server/core/models.py`, add after line 111 (`status` field):

```python
    STAGE_CHOICES = (
        ('ATTACHMENT', 'הצמדה'),
        ('CONTRACT', 'חוזה'),
        ('SIGNING', 'חתימה'),
        ('CLOSING', 'סגירה'),
    )
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='ATTACHMENT')
```

- [ ] **Step 4: Create and run migration**

Run: `cd server && python manage.py makemigrations core && python manage.py migrate`

- [ ] **Step 5: Run test to verify it passes**

Run: `cd server && python manage.py test core.tests.DealStageTest -v2`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/core/models.py server/core/migrations/ server/core/tests.py
git commit -m "feat: add stage field to Deal model"
```

---

### Task 2: Fix DealTransaction stage choices

**Files:**
- Modify: `server/core/models.py:137-144`

- [ ] **Step 1: Write the failing test**

```python
class DealTransactionStageTest(TestCase):
    def test_transaction_stage_choices_match_deal_stages(self):
        from core.models import DealTransaction
        stage_keys = [c[0] for c in DealTransaction.STAGE_CHOICES]
        self.assertIn('ATTACHMENT', stage_keys)
        self.assertIn('CONTRACT', stage_keys)
        self.assertIn('SIGNING', stage_keys)
        self.assertIn('CLOSING', stage_keys)
        # Old choices should NOT be present
        self.assertNotIn('INITIAL', stage_keys)
        self.assertNotIn('IN_PROGRESS', stage_keys)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealTransactionStageTest -v2`
Expected: FAIL — old stage choices still present

- [ ] **Step 3: Replace DealTransaction STAGE_CHOICES**

In `server/core/models.py`, replace lines 138-144:

```python
    STAGE_CHOICES = (
        ('ATTACHMENT', 'הצמדה'),
        ('CONTRACT', 'חוזה'),
        ('SIGNING', 'חתימה'),
        ('CLOSING', 'סגירה'),
    )
```

- [ ] **Step 4: Create migration and run tests**

Run: `cd server && python manage.py makemigrations core && python manage.py migrate`
Then: `cd server && python manage.py test core.tests.DealTransactionStageTest -v2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/core/models.py server/core/migrations/
git commit -m "fix: align DealTransaction stage choices with Deal stages"
```

---

### Task 3: Add signing fields to DealDocument

**Files:**
- Modify: `server/core/models.py:118-134`

- [ ] **Step 1: Write the failing test**

```python
class DealDocumentSigningTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='signer@test.com', password='pass123')
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Sign Test Address')
        self.apartment = Apartment.objects.create(project=self.project, price=500000)
        self.deal = Deal.objects.create(user=self.user, apartment=self.apartment, project=self.project)

    def test_document_has_signing_status_default_none(self):
        from core.models import DealDocument
        doc = DealDocument.objects.create(deal=self.deal, filename='contract.pdf')
        self.assertEqual(doc.signing_status, 'NONE')

    def test_document_signing_status_can_be_set(self):
        from core.models import DealDocument
        doc = DealDocument.objects.create(deal=self.deal, filename='contract.pdf', signing_status='PENDING')
        doc.refresh_from_db()
        self.assertEqual(doc.signing_status, 'PENDING')

    def test_document_has_signed_at_nullable(self):
        from core.models import DealDocument
        doc = DealDocument.objects.create(deal=self.deal, filename='contract.pdf')
        self.assertIsNone(doc.signed_at)

    def test_document_has_uploaded_by_nullable(self):
        from core.models import DealDocument
        doc = DealDocument.objects.create(deal=self.deal, filename='contract.pdf', uploaded_by=self.user)
        self.assertEqual(doc.uploaded_by, self.user)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealDocumentSigningTest -v2`
Expected: FAIL — fields don't exist

- [ ] **Step 3: Add signing fields to DealDocument**

In `server/core/models.py`, add after line 131 (`uploaded_at` field):

```python
    SIGNING_STATUS_CHOICES = (
        ('NONE', 'No signature required'),
        ('PENDING', 'Pending signature'),
        ('SIGNED', 'Signed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    signing_status = models.CharField(max_length=10, choices=SIGNING_STATUS_CHOICES, default='NONE')
    signed_file = models.FileField(upload_to='signed_documents/', null=True, blank=True)
    signature_image = models.FileField(upload_to='signatures/', null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    uploaded_by = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='uploaded_documents'
    )
```

- [ ] **Step 4: Create migration and run tests**

Run: `cd server && python manage.py makemigrations core && python manage.py migrate`
Then: `cd server && python manage.py test core.tests.DealDocumentSigningTest -v2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/core/models.py server/core/migrations/
git commit -m "feat: add signing workflow fields to DealDocument"
```

---

### Task 4: Add `type` and `deal` fields to Notifications

**Files:**
- Modify: `server/core/models.py:91-99`

- [ ] **Step 1: Write the failing test**

```python
class NotificationFieldsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='notif@test.com', password='pass123')

    def test_notification_has_type_default_general(self):
        from core.models import Notifications
        notif = Notifications.objects.create(user=self.user, title='Test', message='Body')
        self.assertEqual(notif.type, 'GENERAL')

    def test_notification_has_deal_nullable(self):
        from core.models import Notifications
        notif = Notifications.objects.create(user=self.user, title='Test', message='Body')
        self.assertIsNone(notif.deal)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.NotificationFieldsTest -v2`
Expected: FAIL

- [ ] **Step 3: Add type and deal fields to Notifications**

In `server/core/models.py`, add after the `is_read` field (line 95):

```python
    TYPE_CHOICES = (
        ('DOCUMENT', 'Document'),
        ('PAYMENT', 'Payment'),
        ('STAGE', 'Stage'),
        ('GENERAL', 'General'),
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='GENERAL')
    deal = models.ForeignKey('Deal', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
```

- [ ] **Step 4: Create migration and run tests**

Run: `cd server && python manage.py makemigrations core && python manage.py migrate`
Then: `cd server && python manage.py test core.tests.NotificationFieldsTest -v2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/core/models.py server/core/migrations/
git commit -m "feat: add type and deal fields to Notifications"
```

---

### Task 5: Add Payment model

**Files:**
- Modify: `server/core/models.py` (append after DealDocument)

- [ ] **Step 1: Write the failing test**

```python
class PaymentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='pay@test.com', password='pass123')
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Payment Test Address')
        self.apartment = Apartment.objects.create(project=self.project, price=1000000)
        self.deal = Deal.objects.create(user=self.user, apartment=self.apartment, project=self.project)

    def test_payment_creation(self):
        from core.models import Payment
        from datetime import date
        payment = Payment.objects.create(
            deal=self.deal,
            payment_number=1,
            due_date=date(2026, 6, 1),
            amount=250000,
            description='תשלום ראשון',
        )
        self.assertEqual(payment.status, 'upcoming')
        self.assertIsNone(payment.paid_at)

    def test_payment_ordering_by_due_date(self):
        from core.models import Payment
        from datetime import date
        Payment.objects.create(deal=self.deal, payment_number=2, due_date=date(2026, 7, 1), amount=250000)
        Payment.objects.create(deal=self.deal, payment_number=1, due_date=date(2026, 6, 1), amount=250000)
        payments = list(Payment.objects.filter(deal=self.deal))
        self.assertEqual(payments[0].payment_number, 1)
        self.assertEqual(payments[1].payment_number, 2)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.PaymentModelTest -v2`
Expected: FAIL — `Payment` model does not exist

- [ ] **Step 3: Add Payment model**

Append to `server/core/models.py`:

```python
class Payment(models.Model):
    STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    )
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='payments')
    payment_number = models.IntegerField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='upcoming')
    description = models.CharField(max_length=255, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"Payment {self.payment_number} - Deal {self.deal.id}"
```

- [ ] **Step 4: Create migration and run tests**

Run: `cd server && python manage.py makemigrations core && python manage.py migrate`
Then: `cd server && python manage.py test core.tests.PaymentModelTest -v2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/core/models.py server/core/migrations/
git commit -m "feat: add Payment model"
```

---

### Task 6: Add DealTeamMember model

**Files:**
- Modify: `server/core/models.py` (append after Payment)

- [ ] **Step 1: Write the failing test**

```python
class DealTeamMemberModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='team@test.com', password='pass123')
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Team Test Address')
        self.apartment = Apartment.objects.create(project=self.project, price=500000)
        self.deal = Deal.objects.create(user=self.user, apartment=self.apartment, project=self.project)

    def test_team_member_creation(self):
        from core.models import DealTeamMember
        member = DealTeamMember.objects.create(
            deal=self.deal,
            role='LAWYER',
            name='אבי כהן',
            phone='050-1234567',
            email='avi@law.com',
        )
        self.assertEqual(member.get_role_display(), 'Lawyer')

    def test_team_member_role_choices(self):
        from core.models import DealTeamMember
        member = DealTeamMember.objects.create(
            deal=self.deal, role='DEAL_MANAGER', name='דני', phone='050-9876543'
        )
        self.assertEqual(member.get_role_display(), 'Deal Manager')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealTeamMemberModelTest -v2`
Expected: FAIL

- [ ] **Step 3: Add DealTeamMember model**

Append to `server/core/models.py`:

```python
class DealTeamMember(models.Model):
    ROLE_CHOICES = (
        ('DEAL_MANAGER', 'Deal Manager'),
        ('LAWYER', 'Lawyer'),
    )
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='team_members')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_role_display()} - {self.name}"
```

- [ ] **Step 4: Create migration and run tests**

Run: `cd server && python manage.py makemigrations core && python manage.py migrate`
Then: `cd server && python manage.py test core.tests.DealTeamMemberModelTest -v2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/core/models.py server/core/migrations/
git commit -m "feat: add DealTeamMember model"
```

---

### Task 7: Update serializers

**Files:**
- Modify: `server/core/serializers.py`

- [ ] **Step 1: Update imports in serializers.py**

In `server/core/serializers.py`, update line 2:

```python
from .models import Project, Apartment, Deal, DealDocument, DealTransaction, Notifications, UserFavorites, ApartmentDocument, ActivityLog, ProjectDocument, Payment, DealTeamMember
```

- [ ] **Step 2: Update DealDocumentSerializer to include new fields**

Replace the existing `DealDocumentSerializer` (lines 79-82):

```python
class DealDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealDocument
        fields = [
            'id', 'deal', 'filename', 'file', 'file_type',
            'signing_status', 'signed_file', 'signature_image',
            'signed_at', 'uploaded_by', 'uploaded_at'
        ]
```

- [ ] **Step 3: Add PaymentSerializer and DealTeamMemberSerializer**

Add after `DealDocumentSerializer`:

```python
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class DealTeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealTeamMember
        fields = '__all__'
```

- [ ] **Step 4: Update DealSerializer to include nested payments and team_members**

In the `DealSerializer` class (line 106), add two new nested fields after `transactions`:

```python
    payments = PaymentSerializer(many=True, read_only=True)
    team_members = DealTeamMemberSerializer(many=True, read_only=True)
```

- [ ] **Step 5: Update NotificationsSerializer to include new fields**

In `NotificationsSerializer`, update the `fields` list to add `type` and `deal`:

```python
    class Meta:
        model = Notifications
        fields = ['id', 'user', 'user_id', 'title', 'message', 'is_read', 'type', 'deal', 'created_at']
```

- [ ] **Step 6: Run all tests to verify nothing is broken**

Run: `cd server && python manage.py test -v2`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add server/core/serializers.py
git commit -m "feat: update serializers for payments, team members, and document signing"
```

---

### Task 8: Add DealDocumentViewSet with sign/approve/reject actions

**Files:**
- Modify: `server/core/views.py`

- [ ] **Step 1: Write the failing test**

Add to `server/core/tests.py`:

```python
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token

class DealDocumentAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email='admin@test.com', password='pass123')
        self.admin.is_staff = True
        self.admin.save()
        self.client_user = User.objects.create_user(email='client@test.com', password='pass123')
        from core.models import Project, Apartment, DealDocument
        self.project = Project.objects.create(project_address='Doc API Test')
        self.apartment = Apartment.objects.create(project=self.project, price=500000)
        self.deal = Deal.objects.create(user=self.client_user, apartment=self.apartment, project=self.project)
        self.doc = DealDocument.objects.create(
            deal=self.deal, filename='contract.pdf', signing_status='PENDING'
        )
        self.admin_token = Token.objects.create(user=self.admin)
        self.client_token = Token.objects.create(user=self.client_user)

    def test_client_can_sign_own_document(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        response = self.client.post(f'/api/deal-documents/{self.doc.id}/sign/')
        self.assertEqual(response.status_code, 200)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.signing_status, 'SIGNED')

    def test_client_cannot_sign_others_document(self):
        other_user = User.objects.create_user(email='other@test.com', password='pass123')
        other_token = Token.objects.create(user=other_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {other_token.key}')
        response = self.client.post(f'/api/deal-documents/{self.doc.id}/sign/')
        self.assertEqual(response.status_code, 403)

    def test_admin_can_approve_document(self):
        self.doc.signing_status = 'SIGNED'
        self.doc.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.post(f'/api/deal-documents/{self.doc.id}/approve/')
        self.assertEqual(response.status_code, 200)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.signing_status, 'APPROVED')

    def test_admin_can_reject_document(self):
        self.doc.signing_status = 'SIGNED'
        self.doc.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.post(f'/api/deal-documents/{self.doc.id}/reject/')
        self.assertEqual(response.status_code, 200)
        self.doc.refresh_from_db()
        self.assertEqual(self.doc.signing_status, 'REJECTED')

    def test_non_admin_cannot_approve(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        response = self.client.post(f'/api/deal-documents/{self.doc.id}/approve/')
        self.assertEqual(response.status_code, 403)

    def test_approve_advances_deal_stage_when_no_pending_docs(self):
        self.doc.signing_status = 'SIGNED'
        self.doc.save()
        self.deal.stage = 'ATTACHMENT'
        self.deal.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        self.client.post(f'/api/deal-documents/{self.doc.id}/approve/')
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.stage, 'CONTRACT')

    def test_list_documents_by_deal_id(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        response = self.client.get(f'/api/deal-documents/?deal_id={self.deal.id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealDocumentAPITest -v2`
Expected: FAIL — no route for `/api/deal-documents/`

- [ ] **Step 3: Update views.py imports**

In `server/core/views.py`, update the imports (lines 1-7). Note: only import the models/serializers that exist at this point. PaymentViewSet and DealTeamMemberViewSet will be added in Tasks 9-10.

```python
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Apartment, Deal, DealDocument, DealTransaction, Notifications, UserFavorites, ApartmentDocument, ActivityLog, ProjectDocument, Payment, DealTeamMember
from .serializers import ProjectSerializer, ApartmentSerializer, DealSerializer, DealDocumentSerializer, DealTransactionSerializer, NotificationsSerializer, UserFavoritesSerializer, ApartmentDocumentSerializer, ActivityLogSerializer, ProjectDocumentSerializer, PaymentSerializer, DealTeamMemberSerializer
from rest_framework import parsers
from django.utils import timezone
```

- [ ] **Step 4: Add DealDocumentViewSet**

Add after `DealViewSet` in `server/core/views.py`:

```python
class DealDocumentViewSet(viewsets.ModelViewSet):
    queryset = DealDocument.objects.all()
    serializer_class = DealDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        deal_id = self.request.query_params.get('deal_id')
        if deal_id:
            return DealDocument.objects.filter(deal__id=deal_id)
        return DealDocument.objects.all()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='sign')
    def sign(self, request, pk=None):
        doc = self.get_object()
        if doc.deal.user != request.user:
            return Response({'error': 'permission_denied'}, status=403)
        if doc.signing_status == 'APPROVED':
            return Response({'error': 'already_approved'}, status=400)
        doc.signed_file = request.FILES.get('signed_file')
        doc.signature_image = request.FILES.get('signature_image')
        doc.signing_status = 'SIGNED'
        doc.signed_at = timezone.now()
        doc.save()
        return Response({'id': doc.id, 'signing_status': doc.signing_status})

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'permission_denied'}, status=403)
        doc = self.get_object()
        doc.signing_status = 'APPROVED'
        doc.save()
        deal = doc.deal
        has_pending = deal.documents.filter(signing_status='PENDING').exists()
        if not has_pending:
            stages = ['ATTACHMENT', 'CONTRACT', 'SIGNING', 'CLOSING']
            current_idx = stages.index(deal.stage) if deal.stage in stages else 0
            if current_idx < 3:
                deal.stage = stages[current_idx + 1]
                deal.save()
        return Response({'id': doc.id, 'signing_status': doc.signing_status})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'permission_denied'}, status=403)
        doc = self.get_object()
        doc.signing_status = 'REJECTED'
        doc.signed_file = None
        doc.signature_image = None
        doc.save()
        return Response({'id': doc.id, 'signing_status': doc.signing_status})
```

- [ ] **Step 5: Register route in urls.py**

In `server/core/urls.py`, update import (line 3) to add `DealDocumentViewSet` only (PaymentViewSet and DealTeamMemberViewSet will be added in Tasks 9-10):

```python
from .views import ProjectViewSet, ApartmentViewSet, DealViewSet, DealTransactionViewSet, NotificationsViewSet, UserFavoritesViewSet as UserFavorites, ApartmentDocumentViewSet, ActivityLogViewSet, ProjectDocumentViewSet, DealDocumentViewSet
```

Add after line 14:

```python
router.register(r'deal-documents', DealDocumentViewSet)
```

- [ ] **Step 6: Run tests**

Run: `cd server && python manage.py test core.tests.DealDocumentAPITest -v2`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add server/core/views.py server/core/urls.py server/core/tests.py
git commit -m "feat: add DealDocumentViewSet with sign/approve/reject workflow"
```

---

### Task 9: Add PaymentViewSet

**Files:**
- Modify: `server/core/views.py`
- Modify: `server/core/urls.py`

- [ ] **Step 1: Write the failing test**

```python
class PaymentAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email='admin-pay@test.com', password='pass123')
        self.admin.is_staff = True
        self.admin.save()
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Pay API Test')
        self.apartment = Apartment.objects.create(project=self.project, price=1000000)
        self.deal = Deal.objects.create(user=self.admin, apartment=self.apartment, project=self.project)
        self.token = Token.objects.create(user=self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_create_payment(self):
        response = self.client.post('/api/payments/', {
            'deal': self.deal.id,
            'payment_number': 1,
            'due_date': '2026-06-01',
            'amount': '250000.00',
            'description': 'תשלום ראשון',
        })
        self.assertEqual(response.status_code, 201)

    def test_list_payments_by_deal(self):
        from core.models import Payment
        from datetime import date
        Payment.objects.create(deal=self.deal, payment_number=1, due_date=date(2026, 6, 1), amount=250000)
        response = self.client.get(f'/api/payments/?deal_id={self.deal.id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.PaymentAPITest -v2`
Expected: FAIL

- [ ] **Step 3: Add PaymentViewSet**

Add to `server/core/views.py`:

```python
class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        deal_id = self.request.query_params.get('deal_id')
        if deal_id:
            return Payment.objects.filter(deal__id=deal_id)
        return Payment.objects.all()
```

- [ ] **Step 4: Register route**

Update import in `server/core/urls.py` to add `PaymentViewSet`:

```python
from .views import ProjectViewSet, ApartmentViewSet, DealViewSet, DealTransactionViewSet, NotificationsViewSet, UserFavoritesViewSet as UserFavorites, ApartmentDocumentViewSet, ActivityLogViewSet, ProjectDocumentViewSet, DealDocumentViewSet, PaymentViewSet
```

Add after the `deal-documents` registration:

```python
router.register(r'payments', PaymentViewSet, basename='payments')
```

- [ ] **Step 5: Run tests**

Run: `cd server && python manage.py test core.tests.PaymentAPITest -v2`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/core/views.py server/core/urls.py server/core/tests.py
git commit -m "feat: add PaymentViewSet"
```

---

### Task 10: Add DealTeamMemberViewSet

**Files:**
- Modify: `server/core/views.py`
- Modify: `server/core/urls.py`

- [ ] **Step 1: Write the failing test**

```python
class DealTeamAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(email='admin-team@test.com', password='pass123')
        self.admin.is_staff = True
        self.admin.save()
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Team API Test')
        self.apartment = Apartment.objects.create(project=self.project, price=500000)
        self.deal = Deal.objects.create(user=self.admin, apartment=self.apartment, project=self.project)
        self.token = Token.objects.create(user=self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_add_team_member(self):
        response = self.client.post('/api/deal-team/', {
            'deal': self.deal.id,
            'role': 'LAWYER',
            'name': 'אבי כהן',
            'phone': '050-1234567',
            'email': 'avi@law.com',
        })
        self.assertEqual(response.status_code, 201)

    def test_list_team_by_deal(self):
        from core.models import DealTeamMember
        DealTeamMember.objects.create(deal=self.deal, role='DEAL_MANAGER', name='דני', phone='050-9876543')
        response = self.client.get(f'/api/deal-team/?deal_id={self.deal.id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealTeamAPITest -v2`
Expected: FAIL

- [ ] **Step 3: Add DealTeamMemberViewSet**

Add to `server/core/views.py`:

```python
class DealTeamMemberViewSet(viewsets.ModelViewSet):
    serializer_class = DealTeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        deal_id = self.request.query_params.get('deal_id')
        if deal_id:
            return DealTeamMember.objects.filter(deal__id=deal_id)
        return DealTeamMember.objects.all()
```

- [ ] **Step 4: Register route**

Update import in `server/core/urls.py` to add `DealTeamMemberViewSet`:

```python
from .views import ProjectViewSet, ApartmentViewSet, DealViewSet, DealTransactionViewSet, NotificationsViewSet, UserFavoritesViewSet as UserFavorites, ApartmentDocumentViewSet, ActivityLogViewSet, ProjectDocumentViewSet, DealDocumentViewSet, PaymentViewSet, DealTeamMemberViewSet
```

Add after the `payments` registration:

```python
router.register(r'deal-team', DealTeamMemberViewSet, basename='deal-team')
```

- [ ] **Step 5: Run tests**

Run: `cd server && python manage.py test core.tests.DealTeamAPITest -v2`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/core/views.py server/core/urls.py server/core/tests.py
git commit -m "feat: add DealTeamMemberViewSet"
```

---

### Task 11: Fix DealViewSet's buggy update_progress action

**Files:**
- Modify: `server/core/views.py:50-74`

The existing `update_progress` action references `deal.current_stage` which doesn't exist — it should use `deal.stage`.

- [ ] **Step 1: Write the failing test**

```python
class DealProgressAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='progress@test.com', password='pass123')
        from core.models import Project, Apartment
        self.project = Project.objects.create(project_address='Progress Test')
        self.apartment = Apartment.objects.create(project=self.project, price=500000)
        self.deal = Deal.objects.create(user=self.user, apartment=self.apartment, project=self.project)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_update_progress_changes_stage(self):
        response = self.client.post(f'/api/deals/{self.deal.id}/progress/', {
            'current_stage': 'CONTRACT',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.deal.refresh_from_db()
        self.assertEqual(self.deal.stage, 'CONTRACT')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server && python manage.py test core.tests.DealProgressAPITest -v2`
Expected: FAIL — AttributeError on `deal.current_stage`

- [ ] **Step 3: Fix DealViewSet.update_progress**

Replace the `update_progress` method in `DealViewSet` (lines 50-74):

```python
    @action(detail=True, methods=['post'], url_path='progress')
    def update_progress(self, request, pk=None):
        deal = self.get_object()
        current_stage = request.data.get('current_stage')
        new_status = request.data.get('status')
        if current_stage:
            deal.stage = current_stage
        if new_status:
            deal.status = new_status
        deal.save()
        return Response(DealSerializer(deal).data)
```

- [ ] **Step 4: Run tests**

Run: `cd server && python manage.py test core.tests.DealProgressAPITest -v2`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/core/views.py server/core/tests.py
git commit -m "fix: DealViewSet.update_progress uses deal.stage instead of nonexistent current_stage"
```

---

### Task 12: Install google-auth and run full test suite

**Files:** None (dependency management)

- [ ] **Step 1: Install google-auth**

Run: `cd server && pip install google-auth`

- [ ] **Step 2: Run full test suite**

Run: `cd server && python manage.py test -v2`
Expected: All tests PASS

- [ ] **Step 3: Commit if any dependency files changed**

If there's a `requirements.txt`, update it:

```bash
cd server && pip freeze > requirements.txt
git add server/requirements.txt
git commit -m "chore: add google-auth dependency"
```

---

### Task 13: Install missing frontend dependencies

**Files:**
- Modify: `new-client/package.json`

- [ ] **Step 1: Install packages**

```bash
cd new-client
npx expo install expo-secure-store
npx expo install react-native-signature-canvas
```

Note: `expo-auth-session`, `expo-crypto`, `expo-web-browser`, `expo-document-picker`, `expo-file-system` — check if already installed before adding.

- [ ] **Step 2: Verify the app starts**

Run: `cd new-client && npx expo start` (verify no dependency errors on startup)

- [ ] **Step 3: Commit**

```bash
git add new-client/package.json new-client/package-lock.json
git commit -m "chore: install expo-secure-store and react-native-signature-canvas"
```

---

## Verification

After all tasks are complete, verify end-to-end:

1. **Start the Django server:**
   ```bash
   cd server && python manage.py runserver
   ```

2. **Run full backend test suite:**
   ```bash
   cd server && python manage.py test -v2
   ```

3. **Verify API endpoints manually (using curl or httpie):**
   ```bash
   # Create a test user and get token
   curl -X POST http://127.0.0.1:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@test.com","password":"Admin123!"}'

   # List deal documents
   curl http://127.0.0.1:8000/api/deal-documents/ \
     -H "Authorization: Token <token>"

   # List payments
   curl http://127.0.0.1:8000/api/payments/ \
     -H "Authorization: Token <token>"

   # List team members
   curl http://127.0.0.1:8000/api/deal-team/ \
     -H "Authorization: Token <token>"
   ```

4. **Start Expo dev server:**
   ```bash
   cd new-client && npx expo start
   ```

5. **Test the full flow on device/simulator:**
   - Login → land on home or pending screen
   - Admin approves user → client refreshes → sees main app
   - Admin creates deal → client sees it in deal tab
   - Admin uploads document with `signing_status=PENDING` → client sees sign button
   - Client signs → admin approves → deal stage advances
   - Client sees payments, team contacts, notifications
