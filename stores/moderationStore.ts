import {defineStore} from 'pinia';
import {ModerationService} from '@/services/ModerationServices';
import type {Material, Comentario, Moderation} from '@/interfaces/Profile.types.ts';
	// not fatal error 's singular, not plural, subject to correction
// ===============================
//     TIPOS LOCALES
// ===============================
 type ModerationStatus = 'aprovado' |'rechazado' |'pendiente'; //*

  	interface ModerationState {
  		// Est. de Materiales pendientes
  	  pendigsMaterials: Material[];
  	  currentMaterial: Material | null;
  	  // modulo de comentarios de profesores
  	  comments: Comentario[];
      commentsForMaterial: Map<string, Comentario[]>;
      // Control de estado general
      loading: boolean;
      error: string;
      	// Estadisticas de moderacion
	     stats:{
	     	pendigsTotal: number;
	     	approvedsTotal: number;
	     	rejectedsTotal: number;
	     };
  	}

  	// ================================
  	// 	STORE: useModerationStore
  	// ================================

	export const useModerationStore = defineStore('moderation_materials',{
		state: (): ModerationState => ({
			 // Materiales
			pendigsMaterials: [],
			 currentMaterial: null, //*
			// Comentarios
			comments: [],
			commentsForMaterial: new Map(),

			loading: false,
			error: '',

			stats:{
				  pendigsTotal: 0,
				approvedsTotal: 0,
				rejectedsTotal: 0,
			},
		}),

  		// ==============================
  		// 		GETTERS 
  		// ==============================

  		getters: {
  			/**
  			 * Obtiene todos los comentarios destacados
  			 * */
  			comentariosDestacados: (state): Comentario[] => {
  				return state.comments.filter(c=>c.destacado); //*
  			},

  			/**
  			 * Obtien comentarios de un material escpecífico
  			 * */
  			comentarioDeMaterial: (state)=> {
  				return (materialId: string): Comentario[] => {
  					return state.commentsForMaterial.get(materialId) || [];
  				};
  			},
  			/**
  			 * Verifica si hay materiales Pendientes
  			 * */  //*
  			hasPending: (state): boolean => {
  				state.pendigsMaterials.length > 0;
  			},

  			/**
  			 * Cuenta de Materiales por estado
  			 * */
  			countStatistics:(state) => {
  				return {  // *cbio 3 *
  					  pendings:  state.stats.pendigsTotal,
  					 approveds:  state.stats.approvedsTotal,
  					rejecteds: state.stats.rejectedsTotal,
  					total: state.stats.pendigsTotal +
  						  state.stats.rejectedsTotal
  				};
  			},	

  			/**
  			 *  Material actual en revision
  			 * */
  			materialInRevition: (state): Material | null => {
  				return state.currentMaterial;
  			},
  		},

  		actions: {
  			// ====================================
  			// 	GESTIÓN DE MATERIALES PENDIENTES
  			// ====================================
  			
  			/**
  			 * Carga todos los materiales pendientes en
  			 * moderarcion*/
  			async loadPendingsMaterials(): Promise<void> {
  					this.loading = true;
  					this.error = '';

  					try {
  						const pendings = await ModerationService.getPendientes(); //*

  						 if (Array.isArray(pendings)) {
  						 	 this.pendigsMaterials = pendings;
  						 	 this.stats.pendigsTotal = pendings.length; //* ht

  						 	 	 await this.loadListMaterialsOfComments(pendings);

  						 	 	console.log(`[ModerationStore]: ${pendings.length} materiales pendientes cargados`);
  						 } else {
  						 	 throw new Error('La respuesta de su arreglo no es valido');
  						 }
  					} catch(err: any) {
  						this.error = err.message || 'Error al obtener materiales pendientes';
  						console.error('[ModerationStore] Error:', this.error);
  						 throw err;
  					} finally {
  						 this.loading = false;
  					}
  			},
  				//*cmbio 133
  			async materialSelected(materialId: string): Promise <void> {
  				const material = this.pendigsMaterials.find(m=>m.id== materialId);

  				 if (material) {
  				 	this.currentMaterial = material;
  				 	console.log(`[ModerationStore]: Material ${materialId} seleccionado para revisión`);
  				 } else {
  				 	 console.warn(`[ModerationStore]: Material ${materialId} NO encontrado`);
  				 }
  			},

  			/**
  			 * Aprobar el material Educativo
  			 * */
  			async approvateMaterial(materialId: string, alumnoId: string):
  			 Promise<void>{
  				this.loading = true;
  				  this.error = '';

  				try{
  					await ModerationService.approvateEducMaterial(materialId,alumnoId);

  					await this.removeOfPendings(materialId);
  					this.stats.approvedsTotal++;

  					console.log(`[ModerationStore]: Material materialId ${materialId} aprobado correctamente`);
  				}catch(err: any){
  					this.error = err.message || 'Error al aprobar material';
        			console.error('[ModerationStore] Error al aprobar:', this.error);
        			 throw err;
  				} finally {
  					 this.loading = false;
  				}
  			},

  			/** Rechazar el material Educativo 
  			 * */
  			async rejectedMaterial(materialId: string, alumnoId: string,
  				    reason?: string): Promise<void>{  //cmbio falta carg de edo
  				this.loading = true;
  				this.error = '';

  				try{
  					await ModerationService.rechazarMaterial(materialId,alumnoId, reason);

  						this.removeOfPendings(materialId);
  						this.stats.rejectedsTotal++;

  					console.log(`[ModerationStore]: Material ${materialId} rechazado`);
  				}catch(err: any){
  					this.error = err.message || 'Error al rechazar material';
        			console.error('[ModerationStore] Error al rechazar:', this.error);
        			throw err;
  				}finally {
  					 this.loading = false;
  				}		
  			},

  			/**
  			 * Cambiar el estado de moderacion un material
  			 * */
  			async changeStateModeration(materialId: string, alumnoId: string, newState: ModerationStatus,
  					 reason?: string): Promise <void> {

  				if (newState === 'aprovado') { 
  					 await this.approvateMaterial(materialId,alumnoId);
  				} else if(newState === 'rechazado'){
  					 await this.rejectedMaterial(materialId,alumnoId,reason); //*
  				} else {
  					console.warn(`[ModerationStore]: Estado "${newState}" no valido para moderación`);
  				}
  			},

  			//  =========================================
  			//  			MODULO DE COMENTARIOS
  			//  =========================================

  			async addComment(materialId:string, message:string, highlighted: boolean = false):Promise <Comentario>{
  				this.loading = true;
				this.error = '';

  				try {
  				 	 const newComment = await ModerationService.addCommentTeacher(materialId,message, highlighted);


  				 	 this.comments.push(newComment);

  				 	 const materialComments = this.commentsForMaterial.get(materialId) ?? [];
  				 	 materialComments.push(newComment);
  				 	  this.commentsForMaterial.set(materialId,materialComments);

  				 	   return newComment;
  				}catch(err: any){
  				 	 this.error = err.message || 'Error al agregar el comentario';
  				 	 // console.error = err.message || 'Error al agregar comentario';
        			 console.error('[ModerationStore] Error:', this.error);
        			 throw err;
  				} finally {
  					this.loading = false;
  				}
  			},

  			/**
  			 * Carga comentarios de una lista de Materiales
  			 * */
  			async loadListMaterialsOfComments(materials: Material[]):
  			 Promise <void>{
  				try{	// guarda nuevo pos si se invoca incorecto
  					if (!materials || Array.isArray(materials)) {
  						console.warn('ModerationStore: loadListMaterialsOfComments requiere un arreglo..');
  							return;
  					}

  					for (const material of materials) {
  						const comments = await ModerationService.obtenerComentariosDeMaterial(material.id);
  					
	  					if (comments.length>0) {
	  						this.commentsForMaterial.set(material.id, comments);
	  						this.comments.push(...comments);
	  					}

					}
						console.log(`[ModerationStore]: Comentarios cargados para ${materials.length} materiales`);  //* esta dentro
				}catch(err: any){
					 console.warn(`[ModerationStore]: Error al cargar los comentarios: `, err.message)
				}
			},

			 /**
			  * Actualiza el Comentario Existente
			  * */
			async updateComment(commentId:string ,newMessage:string ,highlighted?: boolean):
			   Promise<void>{
			  	this.loading = true;
				  this.error = '';

				try{
				  	 await ModerationService.updateComment(commentId, newMessage,highlighted);

				  	 const comment = this.comments.find(c => c.id === commentId);

				  	 if (comment) {
				  	 	comment.message = newMessage;
				  	 	 if (highlighted !== undefined) {
				  	 	 	 comment.highlighted = highlighted;
				  	 	 }
				  	 }
				  	  console.log(`[ModerationStore]: Comentario ${commentId} actualizado `);
				}catch(err: any){
				  	 this.error = message || 'Error al actualizar el comentario, del Profesor';
				  	 // console.error('[ModerationStore] Error:', this.error);
				}finally {
					this.loading = false;
					}
			},

			/**
			 * Eliminar  comentario del role2(Teacher)
			 * */
			async deleteComment(commentId: string , materialId: string): Promise<void>{
				this.loading = true;
				  this.error = '';

				try{
					await ModerationService.deleteComment(commentId);

					this.comments = this.comments.filter( c => c.id  !==commentId); //*

					const commentMaterial = this.commentsForMaterial.get(materialId);
					 if (commentMaterial) {
					 	  const updates = commentMaterial.filter( c=>c.id !== commentId);
					 	  this.commentsForMaterial.set(materialId, updates);  //*
					 }

					 console.log(`[ModerationStore], Comentario ${commentId} eliminado`);
				}catch(err: any){
					this.error = err.message || 'Error al eliminar el comentario';
					throw err;
				} finally {
					this.loading = false;
				}
			},	

			 // ============================
			 // 	UTILIDADES INTERNAS
			 // ============================
			
			 /**
			  * Remueve un material de la lista de Pendientes
			  * */
			removeOfPendings(materialId: string): void {
				this.pendigsMaterials =  this.pendigsMaterials.filter(
					m => m.id !== materialId
				);

				this.stats.pendigsTotal = this.pendigsMaterials.length;

				 if(this.currentMaterial?.id === materialId){
				 	 this.currentMaterial = null;
				 }
			},
			// todos a exp el ultimo
			cleanState(): void{
			   this.pendigsMaterials = [];
			   this.currentMaterial = null;
			    this.comments = [];
			    this.commentsForMaterial.clear();
			    this.error = '';
			    this.stats = {
			    	pendigsTotal: 0,
			    	approvedsTotal: 0,
			    	rejectedsTotal: 0
			    };
			    console.log('[ModerationStore]: El Estado fue sanitizado');
			},

			async updateStatistics(): Promise<void> {
				try{
					const stats = await ModerationService.obtenerEstadisticas();
					this.stats = stats;

					console.log('[ModerationStore]: Estadísticas actualizadas');
				}catch(err: any){
					console.error('[ModerationStore] Error al Actualizar estadísticas', err)
				}
			},
		},

	});