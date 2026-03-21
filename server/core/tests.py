import json
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import (
    Project, Apartment, ApartmentDocument, Deal, DealDocument,
    DealTransaction, Notifications, UserFavorites, ActivityLog, ProjectDocument
)

User = get_user_model()


# ========================================================================
# MODEL TESTS
# ========================================================================

class ProjectModelTests(TestCase):
    @patch('core.models.Nominatim')
    def test_create_project(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        project = Project.objects.create(project_address='Tel Aviv, Israel')
        self.assertEqual(str(project), 'Tel Aviv, Israel')
        self.assertEqual(project.project_address, 'Tel Aviv, Israel')

    @patch('core.models.Nominatim')
    def test_project_geocoding_on_save(self, mock_nominatim):
        mock_location = type('Location', (), {'latitude': 32.0853, 'longitude': 34.7818})()
        mock_nominatim.return_value.geocode.return_value = mock_location
        project = Project.objects.create(project_address='Tel Aviv, Israel')
        self.assertAlmostEqual(project.latitude, 32.0853)
        self.assertAlmostEqual(project.longitude, 34.7818)

    @patch('core.models.Nominatim')
    def test_project_no_geocode_if_already_has_coords(self, mock_nominatim):
        project = Project.objects.create(
            project_address='Known Place',
            latitude=31.0, longitude=35.0
        )
        mock_nominatim.return_value.geocode.assert_not_called()
        self.assertEqual(project.latitude, 31.0)

    @patch('core.models.Nominatim')
    def test_project_geocoding_error_handled(self, mock_nominatim):
        mock_nominatim.return_value.geocode.side_effect = Exception('Network error')
        project = Project.objects.create(project_address='Bad Address')
        self.assertIsNone(project.latitude)
        self.assertIsNone(project.longitude)


class ApartmentModelTests(TestCase):
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.project = Project.objects.create(project_address='Haifa, Israel')

    def test_create_apartment(self):
        apt = Apartment.objects.create(
            project=self.project,
            price=Decimal('1500000.00'),
            number_of_rooms=4,
            floor=3,
            apartment_size_sqm=120.0
        )
        self.assertIn('Haifa, Israel', str(apt))
        self.assertEqual(apt.project, self.project)
        self.assertEqual(apt.number_of_rooms, 4)

    def test_apartment_default_type(self):
        apt = Apartment.objects.create(project=self.project)
        self.assertEqual(apt.type, 'תמ\"א')


class DealModelTests(TestCase):
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.user = User.objects.create_user(
            email='deal@example.com', password='testpass', full_name='Deal User'
        )
        self.project = Project.objects.create(project_address='Jerusalem, Israel')
        self.apartment = Apartment.objects.create(project=self.project, price=Decimal('2000000'))

    def test_create_deal(self):
        deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        self.assertEqual(deal.status, 'Active')
        self.assertIn('עסקה', str(deal))

    def test_deal_status_choices(self):
        deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, status='Completed'
        )
        self.assertEqual(deal.status, 'Completed')


class DealDocumentModelTests(TestCase):
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.user = User.objects.create_user(
            email='doc@example.com', password='testpass', full_name='Doc User'
        )
        self.project = Project.objects.create(project_address='Netanya')
        self.apartment = Apartment.objects.create(project=self.project)
        self.deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )

    def test_create_deal_document(self):
        doc = DealDocument.objects.create(
            deal=self.deal, filename='test_doc.pdf', file_type='CONTRACT'
        )
        self.assertIn('חוזה', str(doc))
        self.assertEqual(doc.file_type, 'CONTRACT')


class DealTransactionModelTests(TestCase):
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.user = User.objects.create_user(
            email='trans@example.com', password='testpass', full_name='Trans User'
        )
        self.project = Project.objects.create(project_address='Eilat')
        self.apartment = Apartment.objects.create(project=self.project)
        self.deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )

    def test_create_transaction(self):
        tx = DealTransaction.objects.create(
            deal=self.deal, stage='IN_PROGRESS', status='WAITING_CLIENT'
        )
        self.assertIn('בתהליך', str(tx))

    def test_default_values(self):
        tx = DealTransaction.objects.create(deal=self.deal)
        self.assertEqual(tx.stage, 'INITIAL')
        self.assertEqual(tx.status, 'WAITING_CLIENT')


class NotificationsModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='notif@example.com', password='testpass', full_name='Notif User'
        )

    def test_create_notification(self):
        notif = Notifications.objects.create(
            user=self.user, title='Test Title', message='Test message'
        )
        self.assertFalse(notif.is_read)
        self.assertIn('Test Title', str(notif))


class UserFavoritesModelTests(TestCase):
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.user = User.objects.create_user(
            email='fav@example.com', password='testpass', full_name='Fav User'
        )
        self.project = Project.objects.create(project_address='Herzliya')
        self.apartment = Apartment.objects.create(project=self.project)

    def test_favorite_apartment(self):
        fav = UserFavorites.objects.create(user=self.user, apartment=self.apartment)
        self.assertEqual(fav.apartment, self.apartment)

    def test_favorite_project(self):
        fav = UserFavorites.objects.create(user=self.user, project=self.project)
        self.assertEqual(fav.project, self.project)


class ActivityLogModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='activity@example.com', password='testpass', full_name='Activity User'
        )

    def test_create_activity_log(self):
        log = ActivityLog.objects.create(
            user=self.user,
            activity_type='DEAL_CREATE',
            description='Created a new deal'
        )
        self.assertEqual(log.activity_type, 'DEAL_CREATE')

    def test_ordering(self):
        ActivityLog.objects.create(
            user=self.user, activity_type='DEAL_CREATE', description='First'
        )
        ActivityLog.objects.create(
            user=self.user, activity_type='DOC_UPLOAD', description='Second'
        )
        logs = ActivityLog.objects.all()
        self.assertEqual(logs[0].description, 'Second')


# ========================================================================
# SERIALIZER TESTS
# ========================================================================

class ProjectSerializerTests(TestCase):
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.project = Project.objects.create(
            project_address='Ramat Gan, Israel',
            project_description='A nice project'
        )

    def test_serializer_fields(self):
        from .serializers import ProjectSerializer
        serializer = ProjectSerializer(self.project)
        data = serializer.data
        self.assertEqual(data['project_address'], 'Ramat Gan, Israel')
        self.assertEqual(data['title'], 'Ramat Gan, Israel')
        self.assertIn('percentage', data)
        self.assertIn('documents', data)

    def test_type_field_none_when_no_apartments(self):
        from .serializers import ProjectSerializer
        serializer = ProjectSerializer(self.project)
        self.assertIsNone(serializer.data['type'])

    def test_type_field_from_apartment(self):
        from .serializers import ProjectSerializer
        Apartment.objects.create(project=self.project, type='פינוי-בינוי')
        serializer = ProjectSerializer(self.project)
        self.assertEqual(serializer.data['type'], 'פינוי-בינוי')


class UserFavoritesSerializerTests(TestCase):
    def test_validation_requires_apartment_or_project(self):
        from .serializers import UserFavoritesSerializer
        serializer = UserFavoritesSerializer(data={})
        self.assertFalse(serializer.is_valid())


class ActivityLogSerializerTests(TestCase):
    def test_time_ago_field(self):
        from .serializers import ActivityLogSerializer
        user = User.objects.create_user(
            email='time@example.com', password='testpass', full_name='Time User'
        )
        log = ActivityLog.objects.create(
            user=user, activity_type='DEAL_CREATE', description='Test'
        )
        serializer = ActivityLogSerializer(log)
        self.assertIn('time_ago', serializer.data)
        # Just-created should be "עכשיו" (now)
        self.assertEqual(serializer.data['time_ago'], 'עכשיו')


# ========================================================================
# API / VIEW TESTS
# ========================================================================

class BaseAPITestCase(TestCase):
    """Base class with shared setup for API tests."""
    
    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='api@example.com', password='testpass', full_name='API User'
        )
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com', password='adminpass', full_name='Admin User'
        )
        self.project = Project.objects.create(
            project_address='Test Project, Tel Aviv',
            project_description='Test description'
        )
        self.apartment = Apartment.objects.create(
            project=self.project,
            price=Decimal('1500000.00'),
            number_of_rooms=3,
            floor=5,
            apartment_size_sqm=90.0
        )
        self.client.force_authenticate(user=self.admin_user)


class ProjectAPITests(BaseAPITestCase):

    def test_list_projects(self):
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @patch('core.models.Nominatim')
    def test_create_project(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        response = self.client.post('/api/projects/', {
            'project_address': 'New Project, Haifa',
            'project_description': 'Brand new project'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 2)

    def test_retrieve_project(self):
        response = self.client.get(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['project_address'], 'Test Project, Tel Aviv')

    @patch('core.models.Nominatim')
    def test_update_project(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        response = self.client.patch(f'/api/projects/{self.project.id}/', {
            'project_description': 'Updated description'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.project_description, 'Updated description')

    def test_delete_project(self):
        response = self.client.delete(f'/api/projects/{self.project.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Project.objects.count(), 0)

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ApartmentAPITests(BaseAPITestCase):

    def test_list_apartments(self):
        response = self.client.get('/api/apartments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_apartments_by_project(self):
        response = self.client.get(f'/api/apartments/?project_id={self.project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @patch('core.models.Nominatim')
    def test_filter_apartments_empty_other_project(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        other_project = Project.objects.create(project_address='Other Project')
        response = self.client.get(f'/api/apartments/?project_id={other_project.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_create_apartment(self):
        response = self.client.post('/api/apartments/', {
            'project_id': self.project.id,
            'price': '2000000.00',
            'number_of_rooms': 5,
            'floor': 10,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Apartment.objects.count(), 2)

    def test_retrieve_apartment(self):
        response = self.client.get(f'/api/apartments/{self.apartment.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Nested project data
        self.assertIn('project', response.data)
        self.assertEqual(response.data['project']['project_address'], 'Test Project, Tel Aviv')

    def test_apartment_includes_main_image(self):
        response = self.client.get(f'/api/apartments/{self.apartment.id}/')
        self.assertIn('main_image', response.data)


class NotificationsAPITests(BaseAPITestCase):

    def test_create_notification(self):
        response = self.client.post('/api/notifications/', {
            'user_id': str(self.user.id),
            'title': 'New Update',
            'message': 'Something happened'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_notifications_user_scoped(self):
        Notifications.objects.create(user=self.user, title='For User', message='M1')
        Notifications.objects.create(user=self.admin_user, title='For Admin', message='M2')
        
        # Logged in as admin, should only see admin's
        response = self.client.get('/api/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for notif in response.data:
            # Should only see the admin's notifications
            self.assertEqual(notif['title'], 'For Admin')

    def test_mark_as_read(self):
        notif = Notifications.objects.create(
            user=self.admin_user, title='Test', message='msg'
        )
        response = self.client.post(f'/api/notifications/{notif.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)


class FavoritesAPITests(BaseAPITestCase):

    def test_add_apartment_favorite(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/favorites/', {
            'apartment_id': self.apartment.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_project_favorite(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/favorites/', {
            'project_id': self.project.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_favorites_user_scoped(self):
        self.client.force_authenticate(user=self.user)
        UserFavorites.objects.create(user=self.user, apartment=self.apartment)
        UserFavorites.objects.create(user=self.admin_user, project=self.project)
        
        response = self.client.get('/api/favorites/')
        self.assertEqual(len(response.data), 1)

    def test_remove_favorite(self):
        self.client.force_authenticate(user=self.user)
        fav = UserFavorites.objects.create(user=self.user, apartment=self.apartment)
        response = self.client.delete(f'/api/favorites/{fav.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(UserFavorites.objects.count(), 0)

    def test_add_favorite_validation_no_item(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/favorites/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DealAPITests(BaseAPITestCase):

    def test_create_deal(self):
        response = self.client.post('/api/deals/', {
            'user_id': str(self.user.id),
            'apartment_id': self.apartment.id,
            'project_id': self.project.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deal.objects.count(), 1)

    def test_list_deals(self):
        Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        response = self.client.get('/api/deals/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_deal_includes_nested(self):
        deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        response = self.client.get(f'/api/deals/{deal.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('documents', response.data)
        self.assertIn('transactions', response.data)
        self.assertIn('apartment', response.data)
        self.assertIn('user', response.data)


class DealTransactionAPITests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )

    def test_create_transaction(self):
        response = self.client.post('/api/deal-transactions/', {
            'deal_id': self.deal.id,
            'stage': 'IN_PROGRESS',
            'status': 'WAITING_CLIENT',
            'description': 'Processing documents'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_filter_by_deal_id(self):
        DealTransaction.objects.create(
            deal=self.deal, stage='INITIAL', status='WAITING_CLIENT'
        )
        response = self.client.get(f'/api/deal-transactions/?deal_id={self.deal.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ActivityFeedAPITests(BaseAPITestCase):

    def test_activity_feed_read_only(self):
        response = self.client.get('/api/activity-feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_activity_feed_no_post(self):
        response = self.client.post('/api/activity-feed/', {
            'activity_type': 'DEAL_CREATE',
            'description': 'Should fail'
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_activity_feed_returns_recent(self):
        user = self.user
        for i in range(25):
            ActivityLog.objects.create(
                user=user, activity_type='DEAL_CREATE', description=f'Activity {i}'
            )
        response = self.client.get('/api/activity-feed/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # ViewSet limits to 20
        self.assertLessEqual(len(response.data), 20)


# ========================================================================
# SIGNAL TESTS
# ========================================================================

class SignalTests(TestCase):
    """Tests for the Django signals creating ActivityLog entries."""

    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None
        self.user = User.objects.create_user(
            email='signal@example.com', password='testpass', full_name='Signal User'
        )
        self.project = Project.objects.create(project_address='Signal City')
        self.apartment = Apartment.objects.create(project=self.project)

    def test_deal_creation_creates_activity_log(self):
        initial_count = ActivityLog.objects.count()
        Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        self.assertEqual(ActivityLog.objects.count(), initial_count + 1)
        log = ActivityLog.objects.latest('created_at')
        self.assertEqual(log.activity_type, 'DEAL_CREATE')
        self.assertIn('פתח תיק חדש', log.description)

    def test_deal_document_creation_creates_activity_log(self):
        deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        initial_count = ActivityLog.objects.count()
        DealDocument.objects.create(
            deal=deal, user=self.user, filename='contract.pdf', file_type='CONTRACT'
        )
        self.assertEqual(ActivityLog.objects.count(), initial_count + 1)
        log = ActivityLog.objects.latest('created_at')
        self.assertEqual(log.activity_type, 'DOC_UPLOAD')
        self.assertIn('contract.pdf', log.description)

    def test_deal_transaction_creation_creates_activity_log(self):
        deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        initial_count = ActivityLog.objects.count()
        DealTransaction.objects.create(
            deal=deal, stage='IN_PROGRESS', status='WAITING_CLIENT'
        )
        self.assertEqual(ActivityLog.objects.count(), initial_count + 1)
        log = ActivityLog.objects.latest('created_at')
        self.assertEqual(log.activity_type, 'STATUS_CHANGE')

    def test_deal_transaction_completion_creates_activity_log(self):
        deal = Deal.objects.create(
            user=self.user, apartment=self.apartment, project=self.project
        )
        tx = DealTransaction.objects.create(
            deal=deal, stage='IN_PROGRESS', status='WAITING_CLIENT'
        )
        initial_count = ActivityLog.objects.count()
        tx.status = 'DONE'
        tx.save()
        self.assertEqual(ActivityLog.objects.count(), initial_count + 1)
        log = ActivityLog.objects.latest('created_at')
        self.assertIn('הושלמה', log.description)
