 <template>
 	 <Teleport to="body">
 	 	<Transition name="modal">
 	 		<div  v-if="props.isOpen" class="modal-overlay">
 	 			<div class="modal-contenedor">
 	 				<!-- Encabezado de la vent. Modal -->
 	 				<div class="modal-header">
 	 					<h3>Cambiar Contraseña</h3>
 	 					<button type="button" class="btn-cerrar" @click="onClose">x</button>
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
 	 					   		<input  id="confirmNewPassword" type="password" v-model="passwordForm.confirmNewPassword"
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
 	 							@click="onClose"
 	 							>Cancelar
 	 							</button>
 	 							<button 
									class="btn-confirmar"
									type="button"
									:disabled="!!isPasswordFormValid"
									@click="onSubmitPasswordChange"
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
	 	controllerPasswordChange,
	 	resetPasswordForm
	 } = usePasswordChange();
		
	// ════════════════════════════════════════════════
	// COMPUTED PROPERTIES (Validaciones adicionales)
	// ════════════════════════════════════════════════
	 const tieneNumeros = computed(() =>  /\d/.test(passwordForm.newPassword));
	 const tieneMayusculas = computed(() => /[A-Z]/.test(passwordForm.newPassword));

	// ════════════════════════════════════════
	// 			MÉTODOS
	// ════════════════════════════════════════

	 /**
	  * Maneja el envío del Formulario
	  * */
	async function onSubmitPasswordChange(): Promise <void> {
		alert('Se esta cambiando tu contraseña C1');
	 	// alert('Procesando el cambio de Contraseña...');
	 		const success =	await controllerPasswordChange();

	 	if(success){
	 		 emit('success');
	 		  onClose();
	 		  // Redirigir al inicio de sesion:  3 segundos y medio despues
	 		  	setTimeout(()=> {
	 		  		 window.location.href = '/login-multi_user-view';
	 		  	},3500);
	 		console.log('La contraseña fue modificada exitosamente..');
	 	}
	}

	 /**
	  * Cierrar el Modal y resetea el formulario
	  * */
	async function onClose(){
 	  resetPasswordForm();
 	  emit('close')
		console.log('Haz cerrado el modal. La contrasenia no se cambio')
	}
</script>

<style>
	/* ════════════════════════════════════════════════ 
	    ESTILOS DEL MODAL
	   ═════════════════════════════════════════════════
	 */
	.modal-overlay{
		background: var(--color-background-primary, #fff);
		border-radius: 12px;
		iset: 0;
		background: rgba(0, 0, 0, 0.48);
		display: flex;
		align-items: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-contenedor{
		background: var(--color-backgroud-primary, #fff);
		border-radius: 12px;
		border: 0.5px solid var(--color-border-secondary, #d1d5db);
		width:  100%;
		max-width: 480px;
		overflow: hidden;
	}
	/* Modal de Encabezado */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1.3px solid var(--color-border-tertiary, #e5e7eb);
	}

	.modal-header h3 {
		font-size: 16.5px;
		font-weight:  500;
		color: var(--color-text-secondary,#41f7);
	}

	.btn-cerrar{
		background: none;
		border: 0.5px solid var(--color-border-tertiary, #e5e7eb);
		border-radius: 6px;
		width: 28px;
		height: 28px;
		cursor: pointer;
		font-size: 14px;
		color: var(--color-text-secondary, #6b7280);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s color 0.15s;
	}

	.btn-cerrar:hover {
		background: var(--color-background-danger, #fee2e2);
		color: var(--color-text-danger,#b91c1c);
	}
	/* Cuerpo de la ventana */
	.modal-body{
		padding: 1.25rem;
	}	
	 /* Alerta de Seguridad */
	.alerta-seguridad{
		background: var(--color-background-warning, #fef9c3);
		border-left: 3px solid #BA7517;
		border-radius: 0 8px 8px 0;
		padding: 0.75rem 1rem;
		margin-bottom:  1rem;
	}

	.alerta-seguridad strong {
		font-size: 13px;
		font-weight: 500;
		color: #633806;
		display: block;
		margin-bottom: 4px;
	}

	.alerta-seguridad p {
		 padding: 0.6rem 1rem;
		border-radius:8px ;
		font-size: 13px; 
		margin-bottom: 0.75rem;
	}


	.alerta{
		padding: 0.6rem 1rem;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 0.75rem;
	}

	.alerta-error {
		background: var(--color-backgroud-danger,#fee2e2);
		color: var(--color-text-danger, #b91c1c);
		border: 0.5px solid var(--color-border-danger,#fca5a5);
	}
	 /* Formulario */
	.formulario-password{
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.campo-formulario{
		font-size: 13px;
		font-weight: 500;
		gap: 4px;
	}

	.campo-formulario label {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-trasparency,#6b7280);
	}

	.campo-formulario input {
		height: 36px;
		padding: 0 10px;
		border: 0.5px solid var(--color-border-secondary,#d1d5db);
		border-radius: 8px;
		font-size: 13px;
		color: var(--color-text-primary, #111);
		background: var(--color-backgroud-primary, #fff);

	}

	.campo-formulario input:focus{
		border-color: #185FA5;
		box-shadow: 0 0 0 3px rgba(24, 95, 165, 0.12);
	}

	.texto-ayuda{
		font-size: 11px;
		color: var(--color-text-tertiary, #9ca3af);
		margin-top: 2px;
	}

	.texto-error{
		font-size: 12px;
		color: var(--color-text-danger, #b91c1c);
		margin-top: 2px;
	}

	.validacion-fortaleza {
		background: var(--color-backgroud-secondary,#f9fafb);
		border: 0.5px solid var(--color-border-tertiary,#e57e7b);
		border-radius: 8px;
		padding: 0.7rem 1rem;
		margin-top: 0.25rem;
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
		height: 34px;
		border-radius: 8px;
		font-size: 13px;
		cursor: pointer;
		transition: background 0.15s opacity 0.15s;
	}

	.btn-cancelar{
		padding: 0 1rem;
		border: 0.5px solid var(--color-border-secondary, #d1d5db);
		background: none;
		color:var(--color-background-secondary,#6b7280);
	}

	.btn-cancelar:hover {
		background:  var(--color-backgroud-secondary, #f3f);
	}

	.btn-confirmar {
		padding: 0 1.125rem;
		border: none;
		background: #185FA5;
		color: #fff;
		font-weight: 500;
	}


	.btn-confirmar:hover:not(:disabled){
		background: #0C447C;
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