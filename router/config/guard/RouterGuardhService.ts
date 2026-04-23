import { PermissionsService } from '@/router/config/PersmissionService.ts';
import {RoleFirstUsingService} from '@/services/CloseBoostrap/FirstUsingClSys.ts'
import { useAuthStore3 } from '@/stores/authStore3.ts';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import type {Role} from '@/interfaces/interfaceRules.ts'

    const ROUTE_BOOTSTRAP = 'viewBootstrap';
    const ROUTE_REGISTER = 'viewRegisterTeacher';

    export class RouterGuardhService {
        private permissionsServs: PermissionsService;

        constructor(private role = 'default'){
            this.permissionsServs = new PermissionsService(role);
        }

        async globalGuardh( to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): Promise <void>
        {
            const authStore3 = useAuthStore3(); 
            const bootstrapCompleted = await RoleFirstUsingService.isBootstrapCompleted();

            if (!bootstrapCompleted) {
                if (to.name !== ROUTE_BOOTSTRAP ) {
                    console.warn('[Guard] Sistema sin inicializar → redirigiendo a bootstrap');
                    return next({name: ROUTE_BOOTSTRAP});
                }
                return next();
            }

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

            // No hay autenticacion, rol no existe de forma legitima(not accees of Firebase)
            if(!authStore3.isAuthenticated){
                console.log('ERROR: No existe aun dicho usuario, en Firebase');
                if (to.name === ROUTE_REGISTER) {
                    console.log('Redirigiendo a Vista de Registro');
                    return next();
                }

                if (!to.meta.requieresAuth) {
                     console.warn('[Guard]: Acceso denegado — usuario no autenticado →', to.path);
                      return next({name: 'LoginMultiusuario'});
                }
                    // Ruta publica: acceso libre
                return next();
            }

            if(!to.meta.requieresAuth){
                const dashboard = authStore3.role === 'teacher'
                 ? { name: 'viewBienvenidaTeachers'}
                 : { name: 'viewBienvenidaStudents'};
                 console.info('[Guard]: Sesión activa — redirigiendo al dashboard del rol:', authStore.role);
                 return next(dashboard);
            }

            /*if (to.meta.role && to.meta.role !== a
              console.warn('[Guard]: Rol incompatible —', authStore.role, 'intentó acceder a ruta de', to.meta.role);
              return next({ name: 'PageError403' });
            }*/

            if(to.meta.permission) {
                this.permissionsServs = new PermissionsService(authStore3.role as Role);

                const hasAccess = this.permissionsServs.hasPermissions(to.meta.permission as string);

                if (!hasAccess) {
                    console.warn('[Guard]: Permiso denegado —', to.meta.permission, 'para rol', authStore3.role);
                     return next({ name: 'PageError403' });
                }
            }

            console.info('Acceso Aprobado →', to.path);
             return next();
        }
        /*Se creo un nuevo Guard para permitir el primer acceso, cuando el sistema esta vacio
        pero se fallo.Sin en cambio habia tenido un acercamiento y se demostro que es mas sencillo
        llevar el registro de la primera cuenta en Firestore y bloquearla a eliminarla
        - Es mas facil cerrar el ciclo bootstrap(Primer Uso) terminarlo e iniciar con el 
          otro.
         - fueron modificados los scripts:
           PersmissionService
             - router_students
             -router_teachers
             router_base
        - Si se requiere seguir efectuando pruebas unicamente se modifica de RouterGuardService
        a: RouterGuardhService en el index y se modificaran cada router de manera individual
        por mapper; en lugar de utilizar valores booleandos en los permisos
        "puedeVisualEstadisticas<-true", unicamente sera suficiente con aniadir 
         sufijos+path para obtener una version reducida 'view:stat-materials' 
         - Se modificó la declaracion de ruteo, en lugar de utilizar: la declaracion corta de vue-router
         import  HomeView from '@/views/HomeView.vue'; se utilizo la opcion predeterminada
         por ello fue utilizada, la definicion formal: "component: () => import('@/Student/views/viewStudentAdmMatls.vue')"
         pero hace lo mismo*/
    }