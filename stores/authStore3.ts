// stores/authStore.ts
import { defineStore, storeToRefs, getActivePinia} from 'pinia';
// import { getActivePinia } from 'pinia';
import { ref, computed } from 'vue';
import {doc,getDoc} from 'firebase/firestore';
import { onAuthStateChanged, getAuth ,type User } from 'firebase/auth';
import { initializeFirebaseStorage } from '@/config/initializeFirebaseConf.ts'; 
import {  AuthService} from '@/services/AuthService.ts';
import { RoleFirstUsingService } from '@/services/CloseBoostrap/FirstUsingClSys.ts';
import type { ProfileTeacher, ProfileStudent, UserRole } from '@/interfaces/interfacefVUn';
import { useRouter } from 'vue-router';


/**
 * AuthStore - Store de autenticación multiusuario
 * Maneja el estado de autenticación y perfil del usuario
 * Sigue el patrón Services-Stores-Views
 */
 const { auth, db } = initializeFirebaseStorage();
 const authService = new AuthService();
 // const authRFServ = new RoleFirstUsingService();

export const useAuthStore3 = defineStore('auth', () => {

  console.log('Haz llegado al primer alm. de Autenticacion: ', useAuthStore3);
  // =====================================================
  // ESTADO
  // =====================================================}
  
  // Estado de carga
const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
  // Usuario de Firebase Auth
  const currentUser = ref<User | null>(null);

  // Perfil del usuario (teacher o student)
  const userProfile = ref<ProfileTeacher | ProfileStudent | null>(null);

  // Rol del usuario
  const userRole = ref<UserRole | null>(null);
  // Esta interfaz no esta guardando nada, por lo que nunca compara en LayoutNBr
  // Estado de autenticación
  const isAuthenticated = ref<boolean>(false);

  // Flag para saber si se completó la inicialización
  const isInitialized = ref<boolean>(false);
    // 26/02/2026
  const totalUsers =  0;  //1
  const currentRole = ref<'student' | 'teacher' | ''>();  //2

  // =====================================================
  // GETTERS
  // =====================================================}
  
  const userId = computed(() => currentUser.value?.uid || null);

  const userEmail = computed(() => currentUser.value?.email || null);

  const userName = computed(() => userProfile.value?.name || '');

  const isTeacher = computed(() => userRole.value === 'teacher');

  const isStudent = computed(() => userRole.value === 'student');
  const role = computed(() => userRole.value);
    // const email = computed(() =>userProfile.email);

  /*console.trace('[authSt3] Primera inovacion - Stack Completo:');
  console.log('[authSt3] Pinia activa en este momento:',!!getActivePinia());*/
  // =====================================================
  // ACCIONES - INICIALIZACIÓN
  // =====================================================
  console.log('La cte currentUser ', currentUser);  //nulo
  console.log('El getter  UserID contie ', userId);
  /**
   * Inicializa el listener de autenticación de Firebase
   * Debe llamarse una sola vez al inicio de la aplicación
   */
  //Metodo Importante, pero debe mejorarse genericamente
  onAuthStateChanged(getAuth(), (firebaseUser) => {
    currentUser.value = firebaseUser ?? null;
  });
  // uid de la sesion personal de Firebase del Usuario
  const uid_auth = computed((): string | null => currentUser.value?.uid ?? null);
  // Tiene doble quitar uno
  async function initAuthListener(): void {
    onAuthStateChanged(auth, async (user) => {
      try {
        loading.value = true;
        
        if (user) {
          currentUser.value = user;
          
          // Determinar el rol del usuario
           const fetchedRole = await authService.getUserRole(user.uid);
            userRole.value = fetchedRole;

          if (fetchedRole) {
            userRole.value = fetchedRole;
            
            // Cargar el perfil según el rol
            const profile = await authService.getUserProfile(user.uid, fetchedRole);
            console.log('Se guardo el perfil de sesion: ', profile);
            userProfile.value = profile;
            
            isAuthenticated.value = true;
          } else {
            // Usuario autenticado pero sin perfil en Firestore
            console.warn('Usuario autenticado sin perfil en Firestore');
            await handleLogout();
          }
        } else {
          // Usuario no autenticado
          resetState();
        }
      } catch (err: any) {
        console.error('Error en auth listener:', err);
        error.value = err.message;
        resetState();
      } finally {
        loading.value = false;
        isInitialized.value = true;
      }
    });
  }
  /*F(n) de Test para obtener el uid del autor de firebase [solo usar para probar] ****/
  async function getUid(): void {
    try{  //NUNCA inicia la f(n), modificarla o bien depurarla para factorizarla y ajustarla para los stores que se necesiten
      const autenticate = await authService.getCurrentUser();
      console.log('guarde el dato de auth..');
      return autenticate;
    }catch(err: any){
      err.value = err.message;
      return false;
    }

    return autenticate;
  }

  /**
   * Verifica si existen usuarios en el sistema
   */
  async function checkSystemInitialization(): Promise<boolean> {
    try {
      loading.value = true;
      return await authService.anyUserExists();
    } catch (err: any) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Inicializa el primer usuario del sistema
   */
  async function initializeFirstUser(): Promise<{
    success: boolean;
    email: string;
    password: string;
    message: string;
  }> {
    try {
      loading.value = true;
      error.value = null;
      
      const result = await RoleFirstUsingService.initialingFirstUse();
      return result;
    } catch (err: any) {
      error.value = err.message;
      return {
        success: false,
        email: '',
        password: '',
        message: err.message
      };
    } finally {
      loading.value = false;
    }
  }

  // =====================================================
  // ACCIONES - AUTENTICACIÓN
  // =====================================================
  
  /**
   * Inicia sesión con email y password
   */
  async function login(email: string, password: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      loading.value = true;
        error.value = null;
        console.log('Correo', email,'pwd',password);
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      // Validar formato de email
      if (!authService.validateEmail(email)) {
        throw new Error('Formato de email inválido');
      }
      
      // Validar contraseña
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      // Realizar login
      const user = await authService.login(email, password);
      console.log('[authStore3] user recibido:', user);
      
      // El estado se actualizará automáticamente por el listener
      const teacherSnap = await getDoc(doc(db, 'teacher_register', user.uid));
      /**
       * Segmento f(n) vital para el registro de rol 'student'***/
      if (teacherSnap.exists()) {
      const roleInDoc = teacherSnap.data().role;
    // Si el doc dice 'student', no es profesor
      if (roleInDoc === 'teacher') {
          userRole.value = 'teacher';
      } else {
          const studentSnap = await getDoc(doc(db, 'student_register', user.uid));
          if (studentSnap.exists()) userRole.value = 'student';
      }
      } else {
          const studentSnap = await getDoc(doc(db, 'student_register', user.uid));
           if (studentSnap.exists()) userRole.value = 'student';
    }
      // }
     /** if (teacherSnap.exists()) {
          const roleInDoc = teacherSnap.data().role;
           if (roleInDoc === 'teacher') {
             userRole.value = 'teacher'
           } else {
             const studentSnap = await getDoc(doc(db, 'student_register', user.uid));
             if (studentSnap.exists()) userRole.value ='student';
           }
          /*userRole.value = 'teacher';
            console.log('[authStore3] userRole seteado:', userRole.value);*
      } else {
        /*  const studentSnap = await getDoc(doc(db, 'student_register', user.uid));
          if (studentSnap.exists()) {
              userRole.value = 'student';  *
         const studentSnap = await getDoc(doc(db, 'student_register', user.uid));
            if (studentSnap.exists()) userRole.value = 'student';
               //linea nueva:[26/05/08] Si no existe uid_nuevo dara acceso mal, se hara nulo, y mostrara incosistencia
          } else {  
              const studentSnap = await getDoc(doc(db, 'student_register', user.uid));
             if (studentSnap.exists()) userRole.value = 'student';
            // throw new Error('ERROR: No ha sido HALLADO/ENC eL perfil del usuario.');
            // console.log('[authStore3] user.uid:', user.uid);
          }  **/

      isAuthenticated.value = true;  // *chge **
      // Solo retornamos éxito
      return {
        success: true,
        message: 'Inicio de sesión exitoso'
      };
    } catch (err: any) {
      error.value = err.message;
      return {
        success: false,
        message: err.message
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cierra la sesión actual
   */
  async function logout(){
    /*success: boolean;
    message: string;*/
  // {
    try {
      loading.value = true;
        error.value = null;
      
      const exit = await authService.logout();
      console.log('Cierra de Sesión, CONFIRMADO...');

      const pinia = getActivePinia();
      pinia?._s.forEach(store => store.$reset?.());

       this.uid_auth = null;
      this.isAuthenticated = false;
      console.log('Estado limpiado - ES-AUTENTICADO: [', this.isAuthenticated,']');
      // Limpiar estado
      resetState();

      await router.push({name: 'viewLoginMultUser'});
      // console.log('An. de Salida ',exit);
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (err: any) {
      error.value = err.message;
      return {
        success: false,
        message: err.message
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Maneja el cierre de sesión (wrapper para consistencia)
   */
  async function handleLogout(): Promise<void> {
    await logout();
  }

  // =====================================================
  // ACCIONES - PERFIL
  // =====================================================
  
  /**
   * Recarga el perfil del usuario actual
   */
  async function reloadProfile(): Promise<void> {
    try {
      if (!currentUser.value || !userRole.value) {
        throw new Error('No hay usuario autenticado');
      }
      
      loading.value = true;
      
      const profile = await authService.getUserProfile(
        currentUser.value.uid,
        userRole.value
      );
      
      userProfile.value = profile;
    } catch (err: any) {
      console.error('Error recargando perfil:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }
    //26/02/2026
  async function syncUserCount() {
      this.totalUsers = await UserService.getTotalUsers();
  }
  // =====================================================
  // UTILIDADES
  // =====================================================
  

  /**
   * Limpia el error actual
   */
  function clearError(): void {
    error.value = null;
  }
    // 26/02/2026
  function setRole(role: 'student' | 'teacher') {
    this.currentRole.value = role;
  }

  /**
   * Resetea todo el estado del store
   */
  function $reset() {
    loading.value = false;
    error.value = null;
    currentUser.value = null;
    userProfile.value = null;
    isAuthenticated.value = false;
    isInitialized.value = false;
    currentRole.value = '';
  }

  // console.log('Cbio Vbe Usuario Actual '. currentUser.value);
  // =====================================================
  // RETURN
  // =====================================================
  
  return {
    // Estado
    loading,
    error,
    currentUser,
    currentRole,
    userProfile,
    userRole,  //## clave para el layout ##
    isAuthenticated,
    isInitialized,
     //email,
    uid_auth,
    // Getters
    userId,
    userEmail,
    userName,
    // isTeacher,
    isStudent,
    role,
    // profile,
    // Acciones
    initAuthListener,
    checkSystemInitialization,
    initializeFirstUser,
    login,
    logout,
    handleLogout,
    reloadProfile,
    clearError,
    getUid,
    // -- Limpia todos los reacts & computados --
    $reset 
    // resetState, el anterior esta completo
  };
});

 // console.trace();

/**
 * El authStore actual debera vincularse con el servicio 'FirstUsingClSys' del directorio
 * de  CloseBootstrap el cual funge con el proposito maximo: el met'initializeFirstUser'
 *  se invocará con el y asi se solucionara el problema de ciclo cerrado, abriendo 
 * despbloquado el flujo del sistema. Debera usarse el de AuthService(esta incompleto)
 * corregirlo con el ultimo ajuste de lo discutido en: 'Evaluación de flujos de navegación por usabilidad'
 * ademas de las 4 pequeñas correciones de los guardas de vue: 'RouterGuardhService
 * Finalmente, aplicar los 2 ultimos cambios al script de configuracion principal: 'main.js'*/