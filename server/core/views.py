from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Apartment, Deal, DealDocument, DealTransaction, Notifications, UserFavorites, ApartmentDocument, ActivityLog, ProjectDocument
from .serializers import ProjectSerializer, ApartmentSerializer, DealSerializer, DealTransactionSerializer, NotificationsSerializer, UserFavoritesSerializer, ApartmentDocumentSerializer, ActivityLogSerializer, ProjectDocumentSerializer
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
        if project_id is not None:
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
        
        # Update stage and status if provided
        current_stage = request.data.get('current_stage')
        status = request.data.get('status')
        if current_stage:
            deal.current_stage = current_stage
        if status:
            deal.status = status
        deal.save()
        
        # Handle documents
        documents_data = request.data.get('documents', [])
        for doc_data in documents_data:
            DealDocument.objects.create(
                deal=deal,
                document_name=doc_data.get('document_name'),
                file_url=doc_data.get('file_url'),
                stage=doc_data.get('stage', deal.current_stage),
                status='Uploaded'
            )
            
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
        if deal_id is not None:
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
