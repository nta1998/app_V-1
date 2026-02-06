import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/server')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import DealTransaction, ActivityLog

def backfill_activities():
    print("Backfilling activities from transactions...")
    transactions = DealTransaction.objects.all().order_by('-request_date')[:20] # Last 20
    
    count = 0
    for t in transactions:
        # Check if already exists roughly (optional, but good practice)
        # For this quick fix, we just create them if the table is empty or just append
        # Let's clean up old logs first if we want a fresh start, or just append
        
        description = f"משימה: {t.get_stage_display()}"
        if t.status == 'DONE':
             description = f"משימה הושלמה: {t.get_stage_display()}"
        
        # simple dedupe check by description and time approx? 
        # Nah, let's just create them.
        
        metadata = {
            'stage': t.get_stage_display(),
            'status': t.get_status_display()
        }
        
        if t.document:
            metadata['filename'] = t.document.filename
            try:
                if t.document.file:
                    metadata['size'] = f"{t.document.file.size / 1024:.1f}KB"
            except:
                pass

        ActivityLog.objects.create(
            user=t.deal.user,
            activity_type='STATUS_CHANGE',
            deal=t.deal,
            description=description,
            metadata=metadata,
            created_at=t.request_date # Backdate it
        )
        count += 1
        
    print(f"Created {count} activity logs.")

if __name__ == '__main__':
    backfill_activities()
