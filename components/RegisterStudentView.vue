<template>
			<h2 class="titulo-seccion">Registro de Estudiantes - FI</h2>
	<section class="registro-estudiante">
			<div v-if="error" class="alerta alerta-error">{{error}}</div>
			<div v-if="message" class="alerta alerta-exito">{{message}}</div>
				
			<form @submit.prevent="onSubmitRegistration" class="formulario-registro">
				  <!-- Nombre -->
				<div class="campo-formulario">
				  <label for="nombre" class="nombre">Nombre *</label>
			    	<input id="nombre" type="text" v-model.trim="registrationForm.name"
			    	placeholder="Escribe tú Nombre" required :disabled="loading">
				</div>
					<!-- Apellido -->
				<div class="campo-formulario">
				   <label for="apellido">Apellido *</label>
				  <input id="apellido" type="text"  v-model.trim="registrationForm.lname"
				   placeholder="Escribe tú Apellido" required :disabled="loading" >
				</div>
					<!-- Carrera -->
				<div class="campo-formulario">
					<label for="carrera" >Carrera *</label>
					<select id="carrera" v-model.trim="registrationForm.carrera"
					   			required :disabled="loading" >
						<option value="ICO">Ing. en Computación</option>
						<option value="IME">Ing. Mécanica</option>
						<option value="ICI">Ing. Civil</option>
						<option value="IEL">Ing. Electrónica</option>
						<option value="IIA">Ing. en Int. Artificial</option>
						<option value="ISES">Ing. en Sistemas Energéticos y Sustentables</option>
					</select>
				</div>
					
					<!-- Edad -->
				<div class="campo-formulario">
				  <label for="">Edad</label>
				   <input id="edad" type="number" v-model.number="registrationForm.age"
				   placeholder="Ingresa tú Edad(opcional)" min="17" max="50"  :disabled="loading"/>
				</div>
					<!-- Tipo de documento Requerido -->
				<div class="campo-formulario">
				  <label for="typeDocument">Tipo de Documento Preferido *</label>
				   <select id="typeDocument" v-model="registrationForm.typeDocument" 
				    required  :disabled="loading" 
				   >
				   	  <option value="">Selecciona un Formato</option>
				   	  <option value="pdf">PDF</option>
				   	  <option value="docx">DOCX(Word)</option>
				   </select>
				</div>
				<!-- ** nuevo Campo[Corro-Elect] testeable -->
				<div class="campo-formulario">
				   <label for="">Correo Electrónico *</label>
				  	<input
				  	 id="pasword"
				  	 type="text"
				  	 v-model="registrationForm.email"
				  	 placeholder="correo en forma napellido@alumno.universidad.mx"
				  	 required
				  	 minlength="20" 
				  	 :disabled="loading"
				  	>
				</div>
					<!-- Contrasena -->
				<div class="campo-formulario">
				   <label for="">Contraseña *</label>
				  	<input
				  	 id="pasword"
				  	 type="password"
				  	 v-model="registrationForm.password"
				  	 placeholder="Mínimo 8 caracteres"
				  	 required
				  	 minlength="8" 
				  	 :disabled="loading"
				  	>
				  <small class="texto-ayuda">Mínimo 8 caracteres</small>
				</div>
				   <!-- Confirmar Contraseña -->
				<div class="campo-formulario">
				 	<label for="confirmPassword">Confirmar Contraseña *</label>
				 	 	<input id="confirmPassword" type="password"
				 	 	   v-model="registrationForm.confirmPassword"
				 	 	   placeholder="Repite tú contraseña"   required minlength="8"
				 	 	   :disabled ="loading">
				 	   	<small  v-if="registrationForm.confirmPassword &&  registrationForm.password !== registrationForm.confirmPassword"
				 	   	  class="texto-error">
				 	   			   Las contraseñas no coinciden
				 	   	</small>
				</div>
					<!-- Boton de Registro -->
				<button class="btn-submit"
					 type="submit"
					 :disabled ="!isRegistrationFormValid || loading"
				 >
					<span v-if="loading" >Registrando..</span>
					<span v-else>Registra Estudiante..</span>
				</button>
					<div class="nota-informativa">
							<p><strong>Nota:</strong>se generará automaticamente</p>
								<ul>
									<li>Email Universitario:<code> {{previewEmail}} </code></li> 
									<li>Núm. Cuenta</li>
									<li>Usuario del Portal</li>
								</ul>
						</div>	
			</form>
		</section>	
</template>

<script setup lang="ts">
	/**
	 * 
	 * ════════════════════════════════════════════════════════ 
	 * 	     COMPONENT: RegisterStudentView
	 * ════════════════════════════════════════════════════════ 
	 * Resp: Renderizado del formulario de registro
	 * Delegar: La lógica del composable useStudentProfile 
	 * */
	import { computed,ref} from 'vue';
	import { useStudentProfileStore } from '@/stores/useStudentProfileStore';
	import { useStudentProfile } from '@/composables/compStudentProfile.ts';
	import { useRouter } from 'vue-router';
	import type { Profile } from '@/interfaces/Profile.types.ts';

	// 
	// ══════════════════════════════════════════════
	// 		COMPOSABLES
	// ══════════════════════════════════════════════

	const {
		registrationForm,
		isRegistrationFormValid,
		loading,
		error,
		message,
		handleRegistration,
		controllerRegistro,
		clearMessages
	} = useStudentProfile();

	// ══════════════════════════════════════
	// 		COMPUTED PROPERTIES
	// ══════════════════════════════════════
	const studentStore = useStudentProfileStore();
	const router = useRouter();
	const result = ref<Profile| null>(null);  //*
	/**
	 * Preview del email que se generará
	 * */
	const previewEmail = computed( () => {	
		if(!registrationForm.name || !registrationForm.lname){
			return 'napellido@alumno.uaemex.mx';
		}

		const primeraLetra = registrationForm.name.charAt(0).toLowerCase();
		const     apellido = registrationForm.lname.toLowerCase()
		    .normalize('NFD')
		    .replace(/[\u300-\u036f]/g, '')
		    .replace(/\s+/g, '');

		    return `${primeraLetra}${apellido}@alumno.universidad.mx`;
	});

	// ═════════════════════════════
	//    MÉTODOS
	// ═════════════════════════════

	/**
	 * Maneja el envio del formulario
	 * */
	   async function onSubmitRegistration(): Promise<void> {
	  	  clearMessages();
	  	  if(!isRegistrationFormValid) return;

	  	  	result.value = await controllerRegistro(registrationForm);
	  		// result.value = await studentStore.registerStudent(registrationForm);
	  		console.log('Register-Details ',result.value);

	  	  if(result.value.success){
	  	  	 	  console.log('[Vw-Registro]: El Registro fue exitoso');
	  	  		return {success:true};
	  	  		console.log('[Vw-Registro]: Redirigiendose a tú Gestions Personal de materiales');
	  	  	 	router.push({name: 'viewMaterialIndividual'} );
	  	  } else {
	  	  	 console.error('[Vw-Registro]: Ocurrio un fallo al Registrar al Estudiante')
	  	  }
	   }
</script>
 
 <style scoped>
 		/*══════════════════════════════════════════════════*/
 		    	/*ESTILOS DEL COMPONENTE*/
 		/*══════════════════════════════════════════════════*/
 		.registro-estudiante {
 			background-color: #f8f9fa;
 			border-radius: 8px;
 			padding: 2rem;
 			max-width: 600px;
 			margin: 0 auto;
 			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
 		}

 		.titulo-seccion {
 			text-align: center;
 			color: #0d6efd;
 			margin-bottom: 1.5rem;
 			font-size: 1.8rem;
 			font-weight: bold;
 		}	
 			/*las Alertas al Usuario, segun correp. el registro*/
 		.alerta {
 			padding: 0.75rem 1rem;
 			margin-bottom: 1rem;
 			border-radius: 5px;
 			font-size: 0.95rem;
 		}

 		.alerta-error {
 			background-color: #d4edda;
 			color: #721c24;
 			border-radius: 1px solid #f5c6cb;
 		}

 		.alerta-exito {
 			background-color: #d4edda;
 			color: #155724;
 			border: 1px solid #f5c6cb;
 		}
 		/* Formularios del Usuario */
 		.formulario-registro {
 			background-color: #f8d7da;
 			color: #721c24;
 			border: 1px solid #c3e6cb;
 		}

 		.campo-formulario {
 			display: flex;
 			flex-direction: column;
 			gap: 0.4rem;
 		}

 		.campo-formulario label {	
 			font-weight: 600;
 			color: #495057;
 			gap: 0.4rem;
 		}

 		.campo-formulario input,
 		.campo-formulario select {
 			font-weight: 0.75rem;
 			font-size: 1rem;
 			border: 1px solid #ced4da;
 			border-radius: 5px;
 			transition: border-color 0.3s box-shadow 0.3s;
 		}
 			/*display: flex; flex-direction: column; gap: 0.4rem;*/
 		.campo-formulario input:focus,
 		.campo-formulario select:focus {
 			outline: none;
 			border-color: #0d6efd;
 			box-shadow:  0 0 0 0.2rem rgba(13, 110, 253, 0.25);
 			/*font-weight: 600; color: #495057; font-size: 0.95rem;*/
 		}

 		.campo-formulario input:disabled,
 		.campo-formulario select:disabled {
 			background-color: #e9ecef;
 			cursor: not-allowed;
 			/*padding: 0.75rem;
 			font-size: 1rem;
 			border-radius: 5px;
 			border: 1px solid #cdd4da;
 			transition:  border-color 0.3s, box-shadow 0.3s;
 			width: 100%;*/
 		}

 		.texto-ayuda {
 			 font-size: 0.85rem;
  			color: #6c757d;
 			/*paddig: 0.75rem;
 			font-size: 1rem;
 			border: 1px solid #ced4da;
 			border-radius: 5px;
 			transition: border-color 0.3s, box-shadow 0.3s
 			width: 100%;*/
 		}

 		.texto-error {
 			font-size: 0.85rem;
 			color: #dc3545;
 			font-weight: 500;
 		}	
 		 /* Notas Informativas y sus efectos */
 		.nota-informativa {
 			background-color: #e7f3ff;
 			border-left: 4px solid #0dc6fd;
 			padding: 1rem;
 			margin: 0.5rem 0;
 			border-radius:4px;
 		}
 		
 		.nota-informativa p {
 			margin: 0 0 0.5rem;
 			color: #0a58ca;
 			font-weight: 600;
 		}

 		.nota-informativa ul {
 			margin: 0.5rem 0 1.5rem;
 			color: #495057;
 			/*margin: 0 0 0.5rem 0; color: #0a58ca; font-weight: 600;*/
 		}

 		.nota-informativa code {
 			background-color: #fff;
 			padding: 0.2rem 0.5rem;
 			border-radius: 3px;
 			font-family: 'Courrier New', monospace;
 			color: #d63384;
 			font-size: 0.9rem;
 			/*color: #495057;*/
 		}
 		 /** Botones de Envío (submit) **/
 		.btn-submit {
 			background-color: #198754;
 			color: white;
 			border: none;
 			padding: 0.75rem 1.5rem;
 			border-radius: 5px;
 			font-size: 1rem;
 			font-weight: bold;
 			cursor: pointer;
 			transition: background-color 0.3s, transform 0.1s;
 			margin-top: 0.5rem;
 			/*margin: 0.5rem 0 0 1.5rem;*/ /*color: #49507;*/
 		}

 		.btn-submit:hover:not(:disabled) {
 			background-color: #157347;
 			transform: translateY(-2px);
 			/*margin: 0.5rem 0 0 1.5rem;*/ /*color: #495057;*/
 		}

 		.btn-submit:disabled {
 			 background-color: #6c757d;
 			 cursor: not-allowed;
 			 opacity: 0.6; /*margin: 0.5rem 0 0 1.5rem;*/ /*color: #495057;*/
 		}

 		/*.nota-informativa ul { margin: 0.5rem 0 0 1.5rem; color: #495057; }*/
 		
 		 /** Disenio Responsivo */
 		@media (max-width: 768px) {
 			.registro-estudiante {
 				 padding: 1.5rem;
 			}

 			.titulo-seccion {
 				font-size: 1.5rem;
 			}
 		}
 </style>
