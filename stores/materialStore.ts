import { defineStore } from 'pinia'
import { MaterialService } from '@/services/MaterialService'
import { useAuthStore3 } from '@/stores/authStore3';
import type { StudentUser } from '@/types/interf.index'

export interface Material {
  id_material: string
  nombre_material: string
  fechaSubida: string
  size?: number
  status?: 'approved' | 'pending' | 'rejected'| 'aprobado' | 'rechazado' | 'pendiente'
  url?: string
  uid_alumno: string
  //url: string *
  archivoURL?: string
}

interface MaterialState {
  studentMaterials:  Material[]
  studentProfile: StudentUser | null
  loading: boolean
  error: string
  message: string

}

export const useMaterialStore = defineStore('materials', {
  state: (): MaterialState => ({
    studentMaterials: [] as Material[],
    studentProfile: null,
    loading: false,
    error: '',
    message: '',
     // UI
    isModalOpen: false,
    selectedMaterial: null as Material | null,
    previewMaterial: null as string | null,
     // Feedback/Retro
     materialErrorMessage: '',
     _isCancelled: false,
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
     _startLoading(){
       this.loading = true;
       this.error = '';
     },

     _stopLoading(){
      this.loading = false;
     },
    // ═══════════════════════════════════════════════════════════════════
    // FETCH STUDENT MATERIALS
    // ═══════════════════════════════════════════════════════════════════
    async fetchStudentProfile(uid_auth: string): Promise<void> {
        try{
          this._validateUid(uid_auth);
          const profile = await MaterialService.getSudentProfile(uid_auth);
          this.studentProfile = profile;
        }catch(error: any){
          this._handleError(error, 'Error al cargar perfil');
        }
    },

    async fetchStudentMaterials(uid_auth: string): Promise<void> {
      // let _canceled = false;
        this._isCancelled = false;
        this._startLoading();
      try{
          console.log('Su valor unico [',uid_auth,']');
          this._validateUid(uid_auth);
           const materials = await MaterialService.getMaterialsByStudentId(uid_auth);
           if (this._canceled) return
           this.studentMaterials = materials;
           this.message = 'Los Materiales cargados correctamente';
      }catch(error: any){
        if (this._canceled) return
          this._handleError(error, 'Error al cargar los materiales');
         throw error;
      } finally {
         if (!this._isCancelled) this._stopLoading();
      }
        
    },
    cancelLoad() {
      // let _canceled
     this._isCancelled = true
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
    /*New Method: 23/05/2026*/
    async loadStudentMaterials(userId: string) {
      this._startLoading();
        try{
          this.studentMaterials = MaterialService.fetchStudentMaterials(userId);
        }catch(err: any){
          this.materialErrorMessage = err.message || 'Error al cargar Materiales';
        }finally {
          this.loading = false;
        }
    },

    // $reset(){ }

    // ═══════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════
    // New Utility: with relation on Preview View 23/05/2026
    openMaterialModal(material: Material) {
      console.log('ingrese')
      if(!material) return;
      const url = MaterialService.resolvePreviewUrl(material);
      console.log('URL Content ', url);
      if (!url) {
          this.materialErrorMessage = 'ERROR: Este material no tiene vista previa disponible';
            return;
      }
        this.selectedMaterial = material;
        this.previewMaterial = url;
        console.log('Enlace dl mt: ', url);
        this.isModalOpen = true;
    },
    // New Utility: with relation on Preview View 23/05/2026
    closeMaterialModal(material: Material) {
       this.isModalOpen = false;
       this.previewMaterial = null;
       // this.previewUrl = null;
    },

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
    /*_startLoading(): void {
      this.loading = true
      this.error = ''
      this.message = ''
    },

    _stopLoading(): void {
      this.loading = false
    },*/

    _handleError(error: any, defaultMessage: string): void {
      const errorMessage = error?.message || defaultMessage
      this.error = errorMessage
      console.error(`[MaterialStore] ${defaultMessage}:`, error)
    },

    _validateUid(uid_auth: string): void {
      console.log('Unique value >',uid_auth.value);
      if (!uid_auth?.trim()) {
        throw new Error('UID de estudiante es requerido')
      }
    },

    // ═══════════════════
    // LIMPIAR EL STORE
    // ═══════════════════
    $reset() {
      this.studentMaterials = [];
       this.studentProfile = null;
       this.loading = false;
       this.error = '';
       this.message = '';
    }

    /**
     * Exisitó un error de condicion de carrera entre los. 2 metodos
     * Estos intentan desmontarse de forma simultanea,
     * Por lo que la ejecucion se rompe. Es prudente modularizarlos por
     *  propósito individual*/

    /*async fetchStudentMaterials(uid: string): Promise<void> {
      this._startLoading()
      // let _cancelled = false
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
        // if (_cancelled) return
        this.studentProfile = profile;
      // if (_cancelled) return
        
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
    }*/
  }
});