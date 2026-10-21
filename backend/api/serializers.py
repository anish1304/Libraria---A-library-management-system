from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Library, Book, Student, BookLoan
from datetime import date


class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = ['id', 'name', 'address', 'city', 'created_at']
        read_only_fields = ['id', 'created_at']


class BookSerializer(serializers.ModelSerializer):
    library_name = serializers.CharField(source='library.name', read_only=True)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'total_copies', 'available_copies',
                  'library', 'library_name', 'created_at']
        read_only_fields = ['id', 'available_copies', 'created_at']

    def validate(self, data):
        # On create, set available_copies = total_copies
        if self.instance is None:
            data['available_copies'] = data.get('total_copies', 1)
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_staff', 'is_superuser']


class StudentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    library_name = serializers.CharField(source='library.name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'user_id', 'username', 'password', 'student_id', 'name',
                  'email', 'phone', 'address', 'library', 'library_name', 'is_active', 'created_at']
        read_only_fields = ['id', 'user_id', 'created_at']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'Username already exists.'})
        user = User.objects.create_user(username=username, password=password)
        student = Student.objects.create(user=user, **validated_data)
        return student

    def update(self, instance, validated_data):
        # Don't update username/password in PATCH
        validated_data.pop('username', None)
        validated_data.pop('password', None)
        return super().update(instance, validated_data)


class StudentReadSerializer(serializers.ModelSerializer):
    """Serializer for reading student data (no credentials)."""
    library_name = serializers.CharField(source='library.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'username', 'student_id', 'name', 'email', 'phone', 'address',
                  'library', 'library_name', 'is_active', 'created_at']


class BookLoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_id_no = serializers.CharField(source='student.student_id', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = BookLoan
        fields = ['id', 'book', 'book_title', 'book_author', 'student', 'student_name',
                  'student_id_no', 'issue_date', 'due_date', 'return_date', 'status', 'is_overdue']
        read_only_fields = ['id', 'status', 'return_date']

    def get_is_overdue(self, obj):
        return obj.is_overdue()


class IssueBookSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
    due_date = serializers.DateField()

    def validate_due_date(self, value):
        if value <= date.today():
            raise serializers.ValidationError("Due date must be in the future.")
        return value


class DashboardStatsSerializer(serializers.Serializer):
    total_books = serializers.IntegerField()
    available_copies = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_libraries = serializers.IntegerField()
    issued_books = serializers.IntegerField()
    overdue_books = serializers.IntegerField()
