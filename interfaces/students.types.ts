/**
 * Carreras disponibles en FI UAEMEX
 * */
	export enum Carrera {
		ICO = 'ICO',	 //Ingeniería en Computación
		IME = 'IME',	// Ingeniería Mecánica
		ICI = 'ICI',	// Ingeniería Civil
		IIA = 'IAA',	// Ingeniería En Inteligencia Artif.
		ISES = 'ISES'	// Ingeniería en Sist. Energéticos Sustentables
 	}

 	export enum TipoDocumento {
 		 PDF= 'pdf',
 		 DOC= 'docx'
 	}

 	export interface StudentUser {
 	 	uid_alumno: string;
 	 	nombre: string;
 	 	apellido: string;
 	 	email: string;
 	 	numCuenta: string;
 	 	carrera: Carrera;
 	 	edad?: number;
 	 	role: 'alumno';
 	 	username: string;
 	 	typeDocument: string;
 	 	fechaRegistro: string; //ISO 8601 format
 	 }

 	 /** Datos que incluyen para registro de nuevo estudiante
 	  * Incluye la contrasenia(se obs la creacion, no se almacena autoamticamente en la Firestore)
 	  * */
 	export interface StudentEditableData {
 	 	nombre: string;
 	 	apellido: string;
 	 	carrera: Carrera;
 	 	edad?: number;
 	 	typeDocument: TipoDocumento;
 	 }

 	 /**
 	  * Datos de cambio de contrasenia
 	  * */
 	export interface ChangePasswordData {
 	 		currentPassword: string;
 	 		newPassword:string ;
 	 		confirmPassword?: string;
 	}

/**
 * Formulario Registro(datos del componente)
 * */
 export interface StudentFormData {
 	 name: string;
 	 lname: string;
 	 carrera: Carrera;
 	 age: number | null;
 	 confirmPassword: string;
 	 typeDocument:TipoDocumento | '';
 }

 export interface StudentEditFormData {
 	 name: string;
 	 lname: string;
 	 carrera: Carrera |  '' ;
 	 age: number | null;
 	 typeDocument:TipoDocumento | '';
 }

 // =======================
 // 	TIPOS DE RESPUESTA
 // =======================

/**
 * Respuesta de operaciones de servicio
 * */
 export interface ServiceReponse <T = any>{
 	 success: boolean;
 	 data?:T ;
 	 error?: string;
 	 message?: string;
 }

 /**
 * Estados del Store
 * */
  export interface StudentProfileState {
 	 profile: StudentUser | null;
 	 loading: boolean;
 	 error: string;
 	 message: string;
 }

 interface Profile {
 	photoURL: string;
 	photoCount: number;
 }
 	// =======================
 	// 		UTILIDADES
 	// =======================

/**
 * Ctes de validacion
 * */
 export const VALIDATION_RULES = {
 	MIN_PASSWORD_LENGTH: 8,
 	MIN_AGE: 17,
 	MAX_AGE: 100,
 	USERNAME_DOMAIN: '@alumno.uaemex.mx'
 } as const;
 
 /**
  * Mensajes de la Aplicacion
  * */
 export const MESSAGES = {
 	REGISTRO_EXITOSO: 'Registro completo exitosamente',
 	PERFIL_ACTUALIZADO: 'Perfil actualizado exitosamente',
 	PERFIL_ELIMINADO: 'Perfil eliminado satisfactoriamente',
 	PASSWORD_CAMBIADO: 'Contraseña modificada exitosamente',
 	ERROR_REGISTRO: 'Error al registrar al estudiante',
 	ERROR_ACTUALIZCION: 'Error al Actualizar el Perfil',
 	ERROR_ELIMINACION: 'Error al Eliminar el Perfil',
 	ERROR_PASSWORD: 'Error al modificar la contraseña',
 	SESION_CERRADA: 'La sesion fue cerradad automaticamente'
 } as const;