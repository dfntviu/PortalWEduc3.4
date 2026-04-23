<template>
	<div class="login-container">
		<div class="login-card">
			<div class="login-header">
				<h1>Portal Educativo</h1>
				<h2>Facultad de Ingeniería - UAEMéx</h2>
			</div>

			<div v-if="showInitButton" class="init-section">
				<div class="alert alert-info">
					<p>Sistema no Inicializado. Es necesario crear el primer Usuario.</p>
				</div>
				<button 
				   @click="controllInitSystem"
				   :disabled="loading"
				   class="btn btn-primary">
				     {{loading ? 'Inicializando...' : 'Inicializar el Sistema'}}
				</button>
			</div>

			
		  			<!-- Formulario de Login -->
			    <form v-else-if="!showInitButton" @submit.prevent="controllSubmit" >
			   	  	<!-- Correo Electrónico -->
			   	  <div class="form-group">
			   	  	<label for="correo">Correo Institucional</label>
			   	  	<input  type="email" v-model="form.email" placeholder="ejemplo@fi.uamex.mx" :disabled="loading" required>
			   	  </div>
			   	  <!-- Contrasenia -->
			   	  <div class="form-group">
			   	  	<label for="contrasenia">Contraseña</label>
			   	  	<input  type="password" v-model="form.password" placeholder="Escribe la Contraseña" :disabled="loading" required>
			   	  </div>
			   	  	<!-- Role -->
			   	    <div class="form-group">
			   	  	    <label >Tipo de Usuario:</label>
			   	  	 	<div class="role-selector">
			   	  	 		<label  class="role-option">
			   	  	 		   <input  type="radio" value="teacher" v-model="form.role" :disabled="loading" required>
			   	  	 		   <span for="role-profesor"class="role-label">
			   	  	 			  <span class="role-icon">👨🏼‍🏫</span>
			   	  	 			  <span>Profesor</span>
			   	  	 		    </span>
			   	  			</label>

			   	  			<label class="role-option">
			   	  				<input   
			   	  					 type="radio"
			   	  					value="student" v-model="form.role"
			   	  					:disabled="loading" required>
			   	  				 <span for="role-estudiante" class="role-label">
			   	  				 	<span class="role-icon">👨🏼‍🎓</span>
			   	  				 	<span>Estudiante</span>
			   	  				 </span>

			   	  			</label>
						    <!-- </div> -->
			   	    </div>
			   	  </div>

			   	    <!-- Mensajes de Error -->
			   	    <div class="alert alert-error">
			   	      {{ error}}
			   		</div>

			   		<button class="btn btn-primary btn-block">
			   		  {{loading ? 'Iniciando Sesión...' : 'Iniciar la Sesión'}}
			   		</button>
			    </form>
			    <!-- Footer -->
			    <div class="login-footer">
			    	<p>Necesitas Ayuda? Contantanos en la Administración</p>
			    </div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import {ref, computed, onMounted} from 'vue';
	import {useRouter} from 'vue-router';
	import {useAuthStore3} from '@/stores/authStore3.ts';
	import type {UserRole} from '@/interfaces/interfacefVUn.ts';  //interefaceRules

		// =========================
	  	//     COMPOSABLES
		// =========================
	   const router = useRouter();
	   const authStore = useAuthStore3(); 

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
	    const loading = computed(()=>authStore.loading);

	    const isFormValid = computed(()=> {
	    	form.value.email.trim() !== '' &&
	    	form.value.password.trim() !== '' &&
	    	form.value.role !== '';

	    	/*console.log('Correo Electrónico: ',form.value.email);
	    	console.log('Pwd : ',form.value.password);*/
	    	console.log('Rol : ',form.value.role);
	    });

	    // ================
		//     METHODS
		// ================
		
		/** 
		 * Verifica si El Sistema necesita inicializarse
		 * */
	    async function checkSystemStatus(): Promise<void> {
	    	try{
	    		const usersExist = await authStore.checkSystemInitialization();
	    		 showInitButton.value = !usersExist;
	    	}catch(err: any){
	    		console.error('Error verificando el Estado del Sistema..');
	    		error.value = 'Error al Inicializar Sys';
	    	}
	    }

	    /**
	     * Manipular el submit del Inicio de Sesion, del Formulario
	     * */
	    async function controllSubmit(): Promise<void> {
	    	try{
	    	 error.value = null;
	    	 successMsg.value = null;
	    	 	// Validacion elemental
						if(isFormValid.value){
						  error.value = 'Por favor, Ingresa todos los campos';
								return;
						}
				// Iniciar la sesion
				const result = await authStore.login(form.value.email, form.value.password);

	    	    if(result.success){
	    	    	successMsg.value = result.message;
	    	    	// Esperar un instante antes de la redireccione x 	Roles
	    	    	  setTimeout(()=>{
	    	    	  	 redirectByRole();
	    	    	  }, 950);
	    	    } else {
	    	    	error.value = result.message;
	    	    }

	    	}catch(err: any){
	    		console.error('Error al Iniciar Sesión: ',err);
	    		error.value = 'Error en el Login';
	    	}
	    }

	    /** 
		 * Redirigir al Usuario segun su rol
		 * */
	    function redirectByRole(): void {
	    	const role = form.value.role; //authStore.userRole;
	    	console.log('Bienvenido: ');
	    	if(role === 'teacher'){ 		//{name: viewBienvenidaTeachers}
	    		console.log('Condicion de rol ha sido aprobada');
	    		router.push('/welcome-teachers');	//welcome-teachers
	    	} else if(role === 'student' ){
	    		router.push('/welcome-estudiantes'); //vw-bienvenida-students
	    	} else {
	    		error.value = 'El Rol del Usuario no ha sido Identificado, o NO es válido';
	    	}
	    }

	    /**
	     * Iniciar el Sistema, creando el Primer Usuario
	     * */
		async function controllInitSystem(): Promise <void> {
			try{
				error.value = null;
				successMsg.value = null;

				const result = await authStore.initializeFirstUser();  //searching

				if(result.success){
					// Llenar el formulario con las credenciales iniciales
					form.value.email = result.email;
					form.value.password = result.password;
					form.value.role = 'teacher';

					successMsg.value = result.message;
					 showInitButton.value = false;  //Bloquea

					 // Inicia Sesion automaticamente a los 2.5 segundos
					  setTimeout(()=>{
					  	 controllSubmit();
					  },2500);
				}else {
				  error.value = result.message;
				}
			}catch(err: any){
				console.error('Error Inicializando tú Rol de Sesión');
			}
		}

		/**
		 * Limpiar los mensajes de Interaccion, despues de un tiempo definido
		 * */
		function clearMessages(): void {
			setTimeout(()=>{
				error.value = '';
				successMsg.message = null;
			}, 4900);
		}
		// ================
		//   CICLO DE VIDA
		// ================
	onMounted( async () => {
		// Revision de la Autenticidad
		if(authStore.isAuthenticated) {
			redirectByRole();
			 return;
		}
		 // Validacion del Estado del Sistema
		await checkSystemStatus();
	});

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