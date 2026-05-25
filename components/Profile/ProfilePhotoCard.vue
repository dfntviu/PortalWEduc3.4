<template>
	<div class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
		<h3 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Foto de Perfil</h3>
		<div class="flex flex-col items-center">
			<!-- COMPONENTE 100% FUNCIONAL -->
		<!-- Avatar -->
			<div class="relative">
				<div class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:h-40 sm:w-40">
					<img
						v-if="photoPreview || profile?.photoURL"
					 :src="photoPreview || profile?.photoURL"
					 :alt="`${profile?.nombre} ${apellidoDisplay}` "
					 class="h-full w-full object-cover"/>

					<div v-else class="text-center">
					 	<svg class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-500" fill="currentColor"  viewBox="0 0 20 20">
					 		<path fill-rule="evenodd" clip-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
					 	</svg>
					 	<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Sin foto</p>
					</div>

					<!-- Badge -->
					<div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
						<span :class="roleBadgeClass"> {{roleLabel}} </span>
					</div>
				</div>

				<!-- Usuario -->
				<div class="mt-8 text-center">
					<h4 class="text-xl font-bold text-gray-900 dark:text-white">
						{{profile?.nombre}} {{ apellidoDisplay }}
					</h4>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						{{profile?.email }}
					</p>
				</div>
				<!-- Upload -->
				<div v-if="isEditing" class="mt-6 w-full space-y-4">
					<!-- Toogle -->
					<div class="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
						<label for="" class="text-sm font-medium text-gray-700 dark:text-gray-300">
							Usar la Foto de Perfil
						</label>
						<button	 type="button"
							@click="emit('toggle-photo')"
							:class="[
								'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
									photoOptions.uploadPhoto ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
								]"
						>
							<span :class="['inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out',
								photoOptions.uploadPhoto ? 'translate-x-5' : 'translate-x-0']"
							></span>
						</button>
					</div>
					<!-- File -->
					<div  v-if="photoOptions.uploadPhoto" class="space-y-2">
						<input 
						ref="fileInput"
						type="file"
						accept="image/jpeg,image/png, image/jpg, image/webp"
						@change="emit('file-selected', $event)"
						 class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"/>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							JPG, PNG o WEBP. Máximo 2MB.
						</p>
						<button  v-if="photoPreview ||  profile?.photoURL" 
						  type="button"  @click="emit('remove-photo')"
						class="w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100
						dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
							Eliminar Foto
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type {ProfesorUser} from '@/interfaces/Profile.types';

	// =======================
	// 		PROPS
	// =======================

	const props = defineProps<{
		profile: ProfesorUser | null,
		apellidoDisplay: string,
		photoPreview: string | null,
		roleBadgeClass: string | string[],
		roleLabel: string,
		isEditing: boolean,
		photoOptions: {uploadPhoto:boolean}
	}>()

	// =======================
	// 		EMITS
	// =======================
	const emit = defineEmits<{
		'toggle-photo': [],
		'file-selected': [event: Event],
		'remove-photo': []
	}>();
</script>
