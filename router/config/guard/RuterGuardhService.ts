/*01) Este archivo de Guardiantes es el archivo funcional*/
	import { PermissionsService } from '@/router/config/PersmissionService.ts';
 		// import {RoleFirstUsingService} from '@/services/CloseBoostrap/FirstUsingClSys.ts'
 	import { useAuthStore3 } from '@/stores/authStore3.ts';
 	import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
	import type {Role} from '@/interfaces/interfaceRules.ts'
	
		const ROUTE_BOOTSTRAP = 'viewBootstrap';
	export class RouterGuardhService {
		
		private permissionsServs: PermissionsService;
		
		constructor(private role = 'default'){
            this.permissionsServs = new PermissionsService(role);
        }

        async globalGuardh(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext):Promise<void> {
        	console.log('SE  ha ingresado al routing..');
			// const bootstrapCompleted = await RoleFirstUsingService.isBootstrapCompleted();
			const authStore3 = useAuthStore3();
			const isAuth = authStore3.isAuthenticated;
			const role = authStore3.userRole;  // nw
			 
			 // console.log('El edo Autenticado contiene: (',authStore3.isAuthenticated,')');
			console.log('Guardia Ejecutando: ', {isAuth, role, toName: to.name, requiresAuth:to.meta.requiresAuth});
				

				// authStore3.isAuthenticated = true; no es posible tenerlo harcodeado, ya que le envia valor obligatorio y cuando reg a authStore es nulo
			if (authStore3.isLoggingOut && to.name === 'viewLoginMultUser ') {
			  console.log('Bandera de salida: ', authStore3.isLoggingOut);
				return next();
			}

			
				// 2. Ruta protegida sin autenticacion → regresar al login **[satisfacie]** 
			if (!isAuth && to.meta.requiresAuth) {
				return next({ name: 'viewLoginMultUser' }); // LoginMultiusuario 
				// console.log('Condicion aceptada, redireccion inmediata');
			}  // ## Esta condicion fue comentada para activar los registros demo, del Portal W. Educativo ##
				
						
				 // ─── 4. Con autenticación en ruta pública ────[funcionales acceso por role]────────────────────
			if (isAuth &&  !to.meta.requiresAuth) {  
				return next({
					  name: role === 'teacher' 
					  ?'viewWelcomeTeachers'     // ← nombre actual de tu ruta
					  : 'viewBienvenidaStudents' });
			}

			if (isAuth && to.name === 'viewProfileUser') {
				if (role === 'teacher' ) {
					return next({ name:  'viewProfileTeacher'});
				}
				return next();
			}

					return next();

			// 0. El sistema esta vacio: [Habilitar cuando sea Funcional]
				/*if (!bootstrapCompleted) {
					if (to.name !== ROUTE_BOOTSTRAP ) {
						console.warn('[Guard] Sistema sin inicializar → redirigiendo a bootstrap');
						 return next({name: ROUTE_BOOTSTRAP});
					}
				  return next();
				}*/
		}
	}