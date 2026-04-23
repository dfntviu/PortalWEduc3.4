import { defineStore } from 'pinia'
import { MaterialService } from '@/services/MaterialService'
import type { StudentUser } from '@/types/interf.index'

interface Material {
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

        this.studentMaterials = materials
        this.studentProfile = profile
        this.message = 'Materiales cargados correctamente'

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

        await MaterialService.downloadMaterial(materialId)
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