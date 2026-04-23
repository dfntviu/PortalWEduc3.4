// types/interfacesv2.ts

/**
 * ============================================================================
 * INTERFACES DEL SISTEMA DE AUTENTICACIÓN MULTIUSUARIO
 * Portal Educativo FI-UAEMEX
 * ============================================================================
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * UserRole - Roles disponibles en el sistema
 * 
 * @type {'professor' | 'alumno'}
 * 
 * - professor: Usuario con rol de profesor (modera materiales)
 * - alumno: Usuario con rol de estudiante (sube materiales)
 */
export type UserRole = 'teacher' | 'student';

/**
 * AuthStatus - Estados de autenticación posibles
 */
export type AuthStatus = 
  | 'authenticated'    // Usuario autenticado
  | 'unauthenticated'  // Usuario no autenticado
  | 'loading'          // Cargando estado de autenticación
  | 'error';           // Error en autenticación

// ============================================================================
// INTERFACES DE PERFIL BASE
// ============================================================================

/**
 * BaseProfile - Campos comunes para todos los perfiles de usuario
 * 
 * Esta interfaz define los campos que comparten tanto profesores como estudiantes
 */
export interface BaseProfile {
  /** ID único del usuario en Firebase Auth */
  uid: string;
  
  /** Nombre(s) del usuario */
  name: string;
  
  /** Apellido(s) del usuario */
  apellido: string;
  
  /** Correo electrónico institucional */
  email: string;
  
  /** Rol del usuario en el sistema */
  role: UserRole;
  
  /** Número de cuenta institucional */
  numCuenta: string;
  
  /** Fecha de creación del perfil (ISO 8601) */
  createdAt: string;
  
  /** Fecha de última actualización del perfil (ISO 8601) - Opcional */
  updatedAt?: string;
  
  /** URL de la foto de perfil - Opcional */
  photoURL?: string;
  
  /** Número de teléfono - Opcional */
  phoneNumber?: string;
  
  /** Estado del perfil (activo/inactivo) - Opcional */
  status?: 'active' | 'inactive' | 'suspended';
}

// ============================================================================
// INTERFACE: PERFIL DE PROFESOR
// ============================================================================

/**
 * ProfileTeacher - Perfil completo de un usuario con rol de profesor
 * 
 * Extiende BaseProfile y añade campos específicos para profesores
 * 
 * @extends BaseProfile
 * 
 * @example
 * ```typescript
 * const teacherProfile: ProfileTeacher = {
 *   uid: 'abc123',
 *   name: 'Juan',
 *   apellido: 'Pérez García',
 *   email: 'juan.perez@fi.uaemex.mx',
 *   role: 'professor',
 *   numCuenta: 'PROF-001',
 *   area: 'Ingeniería en Computación',
 *   createdAt: '2024-01-15T10:30:00Z',
 *   especialidad: 'Inteligencia Artificial',
 *   grado: 'Doctor'
 * };
 * ```
 */
export interface ProfileTeacher extends BaseProfile {
  /** Rol fijo para profesores */
  role: 'teacher';
  
  /** 
   * Área académica del profesor
   * Ejemplo: "Ingeniería en Computación", "Matemáticas", "Física"
   */
  area: string;
  
  /** 
   * Especialidad o área de expertise del profesor - Opcional
   * Ejemplo: "Inteligencia Artificial", "Bases de Datos", "Redes"
   */
  especialidad?: string;
  
  /** 
   * Grado académico del profesor - Opcional
   * Ejemplo: "Licenciado", "Maestro", "Doctor"
   */
  grado?: 'Licenciado' | 'Maestro' | 'Doctor' | 'Postdoctorado';
  
  /** 
   * Materias que imparte el profesor - Opcional
   * Array de nombres de materias
   */
  materias?: string[];
  
  /**
   * Número de materiales moderados por el profesor - Opcional
   */
  materialesModerated?: number;
  
  /**
   * Horario de atención a estudiantes - Opcional
   */
  horarioAtencion?: string;
  
  /**
   * Extensión telefónica - Opcional
   */
  extension?: string;
  
  /**
   * Oficina o cubículo - Opcional
   */
  oficina?: string;
}

// ============================================================================
// INTERFACE: PERFIL DE ESTUDIANTE
// ============================================================================

/**
 * ProfileStudent - Perfil completo de un usuario con rol de estudiante
 * 
 * Extiende BaseProfile y añade campos específicos para estudiantes
 * 
 * @extends BaseProfile
 * 
 * @example
 * ```typescript
 * const studentProfile: ProfileStudent = {
 *   uid: 'xyz789',
 *   name: 'María',
 *   apellido: 'González López',
 *   email: 'maria.gonzalez@alumno.fi.uaemex.mx',
 *   role: 'alumno',
 *   numCuenta: '2021001234',
 *   carrera: 'Ingeniería en Software',
 *   createdAt: '2024-01-15T10:30:00Z',
 *   semestre: 6,
 *   grupo: 'A'
 * };
 * ```
 */
export interface ProfileStudent extends BaseProfile {
  /** Rol fijo para estudiantes */
  role: 'alumno';
  
  /** 
   * Carrera que cursa el estudiante
   * Ejemplo: "Ingeniería en Software", "Ingeniería en Computación"
   */
  carrera: string;
  
  /** 
   * Semestre actual del estudiante - Opcional
   * Rango: 1-10 (típicamente)
   */
  semestre?: number;
  
  /** 
   * Grupo al que pertenece el estudiante - Opcional
   * Ejemplo: "A", "B", "C"
   */
  grupo?: string;
  
  /** 
   * Turno del estudiante - Opcional
   */
  turno?: 'Matutino' | 'Vespertino' | 'Mixto';
  
  /**
   * Número de materiales subidos por el estudiante - Opcional
   */
  materialesSubidos?: number;
  
  /**
   * Promedio del estudiante - Opcional
   * Rango: 0-10
   */
  promedio?: number;
  
  /**
   * Fecha de ingreso a la universidad - Opcional
   */
  fechaIngreso?: string;
  
  /**
   * Fecha estimada de egreso - Opcional
   */
  fechaEgreso?: string;
}

// ============================================================================
// INTERFACES DE AUTENTICACIÓN
// ============================================================================

/**
 * LoginCredentials - Credenciales para iniciar sesión
 */
export interface LoginCredentials {
  /** Correo electrónico */
  email: string;
  
  /** Contraseña */
  password: string;
  
  /** Rol con el que desea iniciar sesión */
  role: UserRole;
}

/**
 * LoginResult - Resultado de un intento de login
 */
export interface LoginResult {
  /** Indica si el login fue exitoso */
  success: boolean;
  
  /** Mensaje descriptivo del resultado */
  message: string;
  
  /** UID del usuario si el login fue exitoso - Opcional */
  uid?: string;
  
  /** Rol del usuario si el login fue exitoso - Opcional */
  role?: UserRole;
}

/**
 * RegisterData - Datos para registro de nuevo usuario
 */
export interface RegisterData {
  /** Nombre del usuario */
  name: string;
  
  /** Apellido del usuario */
  apellido: string;
  
  /** Correo electrónico */
  email: string;
  
  /** Contraseña */
  password: string;
  
  /** Rol del usuario */
  role: UserRole;
  
  /** Número de cuenta */
  numCuenta: string;
  
  /** Área (para profesor) o Carrera (para estudiante) */
  areaOrCarrera: string;
}

/**
 * InitializationResult - Resultado de la inicialización del sistema
 */
export interface InitializationResult {
  /** Indica si la inicialización fue exitosa */
  success: boolean;
  
  /** Email del usuario creado */
  email: string;
  
  /** Password del usuario creado */
  password: string;
  
  /** Mensaje descriptivo */
  message: string;
  
  /** Credenciales adicionales - Opcional */
  credentials?: {
    uid: string;
    role: UserRole;
  };
}

// ============================================================================
// INTERFACES DE SESIÓN
// ============================================================================

/**
 * UserSession - Información de sesión del usuario
 */
export interface UserSession {
  /** UID del usuario */
  uid: string;
  
  /** Email del usuario */
  email: string;
  
  /** Nombre completo del usuario */
  displayName: string;
  
  /** Rol del usuario */
  role: UserRole;
  
  /** Indica si el usuario está autenticado */
  isAuthenticated: boolean;
  
  /** Token de sesión - Opcional */
  token?: string;
  
  /** Fecha de inicio de sesión - Opcional */
  loginAt?: string;
  
  /** Fecha de última actividad - Opcional */
  lastActivity?: string;
}

/**
 * AuthState - Estado completo de autenticación
 */
export interface AuthState {
  /** Usuario actual de Firebase */
  currentUser: any | null;
  
  /** Perfil del usuario */
  userProfile: ProfileTeacher | ProfileStudent | null;
  
  /** Rol del usuario */
  userRole: UserRole | null;
  
  /** Estado de autenticación */
  isAuthenticated: boolean;
  
  /** Estado de carga */
  loading: boolean;
  
  /** Error si existe */
  error: string | null;
  
  /** Indica si se completó la inicialización */
  isInitialized: boolean;
}

// ============================================================================
// TIPOS DE UTILIDAD
// ============================================================================

/**
 * ProfileUnion - Unión de tipos de perfiles
 */
export type ProfileUnion = ProfileTeacher | ProfileStudent;

/**
 * PartialProfile - Perfil parcial para actualizaciones
 */
export type PartialProfileTeacher = Partial<ProfileTeacher>;
export type PartialProfileStudent = Partial<ProfileStudent>;

/**
 * ProfileUpdate - Datos para actualizar un perfil
 */
export type ProfileUpdate<T extends UserRole> = 
  T extends 'professor' 
    ? Partial<Omit<ProfileTeacher, 'uid' | 'role' | 'createdAt'>>
    : Partial<Omit<ProfileStudent, 'uid' | 'role' | 'createdAt'>>;

// ============================================================================
// VALIDACIONES Y GUARDS DE TIPO
// ============================================================================

/**
 * Type Guard: Verifica si un perfil es de profesor
 */
export function isTeacherProfile(profile: ProfileUnion): profile is ProfileTeacher {
  return profile.role === 'professor';
}

/**
 * Type Guard: Verifica si un perfil es de estudiante
 */
export function isStudentProfile(profile: ProfileUnion): profile is ProfileStudent {
  return profile.role === 'alumno';
}

/**
 * Type Guard: Verifica si un valor es un UserRole válido
 */
export function isValidUserRole(role: string): role is UserRole {
  return role === 'professor' || role === 'alumno';
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Roles disponibles como array
 */
export const USER_ROLES: readonly UserRole[] = ['professor', 'alumno'] as const;

/**
 * Mapeo de roles a nombres legibles
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  professor: 'Profesor',
  alumno: 'Estudiante'
} as const;

/**
 * Colecciones de Firestore por rol
 */
export const ROLE_COLLECTIONS: Record<UserRole, string> = {
  professor: 'teachers',
  alumno: 'students'
} as const;

// ============================================================================
// INTERFACES ADICIONALES (Útiles para el sistema)
// ============================================================================

/**
 * ValidationResult - Resultado de una validación
 */
export interface ValidationResult {
  /** Indica si la validación fue exitosa */
  isValid: boolean;
  
  /** Mensaje de error si la validación falló */
  message: string;
  
  /** Campo que falló la validación - Opcional */
  field?: string;
}

/**
 * ApiResponse - Respuesta genérica de una operación
 */
export interface ApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  
  /** Mensaje descriptivo */
  message: string;
  
  /** Datos de respuesta - Opcional */
  data?: T;
  
  /** Código de error - Opcional */
  errorCode?: string;
}

/**
 * PaginationParams - Parámetros de paginación
 */
export interface PaginationParams {
  /** Página actual (base 1) */
  page: number;
  
  /** Elementos por página */
  limit: number;
  
  /** Campo por el cual ordenar - Opcional */
  sortBy?: string;
  
  /** Dirección del ordenamiento - Opcional */
  sortOrder?: 'asc' | 'desc';
}

/**
 * PaginatedResponse - Respuesta paginada
 */
export interface PaginatedResponse<T> {
  /** Datos de la página actual */
  data: T[];
  
  /** Total de elementos */
  total: number;
  
  /** Página actual */
  page: number;
  
  /** Elementos por página */
  limit: number;
  
  /** Total de páginas */
  totalPages: number;
  
  /** Indica si hay página siguiente */
  hasNext: boolean;
  
  /** Indica si hay página anterior */
  hasPrev: boolean;
}

// ============================================================================
// EXPORTS ADICIONALES
// ============================================================================

/**
 * Re-exportar todo para facilitar los imports
 */
export type {
  BaseProfile,
  ProfileTeacher,
  ProfileStudent,
  LoginCredentials,
  LoginResult,
  RegisterData,
  InitializationResult,
  UserSession,
  AuthState,
  ProfileUnion,
  PartialProfileTeacher,
  PartialProfileStudent,
  ProfileUpdate,
  ValidationResult,
  ApiResponse,
  PaginationParams,
  PaginatedResponse
};

export {
  isTeacherProfile,
  isStudentProfile,
  isValidUserRole,
  USER_ROLES,
  ROLE_DISPLAY_NAMES,
  ROLE_COLLECTIONS
};