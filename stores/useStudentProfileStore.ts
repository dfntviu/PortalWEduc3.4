/**
 * ======= ======================================
 *  STORE: student Profile Store
 * ==============================================
 * Responsabilidad: La Gestion de estado reactivo + Orquestacion de Servicios
 * NO contiene Logica de Firebase(delegada al Service) 
 * 
 * @modulo: stores/useStudentProfileStore
 * @arquitectura Store layer(capa intermedia) 
 **/

 import {defineStore} from 'pinia';
 import {ProfileStudentService} from '@/services/ProfileStudentService';
 import type {StudentUser,StudentRegisterationData, StudentEditableData,ChangePasswordData,
StudentProfileState, ServiceResponse} from '@/interfaces/tipos.estudiantes';
 import  {MESSAGES} from '@/interfaces/students.types';
 import type { ProfilePhotoOptions } from '@/services/ProfileStudentService';

 export const useStudentProfileStore = defineStore('studentProfile', {
  	 state: (): StudentProfileState  => ({
  	 			profile: null,
  	 			loading: false,
  	 			error:'',
  	 			message: ''
  	   	 }),

  	 getters: {
  		/**
  		 * Verifica si hay un perfil cargado
  		 * */
  	 	hasProfile: (state): string => {
  	 		if (!state.profile) return;
  	 		 return  `${state.profile.name} ${state.profile.lastname}`;
  	 	},

  	 	/**
  	 	 * Obtiene el correo universitario
  	 	 * */
  	 	universityEmail: (state): string => {
  	 		return state.profile.accounNumber ?? '';
  	 	},

  	 	accountNumber: (state): string => {
  	 		return state.profile?.numCuenta ?? '';
  	 	},
  	 	/**
  	 	 * Verifica si está en estado de carga
  	 	 * */
  	 	isLoading: (state): boolean => state.loading

  	},

  	actions: {
  		// ═════════════════════════════════════════════════════════════════════
  	// }
    // REGISTRO COMPLETO (Auth + Perfil)
    // ══════════════════════════════════════════

  		/**
     * Registra un nuevo estudiante
     * 1. Crea usuario en Firebase Auth
     * 2. Guarda perfil en Firestore
     * 3. Carga el perfil del estado
     * */
  		async registerStudent(data: StudentRegistrationData,photoOptions?: ProfilePhotoOptions): Promise<void> {
			this.loading = true;
			this.error  = '';
			this.message = '';

			console.log('[Store] photoOptions recibido:', photoOptions);
			try{
				console.log('[StudentStore] Iniciando registro de estudiante');
        
        // Validaciones básicas
        if (!data.nombre || !data.apellido || !data.password) {
          throw new Error('Completa todos los campos requeridos');
        }
        
        if (!data.carrera) {
          throw new Error('Debes seleccionar una carrera');
        }
        
        if (data.password.length < 8) {
          throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
        	/*const tempEmail = ProfileStudentService['generateUniversitaryEmail'](
        		data.nombre,   debera de ajustarse, de tal suerte que el email sea generado, por medio de la f(n)
        		data.apellido);

        	console.log('[Estado de Estudiante] Email generado por Auth ',tempEmail);*/

				
				// 1. Crear usuario en Firebase Auth
					const firebaseUser = await ProfileStudentService.createAccountEmailAndPassword(data.email, data.password);

					const uid = firebaseUser.uid;
					console.log('[Estado de Estudiante] Usuario creado con  UID:',uid);

						// 2. Guardar Perfil en firestore
					const profile_student = await ProfileStudentService.saveStudentProfile(data,uid,photoOptions);  // movi accidentalmente los parametros**

					/*if (!profile_student.success || !profile_student.data) { //*
						console.log('Error al guardar el perfil del Estudiante');
					} */
					 //*
						// Cargar el perfil del estado
					this.profile = profile_student; //*
					this.message = MESSAGES.REGISTRO_EXITOSO; //* 

					 console.log('[StudentStore] El registro fue completado exitosamente');
					 /*console.log('[StudentStore] Email Universitario', profile_student.data.email);
					 console.log('[StudentStore] Número de cuenta:', profile_student.data.accounNumber);*/

						return { //* * * 
							success: true,  // * * *
							data: profile_student, // * * *
							message: this.message, // * * *
						};//* * * 
				}catch(error: any){
						this.error = error.message ?? 'Error desconocido';
        		console.error('[StudentStore] Error al registrar:', error);
        	 return { success: false, message: this.error };
				} finally {
					this.loading = false;
				}
  		},

  		/**
  		 * Cargar el perfil de un estudiante por
  		 * UID **/
  		async loadStudentProfile(uid:string): Promise <void> {
  					this.loading = true;
  					this.error = '';
  			try{
  					console.log('[StudentStore] Cargando el perfil del estudiante:', uid);

  					const profile = await ProfileStudentService.getStudentById(uid);

  					if (!profile) {
  						throw new Error('No se encontró el perfil del estudiante');
  					}

  					this.profile = profile;
  					console.log('[StudentStore] Perfil cargado: ', profile.nombre);
  			}catch(error:any){
  					this.error = error.message || ''
  			}
  		},

  		/** Cargar el perfil desde el localStorage
  		 * Util para recuperar session
  		 * */
  		async loadFromLocalStorage(): Promise<boolean> {
  				try{
  					this.loading = true;
						this.error  = '';
						this.message = '';

  						const storedUser = localStorage.getItem('currentUser');

  						if (!storedUser) {
  							throw new Error('No hay perfil cargado para actualizar');
  							 return false;
  						}

  						const userData = JSON.parse(storedUser);

  						if (!userData.uid || userData.role !== 'student') {
  							console.warn('[StudentStore] Usuario en localStorage, no es estudiante', error);
  								return false;
  						}
  							const result = await this.loadStudentProfile(userData.uid);
  							 return true;
  						
  				}catch(error: any){
  						console.warn('[StudentStore] Error al cargar desde el localStorage', error);
  						return false;
  				}finally{
  					 this.loading = false;
  				}
  		},

  		async updateProfile(data: StudentEditableData): Promise<ServiceResponse> {
  				try{

  						if (!this.profile) {
  							throw new Error('No hay perfil cargado para actualizar');
  						}

  						console.log('[StudentStore] Actualizando perfil');
  							// Ajustar los parametros a 3 con la foto de Perfil
  						const result = await ProfileStudentService.updateProfile(
  								this.profile.uid_alumno,
  								data
  							);

  						if(!result.success){
  							throw new Error(result.error || 'Error al actualizar perfil');
  						}

  						await this.loadStudentProfile(this.profile.uid_alumno);
  						this.message = MESSAGES.PERFIL_ACTUALIZADO;
  						console.log('[StudentStore] El Perfil fue actualizado exitosamente ');

  						return {
  							success: true,
  							message: this.message
  						};
  				}catch(error: any){
  						this.error = error.message || MESSAGES.ERROR_ACTUALIZACION;
  						console.error('[StudentStore] Error en updateProfile:', error);

  						return {
  							success: false,
  							error: this.error
  						};
  				}finally {
  					 this.loading = false;
  				}
  		},

  		/**
  		 * Elimina el perfil del estudiante
  		 * NOTA: Solo elimina el documento Firestore, no la cuenta de Auth
  		 * */
  		async deleteProfile(): Promise<ServiceResponse> {
  			this.loading = true;
			  this.error  = '';
			  this.message = '';

			  try{
			  	if (!this.profile) {
			  		throw new Error('Aún, no hay Perfil cargado para ELIMINAR');
			  	}

			  	console.log('[StudentStore] Eliminando el Perfil');

			  	const result = await ProfileStudentService.deleteStudentProfile(this.profile.uid_alumno);

			  	if (!result.success) {
			  		throw new Error(result.error || 'Error al eliminar el Perfil');
			  	}

			  	// Limpiar el estado
			  	this.profile = null;
			  	this.message = MESSAGES.PERFIL_ACTUALIZADO;

			  	console.log('[StudentStore] El Perfil fue "Eliminado" exitosamente');

			  	return {
			  		success: true,
			  		message: this.message
			  	};
			  }catch(error: any){
			  	this.error = error.message || MESSAGES.ERROR_ELIMINACION;
  						console.error('[StudentStore] Error en updateProfile:', error);

  					return {
  						success: true,
			  			message: this.message
  					}
			  } finally {
			  	this.loading = false;
			  }
  		},
  		  		/**
  		 * Cambia la contrasenia del estudiante
  		 * Requiere contrasenia actual para re-autenticacion
  		 * Cierra session automaticamente despues del cambio
  		 * */
  		async changePassword(data: changePassword): Promise<ServiceResponse> {
  			  this.loading = true;
      		this.error = '';
      		this.message = '';

      	try{
      		console.log(' [StudentStore] Iniciando cambio de contrasenia ');

      		if (data.newPasssword !== data.confirmPassword) {
      			throw new Error('Las contraseñas son diferentes');
      		}

      		if (data.newPasssword.length < 8) {
      			throw new Error('La nueva contrasenia debe tener al menos 8 caracteres ');
      		}
      		
      		if (data.newPasssword === data.confirmPassword) {
      			throw new Error('La nueva contrasenia debe ser diferente a la actual');
      		}

      		const result = await ProfileStudentService.changePassword(data);

      		if (!result.success) {
      			throw new Error(result.error || 'Error al cambiar la contrasenia');
      		}

      		this.profile = null;
      		this.message = MESSAGES.PASSWORD_CAMBIADO;


      		console.log('[StudentStore] La contraseña fue cambiada, sesion cerrada');

      		return {
      			success: true,
			  		message: this.message
      		};
      	}catch(error: any){
      		 this.error = error.message || MESSAGES.ERROR_PASSWORD;
        	console.error('[StudentStore] Error en changePassword:', error);

        	return {
        	 success: false,
        	 error: this.error
        	};
      	}finally {
      		this.loading = false;
      	}
  		},

  		// ===============================
  		// 						UTILIDADES
  		// ===============================
  		/**
  		 * Limpia todos los mensajes y errores
  		 * */
  		clearMessages(): void {
  			this.error = '';
  			this.message = '';
  		},

  		/**
  		 * Limpia completamente el  estado
  		 * */
  		resetState(): void {
  			this.profile = '';
  			this.loading = '';
  			this.error = '';
  			this.message= '';
  		}
  	}
  });