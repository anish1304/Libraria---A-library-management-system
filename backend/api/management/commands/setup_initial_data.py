"""
Custom management command to set up initial admin user and sample data.
Run with: python manage.py setup_initial_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Creates the initial admin superuser if not present.'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@library.com', 'Admin@1234')
            self.stdout.write(self.style.SUCCESS(
                'Admin user created: username=admin, password=Admin@1234'
            ))
        else:
            self.stdout.write('Admin user already exists.')
