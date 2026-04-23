    /** Importar en el Layout o App.vue, cuando sea terminodo el proyecto y las interacciones no solo
     * sean correctas sino que ademas sena 100% funcionales.
     * Verificar Sesion para ver como importar la vista_componente ErrortranstionModal*/

 import useErrorModalStore from '@/store/errorModalStore.ts'
 import { ErrorModalType, type ErrorModalConfig, type ErrorModalPayload} from '@/modals/ErrorModal.types';

 const ERROR_MODAL_CATALOG: Record <ErrorModalType, ErrorModalConfig> = {
 	[ErrorModalType.ROUTE_NOT_FOUND]: {
 		type: ErrorModalType.ROUTE_NOT_FOUND,
 		httpCode: '404',
 		icon: '',
 		title: 'La Ruta no fue Encontrada',
 		description: 'El servidor no puede encontrar el recurso solicitado. La URL no coincide con '
 		+ 'ninguna ruta registrada en el sistema.',
 		context: 'Error de la Ruta',
 		accentColor: '#f59e0b',
 		badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
 		progressClass: 'bg-amber-400',
 	},

 	[ErrorModalType.NETWORK_ERROR]: {
 		type: ErrorModalType.NETWORK_ERROR,
 		httpCode: 'N/A',
 		icon: '📡',
 		title: 'Error de red',
 		description: 'No existe comunicacion entre el cliente y el servidor. Puede ser un timeout, desconexión, o DNS fallido.',
 		context: 'Error de Red',
 		accentColor: '#6b7280',
 		badgeClass: 'bg-gray-100 text-gray-600 border border-gray-300',
 		progressClass: 'bg-gray-400'
 	},

 	[ErrorModalType.DOMAIN_ERROR]: {
 		type: ErrorModalType.DOMAIN_ERROR,
 		httpCode: 'N/A',
 		icon: '',
 		title: 'El dominio es irresoluble',
 		description: 'El Portal W. Educativo,no le es posible traducir el dominio de direccion IP valida. Verifique su conectividad',
 		context: 'Error del Dominio',
 		accentColor: '#3b82f6',
 		badgeClass: 'bg-blue-100 text-blue-700 border border-blue-300',
 		progressClass: 'bg-blue-400',
 	},

 	[ErrorModalType.FORBIDDEN]: {
 		type: ErrorModalType.FORBIDDEN,
 		httpCode: '403',
 		icon: '🔒',
 		description: 'El servidor rechaza la autorización. Su rol no cuenta con los permisos necesarios para este recurso(RBAC).',
 		context: 'Error de Área Restringido',
 		accentColor: '#dc2626',
 		badgeClass: 'bg-red-100 text-red-700 border border-red-300',
 		progressClass: 'bg-red-500'
 	},

 	[ErrorModalType.UNAUTHORIZED]:{
 		type: ErrorModalType.UNAUTHORIZED,
 		httpCode: '401',
 		icon: '🛡️'
 		title: 'La sesión no autenticada',
 		description: 'El acceso es denegado. No hay credenciales validas, o la sesión / token ha expirado.',
 		context: 'Error por Proceso sin autenticación',
 		badgeClass: 'bg-violet-100 text-violet-700 border border-violet-300',
 		progressClass: 'bg-violet-500',
 	},
 };

  class ErrorModalService {
  	 private get store(){
  	 	 return useErrorModalStore();
  	 }
  	 /**
  	  * Error 1 - 404: Ruta no registrada EN EL router */
  	 triggerRouteNotFound(path?: string): void {
  	 	this._dispatch({type: ErrorModalType.ROUTE_NOT_FOUND, path, httpCode: 404});
  	 }
  	 /**
  	  * Error #2 - Red Sin conextividad o perdida de timeout */
  	 triggerNetworkError(details?: string): void {
  	 	this._dispatch({type:ErrorModalType.NETWORK_ERROR, details});
  	 }
  	 /* Error #3 - Dominio: DNS no resoluble(irresoluble) */
  	 triggerDomainError(details? string): void {
  	 	this._dispatch({type: ErrorModalType.DOMAIN_ERROR, details});
  	 }
  	 /* Error # 4 - 403:*/
  	 triggerForbidden(path?: string): void {
  	 	this._dispatch({type: ErrorModalType.FORBIDDEN, path, httpCode: 403});
  	 }
     /** 
      * Error # 5 - 401: Sin sesion activa o token expirado*/
  	 triggerUnauthorized(path?: string): void {
  	 	this._dispatch({type: ErrorModalType.UNAUTHORIZED, path, httpCode: 401});
  	 }
     /**
      * Obtiene la configuracion visual de tipo de error*/
  	 getConfig(type: ErrorModalType):ErrorModalConfig {
  	 	return ERROR_MODAL_CATALOG[type];
  	 }
  	 /**
  	  * Descarta el modal activo pragmaticamente*/
  	 dimiss(): void {
  	 	this.store.hide();
  	 }

  	 /*─── Met. Privado  ─────────────────────────────────────────────────*/
  	 private _dispatch(payload: ErrorModalType): void {
  	 	this.store.show(payload);
  	 }
  }
  /** Instancia lista para indexarse en guards y servicios */
  export const errorModalService = new ErrorModalService();