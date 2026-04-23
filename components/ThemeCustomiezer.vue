<template>
	<div class="theme-customizer">
		<!-- Header -->
		<div class="customizer-header">
			<div class="header-content">
				<h2 class="header-title">
					<svg class="icon">
						</path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z">
					</svg>
					Personalizar Mi Espacio
				</h2>
				 <p class="header-subtitle">Configura tú Espacio visual</p>
			</div>

			<button class="btn-reset" @click="resetToDefault"  :disabled="isLoading">
					<svg class="icon-small" xmlns="http://www.w3.org/2000/svg" fill='none' stroke="currentColor" viewBox="0 0 24 24">
						</path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8">
					</svg>
				Restaurar por Defecto
			</button>
		</div>
			<!-- </div> -->
		<!-- Loading State	 -->
		  <div  v-if="isLoading" class="loading-state">
		  	<div class="spinner">
		  		<p>Aplicando Cambios...</p>
		  	</div>
		  </div>

		<!-- Error State -->
		<div class="error-msg">
			<svg class="icon-small">
				<circle cx="12"  cy="8"  r="10">
					<line  x1="12"  x2="12" y1="8"  y2="12"></line>
					<line  x1="12"  x2="12.01" y1="16"  y2="16"></line>
				</circle>
			</svg>
			{{error}}
		</div>

		<!-- Cuztomization Sections -->
		<div class="customizer-content">
			<section class="customization-section">
				<div class="section-header">
					<h3 class="section-title">
						<p class="section-description">Elige el Esq. de colores</p>
					</h3>
				</div>
				<PaletteSelector	
					 :selected-palette="currentPalette"
					 :palettes="availablePaletts"
					 @update:palette="handlePaletteChange"
				 />
			</section>

			<!-- Background Selector -->
			<section class="customizer-content">
				<div class="section-header">
					<div class="section-title">
						<div class="section-description">
							<p>Selecciona una Imagen para tú Área de Trabajo</p>
						</div>
					</div>
				</div>
				<BackgroundSelector
					:selected-background="currentBackgroundImage"
					:backgrounds="availableBackgrounds"
					@update:background="handleBackgroundChange"
				/>

				<!-- Profile Photo Style -->
				<section class="customization-section">
					<div class="section-header">
						<h3 class="section-title">Estilo de Foto de Perfil
							<p class="section-description">Cambia tú Foto de Perfil</p>
						</h3>
					</div>
						<ProfileStyleSelector  
						 :selected-style="profilePhotoStyle"
					     @update:style="handleStyleChange"
						/>
				</section>

					<!-- Preview Toggle >> Alt. entre Vista Previa -->
					<section class="customization-section">
						<div   class="preview-ctrls">
							<button
								@click="togglePreview"
								class="btn-preview"
								:class=" {active:isPreviewMode } "
							>
								<svg class="icon-small">{{isPreviewMode ?'Modo Vista Previa Activo' : ' Vista Previa'}}</svg> 	
							 </button>

							 <button v-if="isPreviewMode" class="btn-apply" @click="applyChanges">Aplicar Cambios</button>
						</div>
					</section>

					<!-- Mensaje Satisfactorio -->
					<Transition name="fade">
						<div v-if="showSuccessMessage" class="success-message">
							<svg class="icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
								stroke="currentColor"> <!--??-->
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14">
							     <popyline points="22 4 12 14.01 9 11.01" />	
							 <svg/>
							 ¡El Tema fue Aplicado Exitosamente!
						</div>
					</Transition>
			</section>
		</div>
		<!-- Success Message -->
</template>

<script setup lang="ts">
	import {ref,computed, onMounted} from 'vue'
	import {usePersonalityStore} from '@/stores/personalityStore';
	import {useAuthStore3} from '@/stores/authStore3';
	 import PaletteSelector from './PaletteSelector.vue';
	 import BackgroundSelector from './BackgroundSelector.vue';
	 import ProfileStyleSelector from './ProfileStyleSelector.vue';
	  import {PaletteType, ProfilePhotoStyle} from '@/interfaces/Personality.types.ts';

	 // Stores
	  const personalityStore = usePersonalityStore();
	  const authStore = useAuthStore3();

	  // State from state
	  const {
	  	isLoading,
	  	error,
		availablePalettes,
		availableBackgrounds,
		currentPalette,
		currentBackgroundImage,
		profilePhotoStyle,
		isPreviewMode,
		hasCustomTheme
	  } = storeRefs(personalityStore);

	  // Local state
	   const showSuccessMessage = ref(false);
	   const hasChanges = ref(false);

	   // Computed
	   const currentUser = computed(()=> authStore.currentUser);
	   const userRole = computed(()=> authStore.currentUser?.role);

	   // Methods
	    const handlePaletteChange = async (paletteId: PaletteType)=>{
	    	if (!currentUser.value || !userRole.value) return;
	    	
	    	hasChanges.value = true;
	    	const success = personalityStore.updatePalette(paletteId, currentUser.value.uid, userRole.value);

	    	if (success) {
	    		showSuccess();
	    	}
	    };

	    const handleBackgroundChange = async (imageId: string | null )=>{
	    	 if (!currentUser.value || !userRole.value) return;

	    	  hasChanges.value = true;
	    	   const success =  await personalityStore.updateBackgroundImage(imageId,currentUser.value.uid, userRole.value);

	    	   if (success) {
	    	   	showSuccess();
	    	   }
	    };

	    const handleStyleChange = async (style: ProfilePhotoStyle) => {
	    	if(!currentUser.value || !userRole.value) return;

	    	hasChanges.value = true;

	    		const success =  await personalityStore.updateProfilePhotoStyle(style,currentUser.value.uid, userRole.value);

	    		if (success) {
	    	   		showSuccess();
	    	    }
	    };

	    const togglePreview = () =>{
	    	 if (isPreviewMode.value) {
	    	 	 // personalityStore.disablePreviewMode(); [pendiente]
	    	 } else {
	    	 	 // efectuar personalizacion CSS para mostrar
	    	 }
	    };

	    const applyChanges = ()=>{
	    	 personalityStore.disablePreviewMode();
	    	  showSuccess();
	    };

	    const resetToDefault = async ()=>{
	    	if(!currentUser.value || !userRole.value) return;

	    	if(confirm('¿Estas seguro de que quieres restaurar la configuración por defecto?')){
	    		const success = personalityStore.restedTheme(
	    				currentUser.value.uid,
	    				userRole.value
	    			);
	    		if(success){
	    		 	 hasChanges.value = false;
	    		 	 showSuccess('El Tema fue restaurado por Defecto');
	    		}
	    	}
	    };

	    const showSuccess = (message = 'El Tema es Aplicado exitosamente') =>{
	    	showSuccessMessage.value = true;
	    	 setTimeout(()=>{
	    	 	 showSuccessMessage.value = false;
	    	 }, 3000);
	    };


	    onMounted(()=>{
	    	if (currentUser.value && userRole.value.value) {
	    		 personalityStore.initializeTheme(currentUser.value.uid, userRole.value);
	    	}
	    });
</script>

<style scoped>

	.theme-customizer{
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	/* Header */
	.customizer-header{
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid var(--card-border-color, #e5e7eb);
	}

	.header-content{
		flex: 1;
	}

	.header-title{
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1.875rem;
		font-weight: 700;
		color: var(--text-primary, #1f2937);
		margin: 0 0 0.5rem 0;
	}

	.header-subtitle{
		font-size: 1rem;
		color: var(--text-secondary,  #6b7280);
		margin: 0;
	}

	.icon{
		width: 2rem;
		height: 2rem;
		stroke-width: 2;
	}

	.icon-small{
		width: 1.25rem;
		height: 1.25rem;
		stroke-width: 2;
	}

	.btn-reset{
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		background: transparent;
		border: 2px solid var(--primary-color, #2C5F2D);
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-reset:hover-not(:disabled){
		background: var(--primary-color, #2C5F2D);
		color: white;
	}

	.btn-reset:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-preview{
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--secondary-color, #97BC62);
		 color: white;
		 border: none;
		 border-radius: 0.5rem;
		 font-weight: 600;
		 cursor: pointer;
		 transition: all 0.2s ease;
	}

	.btn-preview: active {
		opacity: 0.9;
		transition:translate(-1px);
	}
	
	.btn-apply{
		background: var(--accent-color,#FCB040);
	}

	.btn-apply: hover{
		padding: 0.75rem 1.5rem;
		background: var(--primary-color, #2C5F2D);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.loading-state{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		gap: 1rem;
	}

	.spinner{
		width: 2rem;
		height: 3rem;
		border: 4px solid rgba(0, 0, 0, 0.1);
		border-left-color: var(--primary-color, #2C5F2D);
		border-radius: 50%;
		animation: spin 1s	linear infinite;
	}

	@keyframes spin {
		to{
			transform: rotate(360deg);
		}
	}

	.error-msg{
		background: #fee;
		color: #c33;
		border: 1px solid #fcc;
	}

	.success-message{
		background: #efe;
		color: #363;
		border: 1px solid #cfc;
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 1000;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}	

	.customizer-content{
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}
    
    .customization-section {
    	background: white;
    	border-radius: 1rem;
    	padding: 1.5rem;
    	border: 1px solid var(--card-border-color, #e5e7eb);
    	transition: box-shadow 0.2s ease;
	}
   
    .customization-section: hover {
    	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .section-header{
    	margin-bottom: 1.5rem;
    }

    .section-title{
    	font-size: 1.25rem;
    	font-weight: 600;
    	color: var(--text-primary, #1f2937);
    	margin: 0 0 0.5rem 0;
    }

    .preview-section{
    	background: linear-gradient(135deg, var(--primary-color, #2C5F2D) 0%,
    	var(--secondary-color, #97BC62)100% );
    	border: none;
    }

	.preview-ctrls{
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	 /* Transitions */
	.fade-enter-active,	
	.fade-leave-active {
		transition: opacity 0.3s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		 opacity: 0;
	}
	  /* Responsividad */
	@media (max-width: 768px){
		 .theme-customizer{
		 	 padding: 1rem;
		 }

		.customizer-header{
			flex-direction: column;
			gap: 1rem;
		}

		.btn-reset{
			width: 100%;
			justify-content: center;
		}

		.preview-ctrls{
			flex-direction: column;
		}

		.btn-preview,
		.btn-apply {
			width: 100%;
			justify-content: center;
		}
	}

</style>