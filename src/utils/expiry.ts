import { ExpiryCalculation, ExpiryStatus } from '../types/document';

/**
 * Calculates expiry status, remaining days, and display tags
 */
export function calculateExpiryStatus(expiryDate?: string | null): ExpiryCalculation {
  if (!expiryDate || expiryDate.trim() === '') {
    return {
      status: 'no_expiry',
      daysRemaining: null,
      label: 'No Expiry',
      colorClass: 'text-slate-600 bg-slate-100 border-slate-200',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-700'
    };
  }

  // Parse YYYY-MM-DD cleanly regardless of timezone
  const [year, month, day] = expiryDate.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    const label = daysAgo === 1 ? 'Expired 1 day ago' : `Expired ${daysAgo} days ago`;
    return {
      status: 'expired',
      daysRemaining,
      label,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800'
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'expiring_soon',
      daysRemaining: 0,
      label: 'Expires today',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800'
    };
  }

  if (daysRemaining <= 30) {
    const label = daysRemaining === 1 ? 'Expires in 1 day' : `Expires in ${daysRemaining} days`;
    return {
      status: 'expiring_soon',
      daysRemaining,
      label,
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800'
    };
  }

  return {
    status: 'valid',
    daysRemaining,
    label: `Expires in ${daysRemaining} days`,
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800'
  };
}

export function getStatusBadgeInfo(status: ExpiryStatus) {
  switch (status) {
    case 'valid':
      return {
        label: 'Valid',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'expiring_soon':
      return {
        label: 'Expiring Soon',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'expired':
      return {
        label: 'Expired',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'no_expiry':
    default:
      return {
        label: 'No Expiry',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
  }
}
