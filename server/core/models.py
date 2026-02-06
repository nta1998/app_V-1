from django.db import models
from geopy.geocoders import Nominatim
import ssl
import certifi

# Configure SSL context for geopy to avoid certificate errors on macOS
ctx = ssl.create_default_context(cafile=certifi.where())


class Project(models.Model):
    project_address = models.CharField(max_length=255, unique=True)
    project_url = models.URLField(max_length=500, blank=True, null=True)
    project_image_url = models.URLField(max_length=500, blank=True, null=True)
    project_description = models.TextField(blank=True, null=True)

    # New fields for coordinates
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.project_address and not self.latitude:
            print(f"📍 Geocoding address: {self.project_address}...")
            geolocator = Nominatim(user_agent="my_real_estate_app_v1", ssl_context=ctx)
            try:
                location = geolocator.geocode(self.project_address)
                if location:
                    self.latitude = location.latitude
                    self.longitude = location.longitude
                    print(f"✅ Found: {self.latitude}, {self.longitude}")
                else:
                    print("⚠️ Address not found")
            except Exception as e:
                print(f"❌ Error during geocoding: {e}")
        
        super().save(*args, **kwargs)

    def __str__(self):
        return self.project_address

class Apartment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='apartments')
    price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    apartment_specific_address = models.CharField(max_length=255, blank=True)
    apartment_size_sqm = models.FloatField(null=True, blank=True)
    number_of_rooms = models.FloatField(null=True, blank=True)
    floor = models.IntegerField(null=True, blank=True)
    facade = models.CharField(max_length=50, blank=True, null=True)
    balcony_size_sqm = models.FloatField(null=True, blank=True)
    air_directions = models.CharField(max_length=255, blank=True, null=True)
    parking = models.CharField(max_length=255, blank=True, null=True)
    neighborhood = models.CharField(max_length=100, blank=True, null=True)
    entry_date = models.CharField(max_length=100, null=True, blank=True)
    apartment_image_url = models.URLField(max_length=500, blank=True, null=True)
    bank_escort = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=50, default='תמ"א', blank=True, null=True)
    main_image_doc = models.ForeignKey('ApartmentDocument', on_delete=models.SET_NULL, null=True, blank=True, related_name='+')

    def __str__(self):
        return f"{self.project.project_address} - Unit {self.id}"

class ApartmentDocument(models.Model):
    DOC_TYPE_CHOICES = (
        ('MAIN', 'תמונה ראשית'),
        ('IMAGE', 'תמונות'),
        ('PDF', 'קבצי pdf'),
    )

    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='apartment_documents/')
    doc_type = models.CharField(max_length=10, choices=DOC_TYPE_CHOICES, default='IMAGE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_doc_type_display()} for Apartment {self.apartment.id}"


class UserFavorites(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='favorites')
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='favorited_by', null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # constraints for uniqueness can be complex with nulls, handling in logic/serializer for now
        pass

    def __str__(self):
        return f"{self.user} - {self.apartment or self.project}"

class Notifications(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user}: {self.title}"

class Deal(models.Model):
    STATUS_CHOICES = (
        ('Active', 'פעיל'),
        ('Completed', 'הושלם'),
        ('Cancelled', 'בוטל'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='deals')
    apartment = models.ForeignKey(Apartment, on_delete=models.PROTECT, related_name='deals')
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name='deals', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"עסקה: {self.user} - {self.apartment}"


class DealDocument(models.Model):
    FILE_TYPE_CHOICES = (
        ('ID', 'תעודת זהות'),
        ('CONTRACT', 'חוזה'),
        ('PAYMENT', 'אישור תשלום'),
        ('OTHER', 'אחר'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='deal_documents', null=True, blank=True)
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='documents')
    filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='deal_documents/', null=True, blank=True)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='OTHER')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.get_file_type_display()})"


class DealTransaction(models.Model):
    STAGE_CHOICES = (
        ('INITIAL', 'התחלתי'),
        ('IN_PROGRESS', 'בתהליך'),
        ('PENDING', 'ממתין'),
        ('COMPLETED', 'הושלם'),
        ('CANCELLED', 'בוטל'),
    )

    STATUS_CHOICES = (
        ('WAITING_CLIENT', 'ממתין ללקוח'),
        ('WAITING_APPROVAL', 'ממתין לאישור'),
        ('DONE', 'בוצע'),
    )

    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='transactions')
    document = models.ForeignKey(DealDocument, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='INITIAL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='WAITING_CLIENT')
    request_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"עסקה {self.deal.id} - {self.get_stage_display()}"


class ActivityLog(models.Model):
    ACTIVITY_TYPES = (
        ('DEAL_CREATE', 'יצירת עסקה'),
        ('DOC_UPLOAD', 'העלאת מסמך'),
        ('PAYMENT', 'תשלום'),
        ('MEETING', 'פגישה'),
        ('STATUS_CHANGE', 'שינוי סטטוס'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)  # For extra info like filename, amount, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.user}"

class ProjectDocument(models.Model):
    DOC_TYPE_CHOICES = (
        ('MARKETING', 'שיווק'),
        ('PLAN', 'תוכניות'),
        ('CONTRACT', 'חוזה'),
        ('OTHER', 'אחר'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='project_documents/')
    doc_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, default='OTHER')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.project.project_address})"
