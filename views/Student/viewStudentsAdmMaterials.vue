<template>
	<div class="min-h h-screen bg-gradient-to-br from-gray-50">
		<div class="max-w-7xl">
			<!-- Encab. con Estadistícas -->
			<div class="bg-white">
				<div class="flex flex-col">
					<div>
						<h1 class="text-3xl">
							<span class="text-4xl">📚
							 </span>Mis Materiales
						</h1>
						 <p class="text-gray-600">Gestiona tus Materiales Ac.</p>
					</div>

					<!-- Boton Crear Material -->
					<button class="px-6 py-4 bg-gradient">
						<span class="text-xl">➕</span>
						Subir Material
					</button>
				</div>

					<!-- Error Alert -->
				<div class="mt-4 p-4 bg-red-50">
					<div class="flex items-start gap-3">
						<span class="text-2xl">⚠️</span>
						<div class="flex-1">
							<h3 class="font-semibold text-red-800">Error</h3>
							 <p class="text-sm text-red-700 dark:text-red-700 dark:text-red-300">
								 {{error}}
							 </p>
						</div>
						<button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
							 ✕
						</button>
					</div>
				</div>
					<!-- Estadisticas -->
					<div class="grid grid-cols2">
						<div class="from-blue-50 to-blue-100">
							<div class="flex items-center justify-between">
								<div>
									<div class="text-sm font-medium">
										<p class="text-sm">Total</p>
										<p class="text-3xl font-bold text-blue-700">
										 {{stats.total}}</p>
									</div>
									<span class="text-4xl">📊</span>
								</div>
							</div>

							<div class="bg-gradient-to-r from-yellow-100 to-yellow-100 rounded-xl p-4">
								<div class="flex items-center justify-between">
									<div>
										<p class="text-sm font-medium">Pendientes</p>
										<p class="text-3xl font-bold"> {{stats.pending}}</p>
									</div>
									<span class="text-4xl">⌛</span>
								</div>
							</div>

							<div class="bg-gradient-to-r from-green-50 to-green-100">
								<div class="flex items-center justify-between">
									<div>
									 <p class="text-sm text-green-100">Aprobados</p>
									 <p class="text-3xl font-bold">{{stats.approved}}</p>
									</div>
									 <span class="text-4xl">✅</span>
								</div>
							</div>

							<div class="bg gradient-to-br from-red-50 to-red-100">
								<div class="flex items-center justify-between">
										<div>
											<p class="text-sm text-red-600 font-medium">Rechazados</p>
											<p class="text-3xl font-bold text-red-700">{{stats.rejected}}</p>
										</div>
										<span class="text-4xl">❌</span>
								</div>
							</div>
					   </div>
					</div>

					<!-- Busqueda y Filtros -->
					<div class="bg-white dark:bg:gray-800 rounded-xl shadow-xl">
						<div class="flex rounded-2xl shadow-xl">
							<!-- Busqueda -->
							<div class="flex-1">
								<div class="relative">
									<!-- <div class="flex flex-col md:flex-row gap-4"> -->
											<button class="absolute rigth-3 top-1/2 text-gray-400">
											 ✕ </button>
									<!-- </div> -->
								</div>
							</div>

							 <span class="text-xl">🔄️</span>
							<!-- Botón Actualizar -->
							<button class="px-6 py-3 bg-gray-100 hover:bg-gray-100 dark:bg-gray-700">
							 Actualizar
							 </button>
						</div>
					</div>

					<!-- Tabs de Filtrado -->
					<div class="bg-white rounde-xl shadow-xl p-6">
						<div class="flex flex-wrap gap-2">
							<button v-for="tab in tabs" :key="tab.id"
							 @click="activeTab = tab.id"
								:class="[ 'x-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2',
									  activeTab === tab.id
									  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md transform scale-105'
									  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600' 
										 +'dark:bg-gray-600 text-gray-700 dark:text-gray-300'
								]"
							>	
							<span class="text-xl">{{tab.icon}}</span>
							 {{tab.label}}
							<span  v-if="tab.count"
							class="ml-2 px-2 py-0 5">{{tab.count}}</span>
							</button>
						</div>
					</div>

					<div class="space-y-4">
						<div class="bg-white dark:bg-gray-800 rounded-2xl">
							<div class="inline-block w-16 h-16">
								<p class="mt-4 text-gray-600 dark:text-gray-300">Cargando Materiales..</p>
									<!-- Empty State -->
								<div class="bg-white rounded-2xl shadow-xl p-12 text-center">
									<div class="text-8xl mb-4">📭</div>
									<h3 class="text-2xl">{{getEmptyMessage()}}</h3>
									<p class="text-gray-600 dark:text-gray-400 mb-6"></p>
									<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg">
									  <span class="text-xl">➕</span>
									  Subir tu Primer Material
									</button>
								</div>

								<!-- Materiales Grid -->
								<TransitionGroup class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									<div>
										<!-- Badge de Estado -->
										<div class="relative">
											<div class="absolute top-4 rigth-4 z-10">
											<span>{{getStatusLabel(materials.status)}}</span>
											</div>

											<div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white">
												<div class="text-6xl font-bold line-clamp mb-2"></div>
												<h3 class="text-xl font-bold line-clamp">
												 {{materials.titulo}}
												 </h3>
												 <p class="text-indigo-100 text-sm line-clamp-2">
													{{materials.description ||  'Sin descripción'}} 
												 </p>
											</div>
										</div>
											<!-- Contenido del Material -->
										<div class="p-6">
											 <!-- Tags -->
											<div v-if="materials.tags && materials.tags.length>0" class="flex flex-wrap gap-2 mb-2">
												<span
												  v-for="tag in material.tags.slice(0,3)"
												  :key="tag"
												 class="px-2 py-1 bg-indigo-100  dark:bg-indigo-900/30 text-indigo-700
												 dark:text-indigo-300 rounded-md text-x font-medium">
												  # {{tag}}
												</span>
												<span v-if="materials.tags.length > 3"
												 class="px-2 py-1 bg-gray-100:dark:bg-gray-700 text-gray-600
												 dark: text-gray-400">
													+{{materials.tags.length - 3}}
												</span>
											</div>

											<!-- Metadata -->
											 <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
												<div class="flex items-center gap-2">
													 <span>📅</span>
													 <span>{{formateDate(materials.createdAt)}}</span>
												</div>
												 <div v-if="materials.views !== undefined" class="flex items-center gap-2">
													  <span>👁️</span>
														<span>{{materials.views}}</span>
												  </div>
												  <div v-if="materials.downlonads !== undefined" class="flex items-center gap-2">
													<span>⬇️</span>
													<span>{material.downloads}</span>
												  </div>
											   </div>   <!--no siempre bien-->

											 <!-- Mensaje de Rechazo (En construcción) -->
											<div class="p-3-bg-red-50 boder">
												<p class="text-sm text-red-800 font-medium">
													 Motivo del Rechazo:
												</p>
												<p class="text-sm text-red-700 dark:text-red-400"> 
												  {{materials.reactionReason}}
												</p>
											</div>

											 <!-- Acciones -->
											<div class="flex gap-2">
												<button
												  @click="startEdit(material)"
												>
												  <div class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg">
												    <span>✏️</span>
												   </div> 
												  Editar
												 </button>
												  <!-- Ver el Estado -->
												 <button
												  @click="viewStatus(material)"
												  class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-700 dark:hover:bg-gray-600"
												 >
													<span>ℹ️</span>
													Estado
												 </button>
													<!-- Elimar materiales(del usuario propio) -->
												 <button v-if="materials.autorId === currentUserId"
													 @click="confirmDelete(materials)"
												  class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
												  font-medium transition-colors flex items-center justify-center">
													<span v-if="!deleting">🚮</span>
													{{ deleting ? 'Eliminando...' :  'Eliminar' }}
												 </button>	
											</div>
											 
										</div>
									</div>
								</TransitionGroup>
							</div>
						</div>

						<!-- Modal de Creacion -->
						<Teleport>
							<Transition>
								<div class="fixed inset-0 bg-black-50 backgroup-blur-sm flex items-center justify-center p-4 z-50">
									<div class="bg-white rounded-2xl max-w-2xl w-full p-6">
										  <div class="flex justify-between items-center mb-6">
											<h3 class="text-2xl font-bold text-gray-900k flex items-center gap-3"> 
												<span class="text-3xl">📺</span>
												 Subir Nuevo Material
											</h3>
											<button class="text-gray-400 hover:text-gray-600 dark:hover-text-gray-300 text-2xl">
												 ✕
											</button>
										  </div>

										  <form action="">
												<!-- Título -->
											<div>
												 <!-- La Descripcion -->
												<label class="block text-sm font-medium text-gray-700 dark:text-gray-30 mb-2">Titulo</label>
												<input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus-border-transparent">
											</div>
													<div>
														<label for="" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
															 Descripcion(*)
														</label>
														<textarea  v-model="createForm.description" rows="4" required   class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-trnsparent">
														</textarea>
												  </div>

												  <!-- Tags(Etiquetas) -->
												  <div>
														 <label for="" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													  Tags: Tg-1,Tg-2,Tg-3</label>
														<input type="text" class="w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
													</div>

													<div>
														<label  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ArchivoPDF</label>
														<div></div>
														<input type="text">
														<div>
															<div class="text-5xl mb-3">📝</div>
															<p class="text-gray-600 dark:text-gray-400 mb-2">Arrastra tu Material(PDF O Word) Aqui</p>
															<button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium  transition-colors">Seleccionar tú Archivo 
															</button>
														</div>

														<div class="flex items-center bg-gray-50 rounded-lg p-4">
															<div class="flex items-center gap-3">
																<span class="text-3xl">📄</span>
																<div class="text-lef">
																	<p class="font-medium text-gray-900 dark:text-white">
																		  {{createForm.file.name}}
																	</p>
																	<p class="text-sm text-gray-600 dark:text-gray-400">{{formatFileSize(createrForm.file.size)}}</p>
																</div>
																<button class="text-red-600 hover:text-red-700 text">x</button>
															</div>
														</div>
													</div>
													 <!-- Botones -->
													<div class="flex gap-3 pt-4">
														<button class="flex-1 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors">Cancelar</button>
														<button>
															<span>⏳</span>
															<span>📤</span>
															<span>{{uploading ? 'Subiendo': 'Subir Material'}}</span>
														</button>
													</div>
										  </form>
									</div>
								</div>
							</Transition>
						</Teleport>

						<Teleport>
							<Transition>
								<div class="fixed iset-0 black backdrop-blur-sm items-center justify-center p-4 z-50">
									<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
										<h3>Estado del Mat.</h3>
										<span class="text-3xl">ℹ️</span>
										<div class="space-y-4">
											<div>
												<p>Título</p>
												<p>{{selectedMaterial.titulo}}</p>
											</div>
										<!-- </div> -->

										<div>
											<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</p>
											<span>{{getStatusLabel(selectedMaterial.status)}}</span>
										</div>

										<div v-if="selectedMaterial?.moderateAt"> <!--revw-->
											<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Fechas de Moderación</p>
											<p class="font-medium text-gray-900 dark:text-white">{{formateDate(moderateAt)}}</p>
										</div>

										<div>
											<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
											 Moderador </p>
											<p class="font-medium text-gray-900 dark:text-white">
												  {selectedMaterial.moderatorNombre} </p>
										</div>

										<div v-if="selectedMaterial.moderatorNombre">
											<p class="text-sm text-gray-600 dark:text-red-400">
												  Motivo del Rechazo
											</p>
											<p class="text-red-700 dark:text-red-400">
											 {{selectedMaterial.rejectionReason}}
											</p>
										</div>
											
										<div>
											<p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Comentario del Moderador
											</p>
											<p class="text-gray-700 dark:text-gray-300">{{selectedMaterial.moderationComment}}
											</p>
										</div>
									</div>
									<button 
										 @click="showStatusModal = false"
									  class="w-full mt-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rodunded-lg font-medium transition-colors">
										Cerrar
									</button>
								</div>
							</div>
							</Transition>
						</Teleport>
						 <!-- Modal de Confirmacion de Eliminacion -->
						<Teleport to="body">
							<Transition name="modal">
								<div  v-if="showDeleteModal && materialToDelete" 
									 class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click.self="showStatusModal = false">
									<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl  max-w-md w-full p-6">
										<div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
											<div class="text-center mb-6">
												<div class="text-6xl mb-4"> ⚠️ </div>
												 <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">¿Desea Eliminar SU material?</h3>
												 <p class="font-bold text-gray-900 dark:text-white mb-2">Es posible, deshacer está acción?</p>
												 <p class="text-gray-600 dark:text-400 mb-2">{{materialToDelete.titulo}}</p>
											</div>

											<div class="flex gap-3">
												<button  @click="controllDelete"
														:disabled="delentig"
												 class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 dark:gray-700 text-white rounded-lg font-medium
													transition-colors disabled:opacity-50 flex items-center justify-center font-medium gap-2"
												>
												<span v-if="delentig">⏳</span>
											  <span v-else>🗑️</span>
													 {{deleting ? 'Eliminando...': 'Eliminar'}}
											 </button>
											</div>
										</div>
									</div>
								</div>
							</Transition>
						</Teleport>
					</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import {ref, computed, onMounted} from 'vue';
	import {useMaterialStudentStore} from '@/stores/materialStudentStore.ts';
	import {useAuthStore3} from '@/stores/authStore3.ts';
	import type {Material,CreateMaterialForm } from '@/types/materialInterfaces';//##

	// ================
	//     STORES
	// ================
	const materialStore = useMaterialStudentStore();
	const     authStore = useAuthStore3();
	// ================
	//     STATE
	// ================
	const activeTab = ref <'all'| 'mine'| 'appoved' | 'pending' | 'rejected'>('all');
	const searchQuery = ref('');
	const showCreateModal = ref(false);
	const showStatusModal = ref(false); //*
	const showDeleteModal = ref(false);
	const selectedMaterial = ref<Material| null>(null);
	const materialToDelete = ref<Material | null>(null);
	const uploading= ref(false);
	const deleting= ref(false);
	const isDragging = ref(false); //*
	const  sInput = ref('');

	const createForm = ref<CreateMaterialForm>({
		title:  '',
		description: '',
		tags: [],
		category: 'Libros',
		file: 'PDF' | undefined 
	});

	// ================
	//     COMPUTED
	// ================
	const materials = computed(()=> materialStore.materials);
	const  loading  = computed(()=> notificationStore.loading);
	 const  error    = computed(()=> materialStore.error);
	 const  currentUserId = computed(()=> authStore.user?.uid);

	 const stats = computed(()=> materialStore.myStats);

	 const tabs = computed(() => [
		{
			 id: 'all' as const,
			 label: 'Todos',
			 icon: '📚',
			 count: materialStore.materials.length
		},
		{
			id: 'mine' as const,
			label: 'Aprobados',
			icon: '📝',
			count: materialStore.approvedMaterials.length
		},
		{
			  id: 'appoved' as const,
			label: 'Aprobados',
			icon: '✅',
			count: materialStore.approvedMaterials.length
		},
		{
		  id: 'pending' as const,
		  label: 'Pendientes',
		  icon: '⌛',
		  count: materialStore.pendingMaterials.length
		},
	 ]);

	 const filteredMaterials = computed(() => {
		let filtered: Material[] = [];

		// Filtrar por tab
		switch(adjectiveTab.value){
			case 'mine':
				filtered = materialStore.myMaterials;
			break;

			case 'approved': 
				 filtered = materialStore.approvedMaterials;
			break;

			case 'pending':
				filtered = materialStore.pendingMaterials;
			break;

			default:
				filtered = materials.value;
			  break;
		}

		// Filtrar por Busqueda
		if (searchQuery.value.trim()) {
			 const query = searchQuery.value.toLowerCase();
				filtered = filtered.filter(m => 
					m.titulo.toLowerCase().includes(query)   ||
					m.description.toLowerCase().includes(query) ||
					m.tags?.some(tag =>tag.toLowerCase().includes(query))
				);
		}

			return filtered;
	 }); 

	 const canSumbitCreate = computed(() => {
		 createForm.value.titulo.trim() &&
		 createForm.value.description.trim() &&
		 createForm.value.file !== undefined;
	 });

	 // ================
	//     METHODS
	// ================

	const refreshMaterials = async() => {
		try{
			await materialStore.fetchMyMaterials();
		}catch(error){
			console.log('Error al refrescar(actualizar) los materiales',error);
		}
	};

	const controllSearch =()=> {
		materialStore.searchMaterials(searchQuery.value);
	}

	const clearingSearch = ()=> {
		searchQuery.value = '';
		materialStore.clearSearch();
	};

	const openCreateModal =()=> {
		createForm.value = {
			title:  '',
			description: '',
			tags: [],
			category: '',
			file: undefined
		}
		 tagsInput.value = '';
		 showCreateModal.value = true;
	};

	const closeCreateModal =(event:Event) => {
		if(uploading.value) return;
		 showCreateModal.value = false;
	};

	const manipulateFileSelect =(event:Event) => {
		const target = event.target as HTMLInputElement;
			 if(target.files && target.files[0]){
			  createForm.value.file = target.files[0];
			 }
	}

	const controllFileDrop =(event: DragEvent) => {
		 isDragging.value = false;

		if(event.dataTransfer?.files && event.dataTransfer.files[0]){
			const file = event.dataTransfer.files[0];
			if(file.type === 'application/pdf' ){
				createForm.value.file = file;
			} else {
				materialStore.setError('Solamente se aceptan archivos PDF');
			}
		}
	};

	const controllCreateMaterial = async() => {
		if(!canSumbitCreate.value) return;

		uploading.value = true;
		try{
			// Procesar Tags
			const tags =  tagsInput.value
			 .split(',')
			 .map(t =>t.trim())
			 .filter(t>t.length > 0);

			const materialData = {
				title:  createForm.value.title.trim(),
				description: createForm.value.description.trim(),
				tags,
				category: createForm.value.category.trim(),
			}

				await materialStore.uploadMaterialFile(!createForm.value.file, materialData);
		}catch(error){
			console.error('Error al crear el Material:',error);
		}finally{
			uploading.value = false;
		}
	}

	const startEdit = (material: Material) => {
		const success = materialStore.startEditMaterial(material);

		if(success){
			// Logica para abir el modal de edicion
			console.log('Modo Edición Activado para :',material.titulo);
		}
	};

	const viewStatus = async (material: Material) => {
		selectedMaterial.value = material;
		showStatusModal.value = true;
	};

	const confirmDelete = (material: Material) => {
		materialToDelete.value = material;
		showDeleteModal.value = true;
	};

	const controllDelete = async () => {
		if(!materialStore.value) return;

		deleting.value = true;

		try{
			const success =  await materialStore.deleteMaterial(materialToDelete.value.uid);
			 
			 if(success){
				showDeleteModal.value = false;
				materialToDelete.value = null;
			 }
		}catch(error){
			console.error('Error al eliminar material: ', error);
		}finally{
			deleting.value = false;
		}
	}

	const getStatusLabel = (status: string): string => {
		const labels = {
			 pending: '⌛Pendiente',
			approved: '✅Arpobado',
			rejected: '❌Rechazado'
		};
		return labels[status as keyof labels] || status;
	};

	const getEmptyMessage = (): string => {
		const messages = {
			 all: 'No hay materiales disponibles',
			mine: 'Aún no has subido materiales',
			approved: 'No hay materiales aprobados',
			pending: 'No tienen materiales pendientes',
			rejected:  'No tienes materiales rechazados'
		};
		 return messages[activeTab.value];
	}

	const getEmptyDescription = (): string => {
		const descriptions = {
			all: 'Sube tu primer Material para comenzar',
			mine: 'Comparte tus apuntes, libros o artículos con la comunidad',
			approved: 'Los materiales aprobados se mostrarán aquí',
			pending: 'Tus materiales en revisión se mostrarán aquí',
			rejected: 'Los materiales rechazados se mostrarán aquí'
		};
		return descriptions[activeTab.value];
	}

	const formateDate = (date: any): string => {
		if(!date) return 'Fecha no disponible';

		 try{
			const d = date.toDate ? date.toDate() : new Date(date);
			 return d.toLocaleDateString('es-MX', {
				day: 'numeric',
				moth: 'short',
				year: 'numeric'
			 });
		 }catch(error){
			return 'Fecha inválida';
		 }
	}

	const formatFileSize = (bytes: number): string => {
		if(bytes === 0) return '0 Bytes';
		 const k = 1024;
		  const sizes = ['Bytes','KB','MB', 'GB'];
		  const i = Math.floor(Math.log(bytes) / Math.log(k));
			return Math.round(bytes/ Math.pow(k,i) * 100 / 100 +' '+ sizes[i]);
	};

	// ================
	//     LIFECYCLE
	// ================
	onMounted( async()=> {
		await refreshMaterials();
	});

</script>
  <!-- Errores sintacticos
   2 Clases juntas
roundex en lugar de rounded en la 122-->
 <style scoped> 
  .material-list-enter-active,
  .material-list-leave-active{
	 transition: all 0.3s eaase;
  }

  .material-list-enter-from{
	opacity: 0;
	transform: translateY(-20px);
  }

  .material-list-leave-to {
	opacity: 0;
	transform: scale(0.9);
  }


  /* Animación del Modal */
  .material-enter-active,
  .modal-leave-active{
	 transition: all 0.3s eaase; 
  }

  .modal-enter-from,
  .modal-leave-to {
	opacity: 0;
  }

  .modal-enter-from > div,
  .modal-leave-to > div {
	 transform: scale(0.9);
  }

  /* Utilidad Abrazadera en linea */
	.line-camp-2 {
			display: -web-kit-box;
			-web-wit-line-camp: 2;
			-web-wit-box-orient: vertical;
			overflow: hidden;
	}
 </style>