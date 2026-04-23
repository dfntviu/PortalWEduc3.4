 <template>
	<div class="teacher-materials-container">
		<!-- Card Externo -->
		<div class="card-ext-teacher main-card">
			<h1 class="page-title">Administración de Materiales</h1>
			<div class="card-ext-teacher main-card">
				<!-- Estadistícas Generales -->
				<div class="stats-section">
					<div class="card-int-teacher stats-card">
						<h2 class="stats-title"><span class="icon">📊</span>
						Estadistícas Generales</h2>
					</div>
					<div v-if="materialBaseStore.loading && materialBaseStore.statistics" class="loading-stats">
						<div class="spinner">
							<p>Cargando Estadísticas..</p>
						</div>

						<div class="stats-grid">
							<div class="stat-item">
								<span class="stat-value"> {{materialBaseStore.statictics.total}}</span>
								<span>Total</span>
							</div>
						</div>

						<div class="stat-item c">
							<span class="stat-value">{{ materialBaseStore.statictis.pending}} </span>
							<span class="stat-label">⌛ Pendientes</span>
						</div>

						<div class="stat-item stat-approved">
							<span class="stat-value"> {{materialBaseStore.statistics.approved}}</span>
							<span class="stat-label">✅ Aprobados</span>
						</div>
						
						<div class="stat-item stat-reajected">
							<span class="stat-value">{{materialBaseStore.statistics.reajected}}</span>
							<span class="stat-label">❌Rechazados</span>
						</div>
					</div>
				</div>
		   		<!-- Filtros y Busqueda -->
				<div class="filters-section">
					<div class="card-int-teacher filter-card">
						<h2 class="section-tittle">
							<span class="icon">🔍</span>
							Filtros & Busqueda</h2>

						<div class="filter-grid">
							<!-- Selector de Filtro -->
							<div class="filter-field">
								<label for="filter" class="field-label">Filtrar por:</label>
								<select id="filter" v-model="selectedFilter" @change="applyFilter" class="filter-select">
									<option value="MaterialFilter.ALL">Todos los Materiales</option>
									<option value="MaterialFilter.PENDING">Pendientes y en Revisión</option>
									<option value="MaterialFilter.APPROVED">Aprobados</option>
									<option value="MaterialFilter.REJECTED">Rechazados</option>
									<option value="MaterialFilter.TODAY">Materiales de Hoy</option>
									<option value="MaterialFilter.LAST_WEEK">La última Semana</option>
								</select>
							</div>
						</div>
						<!-- Busqueda -->
						<div class="search-field">
							<label for="search" class="field-label">Buscar:</label>
							<input type="text" v-model="searchQuery"  placeholder="Busq. por Consulta" class="search-input"
							 @input="manipulateSearch">
						</div>
					</div>
				     <!-- Filtro Activo-->
					<div class="active-filter">
						<span class="filter-badge">
						 📌Filtro activo:{{materialBaseStore.currentFilterName}}
						</span>
						<button @click="clearFilter" class="btn-clear-filter">
						 Limpiar</button>
					</div>
				</div>
			</div>
			<!-- Mensaje de Error -->
			<Transition>
				<div class="alert alert-error">
					<button @click="materialBaseStore.clearError()" class="alert-close">✕</button>
				</div>
			</Transition>	
			<!-- Lista de Materiales -->
			<div class="materiales-section">
				<div class="section-header">
					<h2 class="section-title"><span class="icon">📁</span>
						Materiales ({{displayedMaterials.length}})
					</h2>

					<div class="header-actions">
						<button>🔄️Actualizar</button>
					</div>
				</div>
				<!-- Loading State --> 
				<div v-if="materialBaseStore.loading && materialBaseStore.hasMaterials" class="loading-state">
					<div class="spinner"></div>
					 <p>Cargando Materiales...</p>
				</div>

				<!-- Estado Vacio -->
				<div v-if="!materialBaseStore.hasMaterials" class="empty-state">
				 	  <span class="empty-icon">🖥️</span>
				 	  <h3>Lo siento,NO se ECONTRARON Materiales</h3>
				 	  <p>{{getEmptyStateMessage}}</p>
				</div>

				<div v-else class="materials-grid">
				 	<div v-for="material in displayedMaterials" :key="material.uid" class="card-int-teacher material-card">
				 		 <!-- Header del Material -->
				 		<div class="material-header">
				 		 	<h3 class="material-title">{{material.titulo}}</h3>
				 		 	 <span :class="['status-badge', `badge- ${material.status}`]" >
				 		 	   {{getStatusText(material.uid)}}
				 		 	 </span>
				 		</div>

				 		<!-- Informacion Autor -->
				 		<div class="material-autor">
				 			<span class="author-icon">👤</span>  <!-- sad-->
				 			<span class="author-name">{{material.autorNombre| 'Sin Autor'}} </span>
				 		</div>
				 		<!-- Descripcion -->
				 		<p v-if="material.description" class="material-description">
				 		 {{material.description}}
				 	    </p>
				 		<!-- Metadata -->
				 		<div class="material-metadata">
				 			<span class="metadata-item">
				 		     📅 Creado: {{formateDate(material.createdAt)}}
				 			</span>
				 			<span  v-if="material.moderateAt" class="metadata-item">
				 			 ✔️ Moderado: {{formateDate(material.createdAt)}}
				 			</span>
				 			<span  v-if="material.tags?.length" class="metadata-item">
				 			 🏷️ {{materials.join(', ')}}
				 			</span>
				 		</div>
				 		<!-- Rechazo(Si Aplica) -->
				 		<div v-if="material.status === 'rejected'  && material.rejectionReason" class="rejection-reason">
				 			<strong>Razón del Rechazo</strong>
				 				<p>{{material.reactionReason}}</p>
				 		</div>
				 		<!-- Utilidad: Acciones de Moderación -->
				 		<div class="moderation-actions">
				 			<!-- Para materiales Pendientes -->
		 					<template>
		 						<button
		 						  @click="utilityModerateApprove(material)"
		 						  class="btn-action btn-approve"
		 						  >{✅Aprobar}
		 						</button>
		 						<button class="btn-action btn-reject">
		 						  ❌Rechazar
		 					    </button>
		 					</template>
		 						<!-- Para Materiales Moderados -->
		 					<template v-if="material.status !== 'pending'">
		 						<button @click="manipulateRevert(material)" class="btn-action btn-revert">
		 							🔄️ Revertir
		 						</button>
		 					</template>
		 					<!-- Acciones comunes -->
		 					<button @click="ApplyMaterialView(material)" class="btn-action btn-view">👁️ Ver</button>
		 					<button @click="ApplyMaterialEdit(material)" class="btn-action btn-edit">✏️ Editar</button>
				 		</div>
				 	</div>
				</div>
			</div>

			<transition class="modal">
				<div class="modal-overlay" v-if="showRejectModal">
					<div  class="modal-content" @click.stop>
						<div class="modal-header">
							<h3> ❌ Rechazar Material</h3>
							<button  @click="closeRejectModal" class="modal-close">✕</button>
						</div>
						<div class="modal-body">
							 <p>
							 	<strong>Material: </strong>{selectedMaterial?.titulo}
							 </p>
							 <p>
							 	<strong>Autor:</strong>{selectedMaterial?.autorNombre}
							 </p>
						</div>

						<div class="form-field">
							<label for="">Razón del Rechazo</label>
							<textarea  id="rejection-reason" v-model="rejectionReason" 
							  placeholder="Explica porque se rechazo este material..." 
							   class="field-text-area"  
							   rows="4" required></textarea>
						</div>
					</div>
						<!-- Descomentar |--Pendiente--| -->
					<!-- <div class="modal-actions">
						<button @click="closeReajectModal" class="btn-cancel">
						  Cancelar
						</button>
						<button  @click="confirmReject" class="btn-confirm-reject">
						  Confirmar Rechazo
						</button>
					</div> -->
				</div>
			</transition>

		</div>
	</div>
 </template>

<script setup lang="ts">   //materiaTeacherStore - change(materialStore)
	import { ref, computed, onMounted } from 'vue';
	import { useMatBaseStore } from '@/stores/materialBaseStore';
	import { MaterialFilter } from '@/stores/materialBaseStore';
	import type { MaterialT} from  '@/interfaces/interfacesToast';
	// c4f93e5be1f71f71cd1ff99e92ab3ac4cda... 
	// ============================
	// STORE
	// ============================
	 const materialBaseStore = useMatBaseStore();
	 /**
	  * Sigo en la busqueda de la unificacion entre vistas Administrar y Estadisticas
	  * recuerdo vagamente que la cree hace mes y medio pero no la encuentro
	  * pordria cambiarla por la vista catalogo, o bien  a partir de los utimos errores
	  * del layout y los metodos de BaseStore conseguir lo que hace falta.
	  * Proceso
	  * 1ero: enviar codigo en una ventana y decirle al mismo modelo que busque las coincidencias,
	  * para encontrar la correcta.
	  * 2do: Repasarla toyo, identificar el proposito, descomponer el flujo y  completarla
	  * segun el flujo*/
	// ==========================
	// STATE
	// ==========================
	 const selectedFilter = ref<MaterialFilter>(MaterialFilter.ALL);
	 const searchQuery = ref('');
	 const showRejectModal = ref(false);
	 const selectedMaterial = ref<Material| null>(null);
	 const    rejectionReason = ref('');

	 // =====================
	// COMPUTED
	// ======================
	 const displayedMaterials = computed(()=>{
	 	if(searchQuery.value.trim()){
	 		return materialBaseStore.filteredMaterials;
	 	}
	 	 return materialBaseStore.materials
	 });

	// ==========================
	// METODOS
	// ==========================

	 /**
	  * Aplicar el Filtro Seleccionado
	  * */
	   async function applyFilter(): Promise<void>{
	   		materialBaseStore.applyFilter(selectedFilter.value);
	   }

	 /**
	  * Limpiar el Filtro Actual
	  * */
	  async function cleanFilter(): Promise<void>{
	  	  selectedFilter.value = MaterialFilter.ALL;
	  	   await applyFilter();
	  }

	 /**
	  * Maneja la Busqueda
	  * */
	  async function handleSearch(): void {
	  	  materialBaseStore.seaarchMaterials(searchQuery.value);
	  }

	 /**
	  * Refresca la Lista de Materiales
	  * */
	async function refreshMaterials(): void {
		await applyFilter();
		await materialBaseStore.fetchStatistics();
	}

	 /**
	  * Aprueba el Material especifico
	  * */
	async function utilityModerateApprove(material: Material): Promise<void>{
	 	if(!confirm(`¿Desea Aprobar el Material: "${material.titulo}"? `)) return;

	 	 	const succes = materialBaseStore.approveMaterial(material.uid);

	 	 	if(succes){
	 	 		alert(`Material ${material.titulo} aprobado Correctamente.`);
	 	 	}
	}

	 /**
	  * Abrir el Modal de Rechazo
	  * */
	async function openRejetModal(material: Material): Promise<void>{
	  	 selectedMaterial.value = material;
	  	 rejectionReason.value = '';
	  	 showRejectModal.value = true;
	}

	async function closeRejetModal(): void{
		 showRejectModal.value  = false;
		  selectedMaterial.value =  null;
		  rejectionReason.value =  '';
	}

	/** 
	 * Cerrar el  de Rechazo
	 * */
	async function confirmReject(): Promise<void>{
	  	 
	  	if(!selectedMaterial.value || !rejectionReason.value.trim()){

	  	 	const success_reject = materialBaseStore.rejectMaterial(
	  	 			selectedMaterial.value.uid,
	  	 			rejectionReason.value
	  	 		);

	  	 	if(success_reject){
	  	 	  	alert(`Material ${selectedMaterial.value.titulo} fue RECHAZADO 🙁`);
	  	 	  	  closeRejetModal();
	  	 	}
	  	}
	}

	/**
	 * Revierte la Moderación del Material
	 * */	
	async function manipulateRevert(material: Material): Promise<void>{
		if(!confirm(`¿Revertir la Moderación de: "${material.titulo}"? `))
		  return;

		const succes_revert = materialBaseStore.revertModeration(material.uid);

		    if(success_reject){
		 	  alert(`La Moderación ha sido revertida para: ${material.titulo}`);
		    }
	}

	/**
	 * Maneja la visualización del Material
	 * */
	function handleView(material: Material): void{
		// TODO: Terminar su implementacion
	}
	/**
	 * Maneja la Edicion del Material
	 * */
	function handleEdit(material: Material): void{
		// TODO: Terminar la Edicion
	}  

	/**
	 * Obtiene el mesaje de Estado vacío
	 * */
	function getEmptyStateMessage(): string {
		if(selectedFilter.value === MaterialFilter.PENDING){
			return 'No hay Materiales pendientes en Revisión';
		}else if(searchQuery.value.trim()){
			return 'No se encontraron materiales con dicho CRITERIO de Busqueda';
		}	
		return 'Aún no hay Materiales en el Sistema'; //Se rec. exp en el lenguaje natural EXISTE-> EXISTENCIA -> SER/ O NO SER 
	}
	// =================
	//   LIFECYCLE
	// =================
	 onMounted(async()=>{
	 	await materialBaseStore.loadNavBarUnify();
	 });
	 // c4f93e5be1f71f71cd1ff99e92ab3ac4cda... 
</script>
<style scoped>
	@import '@/assets/styles/materialColors.css';

	/**
	 * ======================
	 *   CONTENEDOR PRINCIPAL
	 * ======================*/
	.teacher-materials{
		min-height: 100vh;
		padding: var(--spacing-xl);
		background: linear-gradient(135deg, #fef3e2 0%, #fce4c0 100%);
		font-family: 'Inter', -apple-system BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.main-card{
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 auto;
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-xl);
	}

	.page-title{
		color: white;
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: var(--spacing-xl);
		text-align: center;
	}

	/**
	 * ======================
	 *   ESTADISTÍCAS
	 * ======================*/

	 .stats-section{
	 	margin-bottom: var(--spacing-xl);
	 }

	 .stats-card{
	 	padding: var(--spacing-xl);
	 	border-radius: var(--border-radius-lg);
	 }

	 .stats-title{
	 	display: flex;
	 	align-items: center;
	 	gap: var(--spacing-sm);
	 	font-size: 1.5rem;
	 	font-weight: 600;
	 	color: var(--color-text-teacher);
	 	margin-bottom: var(--spacing-lg);
	 }

	 .icon{
	 	font-size: 1.75rem;
	 }
	 
	 .loading-stats{
	 	text-align: center;
	 	padding: var(--spacing-xl);
	 	color: var(--color-text-secondary);
	 }

	 .stats-grid{
	 	text-align: center;
	 	padding: var(--spacing-xl);
	 	color:  var(--color-text-secondary);
	 }

	 .stat-item{
	 	text-align: center;
	 	padding: var(--spacing-lg);
	 	background: var(--color-bg-secondary);
	 	border-radius: var();
	 	border: var();
	 	transition: all var();
	 }
	 
	 .stat-item:hover{
	 	transform: translateY(-2px);
	 	box-shadow: var(--shadow-md);
	 }

	 .stat-value{
	 	transform: translateY(-2px);
	 	font-size: 2rem;
	 	font-weight: 700;
	 	color: var();
	 	margin-bottom: var();
	 }


	 .stat-label{
	 	display: block;
	 	font-size: 0.875rem;
	 	color: var();
	 	font-weight: 500;
	 }

	 .stat-pending{
	 	border-color: var();
	 }

	 .stat-approved{
	 	border-color: var();
	 }

	 .stat-approved .stat-value{
	 	color: var();
	 }

	.stat-approved{
      border-color: var();
	}

	.stat-approved .stat-value{
		color: var();
	}
	
	.stat-reajected{
		border-color: var();
	}

	.stat-reajected .stat-value{
		color: var();
	}

	/**
	 * ======================
	 * 	  FILTROS
	 * ====================== **/
	.filters-section{
	 	margin-bottom: var();
	}
	 
	.filters-card{
	 	padding: var();
	 	border-radius: var();
	}

	.section-tittle{
	 	display: flex;
	 	align-items: center;
	 	gap: var();
	 	font-size: 1.25rem;
	 	font-weight: 600;
	 	color: var();
	 	margin-bottom: var();
	}

	.filter-grid{
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var();
	}

	.field-label{
		font-weight: 500;
		color: var();
		font-size: 0.875rem;
	}

	.filter-select
	.search-input{
		padding: var();
		border: 2px solid var();
		border-radius: var();
		font-size: 1rem;
		transition: all var();
	}

	.filter-select
	.search-input:focus {
		outline: none;
		border-color: var();
		box-shadow: 0 0 3px rgba(217, 119, 6, 0.1);  /*donde a===alfa*/
	}

	.active-filter{
		display: flex;
	}
</style>

<!-- Se agregaron:
   materialTeacherStore
   MaterialAdmServProffesor >> DesplegarMaterialServiceR2 -->
