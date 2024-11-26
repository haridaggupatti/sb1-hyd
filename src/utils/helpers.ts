export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function truncateFilename(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;
  const ext = filename.split('.').pop();
  const name = filename.substring(0, filename.lastIndexOf('.'));
  const truncated = name.substring(0, maxLength - 5) + '...' + name.slice(-2);
  return `${truncated}.${ext}`;
}