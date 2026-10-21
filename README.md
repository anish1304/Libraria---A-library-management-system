# LIBRARIA — Enterprise Library & Knowledge Management Platform

> *"An intelligent platform for discovering, organizing, lending, and managing knowledge."*

LIBRARIA is an enterprise-grade digital library operations and knowledge discovery platform engineered for universities, colleges, research institutes, and multi-branch library systems. 

---

## 1. Product Vision & Architecture

LIBRARIA combines the aesthetic refinement of a premium digital editorial reading experience with the operational rigor of a mission-critical SaaS enterprise system.

- **Standalone Autonomous Operation**: Runs 100% locally with a comprehensive, typed mock-data store (`MockDataService`) backed by `localStorage` persistence. The frontend does not require any backend database to be running to showcase every workflow.
- **Future Django REST Framework Integration**: Every service cleanly defines HTTP API endpoints targeting `http://127.0.0.1:8000/api/v1/` with automatic fallback to mock state.
- **Design System Tokens**: Centralized CSS tokens for light and dark themes (Brand Navy `#17233D`, Brand Blue `#3157D5`, Violet `#7357E8`, semantic badges, glassmorphic drawers, and responsive layouts).

---

## 2. Multi-Role Credentials (1-Click Demo Login)

The platform provides dedicated workflows and role-aware navigation for four distinct institutional personas:

| Institutional Role | Demo Username | Demo Password | Persona Name | Key Privileges |
|--------------------|---------------|---------------|--------------|----------------|
| **Super Administrator** | `admin` | `Admin@1234` | Dr. Arthur Pendelton | Full system access, institutional policies, reports, audit trail, user directory |
| **Librarian** | `librarian` | `Librarian@1234` | Elena Rostova, MLS | Circulation desk, physical inventory, copy barcodes, reservations fulfillment |
| **Faculty / Staff** | `faculty` | `Faculty@1234` | Prof. David K. Sterling | Extended borrowing limit (12 books), 5 renewals, seminar reading lists |
| **Student / Scholar** | `student` | `Student@1234` | Alexandria Morgan | 5 book limit, catalog discovery, self-service renewals, hold queues, profile |

*A live Demo Role Switcher is accessible directly from the top header on any page.*

---

## 3. Core Feature Workspaces

### 🏛️ Executive Admin Control Center (`/admin/dashboard`)
- **8 Summary Metrics**: Master Titles, Physical Copies, Shelf Available, Active Members, Active Loans, Overdue Loans, Pending Holds, Active Campus Branches.
- **Inventory & Circulation Balance Bar**: Multi-segment progress visual showing proportional stock availability.
- **Overdue Attention Widget**: Real-time listing of overdue borrowers requiring action.
- **Operational Shortcuts**: Quick navigation to issue books, register members, and export reports.

### 📚 Catalogue & Physical Copies Inventory (`/admin/books`)
- Conceptual distinction between **Master Titles** (bibliographic data, ISBN, authors, publisher, year, categories) and **Physical Copy Assets** (copy ID, accession number, barcode, condition, shelf location, availability status).
- **Physical Copy Inventory Modal**: View all tracked barcodes, accession numbers (`ACC-2024-xxxx`), and add physical copies dynamically with one click.
- Filter by campus branch, search query, and stock availability.

### 🔄 Circulation Desk & Express Barcode Return (`/admin/loans`)
- **Quick Issue**: Student selection with borrowing limit checks, book availability verification, custom due date calculation, and authorized checkout.
- **Quick Barcode Check-in**: Scan or type a physical copy barcode (e.g. `BC-1003`) to automatically locate the loan, assess overdue fines, and return the item to stock.
- Active loans roster with live countdowns and overdue alerts.

### 🔖 Reservations & Waitlist Queue (`/admin/reservations`)
- Queue priority ordering for titles currently on loan.
- Staff actions: **Stage Pickup** (notifies member book is ready) and **Fulfill Hold** (hands volume to patron).
- Expiration tracking for holds awaiting collection.

### 💰 Fines & Penalties Ledger (`/admin/fines`)
- Live overdue penalty calculations based on configurable daily fine rates (`$1.50/day`).
- **Record Demo Payment**: Generates official transaction receipts (`REC-2024-xxxx`) and updates loan records.
- Fee waiver workflow with reason logging in the audit log.

### 📊 Reporting & Analytics Studio (`/admin/reports`)
Comprehensive reporting workspace featuring **9 distinct report categories**:
1. Circulation Activity Register
2. Overdue Loans & Default Risk Assessment
3. Physical Copy Holdings & Asset Condition
4. Most Popular Titles Ranking
5. Category-Wise Subject Distribution
6. Member Borrowing Activity & Quota Analysis
7. Reservations & Waitlist Fulfillment
8. Fines & Penalty Revenue Summary
9. Multi-Branch Operations Comparison
- **Client-Side CSV Export**: Downloads standard `.csv` files generated locally in browser memory.
- **Print / PDF Layout**: Optimized print styles with `@media print`.

### ⚡ Bulk Operations & CSV Import Wizard (`/admin/import`)
- Client-side drag-and-drop CSV parser.
- Schema validation checking required fields, ISBN format, and duplicate detection.
- Row-level validation highlighting valid rows vs rejected rows.
- Downloadable sample CSV templates for both Books and Members.

### 🛡️ Operational Audit History (`/admin/transactions` or `/admin/audit`)
- Searchable timeline of administrative actions: loan issuance, book check-ins, renewals, catalog creation, fine settlements, and setting adjustments.
- Dual-view toggle between Staff Audit Events and Complete Circulation Log.

### ⚙️ Institutional Settings & Policies (`/admin/settings`)
- Organization name, mission tagline, and primary default library branch.
- Configurable borrowing limits: student loan period (14d), faculty loan period (30d), max renewals, daily fine rate, hold expiration window.
- **Demo Sandbox Reset**: One-click restore to factory seed data with confirmation modal.

### 🎓 Member Self-Service Portal (`/student/*`)
- **Scholar Dashboard** (`/student/dashboard`): Active borrowings summary, due date countdowns, and quick access navigation cards.
- **Discovery Catalogue** (`/student/books`): Responsive card grid and table view, book specification modal, and **Place Hold** action.
- **My Active Loans** (`/student/my-loans`): Active check-outs with **Self-Service Renew (+14d)** button protected by renewal quotas.
- **Reserved Holds** (`/student/reservations`): Queue position badges (`Queue #1`, `Ready Now`), pickup locations, and hold cancellation.
- **Curated Reading Lists** (`/student/reading-lists`): Custom collections ("Research", "To Read", "Favorites") with add/remove actions.
- **Scholar Profile** (`/student/profile`): Display name, email, preferred library branch, and dark mode toggle.

---

## 4. Global UX & Accessibility Features

- **Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Fast spotlight modal to jump to any page, search book titles, lookup members, or switch demo roles.
- **Notification Center Drawer**: Slide-out panel with live unread counter, category filters (Loans, Due Reminders, Overdue, Reservations, System), and mark-all-read.
- **Theme Switcher**: Instant light mode and dark mode transitions preserved in `localStorage`.
- **Responsive Mobile Navigation**: Off-canvas sidebar drawer with backdrop for tablets and mobile viewports.

---

## 5. Technology Stack

- **Framework**: Angular 22 (Standalone Components)
- **Language**: TypeScript 5.8+
- **Styling**: Vanilla CSS Design System with CSS Custom Properties (`styles.css`) + Bootstrap 5.3 utilities
- **Icons**: Bootstrap Icons (SVG/WebFont)
- **State & Mock Engine**: Angular Signals & RxJS Observable streams
- **Routing**: Angular Router with lazy-loaded components and role-aware route guards

---

## 6. Installation & Local Execution

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### Setup & Run
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start local server on port 4200
npm start
```

Access the application in your browser:
**`http://localhost:4200/`**

### Running the Production Build
```bash
npm run build
```
The production bundle will compile cleanly into `dist/frontend/` with **0 errors and 0 warnings**.

---

## 7. Future Django REST Framework API Endpoints

When transitioning from the client-side mock store to a live DRF backend, the services are prepared to integrate with the following standard REST contract:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/admin-login/` | Staff authentication |
| `POST` | `/api/v1/auth/student-login/` | Member authentication |
| `GET` | `/api/v1/auth/me/` | Current user profile |
| `GET / POST` | `/api/v1/books/` | Book collection list and creation |
| `GET / PATCH / DELETE` | `/api/v1/books/{id}/` | Single title operations |
| `GET / POST` | `/api/v1/libraries/` | Library branch directory |
| `GET / POST` | `/api/v1/students/` | Member directory |
| `GET` | `/api/v1/loans/` | All circulation loans |
| `POST` | `/api/v1/loans/issue/` | Check out a copy |
| `POST` | `/api/v1/loans/{id}/return/` | Check in a copy |
| `GET` | `/api/v1/my-loans/` | Member personal borrowings |
| `GET` | `/api/v1/dashboard/stats/` | Executive dashboard stats |

---

## 8. License & Attribution

Designed and built as **LIBRARIA — Enterprise Library & Knowledge Management Platform**.
All UI components, design tokens, mock state stores, and workflows are original and production-ready.
