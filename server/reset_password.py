#!/usr/bin/env python3
"""Reset admin password - run with: python reset_password.py"""
import os, sys, signal

# Kill after 15 seconds to avoid iCloud SQLite lock hangs
signal.alarm(15)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))

import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

for email in ['admin@example.com', 'nta8888@gmail.com']:
    try:
        u = User.objects.get(email=email)
        u.set_password('Admin123!')
        u.save()
        print(f'Password reset for {email}: OK')
        print(f'  Hash: {u.password[:50]}...')
    except User.DoesNotExist:
        print(f'{email}: not found')
    except Exception as e:
        print(f'{email}: ERROR - {e}')

print('Done!')
