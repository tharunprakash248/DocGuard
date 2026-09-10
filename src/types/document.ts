export type DocumentCategory =
  | 'Identity'
  | 'Education'
  | 'Certificates'
  | 'License'
  | 'Insurance'
  | 'Finance'
  | 'Medical'
  | 'Other';

export type ExpiryStatus = 'valid' | 'expiring_soon' | 'expired' | 'no_expiry';

export interface DocumentItem {
  id: string;
  userId: string;
  title: string;                 // UI title
  documentName?: string;         // Explicit documentName metadata field
  category: DocumentCategory;
  issueDate: string;             // YYYY-MM-DD
  expiryDate?: string | null;    // YYYY-MM-DD or null
  notes?: string;
  fileUrl?: string;              // Download/preview URL (prepared for future storage)
  storagePath?: string;          // Cloud storage path (prepared for future storage)
  fileName: string;              // Original file name (e.g., passport.pdf)
  fileType: string;              // MIME type or extension (e.g. application/pdf)
  fileSize: number;              // in bytes
  createdAt: string;             // ISO string
  updatedAt: string;             // ISO string
}

export interface ExpiryCalculation {
  status: ExpiryStatus;
  daysRemaining: number | null;
  label: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
}

export interface CategoryInfo {
  name: DocumentCategory;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export interface DocumentFilterOptions {
  searchQuery: string;
  category: string;
  fileType: string;
  status: string;
  sortBy: 'expirySoonest' | 'newest' | 'oldest' | 'nameAsc';
}
