/**
 * Types e Interfaces para el Sistema de Materiales Educativos
 * 
 * Este archivo contiene todas las definiciones de tipos necesarias para:
 * - Stores (Base, Student, Teacher)
 * - Services (Base, Student, Teacher)
 * - Views (Student, Teacher)
 * 
 * @module MaterialTypes
 */

import type { Timestamp } from 'firebase/firestore';

// ============================================
// ENUMS
// ============================================

/**
 * Estados posibles de un material
 */
export enum MaterialStatus {
    PENDING = 'pending',      // Pendiente de revisión
    APPROVED = 'approved',    // Aprobado por profesor
    REJECTED = 'rejected',    // Rechazado por profesor
    DELETED = 'deleted',      // Eliminado (soft delete)
}

/**
 * Filtros disponibles para vista de profesor
 */
export enum MaterialFilter {
    ALL = 'all',              // Todos los materiales
    PENDING = 'pending',      // Solo pendientes
    APPROVED = 'approved',    // Solo aprobados
    REJECTED = 'rejected',    // Solo rechazados
    TODAY = 'today',          // Subidos hoy
    LAST_WEEK = 'last_week',  // Subidos última semana
}

/**
 * Tipos de operaciones de moderación
 */
export enum ModerationAction {
    APPROVE = 'approve',
    REJECT = 'reject',
    REVERT = 'revert',
}

// ============================================
// INTERFACE PRINCIPAL: MATERIAL
// ============================================

/**
 * Estructura completa de un Material Educativo
 */
export interface Material {
    // Identificación
    uid: string;                          // ID único del material
    
    // Información básica
    titulo: string;                       // Título del material
    description: string;                  // Descripción del contenido
    tags: string[];                       // Etiquetas para búsqueda
    
    // Archivo
    fileUrl: string;                      // URL del archivo PDF en Storage
    fileName: string;                     // Nombre original del archivo
    fileSize?: number;                    // Tamaño del archivo en bytes
    filePath?: string;                    // Ruta en Firebase Storage
    
    // Autoría
    autorId: string;                      // UID del usuario que subió el material
    autorNombre: string;                  // Nombre del autor
    autorEmail?: string;                  // Email del autor (opcional)
    
    // Estado y moderación
    status: MaterialStatus | string;      // Estado actual del material
    moderatedBy?: string;                 // UID del profesor que moderó
    moderatedByName?: string;             // Nombre del profesor moderador
    moderatedAt?: Timestamp | Date;       // Fecha de moderación
    rejectionReason?: string;             // Razón del rechazo (si aplica)
    
    // Metadata temporal
    createdAt: Timestamp | Date;          // Fecha de creación
    updatedAt: Timestamp | Date;          // Última actualización
    
    // Estadísticas (opcional - para futuras funcionalidades)
    viewCount?: number;                   // Número de visualizaciones
    downloadCount?: number;               // Número de descargas
    
    // Campos adicionales (extensibilidad)
    [key: string]: any;                   // Permite campos adicionales
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * DTO para crear un nuevo material (sin campos generados)
 */
export interface CreateMaterialDTO {
    titulo: string;
    description: string;
    tags: string[];
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    filePath?: string;
    autorNombre: string;
    autorEmail?: string;
}

/**
 * DTO para actualizar un material existente (campos opcionales)
 */
export interface UpdateMaterialDTO {
    titulo?: string;
    description?: string;
    tags?: string[];
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    // No permite actualizar autor, status, ni metadata
}

/**
 * DTO para moderación de material
 */
export interface ModerateMaterialDTO {
    status: MaterialStatus.APPROVED | MaterialStatus.REJECTED;
    rejectionReason?: string;  // Requerido si status es REJECTED
    moderatedBy: string;       // UID del profesor
    moderatedByName: string;   // Nombre del profesor
}

/**
 * DTO para datos del formulario de edición
 */
export interface MaterialFormData {
    titulo: string;
    description: string;
    tags: string[];
}

// ============================================
// INTERFACES DE ESTADÍSTICAS
// ============================================

/**
 * Estadísticas de materiales del alumno
 */
export interface StudentMaterialStats {
    total: number;      // Total de materiales propios
    pending: number;    // Pendientes de revisión
    approved: number;   // Aprobados
    rejected: number;   // Rechazados
}

/**
 * Estadísticas generales del sistema (vista profesor)
 */
export interface SystemMaterialStats {
    total: number;           // Total de materiales en el sistema
    pending: number;         // Pendientes de revisión
    approved: number;        // Aprobados
    rejected: number;        // Rechazados
    todayCount: number;      // Subidos hoy
    weekCount: number;       // Subidos esta semana
    totalStudents?: number;  // Total de estudiantes con materiales
}

/**
 * Estadísticas por estudiante (para dashboard de profesor)
 */
export interface StudentStats {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    totalMaterials: number;
    pendingMaterials: number;
    approvedMaterials: number;
    rejectedMaterials: number;
}

// ============================================
// INTERFACES DE RESPUESTA
// ============================================

/**
 * Respuesta estándar de operaciones
 */
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Respuesta de consulta de estado de material
 */
export interface MaterialStatusResponse {
    status: MaterialStatus | string;
    moderatedAt?: Date;
    moderatedBy?: string;
    moderatedByName?: string;
    rejectionReason?: string;
}

/**
 * Respuesta de búsqueda de materiales
 */
export interface SearchMaterialsResponse {
    materials: Material[];
    total: number;
    hasMore: boolean;
}

// ============================================
// TIPOS AUXILIARES
// ============================================

/**
 * Tipo para opciones de búsqueda/filtrado
 */
export interface MaterialSearchOptions {
    query?: string;              // Término de búsqueda
    status?: MaterialStatus;     // Filtrar por estado
    autorId?: string;            // Filtrar por autor
    tags?: string[];             // Filtrar por tags
    dateFrom?: Date;             // Desde fecha
    dateTo?: Date;               // Hasta fecha
    limit?: number;              // Límite de resultados
    orderBy?: 'createdAt' | 'updatedAt' | 'titulo';  // Ordenar por
    orderDirection?: 'asc' | 'desc';  // Dirección del ordenamiento
}

/**
 * Tipo para opciones de paginación
 */
export interface PaginationOptions {
    page: number;
    limit: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}

/**
 * Tipo para resultado paginado
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

// ============================================
// TIPOS PARA STORES
// ============================================

/**
 * Estado base del store de materiales
 */
export interface MaterialStoreState {
    materials: Material[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
}

/**
 * Estado del store de estudiante
 */
export interface StudentStoreState extends MaterialStoreState {
    isEditMode: boolean;
    editingMaterialId: string | null;
    editFormData: MaterialFormData;
    originalMaterialData: Partial<Material> | null;
}

/**
 * Estado del store de profesor
 */
export interface TeacherStoreState extends MaterialStoreState {
    currentFilter: MaterialFilter;
    statistics: SystemMaterialStats;
}

// ============================================
// TIPOS PARA VALIDACIÓN
// ============================================

/**
 * Reglas de validación para un material
 */
export interface MaterialValidationRules {
    titulo: {
        minLength: number;
        maxLength: number;
        required: boolean;
    };
    description: {
        minLength: number;
        maxLength: number;
        required: boolean;
    };
    tags: {
        minTags: number;
        maxTags: number;
        maxTagLength: number;
    };
    file: {
        maxSize: number;        // En bytes
        allowedTypes: string[]; // ['application/pdf']
    };
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
    valid: boolean;
    errors: {
        field: string;
        message: string;
    }[];
}

// ============================================
// TIPOS PARA EVENTOS
// ============================================

/**
 * Eventos del sistema de materiales
 */
export type MaterialEvent = 
    | { type: 'created'; material: Material }
    | { type: 'updated'; materialId: string; changes: Partial<Material> }
    | { type: 'deleted'; materialId: string }
    | { type: 'approved'; materialId: string; moderatorId: string }
    | { type: 'rejected'; materialId: string; moderatorId: string; reason: string }
    | { type: 'reverted'; materialId: string; moderatorId: string };

// ============================================
// TIPOS PARA PERMISOS
// ============================================

/**
 * Rol del usuario
 */
export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    ADMIN = 'admin',
}

/**
 * Permisos sobre un material
 */
export interface MaterialPermissions {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canModerate: boolean;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Valores por defecto para validación
 */
export const MATERIAL_VALIDATION_DEFAULTS: MaterialValidationRules = {
    titulo: {
        minLength: 5,
        maxLength: 200,
        required: true,
    },
    description: {
        minLength: 0,
        maxLength: 1000,
        required: false,
    },
    tags: {
        minTags: 0,
        maxTags: 10,
        maxTagLength: 30,
    },
    file: {
        maxSize: 10 * 1024 * 1024, // 10 MB
        allowedTypes: ['application/pdf'],
    },
};

/**
 * Textos de estado en español
 */
export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
    [MaterialStatus.PENDING]: 'Pendiente',
    [MaterialStatus.APPROVED]: 'Aprobado',
    [MaterialStatus.REJECTED]: 'Rechazado',
    [MaterialStatus.DELETED]: 'Eliminado',
};

/**
 * Textos de filtros en español
 */
export const MATERIAL_FILTER_LABELS: Record<MaterialFilter, string> = {
    [MaterialFilter.ALL]: 'Todos',
    [MaterialFilter.PENDING]: 'Pendientes',
    [MaterialFilter.APPROVED]: 'Aprobados',
    [MaterialFilter.REJECTED]: 'Rechazados',
    [MaterialFilter.TODAY]: 'Hoy',
    [MaterialFilter.LAST_WEEK]: 'Última Semana',
};

// ============================================
// GUARDS DE TIPO (Type Guards)
// ============================================

/**
 * Verifica si un objeto es un Material válido
 */
export function isMaterial(obj: any): obj is Material {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.uid === 'string' &&
        typeof obj.titulo === 'string' &&
        typeof obj.autorId === 'string' &&
        typeof obj.status === 'string'
    );
}

/**
 * Verifica si un material está pendiente
 */
export function isPendingMaterial(material: Material): boolean {
    return material.status === MaterialStatus.PENDING;
}

/**
 * Verifica si un material está aprobado
 */
export function isApprovedMaterial(material: Material): boolean {
    return material.status === MaterialStatus.APPROVED;
}

/**
 * Verifica si un material está rechazado
 */
export function isRejectedMaterial(material: Material): boolean {
    return material.status === MaterialStatus.REJECTED;
}

/**
 * Verifica si un usuario puede editar un material
 */
export function canEditMaterial(material: Material, userId: string): boolean {
    return (
        material.autorId === userId &&
        material.status === MaterialStatus.PENDING
    );
}

/**
 * Verifica si un usuario puede moderar un material
 */
export function canModerateMaterial(material: Material, userRole: UserRole): boolean {
    return (
        (userRole === UserRole.TEACHER || userRole === UserRole.ADMIN) &&
        material.status === MaterialStatus.PENDING
    );
}

// ============================================
// UTILIDADES DE TRANSFORMACIÓN
// ============================================

/**
 * Convierte Timestamp de Firestore a Date
 */
export function timestampToDate(timestamp: Timestamp | Date | undefined): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Date) return timestamp;
    return timestamp.toDate();
}

/**
 * Convierte Material de Firestore a Material con Dates
 */
export function convertFirestoreMaterial(firestoreMaterial: any): Material {
    return {
        ...firestoreMaterial,
        createdAt: timestampToDate(firestoreMaterial.createdAt) || new Date(),
        updatedAt: timestampToDate(firestoreMaterial.updatedAt) || new Date(),
        moderatedAt: timestampToDate(firestoreMaterial.moderatedAt),
    };
}

// ============================================
// EXPORTS DE CONVENIENCIA
// ============================================

/**
 * Re-exportar todo para facilitar imports
 */
/*export type {
    Material,
    CreateMaterialDTO,
    UpdateMaterialDTO,
    ModerateMaterialDTO,
    MaterialFormData,
    StudentMaterialStats,
    SystemMaterialStats,
    StudentStats,
    ServiceResponse,
    MaterialStatusResponse,
    SearchMaterialsResponse,
    MaterialSearchOptions,
    PaginationOptions,
    PaginatedResult,
    MaterialStoreState,
    StudentStoreState,
    TeacherStoreState,
    MaterialValidationRules,
    ValidationResult,
    MaterialEvent,
    MaterialPermissions,
};
*/
/*export {
    MaterialStatus,
    MaterialFilter,
    ModerationAction,
    UserRole,
    MATERIAL_VALIDATION_DEFAULTS,
    MATERIAL_STATUS_LABELS,
    MATERIAL_FILTER_LABELS,
    isMaterial,
    isPendingMaterial,
    isApprovedMaterial,
    isRejectedMaterial,
    canEditMaterial,
    canModerateMaterial,
    timestampToDate,
    convertFirestoreMaterial,
};*/