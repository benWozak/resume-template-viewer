export function escapeLatex(str: string): string {
  return str.replace(/([\\{}$&#^_~%])/g, '\\$1');
}

export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
}

export function escapeUrl(url: string): string {
  return url.replace(/%/g, '\\%').replace(/#/g, '\\#');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

export function formatSnakeCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars except spaces and hyphens
    .replace(/[\s-]+/g, '_'); // Replace spaces and hyphens with single underscore
}