"""
Sync Django MySQL database data into frontend mock-data.service.ts
This ensures that the client-side seed data in Angular has the exact same:
- 18 Authentic Libraries
- 115 Verified Books
- 112 Authentic Students with Addresses & Statuses
- 44 Circulation Loans
"""
import os
import sys
import django
import json
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_backend.settings')
django.setup()

from api.models import Library, Book, Student, BookLoan

def run():
    print("Exporting data from Django MySQL...")
    libs = list(Library.objects.all())
    books = list(Book.objects.select_related('library').all())
    students = list(Student.objects.select_related('user', 'library').all())
    loans = list(BookLoan.objects.select_related('book', 'student').all())
    today = date.today()

    # Build seedLibraries
    ts_libs = []
    for l in libs:
        ts_libs.append({
            "id": l.id,
            "name": l.name,
            "code": f"LIB-{l.city.upper()[:4]}",
            "address": l.address,
            "city": l.city,
            "contact_email": f"{l.city.lower().replace(' ', '')}.library@libraria.org",
            "contact_phone": "+1 (555) 234-" + f"{l.id:04d}",
            "opening_hours": "Mon-Fri: 07:30 - 22:00 | Sat-Sun: 09:00 - 19:00",
            "status": "Active",
            "total_books": Book.objects.filter(library=l).count(),
            "active_members": Student.objects.filter(library=l).count(),
            "current_loans": BookLoan.objects.filter(book__library=l, status='Issued').count(),
            "created_at": l.created_at.strftime("%Y-%m-%d")
        })

    # Build seedUsers: 1 admin + all students
    ts_users = [
        {
            "id": 1,
            "username": "admin",
            "name": "Dr. Arthur Pendelton",
            "email": "admin@library.com",
            "phone": "+1 (555) 101-0001",
            "address": "476 5th Ave, New York, NY 10018",
            "role": "super_admin",
            "role_display": "Chief University Librarian & Administrator",
            "department": "Library Executive Office",
            "library_id": libs[0].id if libs else 1,
            "library_name": libs[0].name if libs else "Central Metropolitan Library",
            "is_active": True,
            "max_loans": 25,
            "max_renewals": 10,
            "created_at": "2023-01-01"
        }
    ]

    for s in students:
        ts_users.append({
            "id": s.id + 1,
            "username": s.user.username,
            "name": s.name,
            "email": s.email,
            "phone": s.phone,
            "address": s.address,
            "role": "student",
            "role_display": "Registered Student Scholar",
            "student_id_no": s.student_id,
            "department": "Academic Programs",
            "library_id": s.library.id,
            "library_name": s.library.name,
            "is_active": s.is_active,
            "max_loans": 5,
            "max_renewals": 2,
            "created_at": s.created_at.strftime("%Y-%m-%d")
        })

    # Build seedBooks & copies
    ts_books = []
    ts_copies = []
    copy_id_counter = 1

    categories_list = [
        ["Computer Science", "Software Engineering"],
        ["Literature", "Classics"],
        ["Natural Sciences", "Physics & Astronomy"],
        ["Philosophy", "Behavioral Economics"],
        ["Business & Strategy", "Technology"],
        ["History", "Social Sciences"]
    ]

    for idx, b in enumerate(books):
        cat = categories_list[idx % len(categories_list)]
        ts_books.append({
            "id": b.id,
            "title": b.title,
            "subtitle": f"Authoritative Edition by {b.author}",
            "isbn": b.isbn,
            "isbn13": b.isbn.replace("-", ""),
            "authors": [a.strip() for a in b.author.split(",")],
            "publisher": "Academic & Global Press",
            "publication_year": 2018 + (idx % 6),
            "edition": "Standard Library Edition",
            "language": "English",
            "categories": cat,
            "description": f"Standard academic reference work '{b.title}' by {b.author}. Available across our library network.",
            "format": "Hardcover" if idx % 2 == 0 else "Paperback",
            "pages": 320 + ((idx * 17) % 400),
            "shelf_location": f"Stack {cat[0][:2].upper()}-0{(idx % 8) + 1}, Shelf {(idx % 4) + 1}",
            "library_id": b.library.id,
            "library_name": b.library.name,
            "total_copies": b.total_copies,
            "available_copies": b.available_copies,
            "popularity_score": 85 + (idx % 15),
            "created_at": b.created_at.strftime("%Y-%m-%d")
        })

        # Create copies for this book
        for c_idx in range(b.total_copies):
            is_loaned = (c_idx >= b.available_copies)
            ts_copies.append({
                "id": copy_id_counter,
                "book_id": b.id,
                "accession_no": f"ACC-{b.id:04d}-{c_idx+1:02d}",
                "barcode": f"BC{b.id:04d}{c_idx+1:02d}",
                "library_id": b.library.id,
                "library_name": b.library.name,
                "shelf_location": f"Stack {cat[0][:2].upper()}-0{(idx % 8) + 1}, Shelf {(idx % 4) + 1}",
                "condition": "Mint" if c_idx == 0 else "Good",
                "status": "Issued" if is_loaned else "Available",
                "acquisition_date": "2024-01-15"
            })
            copy_id_counter += 1

    # Build seedLoans
    ts_loans = []
    for idx, l in enumerate(loans):
        matched_copy = next((c for c in ts_copies if c["book_id"] == l.book.id and c["status"] == "Issued"), ts_copies[0] if ts_copies else None)
        is_overdue = (l.status == 'Issued' and today > l.due_date)
        overdue_days = (today - l.due_date).days if is_overdue else 0
        fine_amount = overdue_days * 1.5 if is_overdue else 0

        ts_loans.append({
            "id": l.id,
            "book_id": l.book.id,
            "book_title": l.book.title,
            "book_author": l.book.author,
            "book_isbn": l.book.isbn,
            "copy_id": matched_copy["id"] if matched_copy else 1,
            "copy_barcode": matched_copy["barcode"] if matched_copy else "BC000101",
            "member_id": l.student.id + 1,
            "member_name": l.student.name,
            "member_role": "student",
            "member_email": l.student.email,
            "member_id_no": l.student.student_id,
            "library_id": l.book.library.id,
            "library_name": l.book.library.name,
            "issue_date": l.issue_date.strftime("%Y-%m-%d"),
            "due_date": l.due_date.strftime("%Y-%m-%d"),
            "return_date": l.return_date.strftime("%Y-%m-%d") if l.return_date else None,
            "status": l.status,
            "is_overdue": is_overdue,
            "overdue_days": overdue_days,
            "renewal_count": 0,
            "max_renewals": 2,
            "fine_amount": fine_amount,
            "fine_paid": False
        })

    # Read existing mock-data.service.ts
    mock_service_path = r"c:\Users\Jinansh Jain\Desktop\project_1\library-management-system\frontend\src\app\services\mock-data.service.ts"
    with open(mock_service_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find boundaries of seedInitialData
    start_tag = "private seedInitialData(): void {"
    end_tag = "this.libraries.set(seedLibraries);"

    start_pos = content.find(start_tag)
    end_pos = content.find(end_tag)

    if start_pos == -1 or end_pos == -1:
        print("ERROR: Could not find seedInitialData markers in mock-data.service.ts")
        sys.exit(1)

    # Update STORAGE_KEY_PREFIX to bump version so browser storage refreshes
    content = content.replace("const STORAGE_KEY_PREFIX = 'libraria_enterprise_';", "const STORAGE_KEY_PREFIX = 'libraria_enterprise_v4_';")
    content = content.replace("const STORAGE_KEY_PREFIX = 'libraria_enterprise_v2_';", "const STORAGE_KEY_PREFIX = 'libraria_enterprise_v4_';")
    content = content.replace("const STORAGE_KEY_PREFIX = 'libraria_enterprise_v3_';", "const STORAGE_KEY_PREFIX = 'libraria_enterprise_v4_';")

    new_seed_body = f"""{start_tag}
    const today = new Date();
    const daysAgo = (d: number) => {{
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      return date.toISOString().split('T')[0];
    }};
    const daysAhead = (d: number) => {{
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      return date.toISOString().split('T')[0];
    }};

    // 1. LIBRARIES ({len(ts_libs)} branches)
    const seedLibraries: LibraryBranch[] = {json.dumps(ts_libs, indent=6)};

    // 2. USERS (1 Admin + {len(ts_users)-1} Students)
    const seedUsers: UserAccount[] = {json.dumps(ts_users, indent=6)};

    // 3. BOOK TITLES ({len(ts_books)} titles)
    const seedBooks: BookTitle[] = {json.dumps(ts_books, indent=6)};

    // 4. PHYSICAL COPIES ({len(ts_copies)} copies)
    const seedCopies: BookCopy[] = {json.dumps(ts_copies, indent=6)};

    // 5. LOAN RECORDS ({len(ts_loans)} circulation records)
    const seedLoans: LoanRecord[] = {json.dumps(ts_loans, indent=6)};

    // 6. RESERVATIONS
    const seedReservations: ReservationRecord[] = [];

    // 7. FINES
    const seedFines: FineRecord[] = [];

    // 8. READING LISTS
    const seedReadingLists: ReadingList[] = [];

    // 9. NOTIFICATIONS
    const seedNotifications: NotificationItem[] = [
      {{
        id: 1,
        title: 'Enterprise Library Database Initialized',
        message: 'Loaded {len(ts_libs)} branches, {len(ts_books)} authentic titles, and {len(ts_users)-1} student accounts.',
        type: 'system',
        timestamp: 'Just now',
        is_read: false
      }}
    ];

    // 10. AUDIT LOG
    const seedAudit: AuditEvent[] = [
      {{
        id: 1,
        actor_name: 'System Administrator',
        actor_role: 'super_admin',
        action: 'Database Rebuild & Seed',
        target_type: 'Book',
        target_id: 1,
        summary: 'Loaded {len(ts_books)} authentic titles and {len(ts_users)-1} students',
        timestamp: 'Just now'
      }}
    ];

    """

    new_content = content[:start_pos] + new_seed_body + content[end_pos:]

    with open(mock_service_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"SUCCESS: Synchronized mock-data.service.ts with {len(ts_libs)} libraries, {len(ts_books)} books, {len(ts_users)} users, and {len(ts_copies)} copies!")

if __name__ == '__main__':
    run()
