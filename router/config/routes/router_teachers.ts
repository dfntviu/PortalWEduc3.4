  import viewAdminMaterialStudent from '@/views/Teacher/viewAdminMaterialStudent.vue';//x-w-wng [aniadi @ a la version de generate origin code ]
  import viewAdminStatisticsMaterials from '@/views/Teacher/viewAdminStatisticsMaterials.vue';
  import viewBienvenidaTeachers from '@/views/Teacher/viewBienvenidaTeachers.vue';
  import viewModerateMaterials from '@/views/Teacher/viewModerateMaterials.vue';//x-w-wng
  import viewRegisterTeacher from '@/views/Teacher/viewRegisterTeacher.vue';//x-w-wng
  // import viewRegisterTeacher2  from '@/views/Teacher/viewRegisterTest2.vue';
  // import viewModerarAbsoluteCM from '@/views/Tracher/viewModerarAbsoluteCM.vue'; /*??*/

   // FILE ROUTER TWO: ROLE_OF_TEACHERS
  export const route_teachers = [
    {
      path:  '/welcome-teachers',
      name: 'viewBienvenidaTeachers',
      component: viewBienvenidaTeachers,
      meta:{requiresAuth: true, role: 'teacher', permission: 'puedeVisualizarBienvenidaRole2'} //view:dashboard-teacher
    },
    
    {
      path: '/teacher-register',
      name: 'viewRegisterTeacher',
      component: viewRegisterTeacher,
      meta: { requiresAuth: true, role: 'teacher', permission: 'puedeVerMaterialIndividual'} //view:register-teacher
    },

/*{
  path: '/regiter-teachers2',
  name: 'viewRegisterTeacher2',
  component: viewRegisterTeacher2
},*/

    {
      path: '/ind-material-teachers-student',
      name: 'viewAdminMaterialStudent',
      component: viewAdminMaterialStudent,
      meta: { requiresAuth: true, role: 'teacher', permission: 'puedeRegistrarCuentaAlumno' } // view:adm-mat-student
    },
    
    {
      path: '/statistics-materiales-teachers',
      name: 'viewAdminStatisticsMaterials',
      component: viewAdminStatisticsMaterials,
      meta: { requiresAuth: true, role: 'teacher', permission: 'puedeVisualEstadisticas' } // view:stat-materials
    },
   
   {
      path: '/moderate-materials-teachers',
      name: 'viewModerateMaterials',
      component: viewModerateMaterials,
      meta: { requiresAuth: true, role: 'teacher', permission: 'puedeRegistrarCuentaAlumno' } // view:mdrate-student-mat
    }

  ]; 
  
  /*{
  path:  '/teachers',
      component: LayoutProfesor,
      name: 'viewBienvenidaTeachers',
      meta:{requiresAuth: true, requiredRole: 'teacher', permission: 'puedeVisualizarBienvenidaRole2'}, //view:dashboard-teacher
      children: [{
                path: '/teacher-register'
               name: viewRegisterTeacher
               }
              path: '/teacher-2',
               name: viewName2
               {
                path: '/teacher-3',
                name: viewNme5
               },
               {
               path: '/teacher-4',
               name: viewName3
               },
               {
                path: '/teacher-5',
                name: viewName4
               }
      ]
    },*/
  //CORNONAME TIT MILES DE DOLARES PARA EL AMERICAN DREAM
  // OF ONE THIS CARGAMMENT ON USA. GITH UP FOR WIN ONE MILLION DOLLARS IN Usa