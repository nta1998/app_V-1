from django.contrib import admin
from .models import Project, Apartment, UserFavorites, Notifications, Deal, DealDocument, DealTransaction, ApartmentDocument, ActivityLog, ProjectDocument

admin.site.register(Project)
admin.site.register(Apartment)
admin.site.register(UserFavorites)
admin.site.register(Notifications)
admin.site.register(Deal)
admin.site.register(DealDocument)
admin.site.register(DealTransaction)
admin.site.register(ApartmentDocument)
admin.site.register(ActivityLog)
admin.site.register(ProjectDocument)
