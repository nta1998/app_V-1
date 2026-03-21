from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserManagerTests(TestCase):
    """Tests for the custom UserManager."""

    def test_create_user_with_email(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            full_name='Test User'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.full_name, 'Test User')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.check_password('testpass123'))

    def test_create_user_without_email_raises(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='testpass123', full_name='No Email')

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            email='test@EXAMPLE.COM',
            password='testpass123',
            full_name='Test User'
        )
        self.assertEqual(user.email, 'test@example.com')

    def test_create_user_without_password_sets_unusable(self):
        user = User.objects.create_user(
            email='nopass@example.com',
            full_name='No Pass User'
        )
        self.assertFalse(user.has_usable_password())

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            full_name='Admin User'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_str(self):
        user = User.objects.create_user(
            email='str@example.com',
            password='testpass123',
            full_name='String User'
        )
        self.assertEqual(str(user), 'str@example.com')

    def test_user_uuid_primary_key(self):
        user = User.objects.create_user(
            email='uuid@example.com',
            password='testpass123',
            full_name='UUID User'
        )
        import uuid
        self.assertIsInstance(user.pk, uuid.UUID)


class LoginAPITests(TestCase):
    """Tests for the login endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='login@example.com',
            password='correctpass123',
            full_name='Login User'
        )

    def test_login_success_with_email(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com',
            'password': 'correctpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'login@example.com')

    def test_login_success_with_username_key(self):
        """The login view supports both 'username' and 'email' keys."""
        response = self.client.post('/api/auth/login/', {
            'username': 'login@example.com',
            'password': 'correctpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_wrong_password(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_nonexistent_user(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'nosuchuser@example.com',
            'password': 'anypass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_case_insensitive_email(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'LOGIN@EXAMPLE.COM',
            'password': 'correctpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_returns_token_and_user_data(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'login@example.com',
            'password': 'correctpass123'
        })
        user_data = response.data['user']
        self.assertIn('id', user_data)
        self.assertIn('full_name', user_data)
        self.assertIn('is_staff', user_data)


class ProfileAPITests(TestCase):
    """Tests for the user profile endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='profile@example.com',
            password='testpass123',
            full_name='Profile User',
            phone_number='0501234567'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')
        self.assertEqual(response.data['full_name'], 'Profile User')
        self.assertEqual(response.data['phone_number'], '0501234567')

    def test_update_profile(self):
        response = self.client.patch('/api/auth/profile/', {
            'full_name': 'Updated Name'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Updated Name')

    def test_profile_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UsersListAPITests(TestCase):
    """Tests for the users list endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123',
            full_name='User One'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123',
            full_name='User Two'
        )
        self.client.force_authenticate(user=self.user1)

    def test_list_users(self):
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_users_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
