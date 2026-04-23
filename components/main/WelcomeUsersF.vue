<template>
	<!-- ════════════════════════════════════════ -->
  	<!-- 		WELCOME CONTAINER 				  -->
  	<!-- ════════════════════════════════════════ -->

  	<div class="welcome-container p-8 max-w-7xl mx-auto">
  		  <!-- ──────────────────────────────────────── -->
  		  <!-- 			Welcome Message	 				-->
  		  <!-- ──────────────────────────────────────── -->
  		<Transition name="fade-slide" mode="out-in">
  			<div v-if="profile && profile.name && profile.apellido" class="welcome-message">
  				<header class="welcome-header">
  					<h2 class="welcome-title">
  					   Bienvenido: {{profile.name}} {{profile.apellido}}
  					</h2>
  					<p class="career-text role-text"> 
  					  {{profile.role}} {{profile.apellido}}
  					</p>
  				</header>

  				<button  @click="openReport" 
  				   class="mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl 
  				   transition-all duration-300 flex items-center gap-2 mx-auto">
  					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
  						<path 
  						  stroke-linecap="round"
  						  stroke-linejoin="round"
  						  stroke-width="2"
  						  d="M19 19v-6a2 2 0 00-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2v10m-6 012-2ha2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2ha2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
  						   </path>
  					</svg>
  					 Ver Reporte de Materiales
  				</button>
  			</div>
  		</Transition>

  		 <!-- ══════════════════════════════ -->
  		 <!-- 		Report Modal     		-->
	     <!-- ══════════════════════════════ -->

  		<ReportSummaryModal
  		  :is-open="showReport"
  		  :role="profile?.role || 'alumno' "
  		  :user-id="showReport = false"
  		  @minimize="handleMinimize"
  		/>

  	</div>

</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import {storeToRefs} from 'pinia'; 
	import {useAuthStore3}  from '@/stores/authStore3.ts'
	import ReporteSummaryModal from '@/components/ReporteSummaryModal.vue';

	// ═════════════════════════════════════════
	// 		STORE
	// ═════════════════════════════════════════
	const authStore = useAuthStore3();
	const { profile, userId } = storeToRefs(useAuthStore3);

	// ═════════════════════════════════════════
	// 		  STATE
	// ═════════════════════════════════════════
	const showReport = ref(false);

	// ══════════════════════════════════════════
	//		   METHODS
	// ══════════════════════════════════════════

	function openReport() {
		showReport.value = true;
	} 

	function handleMinimize(isMinimized: boolean){
		console.log('El modal esta minimizado:', isMinimized);

	}

</script>
 <style scoped>
 	  /* ════════════════════════════════*/
 	  /*    TRANSITIONS					 */
 	  /* ════════════════════════════════*/
 	 .fade-slide-enter-active,
 	 .fade-slide-leave-active {
 	 	 transition: all 0.4s cubic-bezier(0.4, 0, 0.2,1);
 	 }

 	.fade-slide-enter-from {
 		opacity: 0;
 		transform: translateY(-20px);
 	}

 	.fade-slide-leave-to {
 	 	opacity: 0;
 	 	transform: translateY(20px);
 	}

 </style>