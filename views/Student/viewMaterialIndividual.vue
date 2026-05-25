<template>
	<main class="materials-catalog-view">
		<header class="catalog-header">
			<div class="header-content">
				<h1 class="main-title">Mís Materiales...</h1>
				<p v-if="studentInfo" class="student-welcome">
					Bienvenido, <strong>{{studentInfo.fullName}}</strong>
					<span class="student-id"></span>
				</p>
			</div>
			<!-- Tarjetas Estads -->
			<div class="stats-grid">
				<article class="stats-card">
				  <span class="stat-icon">📚</span>
					<div class="stat-content">
						<p class="stat-value"> {{totalMaterials}} </p>
						<p class="stat-label"> Todos los Materiales</p>
					</div>
				</article>
				<article class="stat-card">
					<span class="stat-icon">📅</span>
					<div class="stat-content">
						<p class="stat-value"> {{recentMaterialsCount}}</p>
						<p class="stat-label"> Materiales Recientes - Últimos 7 días</p>
					</div>
				</article>
				<article class="stat-card">
					<span class="stat-icon">💾</span>
					<div class="stat-content">
						<p class="stat-value"> {{totalFileSizeFormatted}}</p>
						<p class="stat-label"> El espacio esta usado</p>
					</div>
				</article>
			</div>
		</header>
			<!-- ══════════════════════════════════════ -->
			<!-- 		FILTROS Y SECCION DE BUSQUEDA   -->
			<!-- ══════════════════════════════════════ -->
		<section class="filters-section">
			<div class="search-container">
					<label for="" class="src-only">Buscar Materiales</label>
				<input type="text" v-model="searchQuery" 
					class="search-input" placeholder="Buscar por nombre de material..."
					@input="handleSearch"/>
			</div>
			<!--los tags inputs compuestos deberan dejar indicado el cierre -->
			<div class="filters-container">
				<div class="filter-group">
					<label for="sort-select" class="filter-label">Ordenar por:</label>
					<select id="sort-select" v-model="sortBy"
						class="filter-select" @change="handleSortChange">
						<option value="recent">Más Recientes</option>
						<option value="oldest">Más AntigÜos</option>
						<option value="name-asc">Nombres(A-Z) </option>
						<option value="name-desc">Nombres(Z-A)</option>
					</select>
				</div>
				<button	v-if="hasFilters"	@click="handleClearFilters"
					class="clear-filter-btn" type="button">Limpiar Filtros
				</button>
			</div>
			<!--===========================================================================
						Materiales Recientes (6-8 Horas)
						Destaca visualmente los materiales subidos recientemente
						Solo se muestra si hay materiales en las ultimas 6-8 horas
				===========================================================================-->
			<Transition name="slide-down">
				<div v-if="hasRecentUploads" class="recent-uploads-section">
					<!-- Header de la seccion  -->
					<div class="recent-upload-header">
						<h3 class="recent-uploads-title">
							⚡ Subidos Recientemente
							<span class="recent-uploads-count">
								({{recentUploads.length}})
							</span>
						</h3>
						<p class="recent-uploads-subtitle">
								Materiales de las últimas {{RECENT_HOURS}} horas
						</p>
					</div>
				
				<!--Grid_de_cards_con_materiales_recientes-->
				<!--Cada_card_tendra_ensombrado_amarillo_p-destacar-->
				<div class="recent-uploads-grid">
					<TransitionGroup name="stagger-fade">
						<article
							v-for="(material, index) in recentUploads"
							:key="material.id_material"
							class="recent-upload-card"
							:style="{transitionDelay: `${index * 50}ms`}"
							@click="handleViewMaterial(material)">
							<!--Indicador visual VIEW-->
							<span class="new-badge">Nuevo</span>
									<!--Icono y nombre del Material-->
								<div class="recent-card-content">
										<span class="recent-card-icon">📄</span>
										<div class="recent-card-info">
											<p class="recent-card-name">{{material.nombre_material}}</p>
											<p class="recent-card-time">
												{{formatearFechaRelativa(material.fechaSubida)}}
											</p>
										</div>
								</div>
									<!--Botones_de_accion_rapida-->
				 				<div class="recent-card-actions">
									<button	@click.stop="handleViewMaterial(material)"
										class="quick-action-btn view" type="button"
										:aria-label="`Ver ${material.nombre_material}`"
										title="Ver">
										👁️
									</button>
									<button  @click.stop="handleDownloadMaterial(material)"
										class="quick-action-btn download"
										type="button"
										:aria-label="`Descargar ${material.nombre_material}`"
										title="Descargar">
											✏️
									</button>
								</div>
						</article>
						</TransitionGroup>
					</div>
				</div>
			</Transition>
		</section>
			<!--==================================================-->
					<!--TABLA_DE_MATERIALES-->
					<!--Tabla_principal_con_todos_los-materiales-->
			<!--==================================================-->
		<section class="materials-section" aria-label="lista de materiales">
				<!--Carga de Estado-->
			<Transition name="fade" mode="out-in">
					<!--Estado:Cargando-->
				<div	v-if="isLoading" key="loading" class="state-container">
					<div class="spinner" aria-label="Cargando Materiales"></div>
					<p class="state-message">Cargando tus Materiales..</p>
				</div>
				<!--Estado de Error-->
				<div  v-else-if="hasError" class="state-container error">
					<span class="state-icon">⚠️</span>
					<p class="stat-message"> {{errorMessage}}</p>
					<button @click="handleRetry" class="retry-btn">
					Reintentar</button>
				</div>
				<!--Estado:_No_hay_materiales-->
				<div v-else-if="isEmpty" key="empty" class="state-container empty">
					<span class="state-icon">📭</span>
					<p class="state-message">
							{{searchQuery ? 'Error: No se encontraron materiales' : 'Aún, no tienes Materiales en tú Sesión'}}
					</p>
					<p v-if="!searchQuery" class="state-hint">
						Los materiales que se suban, aquí se mostrarán aquí
					</p>
				</div>
				<!--Edo:_Tabla_con-Materiales-->
				<div v-else key="content" class="table-container">
					<table class="materials-table" role="table"> 
						<thead>
							<tr>
								<th scope="col">Material</th>
								<th scope="col">Fecha de Subida</th>
								<th scope="col">Tamaño</th>
								<th scope="col">Estado</th>
								<th scope="col">Acciones</th>
							</tr>
						</thead>
						<TransitionGroup name="table-row" tag="tbody">
							<tr v-for="material in paginacionMateriales" :key="material.id_material" class="material-row">
								<td class="material-name-cell">
									<div class="material-info">
										<span class="material-icon">📄</span>
										<!--<div class="material-icon">-->
										<div class="material-details">
											<p class="material-name"> {{material.nombre_material}} </p>
											<p class="material-id">ID: {{material.id_material}} </p>
										</div>
									</div>
								</td>
									<td class="date-cell">
										<time :datetime=" new Date(material.fechaSubida).toISOString()">
											{{formatearFecha(material.fechaSubida)}}
										</time>
									</td>
									
									<td class="size-cell">
											{{formatFileSize(material.size)}}	
									</td>

									<td class="status-cell">
										<span :class="['status-badge',`status-${material.status || 'pending'}`]">
											{{getStatusLabel(material.status)}}
										</span>
									</td>
									
									<td class="actions-cell">
										<div class="actions-button">
											<button
													@click="handleViewMaterial(material)"
												class="action-btn view"
												type="button"
												:aria-label="`Ver: ${material.nombre_material}`"
												title="Ver Material"
												>
													👁️
											</button>
											<button
												@click="handleDownloadMaterial(material)"
												class="action-btn downlonad"
												type="button"
												:aria-label="`Descargando.. ${material.nombre_material}`"
												title="Descargar Material"
												:disabled="isDownloading === material.id_material"
											>
												{{isDownloading === material.id_material ? '⏳' : '⬇️'}} 
											</button>
										</div>
									</td><!--/td_composed_more-->
							</tr>
						</TransitionGroup>
					</table>

					<!-- Paginacion:_Materiales_Individuales -->
					<nav v-if="totalPages>1" class="pagination" aria-label="Paginación">
						<button @click="handlePreviousPage" :disabled="currentPage===1"
							class="pagination-btn" type="button" aria-label="Pag. Anterior" >⬅️Anterior</button>
						
						<div class="pagination-info">
							Página {{currentPage}} de {{totalPages}}
							({{filteredMaterials.length}} materiales)
						</div>

						<button @click="handleNextPage" :disabled="currentPage===totalPages"
							class="pagination-btn" type="button" aria-label="Pag. Siguiente">Siguiente➡️</button>
					</nav>
				</div>
			</Transition>
		</section>

		<!--NVA SECCION: Historial de Subidas (6 meses)-->
		<!-- Timeline cronologico de todos los materiales subidos-->
		<!--Agrupados por mes con scroll vertical-->
			<!--Jan/31/2026-->
		<Transition>
			<section class="upload-history-section">
				<header class="history-header">
					<h2 class="history tittle">📜Historial de Subidas</h2>
					<span class="history-subtitle">Últ.6 meses</span>
					<p class="history-description">Cronología completa de tus materiales subidos</p>
				</header>
				<!--In building....-->
			</section>
		</Transition>
			 <!-- ════════════════════════════════════ -->
			 <!--     MATERIAL VIEWER MODAL
				Muestra el material  en un iframe con navegacion prev/next-->
			 <!-- ════════════════════════════════════ -->
		<Teleport to="body" :disabled="!isUnmounting">
			<Transition>
				<div v-if="isModalOpen"  class="modal-overlay" @click.self="materialStore.closeMaterialModal()"
						role="dialog" arial-modal="true" aria-labelledby="viewer-title">
					<article class="modal-viewer">
						<header class="viewer-header">
							<h2 class="viewer-title">
								{{selectedMaterial?.nombre_material}}
							</h2>
							<button
								@click="handleCloseViewer"  class="modal-close"	type="button" aria-label="Cerrar Visor">
								✕</button>
						</header>
						<div class="viewer-content">
							<iframe  v-if="previewMaterial"
							:src="previewMaterial" class="pdf-viewer" title="Visor PDF"></iframe>
							<div  v-else class="viewer-placeholder">
								<p>No fue posible, cargar el material.</p>
							</div>
						</div>

						<footer class="viewer-actions">
							<button @click="handleDownloadMaterial(selectedMaterial)" class="viewer-btn downlonad" 
								type="button"> ⬇️ Descargar</button>
							<button @click="materialStore.closeMaterialModal()" class="viewer-btn cancel" type="button">
								Cerrar
							</button>
						</footer>
					</article>
				</div>
			</Transition>
		</Teleport>

		<!--════════════════════════════════════-->
		<!--     NOTIFICATIONS	     -->
		<!--════════════════════════════════════-->
		<Teleport to="body" >
			<TransitionGroup  tag="div" class="notificacions-container"	
			  v-if="activeNotifications.length > 0">
				<article
					v-for="notification in activeNotifications"
					:key="notification.id"
					:class="['notification', `notification-${notification.type}`]"
					:role="alert"
					:aria-live="notification.type === 'error' ? 'assertive' : 'polite' "
				>
					<span class="notificacion-icon">{{notification.icon}} </span>
					<p class="notificacion-message">{{notification.message}}</p>
					<button class="notificacion-close"
							@click="handleCloseNotification(notification.id)"
							type="button"
							aria-label="Cerrar Notificación"
					>
							✕
					</button>
					<!-- ** Btn Notificaciones  ** -->
					<button @click="handleCloseNotification(notification.id)"> Guardar</button>
				</article>
			</TransitionGroup>
		</Teleport>
	</main>
</template>

<script setup lang="ts">
import { ref, computed, watch,onUnmounted,onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia';
import { useAuthStore3 } from '@/stores/authStore3'
import { useMaterialStore } from '@/stores/materialStore'
import { useNotifications } from '@/composables/useNotifications'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useFileFormatter } from '@/composables/useFileFormatter'

// ══════════════════════
//    TYPES & INTERFACES
// ══════════════════════
interface Material {
  id_material: string
  nombre_material: string
  fechaSubida: Date
  size?: number
  status?: 'approved' | 'pending' | 'rejected'
  url?: string
}

interface StudentInfo {
  fullName: string
  numCuenta?: string
}

// FIX #9: 'oldest ' tenía espacio al final
type SortOption = 'recent' | 'oldest' | 'name-asc' | 'name-desc'

// ══════════════════════
//    COMPOSABLES
// ══════════════════════
// console.log('[setup] useMaterialStore →', useMaterialStore())
const materialStore = useMaterialStore()
// console.log('[setup] materialStore →', materialStore)
// console.log('[setup] materialStore.$state →', materialStore.$state) 
const authStore3     = useAuthStore3();
	if(!materialStore){
		console.log('[Mis materiales] Store: materialStore no disponible')
	}

// Recibir states de stores utilizados 
 const { uid_auth } = storeToRefs(authStore3);
 const {isModalOpen, selectedMaterial, previewMaterial} = storeToRefs(materialStore);

// FIX #10: una sola instancia, ambas funciones desestructuradas
const { formatearFecha, formatearFechaRelativa } = useDateFormatter()
const { formatFileSize }                         = useFileFormatter()

// FIX #1: desestructurar showNotification y activeNotifications
const { showNotification, activeNotifications, removeNotification}  = useNotifications()

// ══════════════════════
//    REACTIVE STATE
// ══════════════════════
const searchQuery      = ref('')
const sortBy           = ref<SortOption>('recent')
const currentPage      = ref(1)
const showViewer       = ref(false)
// const selectedMaterial = ref<Material | null>(null)
const isDownloading    = ref<string | null>(null)

// ══════════════════════
//    CONSTANTES
// ══════════════════════
const ITEMS_PER_PAGE = 10
const RECENT_HOURS   = 8

const STATUS_LABELS: Record<string, string> = {
  approved: 'Aprobado',
  pending:  'Pendiente',
  rejected: 'Rechazado'
}

// ══════════════════════
//    COMPUTED
// ══════════════════════
const isLoading    = computed(() => materialStore.loading)
const hasError     = computed(() => materialStore.error !== '')
const errorMessage = computed(() => materialStore.error)

const studentInfo = computed((): StudentInfo | null => {
  const profile = materialStore.studentProfile
  if (!profile) return null
  return {
    // FIX #7: operadores fuera del template string
    fullName:   `${profile.name || ''} ${profile.lname || ''}`.trim(),
    numCuenta:  profile.numCuenta
  }
})

const allMaterials = computed(() => materialStore.studentMaterials || [])

const recentUploads = computed(() => {
  const now        = new Date()
  const cutOffTime = new Date(now.getTime() - RECENT_HOURS * 60 * 60 * 1000)
  return (Array.isArray(allMaterials.value) ? allMaterials.value : []).filter(material =>
    new Date(material.fechaSubida) >= cutOffTime
  )
})

// FIX #8: computed que faltaba — usado en template v-if
const hasRecentUploads = computed(() => recentUploads.value.length > 0)

const filteredMaterials = computed(() => {
  let materials =  Array.isArray(allMaterials.value) ? [...allMaterials.value] : [];
		// [...allMaterials.value]
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    materials = materials.filter(m =>
      m.nombre_material?.toLowerCase().includes(query)
    )
  }

  switch (sortBy.value) {
    case 'recent':
      materials.sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())
      break
    case 'oldest':
      materials.sort((a, b) => new Date(a.fechaSubida).getTime() - new Date(b.fechaSubida).getTime())
      break
    case 'name-asc':
      materials.sort((a, b) => a.nombre_material.localeCompare(b.nombre_material))
      break
    case 'name-desc':
      materials.sort((a, b) => b.nombre_material.localeCompare(a.nombre_material))
      break
  }
  return materials
})

const paginacionMateriales = computed(() => {
  // FIX #4: currentPage.value — no el Ref object
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end   = start + ITEMS_PER_PAGE
  return filteredMaterials.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(filteredMaterials.value.length / ITEMS_PER_PAGE)
)

// FIX #2 y #3: isEmpty debe retornar boolean, no string de tamaño
const isEmpty = computed(() =>
  !isLoading.value && !hasError.value && filteredMaterials.value.length === 0
)

const totalMaterials = computed(() => allMaterials.value.length)

// FIX #6: return faltante
const recentMaterialsCount = computed(() => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return (Array.isArray(allMaterials.value) ? allMaterials.value : []).filter(m =>
    new Date(m.fechaSubida) >= sevenDaysAgo
  ).length
  	console.log('allMaterials.value:', allMaterials.value, typeof allMaterials.value)
})

const totalFileSizeFormatted = computed(() => {
  const totalBytes = (Array.isArray(allMaterials.value) ? allMaterials.value : []).reduce((sum, m) => sum + (m.size || 0), 0)
  return formatFileSize(totalBytes)
})

const hasFilters = computed(() =>
  searchQuery.value.trim() !== '' || sortBy.value !== 'recent'
)

// ══════════════════════
//    WATCHERS
// ══════════════════════
const stopErrorWatch = watch(() => materialStore.error, (error) => {
  if (error) {
    showNotification({ type: 'error', message: error });
  }
})

const stopPaginationWatch = watch(() => filteredMaterials.value.length, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
})

// ══════════════════════
//    HANDLERS
// ══════════════════════
const handleSearch = (): void => {
  currentPage.value = 1;
}

const handleSortChange = (): void => {
  currentPage.value = 1;
}

const handleClearFilters = (): void => {
  searchQuery.value = ''
  sortBy.value      = 'recent'
  currentPage.value = 1
}

const handlePreviousPage = (): void => {
  if (currentPage.value > 1) {
    // FIX #5: .value en la mutación
    currentPage.value--
  }
}

const handleNextPage = (): void => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
	/*Muestra la vista previa de los materiales*/
const handleViewMaterial = (material: Material): void => {
	if (!material) return
  materialStore.openMaterialModal(material);
	 	console.log('[handleViewMaterial] material:', material);
}

const handleCloseViewer = (): void => {
  showViewer.value       = false
  selectedMaterial.value = null
}

const handleDownloadMaterial = async (material: Material | null): Promise<void> => {
  if (!material) return
  isDownloading.value = material.id_material
  try {
    await materialStore.downloadMaterial(material.id_material)
    showNotification({
      type:    'success',
      message: `${material.nombre_material} descargado correctamente`
    })
  } finally {
    isDownloading.value = null
  }
}

const handleRetry = async (): Promise<void> => {
  const uid = authStore3.user?.uid
  if (uid) {
    await materialStore.fetchStudentMaterials(uid)
  }
}

// FIX #12: función para cerrar notificaciones — usarla en el botón ✕
const handleCloseNotification = (id: string): void => {
  // implementar según tu useNotifications — ejemplo:
  // removeNotification(id)
}

// ══════════════════════
//    HELPERS
// ══════════════════════
const getStatusLabel = (status?: string): string =>
  STATUS_LABELS[status || 'pending'] || 'Desconocido'

  // let stopWatcher: (() => void) | null = null;
// ══════════════════════
//    LIFECYCLE
// ══════════════════════
const stopAuthWatch = watch(uid_auth, async (unique_user) => {
		if (!unique_user)  return;
			console.log('[Auth] ',unique_user);
		// const unique_user = uid_auth.value;
  	materialStore._isCancelled = false;
    	await materialStore.fetchStudentMaterials(unique_user);
}, {immediate: true} // Auth ya resuelto — carga directa
    /*console.log('[Debug]',{
    	uid: unique_user,
    	materials: materialStore.studentMaterials,
    	perfil: materialStore.studentProfile,
    	error:materialStore.error
    });*/

  // Auth aún no resuelto — esperar
  	/*stopWatcher = watchEffect(async () => {
   const unique_user = uid_auth.value
    if (unique_user) await materialStore.fetchStudentMaterials(unique_user)
	 })*/
);
   
	
  		// Parche para seguir correctamente la animacion transition de vue
   const isUnmounting = ref(false);
  onBeforeUnmount( ()=> {
  	/*Detener la Ejecucion de todos los watchs*/
  	stopErrorWatch() ;
   stopPaginationWatch();
     stopAuthWatch();
     // Detener flujo de f(n)s disparadas y detener el modal
  	  isUnmounting.value = true;
  	  materialStore._isCancelled = true;
  	  materialStore.closeMaterialModal();
  	  // materialStore.studentMaterials = []
  		/*nextTick(() => {
  	 			materialStore.$reset();
  		}
		);*/
  	   // regresar la directiva, reg. el met. comentado de vue
  	  // if(stopWatcher) stopWatcher();
  	 // alert('eliminando los residuos de las cuentas previas..');
  });
  
  /*const unwatch = watch(
    () => unique_user,
    async (newUid) => {
    	console.log(newUid);
      if (newUid) {
        unwatch() // dejar de observar
        await materialStore.fetchStudentMaterials(newUid)
      }
    },
    { immediate: false }
  )*/
 /* const uid = authStore.user?.uid
  if (!uid) {
    showNotification({ type: 'error', message: 'No se pudo identificar al usuario' })
    return
  }
  await materialStore.fetchStudentMaterials(uid)*/

</script>

<style scoped>

  	 /*═══════════════════════════════════*/
  	 /*			LAYOUT						  */
  	 /*═══════════════════════════════════*/
  	.materials-catalog-view{
  		@apply min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50;
  		@apply dark:from-gray-900 dark:via-gray-800 dark:to-gray-900;
  		@apply py-8 px-4 sm:px-6 lg:px-8;
  		 animation: fadeIn 0.5s ease-out;
  	}

  	/*═══════════════════════════════════*/
  	 /*			ENCABEZADO					*/
  	 /*══════════════════════════════════ */
  	 	.catalog-header{
  	 		@apply max-w-7xl mx-auto mb-8;
  	 		animation: slideInDown 0.6s ease-out;
  	 	}

  	 	.header-content{
  	 		@apply text-center mb-6;
  	 	}
  	 	
  	 	.main-title{
  	 		@apply text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2;
  	 	}

  	 	.student-welcome{
  	 		@apply text-lg text-gray-600 dark:text-gray-400;
  	 	}
  	 	
  	 	.student-id{
  	 		@apply text-sm text-gray-500 dark:text-gray-500 ml-2;
  	 	}


	.stats-grid{
		@apply grid grid-cols-1 sm:grid-cols-3 gap-4;
	}

	.stats-card{
		@apply bg-white dark:bg-gray-800 rounded-xl shadow-md;
		@apply flex items-center gap-4 transition-transform duration-300 hover:scale-105;
	}

	.stats-icon{
		 @apply text-3xl
	}

	.stat-content{
		@apply flex flex-col;
	}

	.stat-value{
		@apply text-sm text-gray-600 dark:text-gray-400;
	}

	.stat-label{
		@apply text-sm text-gray-600 dark:text-gray-400;
	}

	/*═══════════════════════════════════*/
  	/*			FILTROS						    */
  	/*══════════════════════════════════ */
  	.filters-section {
  		@apply max-w-7xl mx-auto mb-6 space-y-4;
  		animation: slideInUp 0.6s ease-out;
  	}

  	 .search-container {
  	 	@apply w-full
  	 }
  	 
	.search-input{
		@apply w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600;
		@apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
		@apply focus:ring-2 focus:ring-blue-500 focus:border-transparent;
		animation: transition-all duration-200;
	}

  	.filters-container {
  	 	 @apply flex flex-wrap gap-4 items-center justify-between;
  	 }

  	 .filters-group {
  	 	@apply flex items-center gap-2;
  	 }

  	 .filters-label {
  	 	@apply text-sm font-medium text-gray-700 dark:text-gray-300;
  	 }

  	.filter-select {
  	 	@apply px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600;
  	 	@apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
  	 	@apply focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  	}

	.clear-filter-btn {
	 	@apply px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700;
	 	@apply text-gray-700 dark:text-gray-300 font-medium;
	 	@apply hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors;
	} 
	 /*═══════════════════════════════════*/
  	 /*	SECCION DE MATERIALES 			  */
  	 /*═══════════════════════════════════*/
	.materials-section {
		@apply max-w-7xl mx-auto;
	}

	.state-container {
		@apply bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg;
		animation: scaleIn 0.4s ease-out;
	}

	.state-container .error {
		@apply border-2 border-red-200 dark:border-red-800;
	}

	.state-container .empty {
		@apply border-2 border-gray-200 dark:border-gray-700;
	}

   .spinner {
     	@apply w-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full;
     	animation: spin 1s linear infinite;
   }

   .state-icon {
   		@apply text-6xl mb-4 block;
	}

	.state-message {
		@apply text-xl font-medium text-gray-700 dark:text-gray-300 mb-2;
	}

	.state-hint {
		@apply mt-4 px-6 bg-blue-600 text-white rounded-lg font-medium;
		@apply hover:bg-blue-700 transition-colors;
	}

	.retry-btn {
		@apply bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden;
		animation: slideInUp 0.6s ease-out;
	}
	
		/* Table  */
	.table-container {
		@apply bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden;
		animation: slideInUp 0.6s ease-out;
	}

	.materials-table {
		@apply w-full;
	}

	.materials-table th {
		@apply px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider;
	}

	.materials-row {
		@apply border-b border-gray-200 dark:border-gray-700;
		@apply hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
	}

	.materials-table td {
		@apply px-6 py-4 text-sm text-gray-900 dark:text-gray-100;
	}

	.material-icon {
		@apply text-2xl;
	}

	.material-details {
		@apply font-medium text-gray-600 dark:text-white;
	}

	.material-name {
		@apply font-medium text-gray-600 dark:text-white;
	}

	.material-id {
		@apply text-xs text-gray-500 dark:text-gray-500;
	}

	.status-badge {
		@apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200;
	}

	.status-approved {
		@apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200;
	}

	.status-pending {
		@apply bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200;
	}

	.status-rejected {
		@apply bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200;
	}

	.actions-button {
		@apply flex gap-2;
	}

	.action-btn {
		@apply p-2 rounded-lg transition-all duration-200;
		@apply disabled:opacity-50 disabled:cursor-not-allowed;
	}

	.action-btn .view {
		@apply bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800;
	}

	.action-btn .downlonad {
		@apply bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800;
	}

	/* Paginacion de Materiales */
	.pagination {
		@apply flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700;
	}

	.pagination-btn {
		@apply px-4 py-4 bg-blue-600 text-white rounded-lg font-medium;
		@apply hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed;
		@apply transition-colors;
	}

	.pagination-info {
		@apply text-sm text-gray-600 dark:text-gray-400;
	}

	/*════════════════════════════════════*/
  	/*	MODAL VIEWER 			            */
  	/*════════════════════════════════════*/
   
   .modal-overlay {
   	@apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4;
    }

   .modal-viewer{
   	 @apply bg-white dark:bg-gray-800 rounded-xl shadow-xl;
   	 @apply w-full max-w-6xl h-[90vh] flex flex-col;
   	  animation: scaleIn 0.3s ease-out;
    }
  	
  	.viewer-header{
  		@apply text-xl font-bold text-gray-900 dark:text-white;
  	}

  	.viewer-title{
  	  @apply text-xl font-bold text-gray-900 dark:text-white;
  	}

  	.modal-close {
  		@apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-600 text-2xl;
  		@apply transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded;
  	}

  	.viewer-content {
  		@apply flex-1 p-4 overflow-hidden;
  	}

  	.pdf-viewer {
  		@apply w-full h-full border-0;
  	}

  	.viewer-placeholder {
  		@apply flex items-center justify-center h-full text-gray-500;
  	}

  	.viewer-actions {
  		@apply flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700;
  	}

  	.viewer-btn {
  		@apply px-6 py-2 rounded-lg font-medium transition-colors;
  	}
   
   	.viewer-btn.downlonad{
	  @apply bg-blue-600 text-white hover:bg-blue-700;
	}

  	.viewer-btn.cancel {
  		@apply bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300;
  		@apply hover:bg-gray-300 dark:hover:bg-gray-600;
  	}

  	/* ═════════════════════════════ */
	/*    NOTIFICACIONES             */
	/* ═════════════════════════════ */
   	.notificacions-container{
   		@apply fixed top-4 right-4 z-50 space-y-3 max-w-sm;
   	}
     
   	.notification {
   		@apply flex items-center gap-3 p-4 rounded-lg shadow-lg;
   		@apply bg-white dark:bg-gray-800 border-l-4;
   			animation: slideRight 0.3s ease-out;
   	}

      /* (*)  */
     .notificacion-success {
	   @apply border-green-500;
     }

   	.notificacion-error {
	   @apply border-red-500;
   	}

   	.notificacion-icon{
	   @apply text-xl;
   	}

   	.notificacion-message {
       @apply flex-1 text-sm text-gray-700 dark:text-gray-300;
   	}

   	.notificacion-close {
   	  @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
   	   transition-colors;
   	}
   	/*═══════════════════════════════════════*/
   	/*			 TRANSITIONS			 */
   	/*═══════════════════════════════════════*/

  </style>  