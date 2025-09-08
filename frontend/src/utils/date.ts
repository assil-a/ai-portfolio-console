import { formatDistanceToNow, format, parseISO } from 'date-fns';

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

export const formatExactTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'PPpp');
  } catch {
    return 'Unknown';
  }
};

export const formatShortDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Unknown';
  }
};