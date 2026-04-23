<template>
	<!--  ================================================= -->
	<!-- 		 VISTA BIENVENIDA PROFESORES	 			-->
	 <!-- ================================================= -->
	<main class="vista-welcome-profesores min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
		 <!-- ________________________________________ -->
		 <!-- 		Componente de Bienvenida		   -->
		 <!-- ________________________________________ -->
		<Transition name="fade-slide">
			<WelcomeUserF 
			 v-if="isAuthenticated && isTeacher"
			  role="teacher"
			/>
			  <!-- loading-state -->
			<div  v-else-if="isLoading" class="flex items-center justify-center min-h-screen">
				<div class="text-center">
					<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4">
						<p class="text-gray-600 dark:text-gray-400">Cargando perfil..</p>
					</div>
				</div>
			</div>
					<!-- estado de errror -->
			<div v-else class="flex items-center justify-center min-h-screen">
				<div class="text-center">
					<svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>  <!-- lleva clausura ('/') -->
					</svg>
				</div>
			</div>
		</Transition>
	</main>
</template>
	
<script setup lang="ts">
	import {computed} from 'vue';
	import {storeToRefs } from 'pinia'
	import  {useAuthStore3} from '@/stores/authStore3.ts';
	import {useProfileStore} from '@/stores/profileStore';
	import WelcomeUsersF from '@/components/main/WelcomeUsersF.vue';

   	// ══════════════════════════════════
    // 		STORE
    // ══════════════════════════════════
    const authStore = useAuthStore3();
    const profileStr3 = useProfileStore();

    const {isAuthenticated, userProfile} = storeToRefs(useAuthStore3);
    const {profile} = storeToRefs(profileStr3);

    // ═════════════════════════════════════
    //		  COMPUTADO
    // ═════════════════════════════════════
    const isLoading = computed(()=> {
    	isAuthenticated && isProfileTeacher;
    });

    const isTeacher = computed( () => {
    	return isProfileTeacher.value?.role === 'profesor';
    });

    //
</script>

<style scoped lang="css">
	.fade-slide-enter-active,
 	.fade-slide-leave-active {
 		transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
 	}

 	.fade-slide-from {
 		opacity: 0;
 		transform: translateY(-30px);
	}

	.fade-slide-leave-to {
		opacity: 0;
		transform: translateY(20px);
	}
</style>