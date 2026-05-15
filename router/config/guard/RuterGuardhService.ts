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
					// 0. El sistema esta vacio
				/*if (!bootstrapCompleted) {
					if (to.name !== ROUTE_BOOTSTRAP ) {
						console.warn('[Guard] Sistema sin inicializar → redirigiendo a bootstrap');
						 return next({name: ROUTE_BOOTSTRAP});
					}
				  return next();
				}*/

				// authStore3.isAuthenticated = true; no es posible tenerlo harcodeado, ya que le envia valor obligatorio y cuando reg a authStore es nulo
			/*if (authStore3.isLoggingOut && to.name === 'viewLoginMultUser ') {
			  console.log('Bandera de salida: ', authStore3.isLoggingOut);
				return next();
			}*/

			// 1.
			if (isAuth.isAuthenticated && to.name === 'viewLoginMultUser') {
				return next ({
					name: role === 'teacher'
					 ? 'viewWelcomeTeachers'
					 : 'viewBienvenidaStudents'
				});
			}
				// 2. Ruta protegida sin autenticacion → regresar al login [satisfacie]
			if (!isAuth && to.meta.requiresAuth) {
				return next({ name: 'viewLoginMultUser' }); // LoginMultiusuario 
				// console.log('Condicion aceptada, redireccion inmediata');
			}
				// 3. Ruta protegida con el rol incorre|cto → redirigir al home del rol activo
			/**
			 * No impota en que ubicacion este si no ha iniciado sesion debera de
			if(to.meta.requiredRole && to.meta.requiredRole !== authStore3.role){
				return next({
					name: authStore3.role === 'teacher'
					  ? 'viewWelcomeTeachers'
					  : 'viewBienvenidaStudents'
				});
			}*/
						// deberia de desplazarse a LayoutNavBar, porque esta libre
						 // ─── 3. Sin autenticación ───[funcionales acceso por role]──────────────────────────────────────
					/*if (!authStore3.isAuthenticated) {
					    if (to.meta.requiresAuth) {  // ← quitar la 'e'
					        return next({ name: ROUTE_LOGIN });
					    }
					    return next();
					}
					*/
						 // ─── 4. Con autenticación en ruta pública ────[funcionales acceso por role]────────────────────
					if (isAuth &&  !to.meta.requiresAuth) {  
						return next({
							  name: role === 'teacher' 
							  ?'viewWelcomeTeachers'     // ← nombre actual de tu ruta
							  : 'viewBienvenidaStudents' });
					    	/*const dashboard = authStore3.role === 'teacher'
					    		return next(dashboard);*/
					}
					return next();
		}
	}