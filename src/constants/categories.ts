import { DocumentCategory, CategoryInfo } from '../types/document';

export const CATEGORIES: CategoryInfo[] = [
  {
    name: 'Identity',
    description: 'Passports, IDs, Driving licenses, SSN, National identity cards',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    iconName: 'UserCheck'
  },
  {
    name: 'Education',
    description: 'Degrees, Diplomas, Transcripts, Enrollment letters, School certificates',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    iconName: 'GraduationCap'
  },
  {
    name: 'Certificates',
    description: 'Professional licenses, Training certificates, Awards, Accreditations',
    color: '#06b6d4',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    iconName: 'Award'
  },
  {
    name: 'License',
    description: 'Vehicle permits, Professional permits, Business registrations',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    iconName: 'FileBadge'
  },
  {
    name: 'Insurance',
    description: 'Health, Auto, Home, Life, Travel insurance policies and cards',
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    iconName: 'ShieldCheck'
  },
  {
    name: 'Finance',
    description: 'Tax forms, Bank statements, Investment documents, Loan records',
    color: '#14b8a6',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    iconName: 'CreditCard'
  },
  {
    name: 'Medical',
    description: 'Vaccinations, Prescriptions, Health records, Doctor reports',
    color: '#ef4444',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    iconName: 'HeartPulse'
  },
  {
    name: 'Other',
    description: 'Utility bills, Warranties, Contracts, Miscellaneous paperwork',
    color: '#64748b',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    iconName: 'FileText'
  }
];

export const CATEGORY_NAMES: DocumentCategory[] = CATEGORIES.map(c => c.name);

export function getCategoryInfo(name: DocumentCategory | string): CategoryInfo {
  const found = CATEGORIES.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
  if (found) return found;
  return CATEGORIES[CATEGORIES.length - 1]; // Fallback to Other
}
