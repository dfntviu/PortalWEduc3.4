 <template>
 	 <!-- 
 	 @componet LayoutProfesor.vue
 	 @description Es el layout simplificado para vistas de Profesores
 	 @note La navegación ahora está optimizad por LayoutNavBar.vue en el script base -> App.vue -->
 	<div class="layout-teacher">
 		<div class="layout-content">
 			<RouterView/>
 		</div>
 	</div>
 </template>

 <script setup lang="ts">
 	
 </script>
 
 <style scoped>
 	.layout-teacher{
 		width: 100%;
 		min-height: calc(100vh - 200px); /** Ajuste con respecto a la altunar del navbar **/
 	}
 	.layout-content{
 		width: 100%;
 		max-width: 1400px;
 		margin: 0 auto;
 		padding: 2rem;
 		animation: fadeIn 0.3s ease-in-out;
 	}

 	 @media (max-width: 768px); {
 	 	.layout-content{
 			padding: 1rem;
 		}
 	 }

 	 @keyframes fadeIn {
 	 	from{
 	 	  opacity: 0;
 	 	  transform: translateY(10px);
 	 	}
 	 	to{
 	 		 opacity: 1;
 	 	  transform: translateY(0px);
 	 	}
 	 }
 </style>