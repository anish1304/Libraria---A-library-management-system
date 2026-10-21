from django.contrib import admin
from .models import Library, Book, Student, BookLoan


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'created_at']
    search_fields = ['name', 'city']


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'isbn', 'total_copies', 'available_copies', 'library']
    search_fields = ['title', 'author', 'isbn']
    list_filter = ['library']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'student_id', 'email', 'library', 'is_active']
    search_fields = ['name', 'student_id', 'email']
    list_filter = ['is_active', 'library']


@admin.register(BookLoan)
class BookLoanAdmin(admin.ModelAdmin):
    list_display = ['book', 'student', 'issue_date', 'due_date', 'return_date', 'status']
    list_filter = ['status']
