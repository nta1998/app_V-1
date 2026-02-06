import pandas as pd
from django.core.management.base import BaseCommand
from core.models import Apartment, Project
import decimal

class Command(BaseCommand):
    help = 'Import apartments from Excel file'

    def handle(self, *args, **kwargs):
        file_path = '/Users/nta19/Library/Mobile Documents/com~apple~CloudDocs/PROJECTS /אפליקציה לאבא/apartments_db.xlsx'
        df = pd.read_excel(file_path)

        for index, row in df.iterrows():
            try:
                # Get Project
                project_id = row['project_id']
                # Try to find project, if not found, maybe create a placeholder or skip
                # For now, let's try to get it.
                project, created = Project.objects.get_or_create(id=project_id, defaults={
                    'project_address': f'Project {project_id} Placeholder',
                    'project_description': 'Auto-created during import'
                })

                if created:
                    self.stdout.write(self.style.WARNING(f'Created placeholder project with ID {project_id}'))

                # Clean Price
                price_str = str(row['price']).replace('₪', '').replace(',', '').strip()
                price = None
                if price_str and price_str.lower() != 'nan':
                    try:
                        price = decimal.Decimal(price_str)
                    except:
                        pass

                # Helper to clean float/int fields
                def clean_float(val):
                    if pd.isna(val):
                        return None
                    s = str(val).strip()
                    if '+' in s:
                        try:
                            parts = s.split('+')
                            return sum(float(p.strip()) for p in parts)
                        except:
                            pass
                    try:
                        return float(s)
                    except:
                        return None

                # Clean Bank Escort
                bank_escort = False
                if str(row['bank_escort']).strip() == 'בנק':
                    bank_escort = True

                # Create or Update Apartment
                # unique_keys: project and address (and maybe price if needed, but address should be unique enough?)
                # Actually, image ID might be better but let's stick to address + project
                
                defaults = {
                    'price': price,
                    'apartment_size_sqm': clean_float(row['apartment_size']),
                    'number_of_rooms': clean_float(row['number_of_rooms']),
                    'floor': clean_float(row['floor']), # floor might be int but float is safe
                    'facade': row['facade'] if pd.notna(row['facade']) else None,
                    'balcony_size_sqm': clean_float(row['balcony_size']),
                    'air_directions': row['air_directions'] if pd.notna(row['air_directions']) else None,
                    'parking': row['parking'] if pd.notna(row['parking']) else None,
                    'neighborhood': row['neighborhood'] if pd.notna(row['neighborhood']) else None,
                    'entry_date': row['entry_date'] if pd.notna(row['entry_date']) else None,
                    'apartment_image_url': row['image'] if pd.notna(row['image']) else None,
                    'bank_escort': bank_escort,
                    'description': row['description'] if pd.notna(row['description']) else None,
                }
                
                # Check for existing duplicates and clean them up
                existing = Apartment.objects.filter(project=project, apartment_specific_address=row['address'])
                if existing.count() > 1:
                    self.stdout.write(self.style.WARNING(f"Found {existing.count()} duplicates for {row['address']}, deleting..."))
                    existing.delete()

                obj, created = Apartment.objects.update_or_create(
                    project=project,
                    apartment_specific_address=row['address'],
                    defaults=defaults
                )
                
                action = "Created" if created else "Updated"
                self.stdout.write(self.style.SUCCESS(f'{action} apartment {index+1}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing row {index+1}: {e}'))
