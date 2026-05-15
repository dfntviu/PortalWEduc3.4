  import viewWelcomeTeachers from '@/views/Teacher/viewWelcomeTeachers.vue';
  import viewRegisterTeacher from '@/views/Teacher/viewRegisterTeacher.vue';//
  import viewAdminMaterialStudent from '@/views/Teacher/viewAdminMaterialStudent.vue';//
  // import viewAdminStatistics from '@/views/Teacher/viewAdminStatistics.vue';
  import viewModerateMaterials from '@/views/Teacher/viewModerateMaterials.vue';//
   import LayoutProfesor from '@/components/LayoutProfesor.vue';
  // import viewAdminStatisticsMaterials from '@/views/Teacher/viewAdminStatisticsMaterials.vue';
  
  export const teachers_routes: RouteRecordRaw[] =
    
    [ {
        path:  '/teachers',
        component: LayoutProfesor,
        // name: 'viewWelcomeTeachers',
        meta:{ requiresAuth: true, requiredRole: 'teacher'}, //view:dashboard-teacher
        children: [
            { // singular unicamente para bienvenida de roles 'role_02'
             path: 'vw-teacher-welcome',
             name: 'viewWelcomeTeachers',
             component: viewWelcomeTeachers,
             meta: {requiresAuth: true, requiredRole:'teacher'}
            },
            { 
              path: 'teacher-register',
              name: 'viewRegisterTeacher',
              component:viewRegisterTeacher,
              meta: {requiresAuth: true, requiredRole:'teacher'}
            },
            {
              path: 'ind-material-teachers-student',
              name: 'viewAdminMaterialStudent',
              component: viewAdminMaterialStudent,
              meta: {requiresAuth: true, requiredRole:'teacher'}
            },
            {
              path: 'statistics-materiales-teachers',
              name: 'viewAdminStatistics',
              component: () => import('@/views/Teacher/viewAdminStatistics.vue'),
              // component: viewAdminStatistics,
              meta: {requiresAuth: true, requiredRole:'teacher'}
            },
            {
              path: 'moderate-materials-teachers',
              name: 'viewModerateMaterials',
              component:viewModerateMaterials,
              meta: { requiresAuth: true, requiredRole: 'teacher'}
            }
        ]
      }
    ];