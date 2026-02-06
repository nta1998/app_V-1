from rest_framework import serializers
from .models import Project, Apartment, Deal, DealDocument, DealTransaction, Notifications, UserFavorites, ApartmentDocument, ActivityLog, ProjectDocument
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    percentage = serializers.IntegerField(default=85, read_only=True) # Mocked value for now

    class Meta:
        model = Project
        fields = [
            'id', 
            'project_address', 
            'project_url', 
            'project_image_url', 
            'project_description',
            'percentage',
            'type',
            'title',
            'documents'
        ]

    def get_type(self, obj):
        first_apartment = obj.apartments.first()
        return first_apartment.type if first_apartment else None

    title = serializers.SerializerMethodField()
    def get_title(self, obj):
        return obj.project_address

    documents = serializers.SerializerMethodField()
    def get_documents(self, obj):
        docs = obj.documents.all()
        return ProjectDocumentSerializer(docs, many=True).data

class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = ['id', 'project', 'title', 'file', 'doc_type', 'created_at']

class ApartmentSerializer(serializers.ModelSerializer):
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), source='project', write_only=True
    )
    documents = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()

    def get_documents(self, obj):
        docs = obj.documents.all()
        return ApartmentDocumentSerializer(docs, many=True).data

    def get_main_image(self, obj):
        if obj.main_image_doc:
            return obj.main_image_doc.file.url
        return obj.apartment_image_url

    class Meta:
        model = Apartment
        fields = '__all__'

class ApartmentDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentDocument
        fields = ['id', 'apartment', 'file', 'doc_type', 'created_at']

class NotificationsSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = Notifications
        fields = ['id', 'user', 'user_id', 'title', 'message', 'is_read', 'created_at']

class DealDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealDocument
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number', 'avatar', 'is_staff', 'is_active']

class DealTransactionSerializer(serializers.ModelSerializer):
    deal_id = serializers.PrimaryKeyRelatedField(
        queryset=Deal.objects.all(), source='deal', write_only=True
    )
    document_id = serializers.PrimaryKeyRelatedField(
        queryset=DealDocument.objects.all(), source='document', write_only=True, required=False, allow_null=True
    )
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DealTransaction
        fields = ['id', 'deal', 'deal_id', 'document', 'document_id', 'stage', 'stage_display', 
                  'status', 'status_display', 'request_date', 'completion_date', 'description']
        read_only_fields = ['deal', 'document', 'request_date']


class DealSerializer(serializers.ModelSerializer):
    documents = DealDocumentSerializer(many=True, read_only=True)
    transactions = DealTransactionSerializer(many=True, read_only=True)
    apartment = ApartmentSerializer(read_only=True)
    apartment_id = serializers.PrimaryKeyRelatedField(queryset=Apartment.objects.all(), source='apartment', write_only=True)
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), source='project', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Deal
        fields = '__all__'


class UserFavoritesSerializer(serializers.ModelSerializer):
    apartment = ApartmentSerializer(read_only=True)
    apartment_id = serializers.PrimaryKeyRelatedField(
        queryset=Apartment.objects.all(), source='apartment', write_only=True, required=False, allow_null=True
    )
    project = ProjectSerializer(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), source='project', write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = UserFavorites
        fields = ['id', 'user', 'apartment', 'apartment_id', 'project', 'project_id', 'added_at']
        read_only_fields = ['user', 'added_at']

    def validate(self, data):
        if not data.get('apartment') and not data.get('project'):
            raise serializers.ValidationError("Either apartment or project must be specified.")
        return data

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'user_name', 'user_avatar', 'activity_type', 'description', 'metadata', 'created_at', 'time_ago']

    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        # Custom Hebrew formatting
        if diff.days == 0:
            if diff.seconds < 60:
                return "עכשיו"
            if diff.seconds < 3600:
                return f"לפני {diff.seconds // 60} דק'"
            return f"לפני {diff.seconds // 3600} שעות"
        return f"לפני {diff.days} ימים"
