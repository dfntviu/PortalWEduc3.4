 <script setup lang="ts">
	import { ref, computed, watch, onUnmounted } from 'vue';
	import {storeToRefs} from 'pinia';
	import { useStatisticsAdmStore } from '@/stores/statisticsAdmStore.ts'; 
	import { useAuthStore3 } from '@/stores/authStore3.ts';

	// ════════════════════════════════════════════════
  //  STORES
  // ════════════════════════════════════════════════
  // console.log('Leyendo correctamente la vista.');
 const  authStore = useAuthStore3();
 console.log('Vista corrriendo satisfactoriamente..');
 	// Proviene de Auth, sol mediante authStore lleva uid_auth consigo
 const {currentUser} = storeToRefs(authStore);
 // console.log('Que tengo? ', currentUser.value);

 const statsStore = useStatisticsAdmStore();
 console.log('[Almacen-Estadistícas]:',statsStore);
 // console.log('Error corregido correctamente..');
   // Nunca llega a la f(n) _startLoading, ni idea.
	// ════════════════════════════════════════════════════════
	//  ESTADO LOCAL — Solo UI State puro, nada de negocio
	// ════════════════════════════════════════════════════════
 /** Control del modo visual glassmorphism  de la vista*/
 const modoGlass = ref<boolean>(false);
	// ═══════════════════════════════════════════════
	//  COMPUTED
	// ═══════════════════════════════════════════════
	  /**
  * Formates el timestamp de la ultima actualizacion para mostrar el pie de pag.
  * Devuelve una string legible en espaniol o vacio si no hay datos
  * */	
    const formLastFetch = computed<string> ( () => {
   	 if(!statsStore.lastFetch) return '';
 	   return statsStore.lastFetch.toLocaleTimeString('es-MX', {
 	 	  hour: '2-digit',
 	 	  minute: '2-digit',
 	   	second: '2-digit',
 	   });
    });
    console.log('contenido de Carga:' , statsStore.loading);
	// ════════════════════════════════════════════════
	//  MÉTODOS
	// ════════════════════════════════════════════════
  /**
   *  Handler del boton actualizar
   * Delega el store forzando invalidacion del cache
   * Precondicion - Requiere que el usuario este autenticado. 
   * */
	async function controllRefresh(): Promise <void> {
		const profesorId = authStore.currentUser?.uid;
			if (!profesorId) return;
			 await	statsStore.refresh(profesorId);
	} 
	/**
	 * Alterna el modo visual entre glassmorphism  y solido
	 * Estado local puro - no persiste entre sesiones.*/
	function toggleGlass(): void {
		modoGlass.value = !modoGlass.value;
	}
	/**
	 * Carga inicial de todas las metricas en paralelo.
	 * El store respeta el cache, no recarga con los datos recientes
	 * */
	watch(
  () => currentUser.value?.uid,
  async (uid) => {
    console.log('[AdminStats] watch uid →', uid);
    if (!uid) return;
    await statsStore.loadAll(uid);
    console.log('[AdminStats] post-loadAll error →', statsStore.error);
    console.log('[AdminStats] adminMetrics →', statsStore.adminMetrics);   
console.log('[AdminStats] teacherMetrics →', statsStore.teacherMetrics); 
console.log('[AdminStats] dailySummary →', statsStore.dailySummary);   
  },
  { immediate: true }
);

	/**
	 * limpieza al desmontar.
	 * Resetea el store para evitar estados obsoletos en proxima visita. 
	 * */
	onUnmounted(() => {
		statsStore.resetState();
	});
 </script>

<template>
			<!-- <div class="stats-header" > -->
	<main class="stats-root min-h-screen" :class="modoGlass ? 'stats-root--glass' :  'stats-root--solid'">
		<div class="stats-wrapper">
			
			<header class="stats-header"  role="banner">
				<div class="stats-header__text">
				<h1 class="stats-header__tittle">
					<span class="stats-header__icon" aria-hidden="true"> 📊 </span>
					   Estadistícas del Sistema
				</h1>
					<p class="stats-header__subtitle">
					  	Métricas Globales - Materiales - Usuarios
					</p>
			</div>

				<div class="stats-header__controls" role="toolbar" aria-label="Controles del panel">
					<button
						@click="controllRefresh"
						:disabled="statsStore.loading"
						class="btn--ghost"
						aria-label="Actualizar Estadistícas"
						title="Actualizar" 
						>
							<span :class="['btn__icon', statsStore.loading && 'btn__icon--spin'] " aria-hidden="true">🔄️</span>
							<span class="btn__label">Actualizar</span>
				   </button>

				   <!-- Animacion glassmorphism  -->
				    <button
						@click="toggleGlass"
					  class="btn btn--ghost"
					  :aria-pressed="modoGlass"
					  aria-label="Alternar modo visual"
		          	>
						<span aria-hidden="true">{{ modoGlass ? '🌑' : '🔆' }}</span>
						<span class="btn__label">{{ modoGlass ? 'Sólido' : 'Glass' }}</span>
		          </button>
				</div>
			</header>
			<!-- ─    ALERTA DE ERROR ─────────────────────────────── -->
			<Transition name="fade-down">
				<div  v-if="statsStore.hasError"
				  class="stats-alert"
				  role="alert"
				  aria-live="assertive"
				  >
						<span class="stats-alert__message">{{statsStore.error}}</span>
				 		<button  @click="statsStore.clearError()"
				 		class="stats-alert__close"
				 		aria-label="Cerrar alerta">✕</button>
				</div>
			</Transition>

			 <!-- ─── ESTADOS ABS EXCLUYENTES ──────────────────────────────── -->
			 <Transition>
			 	<section
			 	v-if="statsStore.loading" key="loading" class="stats-state" role="status" aria-label="Cargando Estadistícas">
			 		<div class="stats-state__loader">
			 			<div class="loader-ring"></div>
			 			<p class="stats-state_msg">Cargando Métricas del Portal..</p>
			 		</div>
			 	</section>
			 	<!-- ------------------------------------------------ -->
			 	<!--  		BLOQUE-1 USUARIO						 -->
			 	<!-- ------------------------------------------------ -->
			 	<section 
			 	 v-else-if="statsStore.hasAdminMetrics"
			 	 key="data"
			 	 class="stats-content"
			 	 aria-label="Métricas del Portal Edu.">
			 		<article class="stats-block">
			 			<h2 class="users-heading"><span>👥</span> Usuarios
			 			</h2>

			 			<div class="stats-grid stats-grid--4">
			 				<div class="stats-card stat-card__total">
			 					<span class="stats-card__label">Total de Usuarios</span>
			 					<span class="stats-card__value">{{(statsStore.adminMetrics?.totalStudents ?? 0) + (statsStore.adminMetrics?.totalTeachers ?? 0)}}</span>
			 				</div>

				 			<div class="stats-card stats-card--total">
				 					<span class="stats-card__value">
				 					   {{statsStore.adminMetrics?.totalStudents ?? 0}}</span>
				 					<span class="stats-card__label">🎓Estudiantes</span>
				 			</div>

				 			<div class="stat-card">
				 				<span class="stats-card__value">
				 					{{statsStore.adminMetrics?.totalTeachers ?? 0}}</span>
				 				<span class="stats-card__label">🏫 Profesores</span>
				 			</div>
			 		 	</div>
			 		</article>
			 		<!-- +----------------------------------------------+-->
			 		<!-- 	BLOQUE 2 -  MATERIALES GLOBALES 			 -->
			 		 <!-- +----------------------------------------------+ -->
			 		 <article class="stats-block">
			 		 	<h2 id="material-heading" class="stats-block__title"><span>📁</span>
			 		 	  Materiales 
			 		    </h2>
			 		    <div class="stats-grid stats-grid--4">
				 		    <div class="stats-grid stats-card--total">
				 		     	 <span class="stats-card__label">Total: </span>
				 		    	 <span class="stats-card__value">
				 		    	 	 {{statsStore.adminMetrics?.totalMaterials ?? 0}}
				 		     	</span>
				 		    </div>

				 		    <div class="stats-card stats-card--approved">
				 		    	<span class="stats-card__value">
				 		    		{{statsStore.adminMetrics?.materialsApproved ?? 0}}
				 		        </span>
				 		    	<span class="stats-card__label">✅ Aprobados: </span>
				 		     	 <span class="stats-card__rate">{{statsStore.approvalRate}}%</span>
				 			</div>

				 			<div class="stat-card stat-card--rejected">
				 				 <span class="stats-card__value"> {{statsStore.adminMetrics?.materialsRejected ?? 0}} </span>
				 				<span class="stats-card__label">❌ Rechazados: </span>
				 				<span class="stats-card__rate">{{statsStore.rejectionRate}}%</span>
				 		 	</div>

				 		 	<div class="stat-card stat-card--pending">
				 				 <span class="stats-card__value"> 
				 				   {{statsStore.adminMetrics?.materialsPending ?? 0}}
				 				 </span>
				 				<span class="stats-card__label">⌛ Pendientes: </span>
				 				<span class="stats-card__rate">{{statsStore.pendingRate}}%</span>
				 		 	</div>
						</div>


						<!-- Barra de Progreso -->
						<div class="stat-progress">
							<div class="stats-progress stats-progress__bar--approved"  
								:style="{width : `${statsStore.approvalRate}%`}">
							</div>
							<div class="stats-progress__bar stats-progress__bar--rejected" 
								:style="{width : `${statsStore.rejectionRate}%`}">
							</div>
							<div class="stats-progress__bar--pending" 
								:style="{width : `${statsStore.pendingRate}%`}">
							</div>
						</div>
			 		 </article>
			 					 <!-- +----------------------------------------------+
								|   BLOQUE 3 — MÉTRICAS DE PROFESOR            |
								+----------------------------------------------+ -->
					<article
						v-if="statsStore.adminMetrics"
						class="stats-block"
						aria-labelledby="teacher-heading"
					>
						<h2  id="teacher-heading" class="stats-block__title">
							<span>🏫</span>
							Vista del Profesor
						</h2>
						
						<div class="stats-grid stats-grid--3">
							<div class="stats-card">
								<span class="stats-card__value">{{statsStore.teacherMetrics?.pendingReview ?? 0}}</span>
								<span class="stats-card__label"> 🔎En revisión</span>
							</div>
							<div class="stats-card">
								<span class="stats-card__value">{{statsStore.teacherMetrics?.pendingReview ?? 0}}</span>
								<span class="stats-card__label"> ⌛Pendientes</span>
							</div>
							<div class="stats-card">
								<span class="stats-card__value">{{statsStore.teacherMetrics?.rejectedCommentsCount ?? 0}}</span>
								<span class="stats-card__label"> 💬Comentarios</span>
							</div>
						</div>
					</article>
						 <!-- +----------------------------------------------+
								|   BLOQUE 4 — RESUEN DEL DIA            |
								+----------------------------------------------+ -->
					<article  
					  v-if="statsStore.dailySummary"
					   class="stats-block stats-block--accent"
					   arial-labelledby="daily-heading"
					   >
						<h2 id="daily-heading" class="stats-block__tittle">
							<span aria-hidden="true">📆</span> Actividad de Hoy
						</h2>
						<div class="stats-daily">
							<div class="stats-daily__date">{{statsStore.dailySummary.date}}</div>
							<div class="stats-daily__count">
								<span class="stats-card__value">
									{{statsStore.activitiesCount}} 
								</span>
								<span class="stats-card__label">Actividades Registradas</span>
							</div>
						</div>
					</article>

					<!-- Timestamp de la ultima actualizacion -->

					<footer class="stats-footer" aria-label="Informacion de actualizacion">
						<time v-if="statsStore.lastFetch" 
						 class="stats-footer__timestamp"
						 :datetime="statsStore.lastFetch.toISOString()"
						 >
						 	Actualizando: {{formLastFetch}}
						 </time>
					</footer>
			 	</section>
			 	<!--  Estado vacio -->
			 	<section v-else
			 	 key="empty"
			 	 class="stats-state"
			 	 role="status"
			 	 aria-label="Sin datos disponibles">
			 		<div class="stats-state__empty">
			 			<span class="stats-state__icon">📭</span>
			 			<h3 class="stats-state__title">Sin datos disponibles</h3>
			 				<p class="stats-state__msg">Error,No se pudieron cargar las Estadísticas del Sistema.</p>
			 				<button click="controllRefresh" class="btn btn--primary">
			 				 Reintentar
			 				</button>
			 		</div>
			 	</section>
			 
			 </Transition>
		</div>
	</main>
</template>

<style scoped>
		/*──────────────────────────────────────────────────────
				VARIABLES LOCALES
		──────────────────────────────────────────────────────*/
		:root {
			--amber-50: #fffbeb;
			--amber-100: #fef3c7;
			--amber-400: #fbbf24;
			--amber-500: #f59e0b;
			--amber-600: #f59e0b;
			--amber-700: #b45309;
			--amber-500: #22c55e;
			--red-500: #ef4444;
			--slate-50: #f8fafc;
			--slate-100: #f1f5f9;
			--slate-200: #e2e8f0;
			--slate-600: #475569;
			--slate-700: #334115;
			--slate-800: #1e293b;
			--slate-900: #0f172a;
		}

		.stats-root-solid {
			background: linear-gradient(135deg, var(--amber-50) 0%, var(--slate-100) 100%);
		}

		.stats-root-glass {
			background: linear-gradient(135deg, var(--amber-50) 0%, var(--slate-100) 100%);
		}

		.stats-root-wrapper {
			max-width: 1200px;
			margin: 0 auto;
			padding: 2rem 1.5rem;
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.stats-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 1rem;
			padding: 1.5rem 2rem;
			background: white;
			border-radius: 1rem;
			border-left: 4px solid var(--amber-500);
			box-shadow: 0 1px 8px rgba(0, 0, 0, .08);
		}

		.stats-root--glass .stats-header {
			background:  rgba(255, 255, 255, 0.6);
			border-left-color: var(--amber-400);
		}

		.stats-header___icon {
			font-size: 1.5rem;
			margin-right: .5rem;
		}

		.stats-header__subtitle{
			font-size: .875rem;
			color: 	var(--slate-600);
			margin: .25rem 0 0;
		}

		.stats-root--glass .stats-header__subtitle { color:#94a3b8;}

		.stats-header__controls {
			display:  flex;
			gap: .75rem;
		}

		/*──────────────────────────────────────────────────────*/
		/*			BOTONES				*/
		/*──────────────────────────────────────────────────────*/
		.btn {
			display: flex;
			align-items: center;
			gap:  4rem;
			padding: .5rem 1rem;
			border-radius: .5rem;
			font-size: .875rem;
			font-weight: 500;
			cursor: pointer;
			transition:  all .2s ease;
			border: none;
		}
		
		.btn:disabled { opacity:.5; cursor: not-allowed; }

		.btn--ghost {
			background: var(--slate-100);
			color: var(--slate-700);
		}

		.btn--ghost:hover:not(:disabled) {
			background: var(--amber-100);
			color: var(--amber-700);
		}

		.stats-root--glass .btn--ghost {
			background: rgba(255, 255, 255, .1);
			color: #e2e8f0;
		}

		.btn--primary {
			background: var(--amber-500);
			color: white;
		}

		.btn--primary:hover { background: var(--amber-600); }

		.btn_icon { font-size: 1rem; }
		.btn__icon--spin { animation: spin .8s linear infinite; }

		/**
		 * ────────────────────────────────
		 *		ALERTA ERROR
		 * ────────────────────────────────*/

		.stats-alert {
			display: flex;
			align-items: center;
			gap: .75rem;
			padding: .875rem 1.25rem;
			background:  #fef2f2;
			border-left: 4px solid var(--red-500);
			border-radius: .5rem;
			color: #991b1b;
			font-size: .9rem;
		}
		
		.stats-alert____message {
			flex: 1; margin: 0;
		}

		.stats-alert__close {
			background: none;
			border: none;
			cursor: pointer;
			font-size: 1rem;
			color: #991b1b;
			padding: .24rem;
			border-radius: .25rem;
		}

		/*────────────────────────────────*/

		/*────────────────────────────────*/
		.stats-state {
			min-height: 20rem;
			display: flex;
			align-items: center;
			justify-content:  center;
			 background: white;
			 border-radius: 1rem;
			 box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
		}

		.stats-state__loader, 
		 .stats-state__empty {
		 	display: flex;
		 	flex-direction: column;
		 	align-items:  center;
		 	gap: 1rem;
		 	 text-align: center;
		 }

		.loader-ring {
			width: 3.5rem;
			height: 3.5rem;
			border:  4px solid var(--amber-100);
			border-top-color:  var(--amber-500);
			border-radius: 50%;
			animation:  spin .8s linear infinite;
		}

		.stats-state__icon { font-size: 3.5rem; }
		.stats-state__title { font-size:1.25rem;  font-weight: 600; margin: 0;}
		.stats-state__msg {color: var(--slate-600); margin: 0; }
		
		/*────────────────────────────────*/
		/*		BLOQUES DE CONTENIDO	  */
		/*────────────────────────────────*/
		.stats-content {
			display: flex;
			flex-direction: column;
			gap: 1.25rem;
		}


		.stats-block {
			background: white;
			border-radius: 1rem;
			padding: 1.5rem;
			box-shadow: 0 1px 8px rgba(0, 0, 0, .08);
			animation: slide-up .4s ease both;
		}

		.stats-block--accent {
			border-left: 4px solid var(--amber-500);
		}

		.stats-block__title{
			font-size: 1.1rem;
			font-weight: 600;
			color: var(--slate-700);
			margin: 0 0 1.125rem;
			display: flex;
			align-items: center;
			gap: .5rem;
		}

		.stats-root--glass .stats-block__title { color: #e2e8f0; }

		.stats-grid--3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.75rem;
}
	 /*Los materiales aprobados y el total de profesores, no se muestra exactamente
	 alineados que los elementos seguidos (sus datos son crorrectos)*/
	.stats-grid--4 {
	  display: grid;
	  grid-template-columns: repeat(4, 1fr);
	  gap: 1rem;
	  margin-top: 0.75rem;
	}
	
	.stats-grid--2 {
	  display: grid;
	  grid-template-columns: repeat(4, 1fr);
	  gap: 1rem;
	  margin-top: 0.75rem;
	}

	.stats-card {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  gap: 0.25rem;
	  padding: 1rem 0.5rem;
	  background: rgba(255, 255, 255, 0.05);
	  border-radius: 0.5rem;
	  min-height: 80px;
	}

.stats-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

	.stats-card__label {
	  font-size: 0.75rem;
	  opacity: 0.7;
	  text-align: center;
	}
	.stats-card__rate {
	  font-size: 0.7rem;
	  opacity: 0.6;
	  line-height: 1;
	}
		/*────────────────────────────────
		*/

		/*.stats-grid-3  { grid-template-rows:  repeat(3, 1fr);}
		.stats-grid-4  { grid-template-columns: repeat(4, 1fr); }*/

		@media (max-width: 768px){
			.stats-grid-3, .stats-grid-4 { grid-template-columns: repeat(2, 1fr); }
		}

		@media (max-width: 480px){
			.stats-grid-3, .stats-grid-4 { grid-template-columns: 1fr}
		}

</style>