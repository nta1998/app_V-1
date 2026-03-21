"""
Base test case for E2E investment flow tests.
Shared setup: admin, user, project, apartment, API clients.
"""
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from core.models import (
    Project, Apartment, Deal, DealDocument,
    DealTransaction, Notifications, ActivityLog
)

User = get_user_model()


class BaseE2ETestCase(TestCase):
    """
    Shared setup for all end-to-end tests.

    Creates:
      - admin_user (is_staff=True)
      - user (regular investor)
      - other_user (second investor)
      - project + apartment
      - Three APIClient instances: admin_client, user_client, anon_client
    """

    @patch('core.models.Nominatim')
    def setUp(self, mock_nominatim):
        mock_nominatim.return_value.geocode.return_value = None

        # --- Users ---
        self.admin_user = User.objects.create_superuser(
            email='admin@test.com',
            password='admin123',
            full_name='Admin Manager',
        )
        self.user = User.objects.create_user(
            email='investor@test.com',
            password='user123',
            full_name='Investor User',
        )
        self.other_user = User.objects.create_user(
            email='other@test.com',
            password='other123',
            full_name='Other User',
        )

        # --- Property data ---
        self.project = Project.objects.create(
            project_address='Test Project, Tel Aviv',
            project_description='Premium project in central Tel Aviv',
        )
        self.apartment = Apartment.objects.create(
            project=self.project,
            price=Decimal('2500000.00'),
            apartment_specific_address='Building A, Apt 12',
            number_of_rooms=4,
            floor=8,
            apartment_size_sqm=120.0,
        )

        # --- API clients ---
        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin_user)

        self.user_client = APIClient()
        self.user_client.force_authenticate(user=self.user)

        self.anon_client = APIClient()

    # ----- Helper methods -----

    def create_deal(self, user=None, apartment=None, project=None, status='Active'):
        """Create a Deal directly via the ORM."""
        return Deal.objects.create(
            user=user or self.user,
            apartment=apartment or self.apartment,
            project=project or self.project,
            status=status,
        )

    def create_document(self, deal, filename='document.pdf', file_type='CONTRACT', user=None):
        """Create a DealDocument with a fake uploaded file."""
        fake_file = SimpleUploadedFile(
            filename,
            b'%PDF-1.4 fake content for testing',
            content_type='application/pdf',
        )
        return DealDocument.objects.create(
            deal=deal,
            user=user or self.admin_user,
            filename=filename,
            file=fake_file,
            file_type=file_type,
        )

    def create_notification(self, user=None, title='New notification', message='Details here'):
        """Create a Notification directly via the ORM."""
        return Notifications.objects.create(
            user=user or self.user,
            title=title,
            message=message,
        )
