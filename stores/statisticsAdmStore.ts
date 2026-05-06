/**
 * @store StaticticsAdminStre
 * @descriptio Estado de estadisticas globales del sistema(Admin) 
 * @pattrn Service-Store-View
 * 
 * RESPONSABILIDADES
 * - Orquestar llamdas a StatisticasService
 * - Centralizar el estado en metricas globales
 * - Gestionar mem. cache, carga y errores
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import  { StaticsServiceUn } from '@/services/StaticticsService_Unif';

interface AdminMetrics {
	  totalStudents:     number;
  totalTeachers:     number;
  totalMaterials:    number;
  materialsApproved: number;
  materialsRejected: number;
  materialsPending:  number;
}


interface TeacherMetrics {
  totalMaterials:        number;
  approvedMaterials:     number;
  rejectedMaterials:     number;
  pendingReview:         number;
  inReview:              number;
  rejectCommentsCount:   number;
}

// ════════════════════════════════════════════════════
//  STORE
// ════════════════════════════════════════════════════
 export const useStatisticsAdmStore = defineStore('statisticsAdm', () => {

  // ═══════════════════════════════════════════
  //  ESTADO
  // ═══════════════════════════════════════════
  const adminMetrics = ref<AdminMetrics | null>(null);
  const teacherMetrics = ref<TeacherMetrics | null>(null);
  const dailySummary = ref<{ date: string; activitiesCount: number} | null>(null);

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  console.log('Mi val. de carga Actual: ', loading);
  /*La ultima carga de materiales, con respecto a la cache*/
  const lastFetch = ref<Date | null>(null);
  const CACHE_DURATION_MS = 5 *  60 * 1000;

  // ═════════════════════════════
  //   COMPUTADO METRICAS DERIVADAS
  // ═════════════════════════════
  console.log('Ingresando al sumario de Estadisticas..');
  /**
   * Cantidad de usuarios en el sys. derivado de las metricas de
   * administracion esto evitara calculos redundantes en la vista
   * */
   const totalUsers = computed(() => 
      (adminMetrics.value?.totalStudents ?? 0) +
      (adminMetrics.value?.totalTeachers?? 0)
   );

   /**
    * Porcentajes aprobados sobre el total.
    * Retorna 0  si no hay materiales para evitar la division entre 0
    * */
    const approvalRate = computed<number> (()=> {
          const total    = adminMetrics.value?.totalMaterials ?? 0;
          const approved = adminMetrics.value?.materialsApproved ?? 0;
            if (total === 0) return 0;
              return Math.round((approved / total)* 100);
    });

    /**
     * Porcentaje de materiales rechazados sobre el total
     * */
    const rejectionRate = computed<number> (()=> {
          const total    = adminMetrics.value?.totalMaterials ?? 0;
          const rejected = adminMetrics.value?.materialsRejected ?? 0;
            if (total === 0) return 0;
              return Math.round((rejected / total)* 100);
    });

     /** [ready]
     * Porcentaje de materiales pendientes sobre el total
     * */
    const pendingRate = computed<number> (()=> {
          const total    = adminMetrics.value?.materialsPending ?? 0;
          const pending = adminMetrics.value?.materialsApproved ?? 0;
            if (total === 0) return 0;
              return Math.round((pending / total)* 100);
    });
      
       /**
       * El indicador de las metricas globales(ctd de materiales disp.) 
       * */
        const hasAdminMetrics = computed<boolean>(() => adminMetrics.value !== null);
        
        /**
         * si hay un error activo*/
        const hasError = computed<boolean>(() => error.value !== null);

        /**
         * Indica si el cache sigue siendo valido
         * */
        const isCacheValid = computed<boolean>( () => {
          if (!lastFetch.value) return false;
           return (Date.now() - lastFetch.value.getTime()) < CACHE_DURATION_MS;
        });

    // ══════════════════════════════════════════════════
    //  HELPERS INTERNOS
    // ═════════════════════════════════════════════════
        /**
         * Finaliza un ciclo de carga.
         * Siempre que llama al bloque finally*/
    function _startLoading(): void {
      console.log('F(n) de load visitada');
       loading.value = true;
       error.value = null;  
        //console.log('Carga del Almac a [+,-]: ', currentUser.value);
    }


    function _stopLoading(): void {
       loading.value = false;
    }


    function _setError(context: string,err: any): void {
       const message =  err?.message || 'Error inesperado';
       error.value  = `${context}: ${message}`;
         if (import.meta.env.DEV) {
            console.error(`[StatisticsAdminStore] ${context}`,err);
         }
    }

    /**
     * Activa el lastFetch de la ultima carga
     * */
    function _markFetch(): void {
         lastFetch.value = new Date();
    }

    /**
     * Carga las metricas globales del sistema(admin)
     * Respeta el caché, no recarga si los datos siguen siendo validos
     * */
    async function loadAdminMetrics(forceRefresh=false): Promise <void> {
       if(!forceRefresh  && isCacheValid.value && hasAdminMetrics.value) return;
        _startLoading();

        try {
           adminMetrics.value = await StaticsServiceUn.getAdminStatistics();
            _markFetch();
        } catch(err: any){
          _setError('Error al cargar el resumen diario',err);
        } finally{
          _stopLoading();
        }
    }

    /**
     * Carga las metricas especificas de la vista del profesor.
     * Incluye el conteo de materiales por estado y los comentarios
     * */
      async function loadTeacherMetrics(): Promise<void> {
        _startLoading();
          // [ready]
        try {
           teacherMetrics.value = await StaticsServiceUn.getTeacherStatistics();
         } catch(err: any){
            _setError('Error al cargar las metricas globales');
         } finally {
           _stopLoading();
         }
      }

      /**
       * Cargar el resumen de actividad del dia para un profesor
       * @param profesorId - UID del profesor autenticado
      */
      async function loadDailySummary(profesorId: string): Promise <void>{
        _startLoading();
         try{
            const summary = await StaticsServiceUn.getDailySummary(profesorId);
            dailySummary.value = {
             date:            summary.date,
             activitiesCount: summary.activitiesCount,
            };
            // [ready]
         }catch(err: any){
            _setError('Error al cargar el resumen diario', err);
         } finally {
           _stopLoading();
         }
      }

      /**
       * El principal - Mt que invoca a onMounted(hook de montaje) de la vista
       * @param profesorId - UID del profesor - es requerido en el resumen diario
       * */
      async function loadAll(profesorId: string): Promise<void> {
        console.log('Main: Cargando todas las metricas disponibles')
         _startLoading();
          try{
             await Promise.all([
               loadAdminMetrics(),
               loadTeacherMetrics(),
               loadDailySummary(profesorId),
             ]);
          }catch(err: any){
             _setError('Error en la carga parela de las metricas');
          } finally {
            _stopLoading();
          }
      }

      /**
       * Fuerza la recarga de todas las metricas invalidando el cache
       * Exp. para el boton actualizar de la vista
       * @param profesorId - UID del profesor activo
       * */
      async function refresh(profesorId: string): Promise<void> {
        lastFetch.value = null;
         await loadAll(profesorId);
      }

      /**
       * Limpieza del error activo, sin recargar los datos **/
      function clearError(): void {
        error.value = null;
      }

      /**
       * Resetea todo el store a su estado inicial. Llamado al onMounted de la vista
       * */
      function resetState(): void{
        adminMetrics.value = null;
        teacherMetrics.value = null;
        dailySummary.value = null;
        loading.value = false;
        error.value = null;
        lastFetch.value = null;
      }

      return {
        adminMetrics,
        teacherMetrics,
        dailySummary,
        loading,
        error,
        lastFetch,

        totalUsers,
        approvalRate,
        rejectionRate,
        pendingRate,
        hasAdminMetrics,
        hasError,
        isCacheValid,

        loadAll,
        loadAdminMetrics,
        loadTeacherMetrics,
        loadDailySummary,
        refresh,
        clearError,
        resetState,
      };
 });