<!-- Esta vista Aun no es Usable en el Portal  -->
<template>
  <div class="profile-view min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
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
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <svg
              class="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>

            Editar Perfil
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex items-center justify-center h-64"
      >
        <div
          class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
      >
        <div class="flex items-start">
          <svg
            class="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 
              1.414L8.586 10l-1.293 1.293a1 1 0 
              101.414 1.414L10 11.414l1.293 
              1.293a1 1 0 001.414-1.414L11.414 
              10l1.293-1.293a1 1 0 
              00-1.414-1.414L10 8.586 8.707 7.293z"
            />
          </svg>

          <div class="ml-3">
            <p class="text-sm text-red-800 dark:text-red-200">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Perfil -->
      <div
        v-else-if="profile"
        class="grid grid-cols-1 gap-6 xl:grid-cols-4"
      >
        <!-- Sidebar -->
        <aside class="space-y-6 xl:col-span-1">
          <!-- Card Foto -> [Carga del Perfil segun corresp el rol] -->
          <section
            class="rounded-2xl bg-white shadow-lg dark:bg-gray-800"
          >
            <div class="p-6">
              <h3
                class="mb-6 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Foto de Perfil
              </h3>

              <div class="flex flex-col items-center">
                <!-- Avatar -->
                <div class="relative">
                  <div
                    class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:h-40 sm:w-40"
                  >
                    <img
                      v-if="photoPreview || profile.photoURL"
                      :src="photoPreview || profile.photoURL"
                      :alt="`${profile.nombre} ${profile.apellidos}`"
                      class="h-full w-full object-cover"
                    />

                    <div
                      v-else
                      class="text-center"
                    >
                      <svg
                        class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 
                          000 6zm-7 9a7 7 0 1114 
                          0H3z"
                        />
                      </svg>

                      <p
                        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
                      >
                        Sin foto
                      </p>
                    </div>
                  </div>

                  <!-- Badge -->
                  <div
                    class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                  >
                    <span :class="roleBadgeClass">
                      {{ roleLabel }}
                    </span>
                  </div>
                </div>

                <!-- Usuario -->
                <div class="mt-8 text-center">
                  <h4
                    class="text-xl font-bold text-gray-900 dark:text-white"
                  >
                    {{ profile.nombre }} {{ profile.apellidos }}
                  </h4>

                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ profile.email }}
                  </p>
                </div>

                <!-- Upload -->
                <div
                  v-if="isEditing"
                  class="mt-6 w-full space-y-4"
                >
                  <!-- Toggle -->
                  <div
                    class="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50"
                  >
                    <label
                      class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Usar foto de perfil
                    </label>

                    <button
                      type="button"
                      @click="togglePhotoUpload"
                      :class="[
                        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                        photoOptions.uploadPhoto
                          ? 'bg-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      ]"
                    >
                      <span
                        :class="[
                          'inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out',
                          photoOptions.uploadPhoto
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        ]"
                      />
                    </button>
                  </div>

                  <!-- File -->
                  <div
                    v-if="photoOptions.uploadPhoto"
                    class="space-y-2"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      @change="handleFileSelect"
                      class="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:rounded-lg file:border-0
                      file:bg-blue-50 file:px-4 file:py-2
                      file:text-sm file:font-semibold
                      file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900/50
                      dark:file:text-blue-300
                      dark:hover:file:bg-blue-900"
                    />

                    <p
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      JPG, PNG o WEBP. Máximo 2MB.
                    </p>

                    <button
                      v-if="photoPreview || profile.photoURL"
                      type="button"
                      @click="removePhoto"
                      class="w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Eliminar foto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section> <!--end_od presentation [Card Foto] -->

          <!-- Info rápida -->
          <section
            class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
          >
            <h3
              class="mb-4 text-lg font-semibold text-gray-900 dark:text-white"
            >
              Información Rápida
            </h3>

            <div class="space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                  Estado
                </span>

                <span
                  :class="
                    profile.activo !== false
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ profile.activo !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                  Miembro desde
                </span>
                <!-- En construccion -->
                <span class="text-gray-900 dark:text-white">
                  {{ formatDate(profile.uploadedAt) }} 
                </span>
              </div>

              <div
                v-if="profile.updatedAt"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-600 dark:text-gray-400">
                  Última actualización
                </span>

                <span class="text-gray-900 dark:text-white">
                  {{ formatDate(profile.updatedAt) }}
                </span>
              </div>
            </div>
          </section>
        </aside>

        <!-- Formulario -->
        <section class="xl:col-span-3">
          <div
            class="rounded-2xl bg-white shadow-lg dark:bg-gray-800"
          >
            <div class="max-w-4xl p-6">
              <h3
                class="mb-6 text-lg font-semibold text-gray-900 dark:text-white"
              >
                Información Personal
              </h3>

              <form
                @submit.prevent="saveProfile"
                class="space-y-8"
              >
                <!-- Datos -->
                <div
                  class="grid grid-cols-1 gap-6 md:grid-cols-2"
                >
                  <div>
                    <label
                      class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nombre(s)
                      <span class="text-red-500">*</span>
                    </label>

                    <input
                      v-model="formData.nombre"
                      type="text"
                      required
                      :disabled="!isEditing"
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                    />
                  </div>

                  <div>
                    <label
                      class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Apellidos
                      <span class="text-red-500">*</span>
                    </label>

                    <input
                      v-model="formData.apellidos"
                      type="text"
                      required
                      :disabled="!isEditing"
                      class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                    />
                  </div>
                </div>

                <!-- Acciones -->
                <div
                  v-if="isEditing"
                  class="flex flex-col-reverse gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end"
                >
                  <button
                    type="button"
                    @click="isCancelEditing"
                    class="rounded-xl border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    :disabled="saving"
                    class="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
                  >
                    <span
                      v-if="saving"
                      class="flex items-center"
                    >
                      <svg
                        class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />

                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 
                          0 0 5.373 0 12h4zm2 
                          5.291A7.962 7.962 0 
                          014 12H0c0 3.042 
                          1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>

                      Guardando...
                    </span>

                    <span v-else>
                      Guardar Cambios
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
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

        const {uid_auth, currentUser} = storeToRefs(authStore3);
          console.log('Usuarion con Id  -->',uid_auth.value);
 	  		const role = authStore3.currentUser?.role;


 	  		if (!uid_auth.value) {
 	  			throw new Error('Usuario no atutenticado');
 	  		}

 	  		if (role === 'student') {
            // error # falto pag sincronia
 	  			await profileStore.getStudentById(uid_auth.value);  
 	  		}else if(role === 'teacher'){
 	  			await profileStore.getTeacherById(uid_auth.value);
 	  		}
        // Mapero del perfil de cada rol, segun corresponda sus atributos
 	  		if (profile.value) {
            if (role === 'student'){
              formData.value = {
                 nombre: profile.value.nombre,
                 apellidos: profile.value.apellidos,
                 email: profile.value.email,
                 materias: profile.value.materias || []
              };
           }
       } else if (role === 'teacher'){
 	  		    formData.value = {
                 nombre: profile.value.nombre,
                 apellidos: profile.value.lname, // identico a sus service, profile & compStudetProfile
                 email: profile.value.email,
                 materias: []
            };
 	  			 // Configurar el edo de la foto
 	  		  photoOptions.value.uploadPhoto = !!profile.value.photoURL;
        }
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