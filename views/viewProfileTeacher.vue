<template>
	<!-- =============================-->
	<!-- 	VISTA PERFIL PROFESOR 	   Vista 100% Funcional -->
	<!-- =============================-->
	<main class="min-h-h-screen bg-gray-50 dark:bg-gray-900">
		<!-- Encabezado -->  
		<div class="mb-8 flex items-center justify-between">  <!--bandera p/habilitar -->
			 <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mí Perfil</h1>
			<p class="text-sm text-gray-500 dark:text-white">Gestiona tu información Personal y Configuración</p>
			<button  v-if="!isEditing" 
			 type="button" 
			 @click="startEditing"
			 class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800">
				<svg class="mr-2 h-5 w-5" stroke-linejoin="round" stroke-width="2">
					<path stroke-linecap="round"  fill="none"  stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" d="M11 5H6a2 2 00-2 2v11a2 2 0 002 2h11 2 002-2v-5m1.414-9.414a 2 0 112.828 2.828L11.828 15H9v-2.828l8.586z"/>
				</svg>
				Editar Perfil
			</button>
		</div>
		<!-- Cuadricula Principal(Grid) -->
		<div class="grid grid-cols-1 gap-6 xl:grid-cols-4">
			<!-- Card Foto -->
			<section class="xl:col-span-1 rounded-2xl bg-white shadow-lg dark:bg-gray-800">
				<ProfilePhotoCard	 :profile="profile"
					:apellido-display="apellidosDisplay"
					:photo-preview="photoPreview"
					:role-badge-class="roleBadgeClass"
					:role-label="roleLabel"
					:is-editing="isEditing" 
					:photo-options="photoOptions"
					@toggle-photo="togglePhotoUpload"
					@file-selected="handleFileSelect"
					@remove-photo="removePhoto"
				/>
			</section>

			<section class="xl:col-span-3">
				<div class="rounded-2xl bg-white shadow-lg dark:bg-gray-800">
					<div class="max-w-4xl p-6">
						<h3 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
							Información Personal
						</h3>
						<!-- Informacion en Modo Lectura -->
						<div v-if="!isEditing" class="grid grid-cols-1 gap-4 sm:grids-cols-3">

							<div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
								<p class="text-xs text-gray-500 dark:text-gray-400">Nombre Completo</p>
								<p class="mt-1 font-medium text-gray-900 dark:text-white">
								{{profile?.nombre}} {{apellidosDisplay}}</p>
							</div>
							
							<div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
								<p class="text-xs text-gray-500 dark:text-gray-400">Núm. de Cuenta</p>
								<p class="mt-1 font-medium text-gray-900 dark:text-white">
								  {{ profile?.numCuenta || 'No registrado'}}
								</p>
							</div>

							<div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
								<p class="text-xs text-gray-500 dark:text-gray-400">Área de Trabajo</p>
								<p class="mt-1 font-medium text-gray-900 dark:text-white">
								  {{ profile?.area || 'Error: Areá No registrada'}}
								</p>
							</div>

							<div class="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50 sm:coll-span-3">
								<p class="">Última Modificación</p>
								<p class="mt-1 font-medium text-gray-900 dark:text-white">{{profile?.updatedAt  ? new Date(profile.updatedAt.seconds *1000).toLocaleDateString('es-MX')
								   : 'Sin Registro'}}
								</p>
							</div>
						</div> <!-- End_Lectura -->
						<form  v-if="isEditing" @submit.prevent="saveProfile" class="space-y-8">
							<!--Nombre teacher -->
							<div class="grid grid-cols-1 gap-6 md:grid-cols-1">
									<label for="" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
										<span class="text-red-500">Nombre(s)</span>
									</label>
									<input type="text" 
										v-model="formData.nombre"
										required
										:disabled="!isEditing"
									 class="w-full rounded lg border border-gray-300 bg-white px-2 py-2 shadow-sm transitions-colors focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
									>
							</div>
							<!-- Apellidos -->
							<div class="grid grid-cols-1 gap-6 md:grid-cols-1">
									<label for="" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
										<span class="text-red-500">Apellidos</span>
									</label>
									<input type="text" 
										v-model="formData.apellidos"
										required
										:disabled="!isEditing"
									 class="w-full rounded lg border border-gray-300 bg-white px-2 py-2 shadow-sm transitions-colors focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
									>
							</div>
							<!-- Área Académica -->
							<div class="grid grid-cols-1 gap-6 md:grid-cols-1">
									<label for="" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
										<span class="text-red-500">Área Académica</span>
									</label>
									<input type="text" 
										v-model="formData.area"
										required
										:disabled="!isEditing"
									 class="w-full rounded lg border border-gray-300 bg-white px-2 py-2 shadow-sm transitions-colors focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
									>
							</div>
							<!--  Número de Cuenta-->
							<div class="grid grid-cols-1 gap-6 md:grid-cols-1">
									<label for="" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
										<span class="text-red-500">Número de Cuenta</span>
									</label>
									<input type="text" 
										v-model="formData.numCuenta"
										required
										:disabled="!isEditing"
									 class="w-full rounded lg border border-gray-300 bg-white px-2 py-2 shadow-sm transitions-colors focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
									>
							</div>
								<!-- Email/C. Electrónico -->
							<div class="grid grid-cols-1 gap-6 md:grid-cols-1">
									<label for="" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
										<span class="text-red-500">Correo Institucional</span>
									</label>
									<input type="text" 
										v-model="formData.email"
										required
										:disabled="!isEditing"
									 class="w-full rounded lg border border-gray-300 bg-white px-2 py-2 shadow-sm transitions-colors focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
									>
							</div>

							<!-- Acciones Permitidas -->
							<div v-if="isEditing"
							   class="flex flex-col-reverse gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
							   <button type="button"
							   	@click="cancelEditing"
							    class="rounded-xl border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800">
							   	Cancelar
							   </button>
							   <button type="submit"  :disabled="teacherSaving" class="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800">
								   	<span  v-if="teacherSaving" class="flex items-center">
								   		<svg class="-ml-1 mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
								   		<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
								   		<path  class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
								   	  </svg>
										Guardando...
								   	</span>
								   	<span v-else>Guardar Cambios</span>
							   </button>
							</div>
						</form><!-- Fin_Formulario-Edicion-->
					</div>
				</div>
			</section>

		</div>
	</main>
</template>

<script setup lang="ts">
	// <script>
	import {ref, computed, watch}    from 'vue';
	import { storeToRefs } from 'pinia';
	import { useAuthStore3 } from '@/stores/authStore3';
	import { useProfileStore } from '@/stores/profileStore';
	import  ProfilePhotoCard  from '@/components/Profile/ProfilePhotoCard.vue'

	//  ===============================
	//  	STORES
	// ================================
		const authStore = useAuthStore3();
		const profileStore = useProfileStore();

		const { uid_auth } = storeToRefs(authStore);
		const { profile } = storeToRefs(profileStore);

	//	================================
	//		DATA
	//	================================
		const isEditing = ref(false);
		const teacherSaving = ref(false);
		const photoPreview = ref<string | null>(null);
		const photoFile = ref<File | null>(null);
		const fileInput = ref<HTMLInputElement | null>(null);

		const photoOptions = ref({uploadPhoto: false});

		const formData = ref({
			nombre: '',
			apellidos: '',
			area: '',
			numCuenta: '',
			email: '',
		});

		//  ===============================
		// 			METS COMPUTADOS
		//  ===============================

		const apellidosDisplay = computed(() =>
			profile.value?.apellidos
			  ?? profile.value?.apellido
			  ?? profile.value?.lname
			  ?? ''
		);

		const roleLabel = computed(() => 'Profesor');

		const roleBadgeClass = computed(( )=>
			'rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900 dark:text-text-indigo-200'
		);

		//  ===============================
		// 			CARGA DE PERFIL
		//  ===============================

		const loadProfile = async(): Promise <void> => {
			// Hace el cambio con: Nombre, Apellido, (Email No)
			try{
				await profileStore.getTeacherById(uid_auth.value!);
				if(profile.value){
					formData.value = {
						nombre: profile.value.nombre ?? '', //* [si]
						apellido: profile.value.apellido ?? '',  //*[si]
						area: profile.value.area ?? '', //[si]
						numCuenta: profile.value.numCuenta ?? '', //[si]
						email: profile.value.email ?? '', //[No]
					}
					  photoOptions.value.uploadPhoto = !!profile.value.photoURL;
				}
			}catch(err){
				console.error('Error al cargar la Foto de Perfil', err);
			}
		}

		watch(uid_auth, async(newUid) => {
				if(! newUid) return
				await loadProfile();
		}, { immediate: true}); //* aqui estaba la raiz del mal, por error de naming

		//  ==========================
		// 		ACCIONES	
		//  ==========================
		// los datos deberan mostrarse en formato de lectura
		const startEditing = (): void => {
			if (profile.value) {
				formData.value = {
				  nombre: profile.value.nombre ?? '' ,
				  apellidos: profile.value.apellido ?? '',/*profile.value.lname?? profile.value.apellidos ?? '',*/
				  area: profile.value.area ?? '',
				  numCuenta: profile.value.numCuenta ?? '',
				  email: profile.value?.email ?? '', //new
				}
			}
			isEditing.value = true;
		}

		const cancelEditing = ():void => {
			isEditing.value = false;
			photoPreview.value = null;
			photoFile.value = null;

			if (profile.value) {
				formData.value = {
					nombre: profile.value.nombre ?? '',
					apellidos: profile.value.apellido ?? profile.value.apellidos ?? '',

					area: profile.value.area ?? '',
					numCuenta: profile.value.numCuenta ?? '',
					email: profile.value.email ?? '',
				}
			}
		}

		const togglePhotoUpload = (): void => {
			photoOptions.value.uploadPhoto = !photoOptions.value.uploadPhoto;
		}

		const handleFileSelect = (event: Event): void => {
			const input = event.target as HTMLInputElement
			const file = input.files?.[0]
				if (!file) return
				photoFile.value = file;
				const reader = new FileReader();
				reader.onload = (event) => { photoPreview.value = event.target?.result as String }  //traicionero identico
				reader.readAsDataURL(file)
		}

		const removePhoto = (): void => {
			photoPreview.value = null;
			photoFile.value = null;
				photoOptions.value.uploadPhoto = false;
				if (fileInput.value) fileInput.value.value = ''
		}

		const saveProfile = async(): Promise <void> => {
			if (!uid_auth.value) return
				teacherSaving.value = true;
			try{
				// variables incompletas [email, password->(faltantes)]
				await profileStore.saveTeacherProfile({
					name: formData.value.nombre, //cambio1
					lname: formData.value.apellidos,
					area: formData.value.area,
					numCuenta: formData.value.numCuenta,
					email: profile.value?.email ?? '',
					password: profile.value?.passwd ?? '',
				},
					uid_auth.value, //cambio2
					photoFile.value ?? undefined
				)
					await loadProfile();
					isEditing.value = false;
					photoPreview.value = null;
					photoFile.value = null;
			}catch(err){
				console.error('Error al guardar el Perfil',err);
			}finally{
				teacherSaving.value = false;
			}
		}
</script>