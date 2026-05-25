<!-- Servicio implementado su proposito es fungir como fuente de
estatidisticas rapida generlal de todo el sistema
para que el profesor posea un panorama global de todo el sistema -->
<template>
	<div class="teacher-stats-wrapper">
		
		<!-- Saludo animado -->
		<span class="teacher-name-anim"> {{profile?.nombre}} </span>
		<span> {{profile?.area}} </span>

		<!-- metricas -->
		<p> {{dashboardTotalStudents}} </p>

		<!-- Rec. de Materiales por Alumno -->
		<div v-for="[codigo,total] in Object.entries(dashboardCarrerBreakdown)" :key="codigo">
			<span>{{ codigo}} </span>
			<span>{{ total}} </span>
		</div>

		<div v-for="[uid,total] in Object.entries(dashboardMaterialsPerStudent)" :key="uid" >
			<span>{ uid.slice(0,7)}</span>
			<span>{{ cantidad}} subidos</span>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineOptions({inheritAttrs: false});
	
	defineProps <{
		role?:'teacher' | 'student'
	} >();
	
	console.log('Leyendo el Componente p/Bienvenida Profesores...');

	// -- Declaracion de librerias --
	import {/*onMounted,*/watch} from 'vue';
	import {storeToRefs} from 'pinia';
	import {useModerationStore} from '@/stores/moderationStore';
	import {useProfileStore} from '@/stores/profileStore';

	import { useAuthStore3 }      from '@/stores/authStore3';  

	// -- Recebir los metodos para orquestar la bienvenida --

		const authStore3      = useAuthStore3();
	 	const moderationStore = useModerationStore();
	 	const profileStore    = useProfileStore();
	 	// Destructurar de Store Base(AuthService)
	 	const { uid_auth } = storeToRefs(authStore3); 

	 // --  Referenciando a las metricas generales
	 	const  {
	 		dashboardTotalStudents,
	 		dashboardCarrerBreakdown,
	 		dashboardMaterialsPerStudent,
	 		isLoading,
	 		moderationErrorMessage
	 	} = storeToRefs(moderationStore);

	 	// -- iniciar el estado del perfil --
	 const { profile} = storeToRefs(profileStore);

	// -- Ciclo de Montaje de la carga de Datos Generales del Portal --
	watch(uid_auth, async (uid) => {
   	 if (!uid) return;
    	await moderationStore.loadDashboardStats();
	}, { immediate: true });

	/*onMounted(async ()=> {
		 await moderationStore.loadDashboardStats();
	});*/
</script>

<style scoped>
	/* |-- Estilos para carga la animacion de Entrada(FullName of teacher) --|*/
	@keyframes teacherSequence {
		0%   { transform: rotate(0deg)   translateY(0)     translateX(0);    clip-path: inset(0 0 0% 0);  }
		18%  { transform: rotate(360deg) translateY(0)     translateX(0);    clip-path: inset(0 0 0% 0);  }
		32%  { transform: rotate(360deg) translateY(18px)  translateX(0);    clip-path: inset(0 0 0% 0);  }
		46%  { transform: rotate(360deg) translateY(-12px) translateX(0);    clip-path: inset(0 0 0% 0);  }
		68%  { transform: rotate(360deg) translateY(0)     translateX(0);    clip-path: inset(0 0 50% 0); }
		82%  { transform: rotate(0deg)   translateY(-28px) translateX(-80px); clip-path: inset(0 0 50% 0); }
		100% { transform: rotate(0deg)   translateY(0)     translateX(0);    clip-path: inset(0 0 0% 0);  }
	}

	.teacher-name-anim{
		display: inline-block;
		animation: teacherSequence 3.2s cubic-bezier(0.4, 0.2, 1) 0.6s both;
	}
</style>