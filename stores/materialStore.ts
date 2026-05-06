import { defineStore } from 'pinia'
import { MaterialService } from '@/services/MaterialService'
import { useAuthStore3 } from '@/stores/authStore3';
import type { StudentUser } from '@/types/interf.index'

export interface Material {
  id_material: string
  nombre_material: string
  fechaSubida: string
  size?: number
  status?: 'approved' | 'pending' | 'rejected'
  url?: string
  uid_alumno: string
}

interface MaterialState {
  studentMaterials: Material[]
  studentProfile: StudentUser | null
  loading: boolean
  error: string
  message: string
}

export const useMaterialStore = defineStore('materials', {
  state: (): MaterialState => ({
    studentMaterials: [],
    studentProfile: null,
    loading: false,
    error: '',
    message: ''
  }),

  getters: {
    isLoading: (state): boolean => state.loading,
    hasError: (state): boolean => state.error !== '',
    materialCount: (state): number => state.studentMaterials.length,
    
    approvedMaterials: (state): Material[] => {
      return state.studentMaterials.filter(m => m.status === 'approved')
    },

    pendingMaterials: (state): Material[] => {
      return state.studentMaterials.filter(m => m.status === 'pending')
    }
  },

  actions: {
    // ═══════════════════════════════════════════════════════════════════
    // FETCH STUDENT MATERIALS
    // ═══════════════════════════════════════════════════════════════════
    async fetchStudentMaterials(uid: string): Promise<void> {
      this._startLoading()

      try {
        this._validateUid(uid)

        // Fetch materials and profile in parallel
        const [materials, profile] = await Promise.all([
          MaterialService.getMaterialsByStudentId(uid),
          MaterialService.getStudentProfile(uid)
        ])

        // const profileStudent = MaterialService.getStudentProfile(uid);s
        console.warn(`El perfil del Estudiante Actual: ->[${profile}]`);

        console.log('[Store] Los materiales obtenidos: ',materials.length);
        console.log('[Store] El Perfil obtenido: ',profile);

        this.studentMaterials = materials
        this.studentProfile = profile;
        
        console.log('[Store] El estado después de asignar...');
        console.log(' - studentMaterials: ',this.studentMaterials.length);
        console.log(' - Edo Perfil del Estudiante: ',this.studentProfile);

        this.message = 'Materiales cargados correctamente';

      } catch (error: any) {
        this._handleError(error, 'Error al cargar los materiales')
        throw error
      } finally {
        this._stopLoading()
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // DOWNLOAD MATERIAL
    // ═══════════════════════════════════════════════════════════════════
    async downloadMaterial(materialId: string): Promise<void> {
      try {
        if (!materialId?.trim()) {
          throw new Error('ID de material inválido')
        }

        /** INICIO - Cambio Aplicado [02/Mayo/2026]
         * MODIFY_STARTING
         * */
        const authStore = useAuthStore3();
        const studentUid = authStore.uid_auth;
        console.log('Uid del Estudiante -> ', studentUid);
        if (!studentUid) {
           throw new Error('ERROR: No fue posible identificar al estudiante. POR-FAVOR, recarga la página');
        }

        await MaterialService.downloadMaterial(materialId, studentUid); 
        /**FIN  - ambio Aplicado [02/Mayo/2026]
         * MODIFY_ENDING
         * */
        this.message = 'Material descargado correctamente'

      } catch (error: any) {
        this._handleError(error, 'Error al descargar el material')
        throw error
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // REFRESH MATERIALS
    // ═══════════════════════════════════════════════════════════════════
    async refreshMaterials(): Promise<void> {
      if (!this.studentProfile?.uid) {
        throw new Error('No hay perfil de estudiante cargado')
      }

      await this.fetchStudentMaterials(this.studentProfile.uid)
    },

    // ═══════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════
    clearError(): void {
      this.error = ''
    },

    clearMessage(): void {
      this.message = ''
    },

    clearAll(): void {
      this.studentMaterials = []
      this.studentProfile = null
      this.error = ''
      this.message = ''
    },

    // ═══════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════
    _startLoading(): void {
      this.loading = true
      this.error = ''
      this.message = ''
    },

    _stopLoading(): void {
      this.loading = false
    },

    _handleError(error: any, defaultMessage: string): void {
      const errorMessage = error?.message || defaultMessage
      this.error = errorMessage
      console.error(`[MaterialStore] ${defaultMessage}:`, error)
    },

    _validateUid(uid: string): void {
      if (!uid?.trim()) {
        throw new Error('UID de estudiante es requerido')
      }
    }
  }
});