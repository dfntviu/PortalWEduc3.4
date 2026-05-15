<template>
  <div class="profile-view min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Mi Perfil
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gestiona tu información personal y configuración
            </p>
          </div>
          
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Perfil
          </button>
        </div>
      </div>
    </div>

    <!--Contenido Principal-->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!--Error State-->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>
        </div>
      </div>

      <!--Contenido del Perfil-->
      <div v-else-if="profile" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna Izquierda: Foto y Acciones Rápidas -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Tarjeta de Foto de Perfil -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Foto de Perfil
              </h3>
              
              <!-- Preview de Foto -->
              <div class="flex flex-col items-center">
                <div class="relative">
                  <div class="w-40 h-40 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <img
                      v-if="photoPreview || profile.photoURL"
                      :src="photoPreview || profile.photoURL"
                      :alt="`${profile.nombre} ${profile.apellidos}`"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="text-center">
                      <svg class="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Sin foto</p>
                    </div>
                  </div>
                  
                  <!-- Badge de rol -->
                  <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span :class="roleBadgeClass">
                      {{ roleLabel }}
                    </span>
                  </div>
                </div>

                <!-- Nombre del Usuario -->
                <div class="mt-6 text-center">
                  <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ profile.nombre }} {{ profile.apellidos }}
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ profile.email }}
                  </p>
                </div>

                <!-- Controles de Foto (Solo en modo edición) -->
                <div v-if="isEditing" class="mt-6 w-full space-y-4">
                  <!-- Toggle para habilitar/deshabilitar foto -->
                  <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Usar foto de perfil
                    </label>
                    <button
                      type="button"
                      @click="togglePhotoUpload"
                      :class="[
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        photoOptions.uploadPhoto ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      ]"
                    >
                      <span
                        :class="[
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          photoOptions.uploadPhoto ? 'translate-x-5' : 'translate-x-0'
                        ]"
                      />
                    </button>
                  </div>

                  <!-- Input de archivo (Solo si está habilitado) -->
                  <div v-if="photoOptions.uploadPhoto" class="space-y-2">
                    <label class="block">
                      <span class="sr-only">Elegir foto</span>
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        @change="handleFileSelect"
                        class="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          dark:file:bg-blue-900/50 dark:file:text-blue-300
                          hover:file:bg-blue-100 dark:hover:file:bg-blue-900
                          file:cursor-pointer file:transition-colors"
                      />
                    </label>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG o WEBP. Máximo 2MB.
                    </p>
                    
                    <!-- Botón para eliminar foto -->
                    <button
                      v-if="photoPreview || profile.photoURL"
                      @click="removePhoto"
                      type="button"
                      class="w-full px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Eliminar foto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjeta de Estadísticas Rápidas -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Rápida
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Estado</span>
                <span :class="profile.activo !== false ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ profile.activo !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Miembro desde</span>
                <span class="text-gray-900 dark:text-white">
                  {{ formatDate(profile.createdAt) }}
                </span>
              </div>
              <div v-if="profile.updatedAt" class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Última actualización</span>
                <span class="text-gray-900 dark:text-white">
                  {{ formatDate(profile.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Formulario de Datos -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div class="p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Información Personal
              </h3>

              <form @submit.prevent="saveProfile" class="space-y-6">
                <!-- Información Básica -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre(s) <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.nombre"
                      type="text"
                      :disabled="!isEditing"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellidos <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.apellidos"
                      type="text"
                      :disabled="!isEditing"
                      required
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                      placeholder="Ingresa tus apellidos"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.email"
                    type="email"
                    disabled
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    El correo no puede ser modificado
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    v-model="formData.telefono"
                    type="tel"
                    :disabled="!isEditing"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    placeholder="Ej: +52 123 456 7890"
                  />
                </div>

                <!-- Información Adicional para Profesores -->
                <div v-if="profile.role === 'teacher'" class="space-y-6">
                  <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Información Académica
                    </h4>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Materias que imparte
                      </label>
                      <div class="flex gap-2">
                        <input
                          v-model="newMateria"
                          type="text"
                          :disabled="!isEditing"
                          @keyup.enter="addMaterial"
                          class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                          placeholder="Escribe una materia y presiona Enter"
                        />
                        <button
                          v-if="isEditing"
                          type="button"
                          @click="addMaterial"
                          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Agregar
                        </button>
                      </div>
                      
                      <!-- Lista de Materias -->
                      <div v-if="formData.materials && formData.materials.length > 0" class="mt-3 flex flex-wrap gap-2">
                        <span
                          v-for="(materia, index) in formData.materials"
                          :key="index"
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {{ materia }}
                          <button
                            v-if="isEditing"
                            type="button"
                            @click="removeMaterial(index)"
                            class="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botones de Acción -->
                <div v-if="isEditing" class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    @click="isCancelEditing"
                    class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="saving" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/> <!--habia error sin autocierre -->
                      </svg>
                      Guardando...
                    </span>
                    <span v-else>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
	import { ref,computed, onMounted,watch } from 'vue';
  import { storeToRefs } from 'pinia';
	import { useProfileStore } from '@/stores/profileStore.ts';
	import { useAuthStore3 } from '@/stores/authStore3.ts';
	 import type { Profile } from '@/interfaces/Profile.types.ts';
	 // STORES
	 const profileStore = useProfileStore();
	 const authStore3 = useAuthStore3();
	 // STATES
	 const isEditing = ref(false);
	 const saving = ref(false);
	 const photoPreview = ref<string>('');
	 const newMaterial = ref('');
	 const fileInput = ref<HTMLInputElement| null>();
	 // OPCIONES FOTO
	 const photoOptions = ref({
	 	uploadPhoto: false,
	 	photoFile: undefined as File | undefined,
	 });
	 // FORMULARIO
	 const formData = ref<Partial<Profile>>({
	 	nombre: '',
  		apellidos: '',
  		email: '',
      telefono: null,
  		materials: []
	 });
	 	// COMPUTADOS
	 const profile = computed(()=> profileStore.profile);
    const loading  = computed(()=> profileStore.loading)
 	 const   error = computed(()=> profileStore.error);
   const photoFile = ref<File | null>(null);
      const roleLabel =computed(()=>  {
         return profile.value?.role === 'student' ? 'Estudiante' : 'Profesor';
 	 		});

 	 		const roleBadgeClass = computed(()=>{
 	 			return profile.value?.role === 'student'
 	 			? 'px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30'+ 
 	 			  'text-green-800 dark:text-green-300'
 	 			: 'px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30'
 	 			 + 'text-purple-800 dark:text-purple-300';
      });

 	  // =========== Metodos  ===========
 	  const loadProfile = async()=>{
 	  	try{

 	  		// const uid = authStore3.currentUser?.uid;
 	  		const role = authStore3.currentUser?.role;

        const {uid_auth, currentUser} = storeToRefs(authStore3);
          console.log('Usuarion con Id  -->',uid_auth.value);


 	  		if (!uid_auth) {
 	  			throw new Error('Usuario no atutenticado');
 	  		}

 	  		if (role === 'student') {
 	  			profileStore.getStudentById(uid_auth);
 	  		}else if(role === 'teacher'){
 	  			profileStore.getTeacherById(uid_auth);
 	  		}

 	  		if (profile.value) {
				formData.value = {
					 nombre: profile.value.nombre,
                apellidos: profile.value.apellidos,
                email: profile.value.email,
                materias: profile.value.materias || []
				   };
 	  		}
 	  			// Configurar el edo de la foto
 	  		photoOptions.value.uploadPhoto = !!profile.value.photoURL;
 	  	}catch(err){
 	  		console.error('Error al cargar el perfil:', err);
 	  	}
 	  };

 	  const startEditing = () => {
 	  	isEditing.value = true;
 	  }

 	  	const isCancelEditing = () => {
	 	  	isEditing.value = false;
	 	  	photoPreview.value = '';
	 	  	if (profile.value) {
	 	  		formData.value = {
	 	  			nombre: profile.value.nombre,
	      		   apellidos: profile.value.apellidos,
	      		   email: profile.value.email,
	      		   materials: profile.value.material || [],
	 	  		};
	 	  		photoOpts.value.uploadPhoto = !!profile.value.photoURL;
		 	}
	 	};
 	  	 /* [New] Aniadidad el 13/05/2026 */
    const togglePhotoUpload = () => {
      // console.log('Contruyendo Flujo de Camb. de Foto...');
        photoOptions.value.uploadPhoto = !photoOptions.value.uploadPhoto;

        if(!photoOptions.value.uploadPhoto) {
           photoPreview.value = '';
           photoOptions.value.photoFile = undefined;
            if(fileInput.value) {
                fileInput.value.value = '';
            }
        }
    };

 	  	const removePhoto = () =>{
 	  		 photoPreview.value = '';
 	  		 photoOptions.value.photoFile = undefined;
 	  		   if (fileInput.value) {
 	  		   	   fileInput.value.value = '';
 	  		   }
            alert('Foto Eliminada, aún es posible modificarla');
           console.log('Foto Eliminada');
 	  	};

 	  	const addMaterial = ()=>{
 	  		if (newMaterial.value.trim() && formData.value.material?.includes(newMaterial.value.length())) {
 	  			
          if (!formData.value.material) {
 	  				formData.value.material = [];
 	  			}
 	  			 formData.value.material.push(newMaterial.index.length);
 	  			  newMaterial.value = null;
 	  		}
 	  	};

 	  	const removeMaterial = (index: number)=>{
 	  		formData.value.material?.splice(index,1);
 	  	}

 	  	const saveProfile = async () =>{
 	  		if (!profile.value?.uid) return;

 	  		saving.value = true;
        console.log('Estoy ejecutando el metodo p/guardar cambios.');
 	  		try{
 	  			const updates: Partial<Profile> = {
 	  				nombre: formData.value.nombre,
 	  				apellidos:formData.value.apellidos,
 	  				correo:formData.value.email,
 	  			};

 	  			if (profile.value.role === 'teacher') {
 	  				updates.material = formData.value.material;
 	  			}

 	  			const photoOptions = {
 	  				uploadPhoto: photoFile.value !== null,
 	  				  photoFile: photoFile.value ?? undefined,
 	  			};
          console.log('actualizacion ', photoOptions.uploadPhoto);
          console.log('Valor ', photoOptions.photoFile);

 	  			if (profile.value.role=== 'student') {
 	  				 await profileStore.updateStudentProfile(profile.value.uid,updates,photoOptions);
 	  			} else if (profile.value.role==='teacher') {
 	  				 profileStore.updateTeacherProfile(profile.value.uid,updates,photoOpts);
 	  			}

 	  			 loadProfile();

 	  			 isEditing.value = false;
 	  			 photoPreview.value = '';

 	  			 alert(	'✅ Perfil actualizado exitosamente');
 	  		}catch(err: any){
 	  			 console.error('Error al guardar perfil:', err);
    			 alert(`❌ Error al guardar: ${err.message}`);
 	  		}
 	  	}

 	  	/* =========== Validaciones de la Vista =========== */

 	/**  const handleImgFileSelect = (event: Emit)=> {
 	      const target = event.target as HTMLInputElement;

          const file = target.files?.[0];
          if (!file) return;

        // VALIDAR TAMAÑO MÁXIMO 2MB
      const UMBRAL_DIMENSION_IMG = 2 * 1024 * 1024;
        if (file.size > UMBRAL_DIMENSION_IMG) {
            alert('El Archivo de Imagen es demasiado grande. Máximo 2MB.');
            return;
        }

        // VALIDAR TIPO
        if (!/^image\/(jpeg|png|jpg|webp)$/.test(file.type)) {
            alert('El Formato no es válido. Solo JPG, PNG, WEBP.');
            return;
        }

      photoOptions.value.photoFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
          photoPreview.value = e.target?.result as string;
      };
       reader.readAsDataURL(file);
 	  }; **/

    const handleFileSelect = (event: Emit) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
           if(file.size > 2* 1024 * 1024 ){
               alert('El Archivo es demasiado grande.Máx 2MB.');
                return;
           }
            // VALIDAR TIPO
           if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
            alert('El Formato no es válido. Solo JPG, PNG, WEBP.');
            return;
           }
           photoFile.value = file;
               // Crear preview
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                photoPreview.value = e.target?.result as string;
            };

            reader.readAsDataURL(file);
        } 
    }

    const formatDate = (date: any): string => {
      if(!date) return 'N/A';

      try {
        const d = date.toDate ? date.toDate(): new Date(date);
        return d.localeDateToString('es-MX',{
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
      }catch{
        return 'N/A';
      }
    };
 	  	 // Ciclo de Vida
 	  	onMounted(()=>{
 	  		loadProfile();
 	  	});

 	   /*photoOpts.value.photoFile = undefined;
 	  	  if (fileInput.value) {
 	  	  	fileInput.value	= '':
 	  	  }*/
</script>