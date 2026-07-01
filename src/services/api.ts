const BASE_URL = 'http://localhost:5000';

let _token: string | null = null;

export function setToken(token: string) {
  _token = token;
}

export function getToken() {
  return _token;
}

export function clearToken() {
  _token = null;
}

export type UserProfile = {
  id: number;
  nombre: string;
  correo: string;
  rol: number;
  telefono: string;
  tipo_cuenta: string;
  edad: number;
};

let _user: UserProfile | null = null;

export function setUser(u: UserProfile) {
  _user = u;
}

export function getUser() {
  return _user;
}

export function clearUser() {
  _user = null;
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error en la solicitud');
  return data as T;
}

export type LoginResponse = {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: number;
    telefono: string;
    tipo_cuenta: string;
    edad: number;
  };
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  telefono?: string;
  edad?: number;
  sexo?: string;
};

export const auth = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: RegisterPayload) =>
    request('/user/add_user', {
      method: 'POST',
      body: JSON.stringify({ ...payload, role: 2, tipo_cuenta: 'personal' }),
    }),
};

export type UpdateProfilePayload = {
  nombre?: string;
  telefono?: string;
  edad?: number;
};

export const userApi = {
  getProfile: (id: number) =>
    request<UserProfile>(`/user/profile/${id}`),

  updateProfile: (id: number, payload: UpdateProfilePayload) =>
    request<UserProfile>(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

export type DashboardSummary = {
  balance_score: number;
  actividades_completadas: number;
  racha_dias: number;
  meta_semanal_pct: number;
};

export type ActivityItem = {
  id: number;
  titulo: string;
  completada: boolean;
  fecha: string;
};

export const dashboardApi = {
  getSummary: (userId: number) =>
    request<DashboardSummary>(`/dashboard/summary/${userId}`),

  getActivity: (userId: number) =>
    request<ActivityItem[]>(`/dashboard/activity/${userId}`),
};
