import { router } from 'expo-router';

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

export type Direccion = {
  id: number | string;
  calle: string;
  numero_exterior: string;
  numero_interior?: string | null;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string | null;
  tipo?: string;
  predeterminada?: boolean;
  activa?: boolean;
  direccion_completa?: string;
};

export type Tarjeta = {
  id: number | string;
  nombre_titular: string;
  numero_enmascarado: string;
  mes_expiracion: string;
  anio_expiracion: string;
  tipo_tarjeta: string;
  predeterminada?: boolean;
};

export const ROLE_ADMIN = 1;
export const ROLE_CLIENT = 2;

export function isAdmin(user: { rol: number } | null | undefined) {
  return user?.rol === ROLE_ADMIN;
}

export type UserProfile = {
  id: number;
  nombre: string;
  correo: string;
  rol: number;
  rol_texto?: string;
  telefono: string;
  tipo_cuenta: string;
  edad: number;
  sexo?: string | null;
  fecha_registro?: string;
  direcciones?: Direccion[];
  total_direcciones?: number;
  tarjetas?: Tarjeta[];
  total_tarjetas?: number;
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

  if (res.status === 401) {
    clearToken();
    clearUser();
    router.replace('/login');
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  }

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

export type RegisterChildPayload = {
  tutor_nombre: string;
  tutor_telefono: string;
  name: string;
  email: string;
  password: string;
  edad: number;
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

  registerChild: (payload: RegisterChildPayload) =>
    request('/user/children/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export type UpdateProfilePayload = {
  nombre?: string;
  correo?: string;
  telefono?: string;
  sexo?: string;
  edad?: number;
};

export const userApi = {
  getProfile: (id: number) =>
    request<UserProfile>(`/user/profile/${id}`),

  updateProfile: (_id: number, payload: UpdateProfilePayload) =>
    request<UserProfile>('/user/update', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ msg: string }>('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    }),
};

export const adminApi = {
  getAllUsers: () => request<UserProfile[]>('/user/'),

  searchUsers: (query: string) =>
    request<UserProfile[]>(`/user/search?query=${encodeURIComponent(query)}`),

  updateUserRole: (userId: number, role: number) =>
    request<{ msg: string }>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  deleteUser: (userId: number) =>
    request<{ msg: string }>(`/user/${userId}`, {
      method: 'DELETE',
    }),
};

export type AddDireccionPayload = {
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string;
  tipo?: string;
  predeterminada?: boolean;
};

export const direccionesApi = {
  getMine: () => request<Direccion[]>('/direcciones/me/direcciones'),

  add: (payload: AddDireccionPayload) =>
    request<Direccion>('/direcciones/me/add_direccion', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  remove: (direccionId: number | string) =>
    request<{ msg: string }>(`/direcciones/${direccionId}`, {
      method: 'DELETE',
    }),
};

export type AddTarjetaPayload = {
  nombre_titular: string;
  numero_tarjeta: string;
  mes_expiracion: string;
  anio_expiracion: string;
  predeterminada?: boolean;
};

export const tarjetasApi = {
  getMine: () => request<Tarjeta[]>('/tarjetas/me'),

  add: (userId: number, payload: AddTarjetaPayload) =>
    request<Tarjeta>(`/tarjetas/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  remove: (tarjetaId: number | string) =>
    request<{ msg: string }>(`/tarjetas/${tarjetaId}`, {
      method: 'DELETE',
    }),
};

export type Suplemento = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  categoria_nombre: string;
  presentacion: string;
  presentacion_nombre: string;
  beneficios: string | null;
  modo_uso: string | null;
  stock: number;
  activo: boolean;
};

export type SuplementoPayload = {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  presentacion: string;
  beneficios?: string;
  modo_uso?: string;
  stock: number;
  activo?: boolean;
};

export const suplementosApi = {
  getActive: () => request<Suplemento[]>('/suplementos/active'),

  getAll: () => request<Suplemento[]>('/suplementos/?all=true'),

  create: (payload: SuplementoPayload) =>
    request<{ msg: string; suplemento: Suplemento }>('/suplementos/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: Partial<SuplementoPayload>) =>
    request<{ msg: string; suplemento: Suplemento }>(`/suplementos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  toggleActivo: (id: number) =>
    request<{ msg: string; suplemento: Suplemento }>(`/suplementos/${id}/toggle`, {
      method: 'PUT',
    }),

  remove: (id: number) =>
    request<{ msg: string }>(`/suplementos/${id}`, { method: 'DELETE' }),
};

export type Dieta = {
  id: number;
  nombre: string;
  descripcion: string;
  objetivo: string;
  objetivo_nombre: string;
  duracion_dias: number;
  calorias_diarias: number;
  nivel_actividad: string;
  nivel_actividad_nombre: string;
  restricciones: string[];
  comidas_por_dia: number;
  activo: boolean;
};

type DietasResponse = {
  success: boolean;
  data: Dieta[];
  total: number;
};

export type PerfilDieta = {
  nombre?: string;
  edad: number;
  peso: number;
  altura: number;
  objetivo: string;
  nivelActividad: string;
  comidasPorDia: number;
  restricciones?: string[];
  enfermedades?: string[];
  alergias?: string[];
  noGusta?: string[];
};

export type ComidaItem = {
  nombre: string;
  cantidad: string;
  preparacion: string;
  calorias: number;
};

export type ComidaPlan = {
  id: number;
  tipo: string;
  hora: string;
  completado: boolean;
  calorias: number;
  items: ComidaItem[];
};

export type DiaPlan = {
  dia: number;
  fecha: string;
  fecha_formateada: string;
  completado: boolean;
  calorias_dia: number;
  comidas: ComidaPlan[];
};

export type PlanGenerado = {
  perfil: PerfilDieta;
  calorias_diarias: number;
  fecha_inicio: string;
  dias: DiaPlan[];
};

export type CrearDietaUsuarioPayload = {
  nombre: string;
  plan_generado: PlanGenerado;
  perfil_usuario?: PerfilDieta;
  descripcion?: string;
  mantener_anterior?: boolean;
};

export type DietaUsuario = {
  id: number;
  usuario_id: number;
  dieta_base_id: number | null;
  nombre: string;
  descripcion?: string | null;
  fecha_inicio?: string;
  fecha_fin?: string | null;
  perfil_usuario: PerfilDieta | Record<string, never>;
  plan_generado: PlanGenerado;
  progreso: number;
  activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
};

type DietasUsuarioResponse = {
  success: boolean;
  data: DietaUsuario[];
  total: number;
};

export const dietasApi = {
  getAll: async () => {
    const res = await request<DietasResponse>('/dietas/');
    return res.data;
  },

  generarPlan: async (perfil: PerfilDieta) => {
    const res = await request<{ success: boolean; data: PlanGenerado }>('/dietas/generar-plan', {
      method: 'POST',
      body: JSON.stringify({ perfil }),
    });
    return res.data;
  },

  crearDietaUsuario: (payload: CrearDietaUsuarioPayload) =>
    request<{ success: boolean; msg: string; id: number }>('/dietas/usuario', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMisDietas: async () => {
    const res = await request<DietasUsuarioResponse>('/dietas/usuario');
    return res.data;
  },

  desactivarDieta: (dietaUsuarioId: number) =>
    request<{ success: boolean; msg: string }>(`/dietas/usuario/${dietaUsuarioId}/desactivar`, {
      method: 'PUT',
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

export type CartItemPayload = {
  suplemento_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

export type OrdenCarritoPayload = {
  nombre_usuario: string;
  telefono_usuario: string;
  items: CartItemPayload[];
  precio_total: number;
  metodo_pago?: string;
  notas?: string;
};

export type OrdenResponse = {
  msg: string;
  orden: {
    id: number;
    codigo_unico: string;
    estado: string;
    precio_total: number;
  };
  notificaciones_generadas: boolean;
};

export type EstadoOrden =
  | 'pendiente'
  | 'confirmada'
  | 'pagada'
  | 'en_preparacion'
  | 'enviada'
  | 'entregada'
  | 'cancelada'
  | 'reembolsada';

export type Orden = {
  id: number;
  codigo_unico: string;
  nombre_usuario: string;
  telefono_usuario: string;
  tipo_pedido: string;
  suplemento: Suplemento | null;
  direccion_texto: string | null;
  direccion_id: number | null;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  metodo_pago: string;
  info_pago: Record<string, unknown> | null;
  notas: string | null;
  pedido_json: string | null;
  estado: EstadoOrden;
  estado_nombre: string;
  fecha_creacion: string | null;
  fecha_actualizacion: string | null;
};

export const ordenesApi = {
  createCarrito: (payload: OrdenCarritoPayload) =>
    request<OrdenResponse>('/ordenes/', {
      method: 'POST',
      body: JSON.stringify({
        nombre_usuario: payload.nombre_usuario,
        telefono_usuario: payload.telefono_usuario,
        tipo_pedido: 'carrito',
        pedido_json: JSON.stringify({ items: payload.items }),
        precio_total: payload.precio_total,
        metodo_pago: payload.metodo_pago ?? 'efectivo',
        notas: payload.notas,
      }),
    }),

  getAll: () => request<Orden[]>('/ordenes/'),

  cambiarEstado: (ordenId: number, estado: EstadoOrden) =>
    request<{ msg: string; orden: Orden }>(`/ordenes/${ordenId}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    }),

  remove: (ordenId: number) =>
    request<{ msg: string }>(`/ordenes/${ordenId}`, { method: 'DELETE' }),

  getEstadisticas: () =>
    request<{ success: boolean; stats: Record<string, unknown> }>('/ordenes/estadisticas'),
};
