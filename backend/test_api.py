"""
Automated test suite for the Library Management System API.
Run from the backend directory: python test_api.py
"""
import urllib.request
import urllib.error
import http.cookiejar
import json
from datetime import date, timedelta

BASE = 'http://127.0.0.1:8000/api/v1'
PASS = 0
FAIL = 0

def check(name, condition, detail=''):
    global PASS, FAIL
    if condition:
        print(f'  [PASS] {name}')
        PASS += 1
    else:
        print(f'  [FAIL] {name} -- {detail}')
        FAIL += 1

# Setup session
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def post(url, data, csrf=None):
    headers = {'Content-Type': 'application/json'}
    if csrf:
        headers['X-CSRFToken'] = csrf
    req = urllib.request.Request(url, json.dumps(data).encode(), headers)
    return opener.open(req)

def get(url):
    return opener.open(urllib.request.Request(url))

def get_csrf():
    for c in cj:
        if c.name == 'csrftoken':
            return c.value
    return None

print('\n=== Library Management System — API Test Suite ===\n')

# ── 1. Admin Login ──────────────────────────────────────────────
print('[ Auth Tests ]')
try:
    resp = post(f'{BASE}/auth/admin-login/', {'username': 'admin', 'password': 'Admin@1234'})
    body = json.loads(resp.read())
    check('Admin login succeeds', resp.status == 200 and body.get('role') == 'admin')
    csrf = get_csrf()
except Exception as e:
    check('Admin login', False, str(e))
    exit(1)

# Invalid credentials
try:
    post(f'{BASE}/auth/admin-login/', {'username': 'admin', 'password': 'wrong'})
    check('Invalid credentials rejected', False, 'Should have returned 401')
except urllib.error.HTTPError as e:
    check('Invalid credentials rejected', e.code == 401)

import time
UID = str(int(time.time()))

# ── 2. Create Library ───────────────────────────────────────────
print('\n[ Library Tests ]')
resp = post(f'{BASE}/libraries/', {'name': f'Test Library {UID}', 'city': 'Mumbai', 'address': '123 Main St'}, csrf)
lib = json.loads(resp.read())
check('Create library', resp.status == 201 and lib.get('name') == f'Test Library {UID}')

# ── 3. Create Book ──────────────────────────────────────────────
print('\n[ Book Tests ]')
resp = post(f'{BASE}/books/', {'title': f'The Great Book {UID}', 'author': 'Test Author', 'isbn': f'TEST-{UID}', 'total_copies': 3, 'library': lib['id']}, csrf)
book = json.loads(resp.read())
check('Create book', resp.status == 201)
check('Available copies = total copies on create', book.get('available_copies') == 3)

# ── 4. Create Student ───────────────────────────────────────────
print('\n[ Student Tests ]')
uname = f'student_{UID}'
sid = f'S{UID[-5:]}'
resp = post(f'{BASE}/students/', {'name': 'Test Student', 'student_id': sid, 'email': f'{uname}@test.com', 'phone': '9999999999', 'library': lib['id'], 'username': uname, 'password': 'Test@1234!'}, csrf)
student = json.loads(resp.read())
check('Create student account', resp.status == 201)

# ── 5. Dashboard Stats ──────────────────────────────────────────
print('\n[ Dashboard Tests ]')
resp = get(f'{BASE}/dashboard/stats/')
stats = json.loads(resp.read())
check('Dashboard stats endpoint', resp.status == 200)
check('Dashboard has total_books', 'total_books' in stats)
check('Dashboard book count >= 1', stats.get('total_books', 0) >= 1)

# ── 6. Student Login ────────────────────────────────────────────
print('\n[ Student Portal Tests ]')
cj2 = http.cookiejar.CookieJar()
opener2 = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj2))
req = urllib.request.Request(f'{BASE}/auth/student-login/', json.dumps({'username': uname, 'password': 'Test@1234!'}).encode(), {'Content-Type': 'application/json'})
resp = opener2.open(req)
s_body = json.loads(resp.read())
check('Student login succeeds', resp.status == 200 and s_body.get('role') == 'student')

# Student cannot access admin API
try:
    opener2.open(urllib.request.Request(f'{BASE}/dashboard/stats/'))
    check('Student blocked from admin dashboard API', False, 'Should have been 403')
except urllib.error.HTTPError as e:
    check('Student blocked from admin dashboard API', e.code == 403)

# Student cannot access students list
try:
    opener2.open(urllib.request.Request(f'{BASE}/students/'))
    check('Student blocked from student management API', False, 'Should have been 403')
except urllib.error.HTTPError as e:
    check('Student blocked from student management API', e.code == 403)

# Student can see their own loans
resp = opener2.open(urllib.request.Request(f'{BASE}/my-loans/'))
check('Student can access own loans', resp.status == 200)

# ── 7. Issue Book Logic ─────────────────────────────────────────
print('\n[ Issue/Return Logic Tests ]')
due = (date.today() + timedelta(days=14)).isoformat()
resp = post(f'{BASE}/loans/issue/', {'book_id': book['id'], 'student_id': student['id'], 'due_date': due}, csrf)
loan = json.loads(resp.read())
check('Issue book succeeds', resp.status == 201 and loan.get('status') == 'Issued')

# Verify available_copies decreased
resp = get(f'{BASE}/books/{book["id"]}/')
b_after = json.loads(resp.read())
check('Available copies decreased after issue', b_after.get('available_copies') == 2)

# Return book
resp = post(f'{BASE}/loans/{loan["id"]}/return/', {}, csrf)
ret = json.loads(resp.read())
check('Return book succeeds', resp.status == 200 and ret.get('status') == 'Returned')

# Verify available_copies increased
resp = get(f'{BASE}/books/{book["id"]}/')
b_final = json.loads(resp.read())
check('Available copies restored after return', b_final.get('available_copies') == 3)

# Duplicate return
try:
    post(f'{BASE}/loans/{loan["id"]}/return/', {}, csrf)
    check('Duplicate return blocked', False, 'Should have returned 400')
except urllib.error.HTTPError as e:
    check('Duplicate return blocked', e.code == 400)

# ── 8. Book with no available copies ───────────────────────────
# Issue all 3 copies
loan_ids = []
for _ in range(3):
    due2 = (date.today() + timedelta(days=7)).isoformat()
    resp = post(f'{BASE}/loans/issue/', {'book_id': book['id'], 'student_id': student['id'], 'due_date': due2}, csrf)
    if resp.status == 201:
        loan_ids.append(json.loads(resp.read())['id'])

try:
    due3 = (date.today() + timedelta(days=7)).isoformat()
    post(f'{BASE}/loans/issue/', {'book_id': book['id'], 'student_id': student['id'], 'due_date': due3}, csrf)
    check('Issue when no copies available blocked', False, 'Should have returned 400')
except urllib.error.HTTPError as e:
    check('Issue when no copies available blocked', e.code == 400)

print(f'\n=== Results: {PASS} passed, {FAIL} failed ===\n')
if FAIL > 0:
    exit(1)
