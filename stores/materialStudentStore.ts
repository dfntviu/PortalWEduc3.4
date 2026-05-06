/**
 * @store MaterialStudentStore
 * @description Gestión de materiales del Alumno
 * @pattern Composición sobre MaterialBaseStore (SSV)
 *
 * FUNCIONALIDADES
 *  - Crear materiales propios
 *  - Ver materiales visibles (propios + aprobados de otros)
 *  - Actualizar / eliminar materiales propios
 *  - Consultar estado de envíos
 *  - Modo edición con detección de cambios
 */
import { defineStore }              from 'pinia';
import { ref, computed }            from 'vue';
import { useMatBaseStore }          from './materialBaseStore';
import { MaterialStudentService }   from '@/services/materials/MaterialStudentService';
import { useAuthStore3 }            from '@/stores/authStore3';
import { getAuth }                  from 'firebase/auth';
import { storeToRefs } from 'pinia';

import type { MaterialBase }        from '@/interfaces/interfaceToast';
import type { Material }            from '@/types/interface.index';

export const useMaterialStudentStore = defineStore('materialStudent', () => {

  // ============================================================
  // COMPOSICIÓN DEL STORE BASE
  // ============================================================
  const baseStore = useMatBaseStore();

  // ==============================
  // BLOQUE: DATA (específico alumno)
  // ==============================
  const originalMaterialData = ref<Partial<Material> | null>(null);

  // ==============================
  // BLOQUE: UI (específico alumno)
  // ==============================
  const isEditMode         = ref<boolean>(false);
  const editingMaterialId  = ref<string | null>(null);
  const editFormData       = ref<{
    titulo:      string;
    description: string;
    tags:        string[];
  }>({
    titulo:      '',
    description: '',
    tags:        [],
  });

  // ==============================
  // COMPUTADOS HEREDADOS (acceso directo desde la vista)
  // ==============================

  // Nota: se accede via baseStore.X en lugar de storeToRefs
  // porque storeToRefs no puede desestructurar métodos
  const materials        = computed((): MaterialBase[] => baseStore.materials);
  const loading          = computed((): boolean => baseStore.loading);
  const error            = computed((): string  => baseStore.error);
  const totalMaterials   = computed((): number  => baseStore.totalMaterials);
  const filteredMaterials = computed(()       => baseStore.filteredMaterials);
  const hasMaterials     = computed((): boolean => baseStore.hasMaterials);
  const hasError         = computed((): boolean => baseStore.hasError);
  const searchTermValue  = computed((): string  => baseStore.searchTermValue);
  console.log('Traza # 4: Materiales recibidos >> ', materials.value);
  // console.log('Filtro Mts >',hasMaterials.value);
  // ==============================
  // COMPUTADOS ESPECÍFICOS DEL ALUMNO
  // ==============================

    // const {uid_auth} = storeToRefs(authStore3);

  /** Materiales propios del alumno autenticado */
    const authStore3 = useAuthStore3(); //* deberia estar fuera y usar para todos los filtros
  const myMaterials = computed((): MaterialBase[] => {
    return baseStore.materials.filter(m => m.autorId === authStore3.user?.uid) as MaterialBase[];
  });
  console.log('Traza 5: Materiales recibidos, actuales  -> ',myMaterials.value);
  /** Materiales aprobados de otros alumnos */
  const approvedMaterials = computed((): Material[] => {
    const authStore3 = useAuthStore3();
    return baseStore.materials.filter(
      m => m.estado === 'aprobado' && m.autorId !== authStore3.user?.uid
    ) as Material[];
  });

  /** Materiales propios pendientes */
  const pendingMaterials = computed((): Material[] => {
    const authStore3 = useAuthStore3();
    return baseStore.materials.filter(
      m => m.autorId === authStore3.user?.uid && m.estado === 'pendiente'
    ) as Material[];
  });

  /** Materiales propios aprobados */
  const myApprovedMaterials = computed((): Material[] => {
    const authStore3 = useAuthStore3();
    return baseStore.materials.filter(
      m => m.autorId === authStore3.user?.uid && m.estado === 'aprobado'
    ) as Material[];
  });

  /** Materiales propios rechazados */
  const myRejectedMaterials = computed((): Material[] => {
    const authStore3 = useAuthStore3();
    return baseStore.materials.filter(
      m => m.autorId === authStore3.user?.uid && m.estado === 'rechazado'
    ) as Material[];
  });

  /** Estadísticas del alumno */
  const myStats = computed(() => ({
    total:    myMaterials.value.length,
    pending:  pendingMaterials.value.length,
    approved: myApprovedMaterials.value.length,
    rejected: myRejectedMaterials.value.length,
  }));

  /** Material actualmente en edición */
  const editingMaterial = computed((): Material | null => {
    if (!editingMaterialId.value) return null;
    return (baseStore.materials.find(m => m.uid === editingMaterialId.value) as Material) ?? null;
  });

  /** Indica si hay cambios pendientes respecto al original */
  const hasEditChanges = computed((): boolean => {
    if (!originalMaterialData.value) return false;
    return (
      editFormData.value.titulo      !== originalMaterialData.value.titulo      ||
      editFormData.value.description !== originalMaterialData.value.description ||  // FIX: faltaba .value en originalMaterialData
      JSON.stringify(editFormData.value.tags) !== JSON.stringify(originalMaterialData.value.tags) // FIX: typo stringnify → stringify
      // FIX: nombre de variable era editingFormData — no existe, es editFormData
    );
  });

  // ==============================
  // MÉTODOS — CARGA DE MATERIALES
  // ==============================

  // ==============================================================
  // FETCH MY MATERIALS
  // ==============================================================
  async function fetchMyMaterials(userId: string): Promise<void> {
    // const uid_firebase = getAuth().currentUser?.uid;
   /* const authStore3 = useAuthStore3();
    const {uid_auth} = storeToRefs(authStore3);
    console.log('uid actual ',uid_auth.value);*/
    if (!userId) {
      baseStore.setError('Debes iniciar Sesión para ver los Materiales');
      return;
    }
    // FIX: faltaba await — el wrapper resolvía sin esperar la operación
    return await baseStore.manejoEjecucionError(
      async () => {
        const visibleMaterials = await MaterialStudentService.getMyMaterials(userId);
        baseStore.setMaterials(visibleMaterials); // FIX: antes llamaba setMaterials() sin argumento
         return visibleMaterials;
      },
      'Error al cargar los Materiales del Alumno',

    );
  }

  // ==============================================================
  // FETCH TODAY MATERIALS
  // ==============================================================
  async function fetchTodayMaterials(userId:string): Promise<void> {
    /*const authStore3 = useAuthStore3();
    const {uid_auth} = storeToRefs(authStore3);*/

    if (!userId) {
      baseStore.setError('Debes iniciar Sesión para ver los Materiales');
      return;
    }
    // FIX: faltaba await
    return await baseStore.manejoEjecucionError(
      async () => {
        const todayMaterials = await MaterialStudentService.getTodayMaterials(userId);
        baseStore.setMaterials(todayMaterials);

        const totalMaterials = todayMaterials.length;
        // console.log(`El Total de materiales actls  ->  ${totalMaterials}`);
         console.log('[Traza real:Forma-2] Todos los materiales:', baseStore.materials.length);
         /*console.log('Arreglo de Mats ',todayMaterials);*/
         return todayMaterials;
      },
      'Error al cargar los Materiales de Hoy del Alumno',
    );
  }

  // ==============================
  // MÉTODOS — CRUD DE MATERIALES
  // ==============================

  // ==============================================================
  // CREATE MATERIAL
  // ==============================================================
  /**
   * Idea asociar por el uuid del material y no el uid del usuario, desapareceria el error al guardar*/
  async function createMaterial(file: File, data: Partial<Material>): Promise<string | null> {
      // const {uid_auth} = storeToRefs(authStore3);
    const uid_firebase  = getAuth().currentUser?.uid;
    const authStore3    = useAuthStore3();

    if (!uid_firebase) {
      baseStore.setError('Debes iniciar sesión para crear tu primer Material');
      return null;
    }

    if (!authStore3.isAuthenticated) {
      baseStore.setError('Debes iniciar Sesión para crear los Materiales');
      return null;
    }

    // FIX: faltaba return — result se computaba pero nunca salía de la función
    // FIX: fetchMyMaterials se llamaba sin argumento
    return await baseStore.manejoEjecucionError(
      async () => {
        const materialId = await MaterialStudentService.createMaterial(uid_firebase, data, file);
        await fetchMyMaterials(uid_firebase);
        return materialId;
      },
      'Error al crear el Material del Alumno',
    );
  }

  // ==============================================================
  // UPDATE MY MATERIAL
  // ==============================================================
  async function updateMyMaterial(
    materialId: string,
    updates:    Partial<Material>,
  ): Promise<boolean> {
    const authStore3 = useAuthStore3();

    // FIX: era authStore3.role?.uid — role no tiene uid, es user
    if (!authStore3.user?.uid) {
      baseStore.setError('Debes iniciar sesión para actualizar los Materiales');
      return false;
    }

    // FIX: faltaba await y result no estaba declarado en el scope del return
    const result = await baseStore.manejoEjecucionError(
      async () => {
        await MaterialStudentService.updateMyMaterial(authStore3.user!.uid, materialId, updates);
        baseStore.updateMaterial(materialId, updates);
        return true;
      },
      'Error al actualizar material',
    );

    return result !== null;
  }

  // ==============================================================
  // DELETE MY MATERIAL
  // ==============================================================
  async function deleteMyMaterial(materialId: string): Promise<boolean> {
    const authStore3 = useAuthStore3();

    if (!authStore3.user?.uid) {
      baseStore.setError('Debes iniciar sesión para eliminar Materiales');
      return false;
    }

    // FIX: faltaba await
    const result = await baseStore.manejoEjecucionError(
      async () => {
        await MaterialStudentService.deleteMyMaterial(authStore3.user!.uid, materialId);
        baseStore.removeMaterial(materialId);
        return true;
      },
      'Error al eliminar material',
    );

    return result !== null;
  }

  // ==============================================================
  // GET MY MATERIAL STATUS
  // ==============================================================
  async function getMyMaterialStatus(materialId: string): Promise<{
    status:      string;
    moderatedAt?: Date;
    reason?:     string | null;
  } | null> {
    const authStore3 = useAuthStore3();

    if (!authStore3.user?.uid) {
      baseStore.setError('Debes iniciar sesión para consultar el estado');
      return null;
    }

    // FIX: faltaba await + había doble return dentro del callback (unreachable)
    const result = await baseStore.manejoEjecucionError(
      async () => {
        return await MaterialStudentService.getMyMaterialMyStatus(
          authStore3.user!.uid,
          materialId,
        );
      },
      'Error al consultar estado del material',
    );

    return result;
  }

  // ==============================
  // MÉTODOS — MODO EDICIÓN
  // ==============================

  // ==============================================================
  // START EDIT MATERIAL
  // ==============================================================
  /**
   * Activa el modo edición para un material propio y pendiente.
   * @returns true si se activó correctamente, false si no
   */
  function startEditMaterial(material: Material): boolean {
    const authStore3 = useAuthStore3(); // FIX: no estaba instanciado en el scope

    if (material.status !== 'pending') {
      baseStore.setError('Solo puedes editar materiales pendientes de revisión');
      return false;
    }

    if (material.autorId !== authStore3.user?.uid) {
      baseStore.setError('No tienes permiso para editar este material');
      return false;
    }

    // FIX: variables incorrectas — eran editMode y editingMaterial (no existen)
    isEditMode.value        = true;
    editingMaterialId.value = material.uid;

    originalMaterialData.value = {
      titulo:      material.titulo,
      description: material.description,
      tags:        [...(material.tags ?? [])],
    };

    editFormData.value = {
      titulo:      material.titulo      ?? '',
      description: material.description ?? '',
      tags:        [...(material.tags   ?? [])],
    };

    console.log('[MaterialStudentStore] ✏️ Edición iniciada para:', material.titulo);
    return true;
  }

  // ==============================================================
  // CANCEL EDIT MATERIAL
  // ==============================================================
  /**
   * Cancela el modo edición.
   * @param force — Si true, cancela sin pedir confirmación aunque haya cambios
   * @returns true si canceló, false si el llamador debe pedir confirmación al usuario
   */
  function cancelEditMaterial(force = false): boolean {
    if (!force && hasEditChanges.value) return false;

    isEditMode.value        = false;
    editingMaterialId.value = null;
    originalMaterialData.value = null;
    editFormData.value = { titulo: '', description: '', tags: [] };
    baseStore.clearError();

    console.log('[MaterialStudentStore] ❌ Edición cancelada');
    return true;
  }

  // ==============================================================
  // UPDATE EDIT FORM DATA
  // ==============================================================
  function updateEditFormData(
    field: 'titulo' | 'description' | 'tags',
    value: any,
  ): void {
    editFormData.value[field] = value;
  }

  // ==============================================================
  // SAVE EDIT MATERIAL
  // ==============================================================
  // FIX: no era async — los returns síncronos devolvían false fuera del Promise
  async function saveEditMaterial(): Promise<boolean> {
    const authStore3 = useAuthStore3();

    if (!authStore3.user?.uid) {
      baseStore.setError('No hay sesión activa');
      return false;
    }

    if (!editingMaterialId.value) {
      baseStore.setError('No hay material en edición');
      return false;
    }

    if (!editFormData.value.titulo.trim()) {
      baseStore.setError('El título es requerido');
      return false;
    }

    // FIX: faltaba await + no había return del resultado
    const result = await baseStore.manejoEjecucionError(
      async () => {
        const updates: Partial<Material> = {
          titulo:      editFormData.value.titulo.trim(),
          description: editFormData.value.description.trim(),
          tags:        editFormData.value.tags,
        };

        await MaterialStudentService.updateMyMaterial(
          authStore3.user!.uid,
          editingMaterialId.value!,
          updates,
        );

        const materialName = editFormData.value.titulo;
        cancelEditMaterial(true);
        console.log(`[MaterialStudentStore] ✅ Material "${materialName}" actualizado`);
        return true;
      },
      'Error al actualizar el Material',
    );

    return result !== null;
  }

  // ==============================================================
  // UPLOAD MATERIAL FILE
  // ==============================================================
  async function uploadMaterialFile(
    file:         File,
    materialData: Partial<Material>,
  ): Promise<string | null> {
    // FIX: el check estaba duplicado y el primer mensaje era incorrecto ("Debes iniciar Sesión")
    if (file.type !== 'application/pdf') {
      baseStore.setError('Solo se aceptan archivos PDF');
      return null;
    }

    return await createMaterial(file, { ...materialData });
  }

  // ==============================
  // RETORNO DEL STORE
  // ==============================
  return {
    // ---- DATA ----
    originalMaterialData,
    // ---- UI ----
    isEditMode,
    editingMaterialId,
    editFormData,
    // ---- COMPUTED HEREDADOS ----
    materials,
    loading,
    error,
    searchTermValue,
    totalMaterials,
    filteredMaterials,
    hasMaterials,
    hasError,
    // ---- COMPUTED PROPIOS ----
    myMaterials,
    approvedMaterials,
    pendingMaterials,
    myApprovedMaterials,
    myRejectedMaterials,
    myStats,
    editingMaterial,
    hasEditChanges,
    // ---- MÉTODOS HEREDADOS (delegados al base) ----
    setError:        baseStore.setError,
    clearError:      baseStore.clearError,
    searchMaterials: baseStore.searchMaterials,
    clearSearch:     baseStore.clearSearch,
    resetState:      baseStore.resetState,
    getMaterialById: baseStore.getMaterialById,
    // ---- MÉTODOS PROPIOS ----
    fetchMyMaterials,
    fetchTodayMaterials,
    createMaterial,
    updateMyMaterial,
    deleteMyMaterial,
    getMyMaterialStatus,
    uploadMaterialFile,
    // ---- MÉTODOS EDICIÓN ----
    startEditMaterial,
    cancelEditMaterial,
    updateEditFormData,
    saveEditMaterial,
  };
});