export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getFileTypeInfo(mimeOrExt: string) {
  const lower = (mimeOrExt || '').toLowerCase();
  if (lower.includes('pdf') || lower.endsWith('.pdf')) {
    return {
      type: 'pdf',
      label: 'PDF',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  }
  if (lower.includes('png') || lower.endsWith('.png')) {
    return {
      type: 'png',
      label: 'PNG',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
  }
  if (lower.includes('jpeg') || lower.includes('jpg') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return {
      type: 'jpg',
      label: 'JPG',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    };
  }
  return {
    type: 'document',
    label: 'FILE',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  };
}
