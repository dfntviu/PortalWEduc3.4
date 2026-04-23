<template>
	<div class="login-card">
    <div class="login-header">
        <h1>Portal Educativo</h1>
        <h2>Facultad de Ingeniería - UAEMéx</h2>
    </div>

    <!-- ═══ Estado de verificación del sistema ═══ -->
    <div v-if="!isSystemChecked" class="alert alert-info">
        <p>Verificando estado del sistema...</p>
    </div>

    <!-- ═══ Sección Init: sistema vacío ═══ -->
    <div v-else-if="showInitButton" class="init-section">
        <div class="alert alert-info">
            <p>Sistema no Inicializado. Es necesario crear el primer Usuario.</p>
        </div>
        <button 
            @click="controllInitSystem"
            :disabled="loading"
            class="btn btn-primary">
            {{ loading ? 'Inicializando...' : 'Inicializar el Sistema' }}
        </button>
    </div>

    <!-- ═══ Formulario Login: sistema ya inicializado ═══ -->
    <form v-else-if="!showInitButton" @submit.prevent="controllSubmit">
        <!-- Correo Electrónico -->
        <div class="form-group">
            <label for="correo">Correo Institucional</label>
            <input type="email" v-model="form.email" placeholder="ejemplo@fi.uamex.mx" :disabled="loading" required>
        </div>
        <!-- Contraseña -->
        <div class="form-group">
            <label for="contrasenia">Contraseña</label>
            <input type="password" v-model="form.password" placeholder="Escribe la Contraseña" :disabled="loading" required>
        </div>
        <!-- Role -->
        <div class="form-group">
            <label>Tipo de Usuario:</label>
            <div class="role-selector">
                <label class="role-option">
                    <input type="radio" value="teacher" v-model="form.role" :disabled="loading" required>
                    <span class="role-label">
                        <span class="role-icon">👨🏼‍🏫</span>
                        <span>Profesor</span>
                    </span>
                </label>
                <label class="role-option">
                    <input type="radio" value="student" v-model="form.role" :disabled="loading" required>
                    <span class="role-label">
                        <span class="role-icon">👨🏼‍🎓</span>
                        <span>Estudiante</span>
                    </span>
                </label>
            </div>
        </div>
        <!-- Mensajes de Error -->
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Iniciando Sesión...' : 'Iniciar la Sesión' }}
        </button>
    </form>
    <!-- Seccion Acceso a la vista principal de c/rol-->
   <!-- <div class="roles">
       ═══ Acción post-login: solo visible para teacher ═══
          Aparece tras el loginRole1 exitoso del primer profesor    -->
        <!-- <div v-if="showRegisterStudentLink" class="init-section">
            <div class="alert alert-success">
                <p>Sesión iniciada. Como Profesor puedes registrar al primer Estudiante.</p>
            </div>
            <router-link :to="{ name: 'viewRegisterTeacher' }" class="btn btn-primary"><viewRegisterStudent
                Registrar Estudiante
            </router-link> ---
         </div> -->
         <!-- Accion post-LoginRole2: Login p/estudiantes mostrar B. de Naveg. para Operaciones de Estudiante -->
        <!-- <div v-if="showNavBarGetStudentRegisterLink" class="init-section">
            <div class="alert alert-success-student">
                <p>Cuenta  Aceptada. Como Estudiante posees acceso a todas las acciones(operaciones) del Portal</p>
            </div>
            <router-link :to="{ name: 'viewUploadMaterials' }" class="btn btn-primary">
                Subir tú Primer material
            </router-link>
        </div> -->
    </div>
    <!-- Footer -->
    <div class="login-footer">
        <p>¿Necesitas Ayuda? Contáctanos en la Administración</p>
    </div>
<!-- </div> -->
</template>
<script setup lang="ts">

	import {ref, computed,reactive, onMounted} from 'vue';
	import {useRouter} from 'vue-router';
	import {useAuthStore3} from '@/stores/authStore3.ts';
	import type {UserRole} from '@/interfaces/interfacefVUn.ts';  //interefaceRules 

		// =========================
	  	//     COMPOSABLES
		// =========================
   const router = useRouter();
   const authStore3 = useAuthStore3(); 

   // const userRole = computed(() => authStore.role);

	    // ===================
	  	//     ESTADO LOCAL
		 // ====================
    interface LoginForm {
    	email:  string;
    	password: string;
    	role: UserRole | '';
    }

	    const form = ref<LoginForm>({
	    	 email: '',
		  password: '',
		      role: ''
	    });

	    const error = ref<string| null>(null);
	    const successMsg = ref<string| null>(null);
	    const showInitButton = ref<boolean>(false);

	    // =======================
	  	//     METHODS COMPUTED
		// =======================
	    const loading = computed(()=>authStore3.loading);

	// ─── nuevas refs ───
    const isSystemChecked      = ref<boolean>(false);
    const showRegisterStudentLink = ref<boolean>(false);
    const showNavBarGetStudentRegisterLink = ref<boolean>(false);

// ─── isFormValid: agregar return ───
    const isFormValid = computed((): boolean => {
        return (
            form.value.email.trim()    !== '' &&
            form.value.password.trim() !== '' &&
            form.value.role            !== ''
        );
    });

// ─── checkSystemStatus: marcar como verificado al terminar ───
async function checkSystemStatus(): Promise<void> {
    try {
        const usersExist = await authStore3.checkSystemInitialization();
        showInitButton.value = !usersExist;
    } catch(err: any) {
        console.error('Error verificando el Estado del Sistema..');
        error.value = 'Error al Inicializar Sys';
    } finally {
        isSystemChecked.value = true; // ← desbloquea el template
    }
}

// ─── controllSubmit: invertir la condición ───
async function controllSubmit(): Promise<void> {
    try {
        error.value = null;
        successMsg.value = null;
        // ✅ Bloquear cuando el formulario NO es válido
        if (!isFormValid.value) {
            error.value = 'Por favor, Ingresa todos los campos';
            return;
        }
            await optionMultuserRole();
    } catch(err: any) {
        console.error('Error al Iniciar Sesión: ', err);
        error.value = 'Error en el Login';
    }
}
	// ────────────────────────────────────────────────────────────────
	// Redirige según el rol (ya autenticado y validado)
	// ────────────────────────────────────────────────────────────────
	
	const redirectByRole = (role) => {  // chges: 179,180
	    const routes = {
	        teacher: '/viewWelcomeTeachers',       //name: viewRegisterTeacher
	        student: '/viewBienvenidaStudents', //upload-materials
	    }
		router.push({ name: routes[role.value] ?? 'viewLoginMultUser' }); //ajustar caract raiz
	}
    // Ingresar a la vista principal de cada uno de los roles asignados
async function optionMultuserRole() {
        const result = await authStore3.login(form.value.email, form.value.password);
        
        if (result.success) {
            successMsg.value = result.message;
            // Solo el profesor, puede registrar al primer estudiante
            if (form.value.role === 'student') {
                router.push({ name: 'viewUploadMaterials'});
                // showRegisterStudentLink.value = true;
            }
            // El Estudiante unicamente  subira los materiales que necesite
            else if(form.value.role === 'teacher'){
                    router.push({ name: 'viewAdminMaterialStudent'});
                // showNavBarGetStudentRegisterLink.value = true;
            }
            /*setTimeout(() => {
                redirectByRole(form.value.role);
            }, 300);*/
        } else {
            error.value = result.message;
        }
        /*La logica de ctrl de navegacion no debera responsabilizarse en esta vta independiente
        Tampoco en el router, lo idoneo será en RouterGuardService con sus roles corresponds */
}
// ─── clearMessages: corregir typo ───
function clearMessages(): void {
    setTimeout(() => {
        error.value = null;
        successMsg.value = null; // ✅ .value no .message
    }, 4900);
}

 
onMounted(async () => {
    await checkSystemStatus();
})
	/*Vista ajustada: Nueva 09/03/2026
	Creada a partir de LoginMultiusuario.origin[la primera creada, flujo de trabajo inicial]
	- Caracteristícas:
	 - Redirecciones
	 -  Reactividad
	 - Vista Correcta
	 - Estilos incompletos
		-Nota
		Importante: Corregir detalles de CompStudentProfile
	 */
	
	/**const showInitButton = ref(false);
	const showRegisterStudentLink = ref(false);
	const loading = ref(false);
	const error = ref('');
	const form? = reactive({email: '', password: '', role: ''});

	// ════════════════════════════════════════
	//  LIFECYCLE - Determina el estado inicial de la vista
	// ════════════════════════════════════════
	onMounted(async ()=>{
		await checkSystemInialized();
	})


	const checkSystemInialized = async () => {
		try{
			loading.value = true;
			const userSnap = await getDocs(collection(db,users));

			 showInitButton.value = userSnap.empty;
		}catch(err){
			error.value = 'Error al verficar el edo del Sistema';
			console.log('[LoginView] checkSystemInitialized:', err);
		} finally {
			loading.value = false;
		}
	}


	const controllInitSystem = async () => {
		try{
			loading.value = true;
			error.value =  '';

			await authStore.initializeFirstUser();

			showInitButton.value = false;
		}catch(err){
			error.value = 'Error al inicializar el sistema.';
			console.log('Control del Sistema',err);
		}
	}*/
</script>

<style scoped>
	/* =============================
   CONTENEDOR PRINCIPAL
   ============================= */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}
/*Copie y pegue (tal cual)*/
.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
}

/* ================================
   HEADER
   ================================ */

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.login-header h2 {
  font-size: 1rem;
  font-weight: 400;
  color: #718096;
  margin: 0;
}

/* ================================
   SECCIÓN DE INICIALIZACIÓN
   ================================ */

.init-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* ================================
   FORMULARIO
   ================================ */

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input[type="email"]:disabled,
.form-group input[type="password"]:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

/* ================================
   SELECTOR DE ROL
   ================================ */

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-option {
  position: relative;
  cursor: pointer;
}

.role-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.role-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
  background: white;
}

.role-option input[type="radio"]:checked + .role-label {
  border-color: #667eea;
  background: #f7faff;
}

.role-option input[type="radio"]:disabled + .role-label {
  opacity: 0.5;
  cursor: not-allowed;
}

.role-icon {
  font-size: 2rem;
}

.role-label span:last-child {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
}

.role-option input[type="radio"]:checked + .role-label span:last-child {
  color: #667eea;
}

/* ================================
   ALERTAS
   ================================ */

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.alert-error {
  background-color: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

.alert-success {
  background-color: #c6f6d5;
  color: #22543d;
  border: 1px solid #68d391;
}

.alert-success-student {
  background-color: #FFA500;
  color: #22543d;
  border: 1px solid #63B3ED;
}

.alert-info {
  background-color: #bee3f8;
  color: #2c5282;
  border: 1px solid #63b3ed;
}

/* ================================
   BOTONES
   ================================ */

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

/* ================================
   FOOTER
   ================================ */

.login-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.login-footer p {
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
}

/* ================================
   RESPONSIVE
   ================================ */

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
  }
  
  .role-selector {
    grid-template-columns: 1fr;
  }
}
</style>