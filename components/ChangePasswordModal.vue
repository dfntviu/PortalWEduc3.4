 <template>
 	 <Teleport to="body">
 	 	<Transition>
 	 		<div class="modal-overlay">
 	 			<div class="modal-contenedor">
 	 				<!-- Encabezado de la vent. Modal -->
 	 				<div class="modal-header">
 	 					<h3>Cambiar Contraseña</h3>
 	 					<button class="s">x</button>
 	 				</div>
 	 				<div class="modal-body">
 	 					<div class="alerta-seguridad">
 	 						<strong>⚠️Aviso de Seguridad</strong>
 	 						<p>Por seguridad, después de cambiar la contraseña se cerrará automáticamente la Sesión. Por lo qué, debeás iniciar con tú nueva contraseña.</p>
 	 					</div>

 	 					<div v-if="passwordError" class="alerta alerta-error">
 	 					   {{passwordError}}
 	 					</div>

 	 					<form action class="formulario-password">
 	 						<div  class="campo-formulario">
 	 							<label for="currentPassword">Contraseña Actual*</label>
 	 						    <input  id="currentPassword" type="password" v-model="passwordForm.currentPassword"
 	 						      placeholder="Ing. tú contraseña actual" required minlength="8" autocomplete="current-password">
 	 					    </div>

 	 					    <div class="campo-formulario">
 	 					   	    <label for="newPassword">Contraseña Actual:</label>
 	 					         <input id="newPassword" type="password"  v-model="passwordForm.newPassword"
 	 					         placeholder="Ingrese nueva contraseña(mín: '8 caracteres') " required minlength="8"
 	 					          autocomplete="newPassword">
 	 					          <small class="texto-ayuda">Mínimo 8 caracteres. Debe ser diferente a la contraseña actual.</small>
 	 					    </div>
 	 					   <!-- Confimar nueva Contraseña -->
 	 					   <div class="campo-formulario">
 	 					   		<label for="confirmNewPassword">Confirmar la Nueva Contraseña</label>
 	 					   		<input  id="confirmNewPassword" type="text" v-model="passwordForm.confirmNewPassword"
 	 					   	 	placeholder="Por favor, reescribe la Nueva contraseña." required minlength="8" 
 	 					   	 	autocomplete="new-password">
 	 					   		<small v-if="passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword" class="texto-error">
 	 					   		  Las contraseñas no coinciden
 	 					   		</small>
 	 					   </div>

 	 					   <!-- Nivel de Seguridad Password(Fortaleza) -->
 	 					   <div v-if="passwordForm.newPassword" class="validacion-fortaleza">
 	 					   	<p class="titulo-validacion">Fortaleza de la Contraseña:</p>
 	 					   	<div class="criterios-validacion">
 	 					   		<div class="criterio" :class=" {
 	 					   			valido: passwordForm.newPassword.length >= 8
 	 					   			}">
 	 					   			<span class="icono"> {{passwordForm.newPassword.length >= 8 ? '✓' :  '○'  }}</span>al menos 8 caracteres
 	 					   		</div>
 	 					   		<div class="criterio"
 	 					   		   :class="{valido: tieneNumeros}">
 	 					   			<span class="icono">{{tieneNumeros ? '✓' :  '○'}}</span>
 	 					   			  Contiene números.
 	 					   		</div>

 	 					   		<div class="criterio">
 	 					   			    <span class="icono">{{tieneMayusculas ? '✓' :  '○'}}</span>
 	 					   					Contiene mayúsculas
 	 					   	   </div>
 	 					   	   <div class="criterio"
  									   :class="{ valido: passwordForm.newPassword !== passwordForm.currentPassword }"
 	 					   	    >
 	 					   	   	    <span class="icono">
 	 					   	           {{  passwordForm.newPassword !== passwordForm.currentPassword ? '✓' : '○' }}
 	 					   	              Diferente a la contraseña actual
 	 					   	        </span>
 	 					   	    </div>
 	 					   	</div>
 	 					   </div>
 	 					   <!-- Botones de accion: Seg. de la Cotrasena -->
 	 						<div class="modal-footer">
								<button 
 	 							class="btn-cancelar"
 	 							type="button"
 	 							@click="onCloseModal"
 	 							>Cancelar
 	 							</button>
 	 							<button 
									class="btn-confirmar"
									type="button"
									:disabled="!isPasswordFormValid"   
 	 							>Camb. Contraseña
 	 							</button>
							</div>
 	 					</form>
 	 					</div>
 	 				</div>
 	 			</div>
 	 	</Transition>
 	 </Teleport>
 </template>

<script setup lang="ts">
	/**
	 * ══════════════════════════════════════════════
	 *    		COMPONENT: ChangePasswordModal
	 * ══════════════════════════════════════════════ 
	 * Repsonsabilidad: Modal para cambiar contrasenia, por medio
	 * de validaciones
	 * Objetivo: Lógica de composable usePasswordChange
	 * 
	 * NOTA: La linea 69 tenia una etiquetada nombrada valido. Esta se omitio
	 * no solo por que causaba eror. Sino porque es propia para clases dinamicas
	 * pero no para ternas condicionales.*/
	import {computed} from 'vue'; 
	import { usePasswordChange } from '@/composables/compStudentProfile.ts';
   
   // ═══════════════════════════════════════
   // 			PROPS
   // ═══════════════════════════════════════

	interface Props {
		isOpen: boolean;
	}

	const props = defineProps<Props>();

	// ═══════════════════════════════════════
	// 			EMITS
	// ════════════════════════════════════════
	 const emit = defineEmits<{
	 	close: []
	 	success: []
	 }>();

	 const {
	 	passwordForm,
	 	isPasswordFormValid,
	 	passwordError,
	 	controllerPaswordChange,
	 	resetPasswordForm
	 } = usePasswordChange();
		
	// ════════════════════════════════════════════════
	// COMPUTED PROPERTIES (Validaciones adicionales)
	// ════════════════════════════════════════════════
	 const tieneNumeros = computed(() =>  /\d/.test(passwordForm.newPassword));
	 const tieneMAyusculas = computed(() => /[A-Z]/.test(passwordForm.newPassword));

	// ════════════════════════════════════════
	// 			MÉTODOS
	// ════════════════════════════════════════

 
	 /**
	  * Maneja el envío del Formulario
	  * */
	async function onSubmitPasswordChange(): Promise <void> {
	 
	 		const success =	await controllerPasswordChange();

	 	if(success){
	 		console.log('La contraseña fue modificada exitosamente..');
	 		 emit('success');
	 		  onClose();

	 		  // Redirigir el Logon despues de 2 segundos
	 		  	setTimeout( ()=> {
	 		  		 window.location.href = '/login';
	 		  	},2000);
	 	}
	 
	}

	 /**
	  * Cierrar el Modal y resetea el formulario
	  * */
	async function close(){
 	  resetPasswordForm();
 	  emit('close')
	}

</script>

<style>
	/* ════════════════════════════════════════════════ 
	    ESTILOS DEL MODAL
	   ═════════════════════════════════════════════════
	 */
	.modal-overlay{

	}

	.modal-contenedor{

	}
	/* Modal de Encabezado */
	.modal-header {

	}

	.modal-header h3 {

	}

	.btn-cerrar{

	}

	.btn-cerrar:hover {

	}
	/* Cuerpo de la ventana */
	.modal-body{

	}	
	 /* Alerta de Seguridad */
	.alerta-seguridad{


	}

	.alerta-seguridad strong {

	}

	.alerta-seguridad p {

	}

	.alerta{

	}

	.alerta-error {

	}
	 /* Formulario */
	.formulario-password{

	}

	.campo-formulario{

	}

	.campo-formulario label {

	}

	.campo-formulario input {

	}

	.campo-formulario input:focus{

	}

	.texto-ayuda{

	}

	.texto-error{

	}

	.validacion-fortaleza {
		margin-top: 0.5px 3px;
		padding: auto;
		color:lightcoral;
	}

	.titulo-validacion {

	}

	.criterios-validacion {

	}

	.criterio {
		margin: 2.5px 1px;
		padding: auto;
		background: #67dfa2;
	}

	.criterio.valido .icono {

	}

	.modal-footer{

	}

	 .btn-cancelar,
	.btn-confirmar{

	}

	.btn-cancelar:hover {

	}

	.btn-confirmar {

	}


	.btn-confirmar:hover:not(:disabled){

	}


	/*Animaciones del Modal > Transition y Teleport */

	 .modal-enter-active,
	 .modal-leave-active {

	 }


	 .modal-enter-from,
	 .modal-leave-to {

	 }


	.modal-enter-active .modal-contenedor,
	.modal-leave-active .modal-contenedor {

	}

	.modal-enter-from .modal-contenedor,
	.modal-leave-to .modal-contenedor {

	}

	 /* Responsivo */
	@media (max-width: 576px){
		.modal-footer{

		}

		.modal-header h3 {

		}
	}
</style>