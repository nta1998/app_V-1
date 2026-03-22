from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ApartmentViewSet, DealViewSet, DealTransactionViewSet, NotificationsViewSet, UserFavoritesViewSet as UserFavorites, ApartmentDocumentViewSet, ActivityLogViewSet, ProjectDocumentViewSet, DealDocumentViewSet, PaymentViewSet, DealTeamMemberViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'apartments', ApartmentViewSet)
router.register(r'deals', DealViewSet)
router.register(r'deal-transactions', DealTransactionViewSet)
router.register(r'notifications', NotificationsViewSet, basename='notifications')
router.register(r'favorites', UserFavorites, basename='favorites')
router.register(r'apartment-documents', ApartmentDocumentViewSet)
router.register(r'project-documents', ProjectDocumentViewSet)
router.register(r'activity-feed', ActivityLogViewSet, basename='activity-feed')
router.register(r'deal-documents', DealDocumentViewSet)
router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'deal-team', DealTeamMemberViewSet, basename='deal-team')

urlpatterns = [
    path('', include(router.urls)),
]
