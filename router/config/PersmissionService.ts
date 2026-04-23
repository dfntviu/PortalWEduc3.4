        //  ./src_refactor/services/PermissionsServ.ts

import type { Permissions, Role } from '@/interfaces/interfaceRules.ts';

export class PermissionsService {
    private permisosPorRol: Record<Role, Permissions> = {
        alumno: {
            esposibleModerarComentarios: false,
            esposibleVerMaterialIndividual: true,
            esposibleRegistrarCuentaAlumno: true,
            esposibleRegistrarCuentaProfesor: false,
            esposibleGestionarMateriales: true,
            esposibleGestionarMateriales_Alumno: false,
            // esposibleModerarComentarios: false,
            esposibleSubirMateriales: true, // ✅ Corregido: alumno esposible subir
        },

        profesor: {
            esposibleModerarComentarios: true,
            esposibleVerMaterialIndividual: false,
            esposibleRegistrarCuentaAlumno: false,
            esposibleRegistrarCuentaProfesor: true,
            esposibleGestionarMateriales: false,
            esposibleGestionarMateriales_Alumno: true,
            // esposibleModerarComentarios: true,
            esposibleSubirMateriales: false, // ✅ Profesor no sube, gestiona
        },

        default: {
            esposibleModerarComentarios: false,
            esposibleVerMaterialIndividual: false,
            esposibleRegistrarCuentaAlumno: false,
            esposibleRegistrarCuentaProfesor: false,
            esposibleGestionarMateriales: false,
            esposibleGestionarMateriales_Alumno: false,
            // esposibleModerarComentarios: false,
            esposibleSubirMateriales: false,
        },
    };


    constructor(private role: Role) {}

    /**
     * Obtener permisos del rol actual
     */
    getPermissions(): Permissions {
        return this.permisosPorRol[this.role] || this.permisosPorRol['default'];
    }

    /**
     * Verificar si tiene un permiso específico
     */
    hasPermission(permissionKey: keyof Permissions): boolean {
        return this.getPermissions()[permissionKey] || false; // ✅ Corregido: faltaba return
    }

    /**
     * Cambiar rol actual
     */
    setRole(role: Role): void {
        this.role = role;
    }

    /**
     * Obtener todos los permisos activos
     */
    getActivePermissions(): string[] {
        const permissions = this.getPermissions();
        return Object.entries(permissions)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => key);
    }
}