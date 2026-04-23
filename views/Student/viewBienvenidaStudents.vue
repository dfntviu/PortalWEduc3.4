<template>
	  <!-- ═══════════════════════════════════════════════════ -->
	  <!-- VISTA BIENVENIDA ESTUDIANTES		 -->
	  <!-- ═══════════════════════════════════════════════════ -->
	<main>
		<Transition>  
			<!--───────────────────────────────────────────────  -->
			<!--		 Welcome Component  - Role 02 				-->
			<!--───────────────────────────────────────────────  -->
		<WelcomeUsersF v-if="isAuthentitcated && isAlumno"  role="teacher" />
			<div v-else-if="isLoading" class="flex items-center justify-center min-h-screen">
					<!-- Loading State -->
				<div class="text-center">
					<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p class="text-gray-600 dark:text-gray-600 dark:text-gray-400">Cargando Perfil..</p>
				</div> 
			</div>
				<!-- Error del Estado -->
			<div v-else class="flex items-center justify-center min-h-screen">
				<div class="text-center">
					<svg class="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor"  viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.858c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.33-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
			</div>
		</Transition>
	</main>
</template>
<script setup lang="ts">
 import { computed} from 'vue'
 import { storeToRefs } from 'pinia'
  import {useAuthStore3} from '@/stores/authStore3.ts';
  import {useProfileStore} from '@/stores/profileStore';
  import WelcomeUsers from '@/components/main/WelcomeUsersF.vue'

  const authStore3 = useAuthStore3();
  const profileStr3 = useProfileStore();

  const {isAuthentitcated, role} = storeToRefs(authStore3);
  const {profile} = storeToRefs(profileStr3);

  console.log('El perfil:[', profile);

  // ═════════════════════════════════
  // 		METODOS COMPUTADOS
  // ═════════════════════════════════
  const isLoading = computed(() => {
  	 return isAuthentitcated && !profile;
  });

  const isAlumno = computed(() => {
  	 profile.value?.role === 'student';
  });
</script>
	
<style scoped>
	.fade-slide-enter-active {
		opacity: 0;
		transform: translateY(-20px);
	}

	.fade-slide-from {
		opacity: 0; transform: translateY(10px);
	}

	.fade-slide-leave-to {
		opacity: 0;
		transform: translateY(20px);
	} 
</style> <!-- ##CULMINATED## --> 
<!-- corregir index.html.refactor para iniciar compilador vue sin
errores desde src_refactor, no omitir que se inicia con el valor
del argumento dev:refactor -->