  import viewBienvenidaStudents from '@/views/Student/viewBienvenidaStudents.vue';    //@ corregir  - vite.config
  import viewMaterialIndividual from '@/views/Student/viewMaterialIndividual.vue'; 
  import viewRegisterStudent from '@/views/Student/viewRegisterStudent.vue';
  import viewStudentsAdmMaterials from '@/views/Student/viewStudentsAdmMaterials.vue';   //[aniadi @ a la version de generate origin code ]
  import viewUploadMaterials from '@/views/Student/viewUploadMaterials.vue';
   // import LogoutAnimation from '@/views/components/Session_Close/LogoutAnimation.vue';

   // FILE ROUTER ONE: ROLE_OF_STUDENTS
  export const route_students = [
    {
      path:  '/welcome-students',
      name: 'viewBienvenidaStudents',
      component: viewBienvenidaStudents,
      meta:{requiresAuth: true, role: 'alumno', permission: 'puedeVisualizarBienvenidaRole1'}
    },
  
    {
      path: '/vw-indiv-material', //register-student
      name: 'viewMaterialIndividual',
      component: viewMaterialIndividual,
      meta: { requiresAuth: true, role: 'alumno', permission: 'puedeVerMaterialIndividual'} //*
    },
  
    {
      path: '/vw-register-student',
      name: 'viewRegisterStudent',
      component: viewRegisterStudent,
      meta: { requiresAuth: true, role: 'alumno', permission: 'puedeRegistrarCuentaAlumno' } //*
    },
  
    {
      path: '/vw_adm-materials-adm', //auth_material-individual
      name: 'viewStudentsAdmMaterials',
      component: viewStudentsAdmMaterials,
      meta: { requiresAuth: true, role: 'alumno', permission: 'puedeGestionarMateriales'}  //*
    },
  
    {
      path: '/upload-materials',
      name: 'viewUploadMaterials',
      component: viewUploadMaterials,
      meta: {requiresAuth: true, role: 'alumno', permission:'puedeSubirMateriales'}  //  [**] alumno, con 1 s
    },

    /*{
      path: '/session-close',
      name: 'LogoutAnimation',
      component: LogoutAnimation,
      meta: {requiresAuth: true, role: 'alumno', permission:'puedeSubirMateriales'}  //  [**] alumno, con 1 s
    }*/
  ]