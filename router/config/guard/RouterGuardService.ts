import { PermissionsService } from '@/router/config/PersmissionService.ts';
import { useAuthStore3 } from '@/stores/authStore3.ts';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import type { Role } from '@/interfaces/interfaceRules.ts';
		/**
		 * Archivo de Seguridad determinar inicios de sesion y vista predeterminada del Web System
		 * Port. Web Educativo 3.3.2 */
		// const ROUTE_REGISTER = 'viewRegisterStudent'
// ?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF
export class RouterGuardService {
	private permissionServs: PermissionsService;
// ?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF
	constructor(private role:Role='default') {
		 this.permissionServs = new PermissionsService(role);
		alert('Estas ingresando  a la clase De Guardias de Ruteo');
		console.log('Rol por defecto: ',role);
	}
	
	async globalGuardh(
		to: RouteLocationNormalized,
		from: RouteLocationNormalized,
		next: NavigationGuardNext
	): Promise<void> {
		console.log('Ejecucion de Seguridad del Serv. por Rol..');
		const authStore3 = useAuthStore3();
			console.log('El estado Autentificacion corrspondiente: ', authStore3);
		const isAuthenticated = authStore3.isAuthenticated;
		const userRole = authStore3.userRole;
			// console.log('El Role corrspondiente: ', userRole);
		// ?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF  [no problem]
		if (authStore3.loading) { 
			 await new Promise(resolve => setTimeout(resolve,100));
		// console.log('Se cargo el edo de autorizacion: ', authStore);
		}
		//?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF [no problem]
		if (!to.meta.requieresAuth) {  
			 return next();
		}
		// ?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF	  //dislucir el script de las vistas
		// LoginMultiusuario[revisar]
		if (to.meta.requieresAuth && !authStore3.isAuthenticated) {		//[no problem]
			console.warn('[Guardia de Ruteo]: Acceso Rechazado - Usuario NO Autenticado');
			  return next({ name: 'viewLogin'});
		}

		/*?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF*/
		//dislucir el script de las vistas de Ambos roles para la Bienvenida correspondiente
		// checar el componente   |**|
		 if (!authStore3.isAuthenticated && to.name === '/' ) {  //[no se ejecutaba, porque no existe ninguna raiz en el ruteo principal]
			  const redirectRoute = authStore.role === 'student'|| authStore3.role === 'teacher'
			     ?  'viewRegisterStudent'
			     :  'viewRegisterTeacher';
			    return next({ name: redirectRoute });
		}

		// Validar el Rol requerido			[no problem]
		if(to.meta.role && to.meta.role !== authStore3.role) {
			console.warn('[Guardia de Ruteo]: Acceso Negado - El Rol es Incorrecto');
			return next({name: 'PageError403'})
		}
		/*?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF
		this.permissionServs.setRole(authStore.role || 'default');
		?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF */
		if (to.meta.permission) {
			const hasPermission = this.permissionServs.hasPermission(to.meta.permission as any);

			if (!hasPermission) {
				console.warn('[Guardia de Ruteo]: Acceso Negado - Sin permisos para Ingresar..');
				  return next({name: 'PageError403'})
			}
		}
			// Permitir el acceso
		 next();
		 // ?=??QWQEGTDRHYIUOIFGDFCEFJGOIERPHKJNHTEJF 
	} 
    /**
     * Guard especifíco para rutas de Profesor
     * */
	/** teacherGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
			const authStore = useAuthStore3();
	 	if (authStore.role !== 'teacher') {
	 	 	 console.warn('[RouterGuard] Acceso denegado - Es Obligatorio ingresar credenciales de Profesor.');
	 	 	  return next({name: 'PageError403'});
	 	}

	 	  next();
	} **/
	
	/**
	 * Guard especifíco para rutas de Alumno 
	 * 	studentGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
			const authStore = useAuthStore3();
		if (authStore !== 'student') {
		 	console.warn('[RouterGuard]: Acceso denegado - Es Obligatorio ingresar credenciales de Alumno.');
		 	 return next({name: 'PageError403'});
		}
		 next();
	}	**/

}
  /**
   * Nacimiento del estado inicial (authStore3) prematuro. Este efectua su primera comunicacion 
   * entre el principal y la hoja de ruteo con su metodo de guardianes, pero  se carga antes  
   * de que de instanciarse.
   * **/


	/** Verificar la vista LayoutNavBar que deriva a NavBarProfesor y NavBarAlumno
	Inicia con el flujo de Registro segun se haya guardado el rol: teacher | student
	segun la vista con el rol detectado(por medio de AuthService
	Continuar el flujo, con la Interaccion de la  vista correspondiente
	El demas flujo es facil de seguir
	Organizar bien el flujo para detectar el orden secuencia de Vista-Store y Vista - Composable - Store
	Analizar concreto y con exactitud las validadciones 3 y 4 
	 **/

/**  IMPORTANTE - Habilitar unicamente cuando haya sido resuelto la friccion diferencia entre modo bootstrap y el modo habitual,
 * leer nota de la vista viewBootstrap, pues de eso dependende la redireccion y en consecuencia el flujo habitual del sistema
 * en escencia(el sistema sin el modelado de los dos tipos de interacciones) -> Bootstrap - Sist. de Ciclo Real(trivial,habituaL, comun) ** /
 * 
 * import { PermissionsService } from '@/router/config/PersmissionService.ts';
import { RoleFirstUsingService } from '@/services/CloseBoostrap/FirstUsingClSys.ts';
import { useAuthStore3 } from '@/stores/authStore3.ts';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import type { Role } from '@/interfaces/interfaceRules.ts';

const ROUTE_BOOTSTRAP = 'viewBootstrap';
const ROUTE_REGISTER  = 'viewRegisterTeacher';

export class RouterGuardhService {
    private permissionsServs: PermissionsService;

    constructor(private role = 'default') {
        this.permissionsServs = new PermissionsService(role);
    }

    async globalGuardh(
        to:   RouteLocationNormalized,
        from: RouteLocationNormalized,
        next: NavigationGuardNext
    ): Promise<void> {

        const authStore3 = useAuthStore3();

        // ── CARRIL 1: MODO BOOTSTRAP ─────────────────────────────────────
        const bootstrapCompleted = await RoleFirstUsingService.isBootstrapCompleted();

        if (!bootstrapCompleted) {
            if (to.name !== ROUTE_BOOTSTRAP) {
                console.warn('[Guard] Sistema sin inicializar → redirigiendo a bootstrap');
                return next({ name: ROUTE_BOOTSTRAP });
            }
            return next(); // ya estamos en bootstrap: dejar pasar. Unicamente funcional cuando no existe ningun usuario
        }

        // ── CARRIL 2: MODO REAL ───────────────────────────────────────────

        // 2.1 Esperar resolución de Firebase antes de leer cualquier estado
        if (authStore3.loading) {
            await new Promise<void>(resolve => {
                const unwatch = authStore3.$subscribe(() => {
                    if (!authStore3.loading) {
                        unwatch();
                        resolve();
                    }
                });
            });
        }

        // 2.2 Salida temprana: registro del primer teacher (caso especial pre-auth)
        if (to.name === ROUTE_REGISTER) {
            return next();
        }

        // 2.3 Usuario NO autenticado
        if (!authStore3.isAuthenticated) {
            if (to.meta.requieresAuth) {
                // ✅ Ruta protegida sin sesión → login
                console.warn('[Guard]: Acceso denegado — usuario no autenticado →', to.path);
                return next({ name: 'LoginMultiusuario' });
            }
            // ✅ Ruta pública → libre acceso
            return next();
        }

        // 2.4 Usuario autenticado en ruta pública → redirigir a su dashboard
        if (!to.meta.requieresAuth) {
            const dashboard = authStore3.role === 'teacher'
                ? { name: 'viewBienvenidaTeachers' }
                : { name: 'viewBienvenidaStudents' };
            console.info('[Guard]: Sesión activa — redirigiendo al dashboard del rol:', authStore3.role);
            return next(dashboard);
        }

        // 2.5 Verificar compatibilidad de rol con la ruta
        if (to.meta.role && to.meta.role !== authStore3.role) {
            console.warn('[Guard]: Rol incompatible —', authStore3.role,
                         'intentó acceder a ruta de', to.meta.role);
            return next({ name: 'PageError403' });
        }

        // 2.6 Verificar permiso granular (si la ruta lo declara)
        if (to.meta.permission) {
            this.permissionsServs = new PermissionsService(authStore3.role as Role);
            const hasAccess = this.permissionsServs.hasPermissions(to.meta.permission as string);

            if (!hasAccess) {
                console.warn('[Guard]: Permiso denegado —', to.meta.permission,
                             'para rol', authStore3.role);
                return next({ name: 'PageError403' });
            }
        }

        // 2.7 Todo validado → acceso aprobado
        console.info('[Guard]: Acceso aprobado →', to.path);
        return next();
    }
     Pasa algo extranio con base pareciera que es lo unico que respeta
}*/