from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Deal, DealDocument, DealTransaction, ActivityLog

@receiver(post_save, sender=Deal)
def log_deal_creation(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.user,
            activity_type='DEAL_CREATE',
            deal=instance,
            description=f"פתח תיק חדש עבור פרויקט {instance.project.project_address if instance.project else 'כללי'}",
            metadata={'project_name': instance.project.project_address if instance.project else ''}
        )

@receiver(post_save, sender=DealDocument)
def log_document_upload(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.user,
            activity_type='DOC_UPLOAD',
            deal=instance.deal,
            description=f"העלה מסמך: {instance.filename}",
            metadata={
                'filename': instance.filename,
                'file_type': instance.get_file_type_display(),
                'size': f"{instance.file.size / 1024:.1f}KB" if instance.file else "0KB"
            }
        )

@receiver(post_save, sender=DealTransaction)
def log_transaction_update(sender, instance, created, **kwargs):
    # Log when a transaction is completed or status changes
    
    # Prepare metadata
    metadata = {
        'stage': instance.get_stage_display(),
        'status': instance.get_status_display()
    }
    
    # Add document info if exists
    if instance.document:
        metadata['filename'] = instance.document.filename
        try:
             # handle missing file safely
             if instance.document.file:
                metadata['size'] = f"{instance.document.file.size / 1024:.1f}KB"
        except:
            pass

    if created:
         ActivityLog.objects.create(
            user=instance.deal.user,
            activity_type='STATUS_CHANGE', 
            deal=instance.deal,
            description=f"משימה חדשה: {instance.get_stage_display()}",
            metadata=metadata
        )
    elif instance.status == 'DONE':
         ActivityLog.objects.create(
            user=instance.deal.user,
            activity_type='STATUS_CHANGE',
            deal=instance.deal,
            description=f"משימה הושלמה: {instance.get_stage_display()}",
            metadata=metadata
        )
