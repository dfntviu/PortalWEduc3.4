import  vwLoginMultiusuario  from '@/views/LoginMultiusuario.vue';
import  vwProfileUser from '@/views/viewProfileUser.vue';
// import  vwBoostrapSys from '@/views/ViewBootstrap.vue'; //nw
import  HomeView from '@/views/HomeView.vue'
  // import  viewUnifyNotification from '@/views/viewUnifyNotification.vue' //* notificacion ambos roles
  
  // ###  FILE_ROUTER_MAIN ###
export const router_main = [
    // Habilitar cuando se obtenga el primer usuario demo
 
  {
    path: '/login-multi_user-view',
    name: 'viewLoginMultUser',
    component: vwLoginMultiusuario,
    meta: { requiresAuth: false }
  },
  {
    path: '/home-page-view',
    name: 'viewHomeView',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  /*{
    path: '/bootstrap-sys-view',
    name: 'vwBoostrapSys', //nw
    component: vwBoostrapSys,
    meta: { requiresAuth: false }
  },*/
  {
    path: '/profile-user-role-view',
    name: 'viewProfileUser',
    component:  vwProfileUser,
    meta: { requiresAuth: true }
  },
  /*{
    path: '/',
    name:'HomeView',
    component: HomeView,
  },*/
  /*{
    path: '/403',
    name: 'PageError403',
    component: viewError403,
    meta: { requiresAuth: false }
  },*/

  /*EN MARCHA
   -> Modelado de Puente Cognitivo en la Vista ViewBooststrap, su propósito mantener asistencia guiada
   para el usuario, con el fin de mantener direccion  y enfoque en su navegacion
   Desde el punto de vista del disenio, se cumple la b. practica cada vista tiene un proposito especifo
   y la vista no independiente(vwBootstrap) no ensuncia la logica de las vistas de registro.*/
];