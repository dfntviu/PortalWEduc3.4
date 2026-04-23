import {defineStore} from 'pinia';
import {DesplegarMaterialServiceR2} from  '@/services/MaterialAdmServProffesor';
import { Material } from '@/interfaces/Profilte.types.ts';


/**
 ** Store para gestión de materiales desde la perspectiva del profesor
 * 
 * Arquitectura: SERVICE-STORE-VIEW
 * - Este Store orquesta servicios
 * - Este Store contiene validaciones de negocio
 * - Este Store no contiene logia de
 * @observar {@link DesplegarMaterialServiceR2 } Para comunicacion con FireBase
 * */
export const useMaterialTeachStore = defineStore('teacher_materials',{
 	// ═══════════════════════════════════════════════════════════
 			// ESTADO
 	// ═══════════════════════════════════════════════════════════
 	state: () => {
 		// ══════════════════════════════════════════════════════════
 		//  Datos Principales
 			materials:[] as Material;
 		// ═══════════════════════════════════════════════════════════
 		// 	Estados de Carga
 		// ═══════════════════════════════════════════════════════════
 			loading: false;

 		// ═══════════════════════════════════════════════════════════
 				// Gestion de Errores
 		// ═══════════════════════════════════════════════════════════
 		error:null as string | null;
 		errorHistory:[] as Array<{
 			timestamp: Date,
			message: string,
			filter: number | null,
			stackTrace?:string
 		}>;
 		// ═══════════════════════════════════════════════════════════
 				// 			Contexto y Metadata
 		// ═══════════════════════════════════════════════════════════
 			lastFilter: null as number | null;
 			lastFetchTimestamp: null as Date | null;
 			fetchCount: 0;
 	},
 		// ═══════════════════════════════════════════════════════════
 				// 			GETTTERS
 		// ═══════════════════════════════════════════════════════════
 	getters: {
	    /**
	     * Indica si hay materiales cargados
	     */
	    hasMaterials: (state): boolean => state.materials.length > 0,
	    
	    /**
	     * Cuenta total de materiales
	     */
	    totalMaterials: (state): number => state.materials.length,
	    
	    /**
	     * Indica si hay errores en el historial
	     */
	    hasErrorHistory: (state): boolean => state.errorHistory.length > 0,
	    
	    /**
	     * Último error registrado
	     */
	    lastError: (state) => number => {
	    	if (state.errorHistory.length === 0) return 0;
	    	 	return state.errorHistory.length/ state.fetchCount;
	    },
	     /**
	     * Indica si el estado está limpio (sin datos ni errores)
	     */
	    isClean: (state) => boolean => {
			return	(	state.materials.length === 0 &&
	    				state.loading &&
	    				state.error === null);
	    },
	},
 		// ═══════════════════════════════════════════════════════════
 				// 			ACTIONS(ACCIONES)
 		// ═══════════════════════════════════════════════════════════
	actions: {
		async fetchMaterialsByFilter(filterOption: number): Promise<void> {
	      // ─────────────────────────────────────────────────────────
	      // VALIDACIÓN DE ENTRADA
	      // ─────────────────────────────────────────────────────────
	      const validationError = this._validateFilterOption(filterOption);
	      if (validationError) {
	        this._handleError(validationError, filterOption);
	        return;
	      }

	      // ─────────────────────────────────────────────────────────
	      // PREPARACIÓN DE ESTADO
	      // ─────────────────────────────────────────────────────────
	      this.loading = true;
	      this.error = null;
	      this.lastFilter = filterOption;
	      this.fetchCount++;

	      try {
	        // ─────────────────────────────────────────────────────────
	        // INSTANCIACIÓN DEL SERVICIO
	        // ─────────────────────────────────────────────────────────
	        const service = MaterialDeployServiceR2();
	        
	        // ─────────────────────────────────────────────────────────
	        // MAPEO DE FILTROS A MÉTODOS DE SERVICIO
	        // Patrón Strategy: cada filtro ejecuta una estrategia diferente
	        // ─────────────────────────────────────────────────────────
	        const filterStrategies: Record<number, () => Promise<Material[]>> = {
	          1: () => service.getAllStudentsMaterials(),
	          2: () => service.getMaterialsSortedByLatest(),
	          3: () => service.getMaterialsByUsername(),
	          4: () => service.getMaterialsToday(),
	          5: () => service.getMaterialLast2Days(),
	          6: () => service.getMaterialsLastWeek(),
	        };

	        // ─────────────────────────────────────────────────────────
	        // OBTENCIÓN DE ESTRATEGIA
	        // ─────────────────────────────────────────────────────────
	        const strategy = filterStrategies[filterOption];
	        
	        if (!strategy) {
	          throw new Error(
	            `Estrategia de servicio no encontrada para filtro: ${filterOption}`
	          );
	        }

	        // ─────────────────────────────────────────────────────────
	        // EJECUCIÓN DEL SERVICIO
	        // ─────────────────────────────────────────────────────────
	        const fetchedMaterials = await strategy();

	        // ─────────────────────────────────────────────────────────
	        // VALIDACIÓN DE RESPUESTA
	        // ─────────────────────────────────────────────────────────
	        this._validateServiceResponse(fetchedMaterials);

	        // ─────────────────────────────────────────────────────────
	        // ACTUALIZACIÓN DE ESTADO
	        // ─────────────────────────────────────────────────────────
	        this.materials = fetchedMaterials;
	        this.lastFetchTimestamp = new Date();

	      } catch (err: any) {
	        // ─────────────────────────────────────────────────────────
	        // MANEJO DE ERRORES
	        // ─────────────────────────────────────────────────────────
	        const errorMessage = this._extractErrorMessage(err);
	        this._handleError(errorMessage, filterOption, err.stack);
	        
	        // Limpia materiales en caso de error crítico
	        this.materials = [];
	        
	      } finally {
	        // ─────────────────────────────────────────────────────────
	        // FINALIZACIÓN - SIEMPRE SE EJECUTA
	        // ─────────────────────────────────────────────────────────
	        this.loading = false;
	      }
		},

	/**
     * Limpia todos los errores del historial
     */
    clearErrorHistory(): void {
      this.errorHistory = [];
      this.error = null;
    },

    /**
     * Reinicia el store a su estado inicial
     * Útil al montar/desmontar componentes
     */
    $reset(): void {
      this.materials = [];
      this.loading = false;
      this.error = null;
      this.errorHistory = [];
      this.lastFilter = null;
      this.lastFetchTimestamp = null;
      this.fetchCount = 0;
    },

     	// ══════════════════════════════════════════════
 		// 				Metodos PRIVADOS [HELPERS]
 		// ══════════════════════════════════════════════

    	/**
    	 * Valida que la opcion de filtro sea valida
    	 * Prefijo _ Indica su uso interno unicamente*/


    	/**
    	 * Valida que la opcion de filtro sea valida
    	 * @private
    	 * @returns Mensaje de error o nulo si es valido*/

    	_validateFilterOption(option: number): string | null {
    		if (!Number.isInteger(option)) {
    			return  `El filtro debe ser un número entero, recibido: ${typeof option}`;
    		}
    		if (option<1|| option>6) {
    			return  `El filtro debe estar entre 1 y 6, [recibido] : ${option}`;
    		}
    		return null;
    	},

    	_validateServiceResponse(response: any): void {
	   		if (!Array.isArray(response)) {
		        throw new Error(
		          `El servicio devolvió un tipo inválido: ${typeof response}. Se esperaba un array.`
		        );
      	   }

      		for (const item of response) {
      			if (!item.id || !item.title) {
      				console.warn('Material con estructura incompleta encontrado:', item);
      			}
      		}
      },

      _extractErrorMessage(error: any): string {
      		// Error de Firebase
      		if (error.code) {
      			return `Error de Firebase (${error.code}): ${error.message}`;
      		}

      		//  Error estandar
      		if (error.message) {
      			return error.message;
      		}
      		// Error no conocido
      		if (typeof error === 'string') {
      			return error;
      		}

      		return 'Error al ingresar los materiales';
      },

     /**
    	 * Manipula errores de Forma centralizada
    	 * Registra el historial de errores con metadata completa
    	 * @private **/
      	_handleError(	
      		message: string,
      		filter: number,
      		stackTrace?: string):void {

      		this.error = message;
      		this.errorHistory.push({timestamp: new Date(),
      		 message,
      		 filter, 
      		 stackTrace,
      		});

      		if (import.meta.DEV) {
      			console.error('[MaterialTeacherStore] Error:', {
		          message,
		          filter,
		          stackTrace,
		          timestamp: new Date().ISOString(),
		       });
      		}
				},
	}
 });