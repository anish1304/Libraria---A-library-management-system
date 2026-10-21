from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Sum, Q
from datetime import date
from .models import Library, Book, Student, BookLoan
from .serializers import (
    LibrarySerializer, BookSerializer, StudentSerializer,
    StudentReadSerializer, BookLoanSerializer,
    IssueBookSerializer, DashboardStatsSerializer
)
from .permissions import IsAdminStaff, IsStudentOnly


# ─── Authentication Views ───────────────────────────────────────────────────

class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if not username or not password:
            return Response({'error': 'Username and password required.'}, status=400)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=401)
        if not (user.is_staff or user.is_superuser):
            return Response({'error': 'Access denied. Admin only.'}, status=403)
        login(request, user)
        return Response({
            'message': 'Login successful.',
            'id': user.id,
            'username': user.username,
            'role': 'admin',
            'is_staff': True,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'display_role': 'Super Administrator' if user.is_superuser else 'Staff Administrator'
        })


class StudentLoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        identifier = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        if not identifier or not password:
            return Response({'error': 'Username and password required.'}, status=400)

        # Resolve user by username, student_id, or email
        user = None
        user_match = User.objects.filter(username__iexact=identifier).first()
        if user_match:
            user = user_match
        else:
            student_match = Student.objects.filter(student_id__iexact=identifier).first()
            if student_match:
                user = student_match.user
            else:
                student_by_email = Student.objects.filter(email__iexact=identifier).first()
                if student_by_email:
                    user = student_by_email.user
                else:
                    user_by_email = User.objects.filter(email__iexact=identifier).first()
                    if user_by_email:
                        user = user_by_email

        if user is None or not user.check_password(password):
            return Response({'error': 'Invalid credentials.'}, status=401)

        if user.is_staff or user.is_superuser:
            return Response({'error': 'Please use the admin portal.'}, status=403)
        if not hasattr(user, 'student_profile'):
            return Response({'error': 'No student profile found.'}, status=403)
        if not user.student_profile.is_active:
            return Response({'error': 'Student account is deactivated.'}, status=403)

        login(request, user)
        student = user.student_profile
        return Response({
            'message': 'Login successful.',
            'id': user.id,
            'username': user.username,
            'role': 'student',
            'is_staff': False,
            'name': student.name,
            'student_name': student.name,
            'student_id': student.student_id,
            'student_pk': student.pk,
            'library': student.library_id,
            'library_name': student.library.name,
            'email': student.email,
            'display_role': 'Registered Student Scholar'
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {'id': user.id, 'username': user.username, 'is_staff': user.is_staff}
        if hasattr(user, 'student_profile'):
            s = user.student_profile
            data['role'] = 'student'
            data['student_name'] = s.name
            data['student_id'] = s.student_id
            data['student_pk'] = s.pk
            data['library'] = s.library_id
        else:
            data['role'] = 'admin'
        return Response(data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'})


# ─── Library ViewSet ─────────────────────────────────────────────────────────

class LibraryViewSet(viewsets.ModelViewSet):
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            return [IsAuthenticated()]
        return [IsAdminStaff()]

    def destroy(self, request, *args, **kwargs):
        library = self.get_object()
        if library.books.exists() or library.students.exists():
            return Response(
                {'error': 'Cannot delete library with books or students assigned to it.'},
                status=400
            )
        return super().destroy(request, *args, **kwargs)


# ─── Book ViewSet ─────────────────────────────────────────────────────────────

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.select_related('library').all()
    serializer_class = BookSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminStaff()]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(isbn__icontains=search)
            )
        library_id = self.request.query_params.get('library', '')
        if library_id:
            qs = qs.filter(library_id=library_id)
        return qs

    def destroy(self, request, *args, **kwargs):
        book = self.get_object()
        if book.has_active_loans():
            return Response({'error': 'Cannot delete book with active loans.'}, status=400)
        return super().destroy(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        book = self.get_object()
        new_total = request.data.get('total_copies')
        if new_total is not None:
            new_total = int(new_total)
            diff = new_total - book.total_copies
            new_available = book.available_copies + diff
            if new_available < 0:
                return Response({'error': 'Cannot reduce total copies below currently issued copies.'}, status=400)
            request.data._mutable = True if hasattr(request.data, '_mutable') else None
            data = request.data.copy()
            data['available_copies'] = new_available
            serializer = self.get_serializer(book, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save(available_copies=new_available)
            return Response(serializer.data)
        return super().partial_update(request, *args, **kwargs)


# ─── Student ViewSet ──────────────────────────────────────────────────────────

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user', 'library').all()
    http_method_names = ['get', 'post', 'patch']

    def get_serializer_class(self):
        if self.request.method in ['POST', 'PATCH']:
            return StudentSerializer
        return StudentReadSerializer

    def get_permissions(self):
        return [IsAdminStaff()]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(student_id__icontains=search) |
                Q(email__icontains=search)
            )
        return qs


# ─── Loan ViewSet ─────────────────────────────────────────────────────────────

class LoanViewSet(viewsets.ViewSet):

    def list(self, request):
        user = request.user
        if user.is_staff or user.is_superuser:
            # Admin sees all loans
            qs = BookLoan.objects.select_related('book', 'student').all()
            status_filter = request.query_params.get('status', '')
            if status_filter:
                qs = qs.filter(status=status_filter)
            overdue = request.query_params.get('overdue', '')
            if overdue == 'true':
                qs = qs.filter(status='Issued', due_date__lt=date.today())
        else:
            # Student sees only their own loans
            if not hasattr(user, 'student_profile'):
                return Response({'error': 'No student profile.'}, status=403)
            qs = BookLoan.objects.select_related('book', 'student').filter(
                student=user.student_profile
            )
        serializer = BookLoanSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='issue')
    def issue_book(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Admin only.'}, status=403)
        serializer = IssueBookSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        book_id = serializer.validated_data['book_id']
        student_id = serializer.validated_data['student_id']
        due_date = serializer.validated_data['due_date']

        try:
            book = Book.objects.get(pk=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found.'}, status=404)

        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=404)

        if not student.is_active:
            return Response({'error': 'Student account is deactivated.'}, status=400)

        with transaction.atomic():
            book_locked = Book.objects.select_for_update().get(pk=book_id)
            if book_locked.available_copies < 1:
                return Response({'error': 'No copies available.'}, status=400)
            loan = BookLoan.objects.create(
                book=book_locked,
                student=student,
                issue_date=date.today(),
                due_date=due_date,
                status='Issued'
            )
            book_locked.available_copies -= 1
            book_locked.save(update_fields=['available_copies'])

        return Response(BookLoanSerializer(loan).data, status=201)

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'error': 'Admin only.'}, status=403)
        try:
            loan = BookLoan.objects.select_related('book').get(pk=pk)
        except BookLoan.DoesNotExist:
            return Response({'error': 'Loan not found.'}, status=404)

        if loan.status == 'Returned':
            return Response({'error': 'This loan has already been returned.'}, status=400)

        with transaction.atomic():
            loan_locked = BookLoan.objects.select_for_update().get(pk=pk)
            book = Book.objects.select_for_update().get(pk=loan_locked.book_id)
            loan_locked.return_date = date.today()
            loan_locked.status = 'Returned'
            loan_locked.save(update_fields=['return_date', 'status'])
            if book.available_copies < book.total_copies:
                book.available_copies += 1
                book.save(update_fields=['available_copies'])

        return Response(BookLoanSerializer(loan_locked).data)

    @action(detail=True, methods=['post'], url_path='renew')
    def renew_book(self, request, pk=None):
        try:
            loan = BookLoan.objects.select_related('book', 'student').get(pk=pk)
        except BookLoan.DoesNotExist:
            return Response({'error': 'Loan not found.'}, status=404)

        user = request.user
        if not (user.is_staff or user.is_superuser):
            if not hasattr(user, 'student_profile') or loan.student_id != user.student_profile.id:
                return Response({'error': 'Access denied.'}, status=403)

        if loan.status == 'Returned':
            return Response({'error': 'Cannot renew a returned book.'}, status=400)

        from datetime import timedelta
        loan.due_date = loan.due_date + timedelta(days=14)
        loan.save(update_fields=['due_date'])
        return Response(BookLoanSerializer(loan).data)

    def get_permissions(self):
        return [IsAuthenticated()]


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    permission_classes = [IsAdminStaff]

    def get(self, request):
        total_books = Book.objects.count()
        available_copies = Book.objects.aggregate(total=Sum('available_copies'))['total'] or 0
        total_students = Student.objects.filter(is_active=True).count()
        total_libraries = Library.objects.count()
        issued_books = BookLoan.objects.filter(status='Issued').count()
        overdue_books = BookLoan.objects.filter(status='Issued', due_date__lt=date.today()).count()

        data = {
            'total_books': total_books,
            'available_copies': available_copies,
            'total_students': total_students,
            'total_libraries': total_libraries,
            'issued_books': issued_books,
            'overdue_books': overdue_books,
        }
        return Response(data)


# ─── Student My Loans ─────────────────────────────────────────────────────────

class MyLoansView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'student_profile'):
            return Response({'error': 'Not a student.'}, status=403)
        loans = BookLoan.objects.select_related('book', 'student').filter(
            student=user.student_profile
        )
        serializer = BookLoanSerializer(loans, many=True)
        return Response(serializer.data)
