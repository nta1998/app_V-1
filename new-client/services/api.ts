import { API_URL } from '../constants/config';

const BASE_URL = API_URL;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

// ─── Error types ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isAuth() { return this.status === 401 || this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isValidation() { return this.status === 400; }
  get isServer() { return this.status >= 500; }
}

export class NetworkError extends Error {
  constructor(message: string = 'אין חיבור לאינטרנט') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'הבקשה לקחה יותר מדי זמן') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/** Returns a user-facing Hebrew message for any API/network error. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof TimeoutError) return err.message;
  if (err instanceof NetworkError) return err.message;
  if (err instanceof ApiError) {
    if (err.isAuth) return 'נדרשת הזדהות מחדש';
    if (err.isNotFound) return 'הפריט לא נמצא';
    if (err.isValidation) return 'נתונים שגויים — נא לבדוק את הטופס';
    if (err.isServer) return 'שגיאת שרת — נסה שוב מאוחר יותר';
    return `שגיאה: ${err.status}`;
  }
  return 'שגיאה לא צפויה';
}

// ─── Core request ────────────────────────────────────────────────────────────

function getHeaders(json = true): HeadersInit {
  const headers: HeadersInit = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (authToken) headers['Authorization'] = `Token ${authToken}`;
  return headers;
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err?.name === 'AbortError') throw new TimeoutError();
      throw new NetworkError();
    })
    .finally(() => clearTimeout(timer));
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const fetchOptions: RequestInit = {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  };

  let lastError: unknown;
  const attempts = (options?.method && options.method !== 'GET') ? 1 : MAX_RETRIES + 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);

    try {
      const response = await fetchWithTimeout(url, fetchOptions, REQUEST_TIMEOUT_MS);

      if (!response.ok) {
        let body: unknown;
        try { body = await response.json(); } catch { /* ignore */ }
        const err = new ApiError(
          `API error: ${response.status} ${response.statusText}`,
          response.status,
          response.statusText,
          body,
        );
        // Only retry on server errors for GET requests
        if (err.isServer && attempt < attempts - 1) { lastError = err; continue; }
        throw err;
      }

      // Handle 204 No Content
      if (response.status === 204) return undefined as T;
      return response.json();
    } catch (err) {
      if (err instanceof ApiError || err instanceof TimeoutError || err instanceof NetworkError) {
        lastError = err;
        if (err instanceof ApiError && !err.isServer) throw err;
        if (attempt === attempts - 1) throw err;
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserStatus = 'pending' | 'approved' | 'blocked';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar: string | null;
  is_staff: boolean;
  is_active: boolean;
  status: UserStatus;
  auth_provider: 'local' | 'google' | 'apple';
  created_at: string;
}

export interface ProjectDocument {
  id: number;
  project: number;
  title: string;
  file: string;
  doc_type: 'MARKETING' | 'PLAN' | 'CONTRACT' | 'OTHER';
  created_at: string;
}

export interface Project {
  id: number;
  project_address: string;
  project_url: string | null;
  project_image_url: string | null;
  project_description: string | null;
  percentage: number;
  type: string | null;
  title: string;
  documents: ProjectDocument[];
}

export interface ApartmentDocument {
  id: number;
  apartment: number;
  file: string;
  doc_type: 'MAIN' | 'IMAGE' | 'PDF';
  created_at: string;
}

export interface Apartment {
  id: number;
  project: Project;
  price: string | null;
  apartment_specific_address: string;
  apartment_size_sqm: number | null;
  number_of_rooms: number | null;
  floor: number | null;
  facade: string | null;
  balcony_size_sqm: number | null;
  air_directions: string | null;
  parking: string | null;
  neighborhood: string | null;
  entry_date: string | null;
  apartment_image_url: string | null;
  bank_escort: boolean;
  description: string | null;
  type: string | null;
  main_image_doc: number | null;
  main_image: string | null;
  documents: ApartmentDocument[];
}

export type SigningStatus = 'NONE' | 'PENDING' | 'SIGNED' | 'APPROVED' | 'REJECTED';

export interface DealDocument {
  id: number;
  user: string;
  deal: number;
  filename: string;
  file: string;
  file_type: 'ID' | 'CONTRACT' | 'PAYMENT' | 'OTHER';
  signing_status: SigningStatus;
  signed_file: string | null;
  signature_image: string | null;
  signed_at: string | null;
  uploaded_at: string;
}

export type DealStage = 'ATTACHMENT' | 'CONTRACT' | 'SIGNING' | 'CLOSING';

export interface DealTeamMember {
  id: number;
  deal: number;
  role: 'DEAL_MANAGER' | 'LAWYER';
  name: string;
  phone: string;
  email: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'upcoming';

export interface Payment {
  id: number;
  deal: number;
  payment_number: number;
  due_date: string;
  amount: string;
  status: PaymentStatus;
  description: string;
  paid_at: string | null;
  created_at: string;
}

export interface DealTransaction {
  id: number;
  deal: number;
  document: number | null;
  stage: DealStage;
  stage_display: string;
  status: 'WAITING_CLIENT' | 'WAITING_APPROVAL' | 'DONE';
  status_display: string;
  request_date: string;
  completion_date: string | null;
  description: string | null;
}

export interface Deal {
  id: number;
  user: User;
  apartment: Apartment;
  project: Project | null;
  status: 'Active' | 'Completed' | 'Cancelled';
  stage: DealStage;
  created_at: string;
  documents: DealDocument[];
  transactions: DealTransaction[];
  team_members?: DealTeamMember[];
  payments?: Payment[];
}

export interface Notification {
  id: number;
  user: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Favorite {
  id: number;
  user: string;
  apartment: Apartment | null;
  project: Project | null;
  added_at: string;
}

export interface ActivityFeedItem {
  id: number;
  user_name: string;
  user_avatar: string | null;
  activity_type: 'DEAL_CREATE' | 'DOC_UPLOAD' | 'PAYMENT' | 'MEETING' | 'STATUS_CHANGE';
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  time_ago: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  is_new?: boolean;
}

export interface StatusResponse {
  status: UserStatus;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  googleAuth: (email: string, fullName?: string, idToken?: string) =>
    request<LoginResponse>('/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, id_token: idToken }),
    }),

  appleAuth: (email: string, fullName?: string, idToken?: string) =>
    request<LoginResponse>('/auth/apple/', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, id_token: idToken }),
    }),

  checkStatus: () => request<StatusResponse>('/auth/status/'),

  profile: () => request<User>('/auth/profile/'),

  updateProfile: async (data: FormData): Promise<User> => {
    const response = await fetchWithTimeout(
      `${BASE_URL}/auth/profile/`,
      { method: 'PATCH', headers: getHeaders(false), body: data },
      REQUEST_TIMEOUT_MS,
    );
    if (!response.ok) {
      let body: unknown;
      try { body = await response.json(); } catch { /* ignore */ }
      throw new ApiError(`API error: ${response.status}`, response.status, response.statusText, body);
    }
    return response.json() as Promise<User>;
  },

  listUsers: (statusFilter?: string) =>
    request<User[]>(statusFilter ? `/auth/users/?status=${statusFilter}` : '/auth/users/'),

  approveUser: (userId: string) =>
    request<{ id: string; status: string }>(`/auth/users/${userId}/approve/`, { method: 'PATCH' }),

  blockUser: (userId: string) =>
    request<{ id: string; status: string }>(`/auth/users/${userId}/block/`, { method: 'PATCH' }),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: () => request<Project[]>('/projects/'),
  get: (id: number) => request<Project>(`/projects/${id}/`),
  create: (data: { project_address: string; project_url?: string; project_image_url?: string; project_description?: string }) =>
    request<Project>('/projects/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ project_address: string; project_url: string; project_image_url: string; project_description: string }>) =>
    request<Project>(`/projects/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/projects/${id}/`, { method: 'DELETE' }),
};

// ─── Apartments ───────────────────────────────────────────────────────────────

export const apartmentsApi = {
  list: (projectId?: number) =>
    request<Apartment[]>(projectId ? `/apartments/?project_id=${projectId}` : '/apartments/'),
  get: (id: number) => request<Apartment>(`/apartments/${id}/`),
};

// ─── Deals ────────────────────────────────────────────────────────────────────

export interface CreateDealPayload {
  user_id: string;
  apartment_id: number;
  team_members: { role: 'DEAL_MANAGER' | 'LAWYER'; name: string; phone: string; email: string }[];
  payments: { due_date: string; amount: string; description: string }[];
}

export const dealsApi = {
  list: () => request<Deal[]>('/deals/'),
  get: (id: number) => request<Deal>(`/deals/${id}/`),
  /** Get the current user's active deal (first active deal) */
  myDeal: () => request<Deal>('/deals/my/'),
  /** Admin: create a new deal (attach apartment to client) */
  create: (data: CreateDealPayload) =>
    request<Deal>('/deals/', { method: 'POST', body: JSON.stringify(data) }),
  /** Admin: advance deal stage */
  advanceStage: (id: number) =>
    request<Deal>(`/deals/${id}/advance-stage/`, { method: 'POST' }),
  progress: (id: number, data: Record<string, unknown>) =>
    request<Deal>(`/deals/${id}/progress/`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Deal Team ────────────────────────────────────────────────────────────────

export const dealTeamApi = {
  list: (dealId: number) => request<DealTeamMember[]>(`/deals/${dealId}/team/`),
  add: (dealId: number, member: Omit<DealTeamMember, 'id' | 'deal'>) =>
    request<DealTeamMember>(`/deals/${dealId}/team/`, { method: 'POST', body: JSON.stringify(member) }),
  remove: (dealId: number, memberId: number) =>
    request<void>(`/deals/${dealId}/team/${memberId}/`, { method: 'DELETE' }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  list: (dealId: number) => request<Payment[]>(`/deals/${dealId}/payments/`),
  add: (dealId: number, payment: { due_date: string; amount: string; description: string }) =>
    request<Payment>(`/deals/${dealId}/payments/`, { method: 'POST', body: JSON.stringify(payment) }),
  markPaid: (dealId: number, paymentId: number) =>
    request<Payment>(`/deals/${dealId}/payments/${paymentId}/mark-paid/`, { method: 'POST' }),
};

// ─── Deal Documents ───────────────────────────────────────────────────────────

export const dealDocumentsApi = {
  list: (dealId: number) => request<DealDocument[]>(`/deals/${dealId}/documents/`),
  /** Admin: upload a document to a deal */
  upload: (dealId: number, formData: FormData) =>
    fetchWithTimeout(
      `${BASE_URL}/deals/${dealId}/documents/`,
      { method: 'POST', headers: getHeaders(false), body: formData },
      REQUEST_TIMEOUT_MS,
    ).then(async (r) => {
      if (!r.ok) {
        let body: unknown;
        try { body = await r.json(); } catch { /* ignore */ }
        throw new ApiError(`API error: ${r.status}`, r.status, r.statusText, body);
      }
      return r.json() as Promise<DealDocument>;
    }),
  /** Client: sign a document */
  sign: (docId: number, signatureData: FormData) =>
    fetchWithTimeout(
      `${BASE_URL}/deal-documents/${docId}/sign/`,
      { method: 'POST', headers: getHeaders(false), body: signatureData },
      REQUEST_TIMEOUT_MS,
    ).then(async (r) => {
      if (!r.ok) {
        let body: unknown;
        try { body = await r.json(); } catch { /* ignore */ }
        throw new ApiError(`API error: ${r.status}`, r.status, r.statusText, body);
      }
      return r.json() as Promise<DealDocument>;
    }),
  /** Admin: approve a signed document */
  approve: (docId: number) =>
    request<DealDocument>(`/deal-documents/${docId}/approve/`, { method: 'POST' }),
  /** Admin: reject a signed document */
  reject: (docId: number) =>
    request<DealDocument>(`/deal-documents/${docId}/reject/`, { method: 'POST' }),
};

// ─── Notifications (Admin) ────────────────────────────────────────────────────

export const adminNotificationsApi = {
  /** Admin: send a notification to a specific user */
  send: (userId: string, data: { title: string; message: string; type?: string }) =>
    request<Notification>('/notifications/send/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, ...data }),
    }),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () => request<Notification[]>('/notifications/'),
  markRead: (id: number) =>
    request<{ status: string }>(`/notifications/${id}/read/`, { method: 'POST' }),
};

// ─── Favorites ────────────────────────────────────────────────────────────────

export const favoritesApi = {
  list: () => request<Favorite[]>('/favorites/'),
  addProject: (projectId: number) =>
    request<Favorite>('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    }),
  addApartment: (apartmentId: number) =>
    request<Favorite>('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ apartment_id: apartmentId }),
    }),
  remove: (id: number) => request<void>(`/favorites/${id}/`, { method: 'DELETE' }),
};

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const activityApi = {
  list: () => request<ActivityFeedItem[]>('/activity-feed/'),
};
