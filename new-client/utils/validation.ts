const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+972|0)[\d\-]{8,12}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'אימייל הוא שדה חובה';
  if (!EMAIL_RE.test(email.trim())) return 'כתובת אימייל לא תקינה';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null; // phone is optional
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!PHONE_RE.test(cleaned)) return 'מספר טלפון לא תקין (לדוגמה: 054-1234567)';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} הוא שדה חובה`;
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password.trim()) return 'סיסמא היא שדה חובה';
  if (password.length < 6) return 'סיסמא חייבת להכיל לפחות 6 תווים';
  return null;
}
