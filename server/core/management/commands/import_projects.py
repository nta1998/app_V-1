from django.core.management.base import BaseCommand
from core.models import Project
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Import projects from Excel file'

    def handle(self, *args, **options):
        file_path = "/Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/projects_db.xlsx"
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        try:
            df = pd.read_excel(file_path)
            # Fill NaN values with empty string for text fields or None for others as needed
            df = df.fillna('')
            
            created_count = 0
            updated_count = 0

            for index, row in df.iterrows():
                project_address = row.get('project_address')
                if not project_address:
                    continue

                project_data = {
                    'project_url': row.get('project_url', ''),
                    'project_image_url': row.get('project_image_url', ''),
                    'project_description': row.get('project_description', ''),
                }
                
                # Use project_address as the unique identifier
                project, created = Project.objects.update_or_create(
                    project_address=project_address,
                    defaults=project_data
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Successfully imported projects: {created_count} created, {updated_count} updated'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing projects: {e}'))
