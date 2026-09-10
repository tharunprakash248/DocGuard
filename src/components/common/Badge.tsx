import React from 'react';
import { ExpiryStatus, DocumentCategory } from '../../types/document';
import { getStatusBadgeInfo } from '../../utils/expiry';
import { getCategoryInfo } from '../../constants/categories';
import {
  UserCheck,
  GraduationCap,
  Award,
  FileBadge,
  ShieldCheck,
  CreditCard,
  HeartPulse,
  FileText
} from 'lucide-react';

interface StatusBadgeProps {
  status: ExpiryStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const info = getStatusBadgeInfo(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${info.bg} ${info.text} ${info.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: DocumentCategory | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  showIcon = true
}) => {
  const cat = getCategoryInfo(category);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const renderIcon = () => {
    const iconClass = 'w-3.5 h-3.5 shrink-0';
    switch (cat.iconName) {
      case 'UserCheck': return <UserCheck className={iconClass} />;
      case 'GraduationCap': return <GraduationCap className={iconClass} />;
      case 'Award': return <Award className={iconClass} />;
      case 'FileBadge': return <FileBadge className={iconClass} />;
      case 'ShieldCheck': return <ShieldCheck className={iconClass} />;
      case 'CreditCard': return <CreditCard className={iconClass} />;
      case 'HeartPulse': return <HeartPulse className={iconClass} />;
      default: return <FileText className={iconClass} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${cat.bgColor} ${cat.textColor} ${cat.borderColor} ${sizeClasses}`}
    >
      {showIcon && renderIcon()}
      {cat.name}
    </span>
  );
};
