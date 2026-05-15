  import viewBienvenidaStudents from '@/views/Student/viewBienvenidaStudents.vue';
  import viewMaterialIndividual from '@/views/Student/viewMaterialIndividual.vue'; 
  import viewStudentsRegisterBase from '@/views/Student/viewRegisterStudent.vue';
  import viewStudentsAdminMaterials from '@/views/Student/viewStudentsAdmMaterials.vue';
  import viewUploadMaterials from '@/views/Student/viewUploadMaterials.vue';
  import LayoutAlumno from '@/components/LayoutAlumno.vue';
   import LogoutAnimation from '@/components/Session_Close/LogoutAnimation.vue';  //vista de salida(se considera vista independiente, anima la salida)
   // RouterSaveRaw
export const students_routes: RouterRecordRaw[] =
  [
  	{
 	path: '/students',
 	// name: viewBienvenidaStudents,
 	component: LayoutAlumno,
 	meta: { requieresAuth:true, requiredRole: 'student'},
 		children: [
 			{ // singular unicamente para bienvenida de roles role_01
 			  path: 'vw-student-welcome',
 			  name: 'viewBienvenidaStudents',
 			  component: viewBienvenidaStudents,
 			  meta: { requiresAuth: true, requiredRole: 'student'}
 			},
 			{
 			  path: 'vw-indiv-material',
 			  name: 'viewMaterialIndividual',
 			  component: viewMaterialIndividual,
 			  meta: { requiresAuth: true, requiredRole:'student'}
 			},
 			{
 			  path: 'vw-register-student',
 			  name: 'viewStudentsRegisterBase',
 			  component: viewStudentsRegisterBase,
 			  meta: { requiresAuth: true, requiredRole:'student'}
 			},
 			{
 			  path: 'vw-adm_materials-students',
 			  name: 'viewStudentsAdminMaterials',
 			  component:viewStudentsAdminMaterials,
 			  meta: {requiresAuth: true, requiredRole: 'student'}
 			},
 			{
 				path: 'upload-materials',
 				name: 'viewUploadMaterials',
 				component: viewUploadMaterials,
 				meta: {requiresAuth: true, requiredRole: 'student'}
 			},
      {
        path: '/session-close',
        name: 'SessionCloseRoles',
        component: LogoutAnimation,
        meta: {requiresAuth: false, requiredRole: 'student'}  //  [**] alumno, con 1 s
      },
 		]
    }
  ];