 import { defineStore } from 'pinia';
 import {ref, computed } from 'vue';
 import { ReportService } from '@/services/ReportService.ts';
  import type { ReportData, MaterialReport } from '@/services/ReportService.ts';
  import type { FormatType } from '@/types/interfces_Repte.ts';  //complet

  /**
   *    
   * ═════════════════════════════════════════ 
   * 		STORE DEFINITION
   *  ════════════════════════════════════════
   */
    const useReportStore = defineStore('report', () => {

    	// ──────────────────────────────────
  		// 			STATE
  		// ──────────────────────────────────
		const reportData = ref<any | null>(null);
		const isLoading = ref<false | null>(null);
		const error = ref<string | null>(null);
		const isExporting = ref<false | null>(null);
		const isDownloaing = ref<false | null>(null);
			
			// La memoria cache
		const lastFetch	 = ref<Date| null>(null);
		const curretRole    = ref<'student'| 'tacher'>('student'); //return to spanish
		const curretUserId  = ref<string| undefined >(undefined);
		const CACHE_DURATION_MS = 5 * 60 * 1000;  // no reseteable

  		// ─────────────────────────────────
  		//    GETTERS
  		// ─────────────────────────────────

		const hasData = computed(() =>  reportData.value !== null);
		const weeklyMaterials = computed(() =>  reportData.value?.lastWeek || []);

		const monthlyMaterials = computed( () =>  reportData.value?.lastMonth || []);

		const totalWeekly = computed ( () => reportData.value?.totalLastWeek || 0);

		const totalMonthly = computed (  () => reportData.value?.lastMonth || [])

		const isCachedValid = computed( ()  => {
			if (!lastFetch.value) return false;
			  const elapsed = Date.now() - lastFetch.value.getTime();  //tmpo transcurrido
			 return  elapsed < CACHE_DURATION_MS;  //==
		});

		const isDownloadZip = computed( ()  => {
			 return curretRole.value === 'alumno' &&
			 		weeklyMaterials.value.length > 0 &&
			 		 isDownloaing.value;
		});

		// ─────────────────────────────────────
  		//   ACTIONS - DATA FETCHING
  		// ─────────────────────────────────────

		/**
          * Cargar reporte de materiales
          * */
		async function recuperarReporte( rol: 'alumno' | 'profesor',
    				usuarioId?: string, forzarActualizacion: boolean = false): Promise<void> {
			
			if (forzarActualizacion && isCachedValid.value &&
					curretRole.value === rol &&
					curretUserId.value ===  usuarioId) {
				 return;
			}

			isLoading.value = true;
			error.value = null;

			try{
				 curretRole.value = rol;
				 curretUserId.value = usuarioId;

				 const data = ReportService.obtenerMaterialesRango(rol, usuarioId);

				 reportData.value = data;
				 curretUserId.value = new Date();

			}catch(err){
				const erorMessage = err instanceof Error
				  ? err.message
				  : 'Error desconocido al cargar el reporte';

				  error.value = erorMessage;
				  console.error('Error al Recuperar el Reporte',err);
				   throw err;
			} finally {
				 isLoading = false;
			}
		}

		/**
          * Refrescar/Actualizar los datos (forzar nueva carga)
          * */

			async function refrescarReporte(): Promise <void>   {
				//
				if (!curretRole.value) {
					throw new Error('No hay rol definido para actualizar o refrescar');
				}

				await recuperarReporte(curretRole.value, curretUserId.value, true);
			}

		// ─────────────────────────────────────
  		//   ACTIONS - EXPORTS
  		// ─────────────────────────────────────	

		/**
		 * Exportar reporte en formato especifico
		 * */
		async function exportarReporte(data: MaterialReport[],formato: FormatType, nombre_archivo: string) {
			 if (!canExport.value) {
			 	throw new Error('No es posible exportar en este momento');
			 }

			 isExporting.value = true;

			try{
			   if (formato === 'pdf') {
			   		await ReportService.exportarAPDF(data, nombre_archivo);
			   } else if (formato === 'xlsx') {
			   	    await ReportService.exportarAPDF(data,nombre_archivo);
			   } else if (formato === 'docx') {
			   		await ReportService.exportarAPDF(data,nombre_archivo);
			   }

			}catch(err){
				console.log('Error al exportar el Reporte PDF: ', err);
				 throw err;
			} finally {
				isExporting.value = false;
			}
		}

		/**
		 * Descargar materiales como ZIP
		 * */
		async function descargarMaterialesAZip(materiales: MaterialReport[]): Promise<void> {
			
			if (!canDownloandZip.value) {
				throw new Error('No es posible descargar ZIP en este momento');
			}

			isDownloaing.value = true;

			try{
				await ReportService.descargaSemanalMaterialesZIP(materiales);
			}catch(err){
				console.error('Error al descargar todo el material en ZIP:',err);
				 throw err;
			} finally {
				 isDownloaing.value = false;
			}
		}


  		// ────────────────────────────────────────
  		// 		ACTIONS - UTILITIES
  		// ────────────────────────────────────────

  		/**
  		 * Limpiar los datos del store
  		 * */
		function limpiarReporteDatos(): void {
			reportData.value = null;
			isDownloaing.value = false;
			error.value = null;
			lastFetch.value = false;
			isDownloaing.value = false;
		}

		/**
		 * Resetear completamente el store
		 * */
		

		/*function $reset(): void {
		 	limiaReporteDatos();
		 	curretRole.value = 'alumno';
		 	curretUserId.value = undefined;
		}
		*/
		function $reset() {
			reportData.value = null;
			isLoading.value = null;
			error.value = null;
			isExporting.value = null;
			isDownloaing.value = '';
			lastFetch.value = null;
			curretRole.value = undefined
		}
      // ─────────────────────────────────────────
      // 		RETURN
      // ─────────────────────────────────────────

		return {
			 // State
			reportData,
			isLoading,
			error,
			isExporting,
			isDownloaing,
			curretRole,
			curretUserId,
			// Clean Method
			$reset, //--- limp. vars --- 
			// Getters
			hasData
			weeklyMaterials
			monthlyMaterials,
			totalWeekly,
			totalMonthly,
			isCachedValid,
			canExport,
			canDownloandZip
			// Actions
			recuperarReporte,
			refrescarReporte,
			exportarReporte,
			descargarMaterialesAZip,
			limpiarReporteDatos,
			$reset
		}
    });