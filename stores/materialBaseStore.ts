/**
 * @store MaterialBaseStore
 * @description Store base con lógica compartida para materiales
 * @pattern Base — heredado por MaterialStudentStore
 *
 * RESPONSABILIDADES
 *  - Estado común: materials, loading, error, searchTerm
 *  - Métodos helpers centralizados
 *  - Gestión de errores centralizada vía manejoEjecucionError
 */
import { defineStore }        from 'pinia';
import { ref, computed }      from 'vue';
import { MaterialBseService } from '@/services/materials/MaterialBaseService';
import type { MaterialBase }  from '@/interfaces/interfaceToast';

// ============================================================
// ENUM DE FILTROS — exportado para uso en vistas y stores hijos
// ============================================================
export enum MaterialFilter {
       ALL = 'all',
   PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
     TODAY = 'today',
 LAST_WEEK = 'last_week',
}

// ============================================================
// STORE BASE — no se usa directamente, solo en composición
// ============================================================
export const useMatBaseStore = defineStore('materialBase', () => {

  // ==============================
  // BLOQUE: DATA
  // ==============================
  const materials  = ref<MaterialBase[]>([]);
  const searchTerm = ref<string>('');
  console.log('Traza1: Materiales <-- [MatBase] ',materials);
  // 'Traza1:', materials estado trampa, solo muestra lo que existe en firebase, no su alcance por usabilidad;  ...materials
  // ==============================
  // BLOQUE: UI
  // ==============================
  const loading = ref<boolean>(false);

  // ==============================
  // BLOQUE: FEEDBACK
  // ==============================
  const error = ref<string>('');
  
  // ==============================
  // COMPUTADOS
  // ==============================
  /*const getMaterialsRefresh() = computed(()=>{
    const totalMaterials = 
  })*/
  /** Total de materiales cargados */
  const totalMaterials = computed((): number =>  materials.value.length);
  console.log('Traza 2: Todos sus Materiales  ->',totalMaterials.value); 

  /** Materiales filtrados por término de búsqueda */
  const filteredMaterials = computed((): MaterialBase[] => {
    if (!searchTerm.value.trim()) return materials.value;
    return MaterialBseService.searchMaterials(searchTerm.value, materials.value);
  })
  /** Término de búsqueda actual (solo lectura) */
  const searchTermValue = computed((): string => searchTerm.value);

  /** Indica si hay materiales cargados */
  const hasMaterials = computed((): boolean => materials.value.length > 0);

  /** Indica si hay un error activo */
  const hasError = computed((): boolean => error.value !== '');  // FIX: era !== null sobre string

  // ==============================
  // HELPERS PRIVADOS
  // ==============================

  function startLoading(): void {
    loading.value = true;
    error.value   = '';           // FIX: limpia error en punto único — era: error.value; (solo lectura)
  }

  function stopLoading(): void {
    loading.value = false;
  }

  function controladoraError(err: any, context: string): void {
    const message = err?.message || 'Error desconocido';
    setError(`${context}: ${message}`);
    console.error(`[MaterialBaseStore] ${context}`, err);
  }

  // ==============================
  // MÉTODOS PÚBLICOS — FEEDBACK
  // ==============================

  function clearError(): void {
    error.value = '';             // FIX: era null sobre ref<string>
  }

  function setError(message: string): void {
    error.value = message;
    console.error('[MaterialBaseStore]', message);
  }

  // ==============================
  // MÉTODOS PÚBLICOS — DATA
  // ==============================

  /** Reemplaza la lista completa de materiales */
  function setMaterials(newMaterials: MaterialBase[]): void {   // FIX: tipo era Material[]
    materials.value = newMaterials;
    console.log(`[MaterialBaseStore] ${newMaterials.length} materiales cargados`);
    // console.log('Total Materiales > ',newMaterials); // esta vacio -> es antes
  }

  /** Agrega un material al inicio de la lista (optimistic update) */
  function addMaterial(material: MaterialBase): void {           // FIX: tipo era Material
    materials.value.unshift(material);
  }

  /** Actualiza un material existente por ID */
  function updateMaterial(materialId: string, updates: Partial<MaterialBase>): void {
    const index = materials.value.findIndex(m => m.uid === materialId);
    if (index !== -1) {
      materials.value[index] = { ...materials.value[index], ...updates };
    }
  }

  /** Elimina un material de la lista local */
  function removeMaterial(materialId: string): void {
    // FIX: filter no muta — se asigna el resultado
    // FIX: condición era === (encontraba el que eliminar, no el que conservar)
    materials.value = materials.value.filter(m => m.uid !== materialId);
  }

  /** Obtiene un material por ID desde el servicio */
  async function getMaterialById(materialId: string): Promise<MaterialBase | null> {
    try {
      return await MaterialBseService.getMaterialById(materialId);
    } catch (err: any) {
      setError(`Error al obtener el Material: ${err.message}`); // FIX: era ${error.message} — variable capturada era error, sombreaba el ref
      return null;
    }
  }

  // ==============================
  // MÉTODOS PÚBLICOS — BÚSQUEDA
  // ==============================

  function searchMaterials(term: string): void {
    searchTerm.value = term;
  }

  function clearSearch(): void {
    searchTerm.value = '';
  }

  // ==============================
  // MÉTODOS PÚBLICOS — RESET
  // ==============================

  function resetState(): void {
    materials.value  = [];
    loading.value    = false;
    error.value      = '';        // FIX: era null
    searchTerm.value = '';
  }

  // ==============================
  // WRAPPER CENTRAL DE ERRORES
  // ==============================

  /**
   * Ejecuta una operación async con manejo centralizado de loading/error.
   * Garantiza que loading siempre se detenga via finally.
   */
  async function manejoEjecucionError<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T | null> {
    try {
      startLoading();
      const result = await operation();
      clearError();
      return result;
    } catch (err: any) {
      // FIX: catch estaba completamente comentado → errores silenciados + loading infinito
      controladoraError(err, context);
      return null;
    } finally {
      // FIX: stopLoading estaba ausente del flujo normal — ahora siempre ejecuta
      stopLoading();
    }
  }

  // ==============================
  // RETORNO DEL STORE
  // ==============================
  return {
    // DATA
    materials,
    searchTerm,
    // UI
    loading,
    // FEEDBACK
    error,
    // COMPUTED
    totalMaterials,
    filteredMaterials,
    searchTermValue,
    hasMaterials,
    hasError,
    // MÉTODOS FEEDBACK
    clearError,
    setError,
    // MÉTODOS DATA
    setMaterials,
    addMaterial,
    updateMaterial,
    removeMaterial,
    getMaterialById,
    // MÉTODOS BÚSQUEDA
    searchMaterials,
    clearSearch,
    // MÉTODOS RESET
    resetState,
    // WRAPPER
    manejoEjecucionError,
  };
});