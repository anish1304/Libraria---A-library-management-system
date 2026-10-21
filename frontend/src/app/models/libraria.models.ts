export type UserRole = 'super_admin' | 'librarian' | 'student' | 'faculty';

export interface UserAccount {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: UserRole;
  role_display: string;
  student_id_no?: string;
  department?: string;
  library_id: number;
  library_name: string;
  is_active: boolean;
  max_loans: number;
  max_renewals: number;
  avatar_url?: string;
  membership_tier?: 'standard' | 'premium' | 'fellow';
  membership_badge?: string;
  created_at: string;
}

export interface BookReview {
  id: number;
  book_id: number;
  member_name: string;
  member_id?: number;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface PaymentReceipt {
  receipt_no: string;
  transaction_id: string;
  amount: number;
  purpose: string;
  description?: string;
  payment_method: string;
  method?: string;
  paid_at: string;
  member_name: string;
  student_name?: string;
  member_id_no: string;
  student_id?: number;
  fineId?: number;
  planTier?: string;
  status?: string;
}

export type BookCondition = 'Mint' | 'Good' | 'Fair' | 'Damaged';
export type CopyStatus = 'Available' | 'Issued' | 'Reserved' | 'Maintenance' | 'Lost' | 'Retired';

export interface BookCopy {
  id: number;
  book_id: number;
  accession_no: string;
  barcode: string;
  library_id: number;
  library_name: string;
  shelf_location: string;
  condition: BookCondition;
  status: CopyStatus;
  acquisition_date: string;
  last_inspected?: string;
}

export interface BookTitle {
  id: number;
  title: string;
  subtitle?: string;
  isbn: string;
  isbn13?: string;
  authors: string[];
  publisher: string;
  publication_year: number;
  edition?: string;
  language: string;
  categories: string[];
  description: string;
  format: 'Hardcover' | 'Paperback' | 'Digital / E-Book' | 'Periodical';
  pages?: number;
  cover_url?: string;
  shelf_location: string;
  library_id: number;
  library_name: string;
  total_copies: number;
  available_copies: number;
  popularity_score: number;
  rating?: number;
  reviews_count?: number;
  reviews?: BookReview[];
  is_wishlisted?: boolean;
  genre_path?: string[];
  created_at: string;
}

export interface LibraryBranch {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  contact_email: string;
  contact_phone: string;
  opening_hours: string;
  status: 'Active' | 'Renovating' | 'Restricted';
  total_books: number;
  active_members: number;
  current_loans: number;
  created_at: string;
}

export type LoanStatus = 'Issued' | 'Returned';

export interface LoanRecord {
  id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  book_isbn: string;
  copy_id: number;
  copy_barcode: string;
  member_id: number;
  member_name: string;
  member_role: UserRole;
  member_email: string;
  member_id_no: string;
  library_id: number;
  library_name: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: LoanStatus;
  is_overdue: boolean;
  overdue_days: number;
  renewal_count: number;
  max_renewals: number;
  fine_amount: number;
  fine_paid: boolean;
}

export type ReservationStatus = 'Waiting' | 'Ready for Pickup' | 'Fulfilled' | 'Cancelled' | 'Expired';

export interface ReservationRecord {
  id: number;
  book_id: number;
  book_title: string;
  book_author: string;
  member_id: number;
  member_name: string;
  member_email: string;
  library_id: number;
  library_name: string;
  reservation_date: string;
  expiry_date: string;
  queue_position: number;
  status: ReservationStatus;
  notes?: string;
}

export type FineStatus = 'Pending' | 'Paid' | 'Waived';

export interface FineRecord {
  id: number;
  loan_id: number;
  member_id: number;
  member_name: string;
  book_title: string;
  overdue_days: number;
  daily_rate: number;
  amount: number;
  status: FineStatus;
  created_at: string;
  paid_at?: string;
  receipt_no?: string;
  reason?: string;
}


export interface ReadingList {
  id: number;
  member_id: number;
  name: string;
  description: string;
  book_ids: number[];
  created_at: string;
  is_system?: boolean;
}

export type NotificationType = 'loan' | 'due' | 'overdue' | 'reservation' | 'system';

export interface NotificationItem {
  id: number;
  recipient_id?: number;
  recipient_role?: UserRole | 'all';
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  is_read: boolean;
  link?: string;
}

export interface AuditEvent {
  id: number;
  timestamp: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  target_type: 'Book' | 'Copy' | 'Member' | 'Loan' | 'Reservation' | 'Fine' | 'Settings' | 'Library';
  target_id: string | number;
  summary: string;
  library_name?: string;
}

export interface SystemSettings {
  org_name: string;
  org_tagline: string;
  default_loan_days_student: number;
  default_loan_days_faculty: number;
  max_renewals_student: number;
  max_renewals_faculty: number;
  max_active_loans_student: number;
  max_active_loans_faculty: number;
  daily_fine_rate: number;
  reservation_expiry_days: number;
  default_library_id: number;
  enable_email_reminders: boolean;
  enable_waitlist_auto_promote: boolean;
  table_density: 'comfortable' | 'compact';
}
