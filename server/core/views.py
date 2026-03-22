from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Project, Apartment, Deal, DealDocument, DealTransaction, Notifications, UserFavorites, ApartmentDocument, ActivityLog, ProjectDocument, Payment, DealTeamMember
from .serializers import ProjectSerializer, ApartmentSerializer, DealSerializer, DealTransactionSerializer, NotificationsSerializer, UserFavoritesSerializer, ApartmentDocumentSerializer, ActivityLogSerializer, ProjectDocumentSerializer, DealDocumentSerializer, PaymentSerializer, DealTeamMemberSerializer
from rest_framework import parsers

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class ApartmentViewSet(viewsets.ModelViewSet):
    queryset = Apartment.objects.all()
    serializer_class = ApartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Apartment.objects.all()
        project_id = self.request.query_params.get('project_id', None)
        if project_id:
            queryset = queryset.filter(project__id=project_id)
        return queryset

class ApartmentDocumentViewSet(viewsets.ModelViewSet):
    queryset = ApartmentDocument.objects.all()
    serializer_class = ApartmentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def perform_create(self, serializer):
        doc = serializer.save()
        # If this is a main image, update the apartment
        if doc.doc_type == 'MAIN':
            doc.apartment.main_image_doc = doc
            doc.apartment.save()

class ProjectDocumentViewSet(viewsets.ModelViewSet):
    queryset = ProjectDocument.objects.all()
    serializer_class = ProjectDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class NotificationsViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notifications.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

class UserFavoritesViewSet(viewsets.ModelViewSet):
    serializer_class = UserFavoritesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserFavorites.objects.filter(user=self.request.user).order_by('-added_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DealTransactionViewSet(viewsets.ModelViewSet):
    queryset = DealTransaction.objects.all()
    serializer_class = DealTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = DealTransaction.objects.all()
        deal_id = self.request.query_params.get('deal_id', None)
        if deal_id:
            queryset = queryset.filter(deal__id=deal_id)
        return queryset.order_by('-request_date')

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return all activities for admins, or create logic to filter
        # For now, let's assume this feed is for admins seeing everything, 
        # or we could filter by visibility. 
        # The prompt implies a general feed of "what's new" in the system (or for the user?).
        # The original React component looks like an Admin feed seeing user updates.
        return ActivityLog.objects.all().order_by('-created_at')[:20]  # Limit to activity stream


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


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        deal_id = self.request.query_params.get('deal_id')
        if deal_id:
            return Payment.objects.filter(deal__id=deal_id)
        return Payment.objects.all()


class DealTeamMemberViewSet(viewsets.ModelViewSet):
    serializer_class = DealTeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        deal_id = self.request.query_params.get('deal_id')
        if deal_id:
            return DealTeamMember.objects.filter(deal__id=deal_id)
        return DealTeamMember.objects.all()
