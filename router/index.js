
     // ###  INDEX ROUTING: [VUE-ROUTER]  ###
  /**    31/05/2026
   * Archivo base encargado de invocar a la clase de Guardas GlobalGuardh
   * en  RouterGuardhService del script -> 'RuterGuardhService'
   * para un funcionamento correcto y modular.  No mover ningun router
   * ningun modulo de router hasta que sea completamente interpretado
   * */
  import {createRouter,createWebHistory} from 'vue-router';
  import { useAuthStore3 } from '@/stores/authStore3.ts';
  import {RouterGuardhService} from '@/router/config/guard/RuterGuardhService.ts';
  import { router_main } from '@/router/config/routes/router_base.ts';
  import { students_routes } from '@/router/config/routes/router_student2.ts';
  import { teachers_routes } from '@/router/config/routes/router_teacher2.ts';
    // import {RouterGuardService} from '@/router/config/guard/RouterGuardService.ts'; habilitar cuando todo este organizado y funcional y remplazarlo
  
  /*Tiene la prioridad porque se ejecuta en el router antes que en el hook bfEach*/
  const routes = [
     // { path: '/', redirect: '/teacher'},
   /* { 
      path: '/', 
      component: LayoutProfesor, children: [...]
    },*/
      {
        path: '/',
        redirect: () => {
           const authStore3 = useAuthStore3();
          // const { authStore3 } = requiere('@/stores/authStore3.ts');
            if(authStore3.isAuthenticated) {
              return authStore3.userRole === 'teacher'
              ? { name: 'viewWelcomeTeachers'} 
              : { name: 'viewBienvienidaStudents'}; //viewBienvenidaTeachers
            }
            return  { name: 'viewLoginMultUser'};
        }
      },
      ...router_main,  //el unico con prefijo distinto
      ...students_routes,//route_students,
      ...teachers_routes,//route_teachers,
  ];

    const router = createRouter({
      history: createWebHistory(),
       routes
    });

    // Ghuards Security
    router.beforeEach(async(to, from, next)=> {
    const serviceGhuard = new RouterGuardhService('default');
      console.log('Iniciando el fichero de ruteo...')
      // console.log('Bienevenido al Routing...');
      // console.log('Leyendo el estado de ruteo: [',authStore,']');
       await serviceGhuard.globalGuardh(to, from, next); 
   });
    
  export default router;

  /**
   * La vista viewBootstrap tiene como propósito brindar asistencia guiada al usuario,
   * manteniendo la dirección y enfoque durante la navegación.
   * Desde el punto de Vista del disenio, se cumple la b. practica de que cada vista 
   * posea un propósito especifíco. En este caso,viewBootstrap, como vista no independiente,
   * no enuncia ni expone Logica de las vistas de registro, sino que actúa como un 
   * punto de orientación previo.
   * Su f(n) no es ejecutar procesos, sino contextualizar y preparar al usuario antes 
   * de interactuar con las vistas de registro*/

  /*Arrriegasrse a cambiar por el guardh mejorado. */