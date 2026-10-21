from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Library(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Libraries'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.city})"


class Book(models.Model):
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=20, unique=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    library = models.ForeignKey(Library, on_delete=models.PROTECT, related_name='books')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author}"

    def clean(self):
        if self.available_copies > self.total_copies:
            raise ValidationError("Available copies cannot exceed total copies.")

    def has_active_loans(self):
        return self.loans.filter(status='Issued').exists()


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True, default='')
    library = models.ForeignKey(Library, on_delete=models.PROTECT, related_name='students')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.student_id})"


class BookLoan(models.Model):
    STATUS_CHOICES = [
        ('Issued', 'Issued'),
        ('Returned', 'Returned'),
    ]

    book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name='loans')
    student = models.ForeignKey(Student, on_delete=models.PROTECT, related_name='loans')
    issue_date = models.DateField()
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Issued')

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.book.title} → {self.student.name} ({self.status})"

    def is_overdue(self):
        from datetime import date
        if self.status == 'Issued':
            return date.today() > self.due_date
        return False
