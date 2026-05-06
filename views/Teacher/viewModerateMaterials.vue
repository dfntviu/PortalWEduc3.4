<template>
	<div class="moderacion-vw-container min-h-screen bg-gray-50">
		<header class="page-header bg-white shadow-sm border-b border-gray-200">
			<div class="max-w-7-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div class="flex items-center justify-between mb-6">
					<h1 class="text-3xl font-bold text-gray-900">Moderacion de Materiales+</h1>
					<p class="mt-1 text-sm text-gray-600">Rev. Los materiales Educativos, subidos por los Estudiantes</p>
					<button class="btn-secondary flex-items-center gap-2">
						<!-- CAMBIO # 2-->
					     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
							  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
							</svg>
						Actualizar
					</button>
				</div>

				<!-- Cards de Estadisticas  -->
				<div class="grid grid-cols-1 md-grid-cols-4 gap-4">
					<div class="flex-items-center justify-between">
						<div>
							<p class="text-sm font-medium text-blue-600">Total</p>
							<p>{{countStatistics.pendientes}}</p>
						</div>
						<div class="p-3 bg-yellow-100 rounded-100 rounded-full">
							<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path  stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6 -3a9 9 0 11 -18 0 9 9 0 0 1 18 0z"></path>
							</svg>
						</div>
					</div>
				</div>
				<!-- Stat >> Aprobados -->
				<div class="stat-card bg-green-50 border border-green-200 rounded-lg p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="p-3 bg-green-100 rounded-full">{{countStatistics.aprobados}}
								<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 2l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
							</p>
						</div>
					</div>
				</div>
				<!-- Stat >> Rechazados -->
				<div class="stat-card bg-red-50 border border-red-200 rounded-lg p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-red-600">Rechazados</p>
							<p class="text-2xl font-bold text-red-900">{{countStatistics.rechazados}}</p>
						</div>
						<div class="p-3 bg-red-100 rounded-full">
							<svg class="w-6 h-6 text-red-600" fill="none">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								 d="M10 14l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z">
								</path>
							</svg>
						</div>
					</div>
				</div>
			</div> <!-- intocanble for now-->
		</header>
		<!-- Región de Filtros de Busqueda -->
		<section class="filters-section bg-white shadow-sm border-b gray-200">
			<div class="max-w-7xl mx-auto px-4 sm-px-6 lg:px-8 py-4">
				<div class="flex flex-col md:flex-row gap-4">
					<div class="flex-1">
						<div class="relative">
							<input type="text" v-model="filtros.search" class="w-full-p-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus-border-blue-500">
								<svg class="absolute left-3 top-25 w-5-h-5 text-gray-400" fill="none" 
								stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M21 2l-6 6m2-57a 7 0 11-14 0 7 7 0 0114 0z"/>
								</svg> 
						</div>
					</div>
					 <!-- Filtro por Materia -->
					 <div class="w-full md:w-48">
					 	<select  v-model="filtros.clasify_material" class="w-full px-4 py-2 border focus:border-blue-500">
					 		<option
					 		   v-for="material in materialesDisponibles" 
					 		    :key="material" :value="material">{{material}}
					 		</option>
					 	</select>
					 </div>

					 <!-- seccion de Ordenamiento -->
					 <div class="w-full md: w-48">
					 	<select v-model="filtros.order" name="" id="" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
					 		<option value="recent">mas Reciente</option>
					 		<option value="ancient">mas Antiguos</option>
					 		<option value="author">Por Autor</option>
					 	</select>
					 </div>
				</div>
			</div>
		</section>  <!--#endregion-->

		<!-- region GRID de materiales pendientes -->
		<section class="materiales-grid-section py-8">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex-items items-center justify-between mb-6">
					<h2 class="ml-2 text-lg font-normal text-gray-500">
						Materiales Pendientes
					</h2>
					<span>({{materialesFiltrados.length}})</span>
				</div>

				<!-- Agrupacion de Animaciones: -->
				  <!-- Grid responsivo con animaciones de Ent/Sda 
				   Tarjetas clickeables que seleccionan el material --> <!-- no hay article cierre por group-->
				 <TransitionGroup  name="material-list"  tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				 	<article v-for="material in materialesFiltrados"
				 	 class="material-card bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2"
				 	 :key="material.id"
				 	 @click="handleSeleccionarMaterial(material.id)"
				 	  :class="{ 
				 	  	'border-blue-500 ring-2 ring-blue-200':
				 	  	 esMaterialSeleccionado(material.id),
				 	  	 'border-gray-200' : !esMaterialSeleccionado(material.id)
				 	  }"
				 	  >

				 			<!-- Header Card -->
					 	<div class="p-4 border-b border-gray-100">
					 	  	<div class="flex items-start justify-between">
					 	  		<div class="flex-1">
					 	  			<h3>{{material.titulo}}</h3>
					 	  			<p class="mt-1 text-sm text-gray-600">
					 	  			  Por: {{material.nombreAlumno}}
					 	  			</p>
					 	  		</div>

					 	  		<!-- Indicador de Seleccion -->
					 	  		<div	v-if="esMaterialSeleccionado(material.id)"
					 	  			class="ml-2 p-2 bg-blue-100 rounded-full">
					 	  			<svg class="w-5 h-5 text-blue-600" fill="currentColor">
					 	  				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
					 	  			</svg>
					 	  		</div>
					 	  	</div>
					 	</div>

				 	  <!-- Contenido Card -->
					 	<div class="p-4 space-y-3">
					 	  	<div class="flex items-center text-sm">
					 	  		<svg class="w-4 text-gray-400 mr-2">
					 	  			<path stroke-linecap="round" stroke-linejoin="round" 
					 	  			  stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					 	  			></path>
					 	  		</svg>
					 	  		<span class="text-gray-700">{{material.area}}</span>
					 	  	</div>

					 	  	<div class="flex items-center text-sm">
					 	  	 	<svg class="w-4 h-4 text-gray-400 mr-2">
					 	  	 		<path stroke-linecap="round" stroke-linejoin="round"
					 	  	 		stroke-width="2" d="M7 21h10a2 2 00 002-V9.41a1 1 0
					 	  	 		00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
					 	  	 	</svg>
					 	  	      	<span class="text-gray-700">{{material.typeFile || 'PDF'}}</span>
					 	  	</div>

					 	  	<div class="flex items-center text-sm">
					 	  	 	<svg>
					 	  	 		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
					 	  	 	</svg>
					 	  	 		<span class="text-gray-700">{{formatearFecha(material.fechaSubida)}}</span>
					 	  	</div>
				 		</div>

					 	<div class="px-4 py-3 bg:gray-50 border-t border-gray-100 flex-items-center justify-between">
					 		<span class="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
					 			Pendiente
					 		</span>
					 		<span class="text-xs text-gray-500">
					 			{{contarComentariosXMaterial(material.id)}} comentarios
							</span>
					 	</div>
					</article>
				</TransitionGroup> <!-- /Grid materiales  -->

			</div>
		</section> <!-- endRegion -->
	
	    <Teleport to="body">
	     	<Transition name="slide-over">
	     		<div  v-if="currentMaterial !== null" class="fixed iset-0 z-50 overflow-hidden">
	     			  <!-- Overlay Obscuro -->
	     			<div class="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
	     			  <!-- Panel deslizante -->
	     		      <div class="absolute iset-y-0 rigth-0 max-2xl w-full bg-white shadow-2xl flex flex-col">
	     		<!-- </div> -->
	     			<!-- Encabezado: Inf basica del mat. seleccionado -->
	     		<header class="px-6 py-4 border-b border-gray-200 bg-gray-50">
	     			<div class="flex items-center justify-between">
	     				<div class="text-xl font-bold text-gray-900">
	     					<h2>{{currentMaterial}}</h2>
	     					<p class="mt-1 text-sm text-gray-600">
	     						Subido por:{{ currentMaterial.nombreAlumno}}
	     					</p>
	     				</div>	
	     					<!-- Boton de Cerrar -->
	     				<button  @click="handleCerrarPanel" class="ml-4 p-2 rounded-lg hover:bg-gray-200 transition-colors">
		     				<svg class="w-6 h-6 text-gray-600">
		     					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
		     						d="M6 18L8 6M6 6l12 12"
		     					 ></path>
		     				</svg>
	     				</button>
	     			</div>

 						<!-- Metadata de material -->
	     			<div class="mt-4 flex flex-wrap gap-4 text-sm">
	     				<div class="flex items-center">
	     					<svg class="w-4 h-4 text-gray-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	     							<path stroke-linecap="round" stroke-linejoin="round" 
	     								stroke-width="2" d="M12 6.253v13m0-13C10 5.477 9.246 5 7.5 5S4.168 5.477
	     								3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477
	     								14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5
	     								18c-1.746 0-3.332.477-4.5 1.253"
	     							/>
	     					</svg>
	     					<span class="text-gray-700">{{currentMaterial.material}}</span>
	     				</div>

	     				<div class="flex items-center">
	     					<svg class="w-4 h-4 text-gray-400 mr-1 5" fill="none" viewBox="0 0 24 24">
	     						<path stroke-linecap="round" stroke-linejoin="round"  stroke-width="2" 
	     						d="M7 21h10a2 2 0 002-2V9.414a1 1 0 
	     						00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
	     					</svg>
	     				</div>
	     			</div>
	     		</header>
	     		<!-- Seccion de Comentarios del rol Profesor-->
	     		<div class="flex-1 overflow-y-auto px-6 py-4">
	     			<section class="comentarios-section">
	     				<h3 class="text-lg font-semibold text-gray-900 mb-4">Comentarios de Retroalimentacion</h3>
	     					<!-- Lista de Comentarios existentes -->
	     				<div v-if="comentariosMaterialActual.length>0">
	     					<TransitionGroup name="comentario-list"> <!-- ??-->
	     						<article 
	     						  v-for="comentario in comentariosMaterialActual"
	     						  :key="comentario.id"
	     						   class="comentario-card p-4 rounded-lg border"
	     						   :class="{  
	     						   	  'bg-yellow-50 border-yellow-300': comentario.destacado,
	     						   	  'bg-yellow-50 border-gray-200' : !comentario.destacado}
	     						   ">

	     						  <!-- Header del comentario -->
	     						<div class="flex items-start justify-between mb-2">
	     						    <div class="flex items-center gap-2">
		     							<span class="tex-sm font-medium text-gray-700">
		     								{{comentario.autorNombre || 'Profesor'}}
		     						   </span>
		     						   <span v-if="comentario.destacado" 
		     						      class="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-0 5 rounded">
		     						    Destacado
		     						   </span>
	     					    	</div>

	     					      <!-- Acciones de Comentario -->
	     					      <div class="flex items-center gap-2">
	     					      	<button 
	     					      		@click="handleEditarComentario(comentario)"
	     					      	    class="text-gray-400 hover:text-blue-600 transition-colors"
	     					      	     title="Editar"
	     					      	     >
	     					      		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	     					      		  	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 16H9v-218.586-8.586z" />
	     					      		</svg>
	     					      	</button>
	     					      </div>
	     					      <!-- Eliminar Comentario  Modificado [26/04/24] -->
	     					      <button @click="handleEliminarComentario(comentario.id)"
									    class="text-gray-400 hover:text-red-600 transition-colors"
									    title="Eliminar">
									    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
									    </svg>
									</button>
								</div>
								    <!-- Contenido del Comentario -->
								<p class="text-gray-800 text-sm whitespace-pre-wrap">
									{{comentario.mensaje}}
								</p>
									<!-- Footer del Comentario -->
								<div class="mt-2 text-xs text-gray-500">
									{{formatearFecha(comentario.fechaCreacion)}}
								</div>

	     					    </article>
	     					</TransitionGroup>
	     				</div>

	     				<div v-else class="text-center py-8">
	     					<svg class="mx-auto w-12 h-12 text-gray-300">
	     						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
	     						 d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 01-2-2V6a2 2 0
	     						 0 012-2h14a2 2 012 2v8a2 2 01-2 2h-5l-5 5v-5z" />
	     					</svg>
     						<p class="mt-2 text-sm text-gray-500">
     							No hay comentarios aún.
     						</p>
	     				</div>

	     				<div class="nuevo-comentario-form bg-white border-gray-300 rounded-lg-p4">
	     					<h4 class="text-sm font-semibold text-gray-700 mb-3">Agregar Comentario</h4>
	     						
	     					<textarea v-model="newComment.mensaje" rows="4"
	     					placeholder="Escribe tu retroalimentación para el Alumno"
	     					 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:rigth-2 focus:ring-blue-500 
	     					 focus:border-blue-500 resize-none">
	     					</textarea>
	     					
	     					<div class="mt-3 flex items-center justify-between">
	     						 <label for="msg" class="flex items-center gap-2 cursor-pointer">
	     							<input v-model="newComment.destacado" row="4" placeholder="Escribe tu retroalimentacion para el estudiante" 
	     							class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
	     							<span class="text-sm text-gray-700">Marcar como leído</span>
	     						</label>

	     						<button 
	     						   @click="handleAgregarComentario"
	     						   :disabled="!esComentarioValido"
	     						  class="px-4 py-2 bg:blue-600 text-white rounded-lg hover:bg-blue-700 disabled-gray-300 disabled:cursor-not-allowed transition-colors">
	     							Agregar Comentario
	     						</button>
	     					</div>
	     				</div>
	     			</section>
	     		</div>
	     		<!-- #endCommentsTchr -->

	     		<!-- Acciones de Moderacion -->
	     		<footer class="px-6 py-4 items-center gap-4">
	     			<div class="flex items-center gap-4">
		     			<button  @click="handleAprobar"   :disabled="!currentMaterial"  class="flex-1 px-6 py-3 bg-green-600 text-white font-semibold ronded-lg hover:bg-green-700 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transtion-colors flex items-center justify-center gap-2">
		     				<svg class="w-5 h-5">
		     					<path/>
		     				</svg>
		     				Aprobar Material
		     			</button>

		     			<button  @click="handleMostrarRechazo"  :disabled="!currentMaterial" class="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:cursor-not-allowed transition-colors flex items-center justify-between gap-2">
		     				<svg class="w-5 h-5"  fill="none" stroke="currentColor" viewBox="0 0 24 24">
		     						<path stroke-linecap="round" stroke-linejoin="round"
		     						 stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		     				</svg>
		     				 Rechazar Material
		     			</button>
	     			</div>
	     		</footer>
	     	 </div>	<!-- /Panel deslizante -->
     	
     		 </div>
	     	</Transition>
	    </Teleport> <!-- #endRegion -->

	    <div v-if="loading && pendigsMaterials.length === 0" 
	       class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-40" > 
	    	<div class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-40">
	    		<div class="text-center">
	    			<svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
	    				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
	    			</svg>
	    			<p class="mt-4 text-gray-600 font-medium">Cargando los Materiales</p>
	    		</div>
	    	</div>

	    	<!-- Empty State -->
	    	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
	    		<svg class="mx-auto w-24 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
	    				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
	    				 d="M9 12l2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	    		</svg>
				<h3 class="mt-2 text-gray-500">
				 	No hay materiales pendientes para moderar, en este momento
				</h3>
				 <p class="mt-2 text-gray-500">No hay materiales pendiente de moderación en este momento</p>
	    	</div>

	    	<!-- Error of State on Modeation -->
	    	<div class="max-2-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	    		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
		    		<div class="flex items-start">
		    			<svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		    				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"  d="M12 8v4M0 4h.01M21 12a9 9 0 11-18 0 9 0 00118 0z" />
		    			</svg>
		    		</div>
		    		<div class="flex-1">
		    			<h3 class="text-red-800 font-semibold">Error al cargar los materiales.</h3>
		    			 <p class="mt-1 text-red-700">{{error}}</p>
		    			<button class="mt-3 px-4 bg-red-600 text-white-600 rounded-lg hover:bg-red-700 transitions-colors">
		    				Reintentar
		    			</button>
		    		</div>
	    	    </div>
	    	</div>
	    	<!-- ============ BEGGIN-CAMBIOS APLICADSO [2026/04/27]  ================ -->
	    	 <!-- Estado: Carga -->
				<div v-if="loading"
				  class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-40">
				  <div class="text-center">
				    <svg class="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
				      <path class="opacity-75" fill="currentColor"
				        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
				    </svg>
				    <p class="mt-4 text-gray-600 font-medium">Cargando materiales...</p>
				  </div>
				</div>
					<!-- Estado: Sin datos -->
				<div v-else-if="!loading && !error && pendigsMaterials.length === 0"
				  class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
				  <svg class="mx-auto w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
				  </svg>
				  <h3 class="mt-4 text-lg font-medium text-gray-900">Sin materiales pendientes</h3>
				  <p class="mt-2 text-gray-500">No hay materiales pendientes de moderación en este momento.</p>
				</div>
					<!-- Estado: Error -->
				<div v-else-if="error"
				  class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
				    <div class="flex items-start gap-3">
				      <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
				      </svg>
				      <div class="flex-1">
				        <h3 class="text-red-800 font-semibold">Error al cargar los materiales</h3>
				        <p class="mt-1 text-red-700">{{ error }}</p>
				        <button @click="handleActualizarDatos"
				          class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
				          Reintentar
				        </button>
				      </div>
				    </div>
				  </div>
				</div>
				<!-- ============ END_CAMBIOS APLICADSO [2026/04/27]  ================ -->
		</div> <!-- endRegion_Moderate -->

		<Teleport to="body">
	    	<Transition name="modal">
	    		<div
	    		   v-if="rejectOfModal.visible"
	    		  class="fixed inset-0 z- flex itemes-center justify-center p-4" 
	    		    @click.self="handleCerrarModalRechazo"
	    		   > 
	    		     <!-- Overlay -->
	    			<div class="absolute inset-0 bg-gray-900 bg-opacity-75"></div>
	    			   <!-- Modal Content  -->
	    				<div class="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
	    					<div class="flex items-center justify-between mb-4">
	    						<h3 class="text-xl font-bold text-gray-900">
	    						 Rechazar Material
	    						</h3>
	    						<button 
	    						     @click="handleCerrarModalRechazo"
	    						    class="text-gray-400 hover:text-gray-600 transtions-colors">
	    							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	    								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
	    								 d="M6 18L18 6M6 6l12 12"/>
	    							</svg>
	    						</button>
	    					</div>

		    				<p class="text-gray-600 mb-4">
		    				Por favor, proporciona una razón para el rechazo. Esta información será enviada al estudiante.
		    			    </p>
		    				<textarea v-model="rejectOfModal.reason"
		    				 class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-red-500 resize-none">
		    				 </textarea>
	    				
		    				<div class="mt-6 flex gap-6">
		    					<button  @click="handleCerrarModalRechazo" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transitions-colors">
		    						Cancelar
		    				   </button>
		    				   <button  @click="handleConfirmarRechazo"  :disabled="!rejectOfModal.reason.trim()"  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
		    				   	Confirmar Rechazo
		    				   </button>
		    				</div>
	    				</div>
	    	 		</div>
	    	</Transition>
		</Teleport>
	    	<!-- [Use]: Modal de Confirmacion para aprobacion -->
	    	<!-- [Objetive]: Proviene aprobaciónes accidentales -->

		<Teleport to="body">
	    	<Transition name="modal">
	    	<div v-if="confirmationModal.visible" 
	    	   class="fixed inset-0 z-[60] flex items-center justify-center p-4"
	    	    @click.self="handleCerrarModalCofirmacion"
	    	   >
	    	   	<!-- Overlay -->
	    		<div class="absolute inset-0 bg-gray-900 bg-opacity-75"></div>
	    		    <!-- ModalContent -->
	    		    <div class="relative bg-white rounded-lg shadow-lg shadow-2xl max-w-md w-full p-6">
		    			<div class="text-center">
		    				<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
		    					<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		    							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		    					</svg>
		    				</div>
		    				
		    					<h3 class="text-lg font-semibold text-gray-900 mb-2">Aprobar este material?</h3>
		    				<p class="text-gray-600 mb-6">
		    					El estudiante será notfificado y el material quedará disp. públicamente
		    				</p>

		    				<div class="flex gap-3">
		    				  	<button  @click="handleCerrarModalCofirmacion" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray transition-colors">
		    				  		Cancelar
		    				  	</button>
		    				  	<button @click="handleConfirmarAprobacion" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
		    				  	  Sí, Aprobarlo
		    				    </button>
		    				</div>
		    			</div>
	    			</div>
	    		</div>
	    	</Transition>
	    </Teleport> 
		 <!-- #endRegion: ConffirModal() -->
	</div>
</template>
	
<script setup lang="ts">
	import {ref, computed, onMounted, watch} from 'vue';
	import {useRouter} from 'vue-router';
	import {storeToRefs} from 'pinia';
	import {useModerationStore} from '@/stores/moderationStore';
	import type { Comentario2 } from '@/intefaces/Profile.types.ts';
	// import {getActivePinia} from 'pinia';
	/**
	 * La vista actual esta completa con respec Arquitectura. Solo se rompe en tiempo de ejecucion
	 * por imagen vectorial. Aun no carga nada pues tiene trascendencia con la vista predecesora
	 * vwAdminMaterialStudent*/
	const router = useRouter();
	const moderationStore = useModerationStore();

	const {
		pendigsMaterials,
		currentMaterial,
		comments,
		loading,
		error,
		stats
	} = storeToRefs(moderationStore);
	console.log('Material Actual --> ',currentMaterial.value);

	 // Getters computados del store
	const {
		comentariosDestacados,
		comentarioDeMaterial,
		hasPending,
		countStatistics,
		materialInRevition,
	} = moderationStore;
 
 	/*console.log('B ',getActivePinia()?.state.value);*/

	const filtros = ref({
		search: '',
		clasify_material: '',
		order: 'recent' as 'recent' | 'ancient' | 'author'
	});
	 // const {search, clasify_material, order } = toRefs(filtros);
	const newComment = ref({
		mensaje: '',
		destacado: false
	});

	const rejectOfModal = ref({
		visible: false,
		reason: ''
	});

	const confirmationModal = ref({
		visible: false
	});

	/**
	 * Materiales filtrados segun busqueda, materia y ordenamiento
	 * @computed
	 * */
	const materialesFiltrados = computed(() => {
		let resultado = [...pendigsMaterials.value];
		 // Filtro por Busqueda de Texto  [cambio 538, 546]**
		if(filtros.value.search){
			const busqueda = filtros.value.search.toLowerCase();
			resultado = resultado.filter( material =>
			 	 material.titulo.toLowerCase().includes(busqueda) ||
			 	 material.nombreAlumno.toLowerCase().includes(busqueda) ||
			 	 material.clasify_material.toLowerCase().includes(busqueda) 
			);
		}
		  // Filtros por Materia
		if(filtros.value.clasify_material){
			 resultado = resultado.filter( material =>
			 	material.clasify_material === filtros.value.clasify_material
			 );
		}
			/* Eran identics la notacion es mayor a menor prioridad. Diferencia de tiempo b-a** */
		  // Ordenamiento [cambio]** abajo de c/opc
		switch(filtros.value.order){
			case 'recent':
				// alert('Pulsaste la opcion reciente');
				return resultado.sort((a,b) =>{		//distitnos
					 new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime()
				});
			 break;

			case 'ancient': 	//alert('Pulsaste la opcion antiguos');
				 return  resultado.sort((a,b) => {
				  	new Date(a.fechaSubida).getTime() - new Date(b.fechaSubida).getTime();
				  });
				break;
			case 'author': 		// Sin formato de clase Tiempo
				// alert('Pulsaste la opcion x Autor');
				return  resultado.sort((a,b)=>{
					/*Nuevos Cambios Aplicados*/
					 const nombreA = a.nombreAlumno ?? '';
					 const nombreB = b.nombreAlumno ?? '';
						 nombreA.localeCompare(nombreB,'es-MX');
				  });
				break;
		}

		return resultado;
	});

	/**
	 * Materiales unicos disponibles en materiales pendientes [cambio]** 580
	 *  @computed
     **/ 
	const materialesDisponibles = computed(() => {
		const materiales = new Set(
			pendigsMaterials.value.map( m=> m.clasify_material)
		);
		  return Array.from(materiales).sort();
	});

	/**
	 * Comentarios del Material actualmente seleccionado
	 *  @computed
     **/ 
	const comentariosMaterialActual = computed(() => {
		if(!currentMaterial.value) return [];
		 return comentarioDeMaterial(currentMaterial.value.id);
	});

	/**
	 * Validacion del comentario nuevo  [cambio]**
	 * @computed*/  
	const esComentarioValido = computed(() => {
	 	return newComment.value.mensaje.trim().length > 0;
	});

	/**
	 * Handler: Actualiza los datos del servidor de Back-E
	 * @resposibility Recargar Materiales pendientes y estadistícas
	 * */
	async function handleActualizarDatos(): Promise<void> {
		try{
			await Promise.all([
				moderationStore.loadPendingsMaterials(),
				moderationStore.updateStatistics()
			]);
		}catch(error){
			console.error('[ModeracionView]:Error al actualizar la Informacion',error);
		}
	}

	/**
	 * Handler: Selecciona el material para revision
	 * @param materialId ID del material a Seleccionar
	 * @resposibility Delegar seleccion al store [cambio]** 621 enc tipo Promesa
	 * */
	async function handleSeleccionarMaterial(materialId: string): Promise <void> {
		if(!materialId){
			console.warn('ModeracionView: Id del material invalido');
			return;
		}
		// Inv. directa de seleccion del state > (p) of materials
		await moderationStore.materialSelected(materialId);
	}

	/**
	 * Handler: Cierra el Panel de Detalles
	 * @resposibility Limpiar la seccion actual
	 **/
	function handleCerrarPanel(): void {
		moderationStore.removeOfPendings('');
		 		// moderationStore.currentMaterial = null;
		 		// Limpiar formulario de comentario
		//  limpiar solo los materiales de la ses. actual (currentMaterial)
		moderationStore.clearCurrentMaterial();
		newComment.value =  {mensaje: '', destacado: false};
	}

	/**
	 * Verifica si el material está seleccionado
	 * @param materialId ID del material al verificar.
	 * @returns true si es el material actual
	 **/
	function esMaterialSeleccionado(materialId: string): boolean {
		 return currentMaterial.value?.id === materialId;
		 console.warn('Material Seleccionado', currentMaterial);
	}

	/**
	 * Verifica si el material está seleccionado
	 * Handler: Agrega un nuevo comentario al material actual
	 * @responsability delegar al store, validar y limpiar el formula
	 * */
	async function handleAgregarComentario(): Promise <void> {
		if(!currentMaterial.value){
			console.warn('No hay Material Seleccionado');
			 return;
		}

		if(!esComentarioValido.value){
			console.warn('Comentario no válido');
		}

		try{
			await moderationStore.addComment(currentMaterial.value.id, newComment.value.mensaje,newComment.value.destacado);

			 newComment.value = { mensaje: '', destacado: false};
		}catch(err){
			console.warn('ERROR al Agregar comentario:',err);
		}
	}

	function handleEditarComentario(comentario: Comentario): void {
  	 // TODO: Implementar modal de edición
 	 console.log('[ModeracionView] Editar comentario:', comentario.id);
	}


	async function handleEliminarComentario(comentarioId: string): Promise<void> {
		if(!currentMaterial.value) return;

		const asegurar_del = confirm('Eliminar el Comentario?');

		if(!asegurar_del) return;


		try{
			await moderationStore.deleteComment(comentarioId,currentMaterial.value.id);
		}catch(err){
			console.warn('[ModeracionVw]:Error al Eliminar comentario', err);
		}
	}

	function contarComentariosXMaterial(materialId: string): number {
	 	return	comentarioDeMaterial(materialId).length;
	}

	 // ────────────────────────────────────────
	 // 	 Acciones de Moderacion
	 // ────────────────────────────────────────
	/**
	 * Handler: Inicia proceso de aprobacion
	 * @responsability Most. modal de confirmacion
	 * */
	async function handleAprobar():Promise <void> {
		if(!currentMaterial.value){
			console.warn('[ModeracionVw] No hay Material Seleccionado');
			 return;
		}
		 // Si es act flagf(n)l, => es visible en DOM
		confirmationModal.value.visible = true;
	}

	/**
	 * Handler: Confirma y ejecuta su aprobacion
	 * @responsability Deleg. aprobacion del store y cerrar el panel
	 * */
	async function handleConfirmarAprobacion():Promise <void> {
		if(!currentMaterial.value) return;

		try{	
			 // Delegar forma nativa del store
			await moderationStore.approvateMaterial(currentMaterial.value.id, 
					currentMaterial.value.alumnoId);

			// Flujo sec. a los paneles p/informar
			handleCerrarModalCofirmacion();
			handleCerrarPanel();
				// TODO - Mostrar Toasting notify of successfully
			console.log('[ModeracionVw] El material fue Aprobado Exitosamente');
		} catch(err){
			console.error('[ModeracionVw] Error al Aprobar:', err);
		}
	}
	/**
	 * Handler: Muestra el modal de Rechazo
	 * @responsability Cambiar el estado del modal
	 * */
	function handleMostrarRechazo(): void {
		if(!currentMaterial.value) return;
			// Habilitado  explicitamente en caso de rechazo
		 rejectOfModal.value.visible = true;
	}

	/**
	 * Handler: Confirma y ejecuta su rechazo
	 * @responsability Validar razon, deleg store y cerrar modales
	 * */
	async function handleConfirmarRechazo(): Promise<void> {
		if(!currentMaterial.value) return;
		if(!rejectOfModal.value.reason.trim()){
			console.warn(' [ModeracionVw] La razón de Rechazo es requerida');
			 return;
		}

		try{
			await moderationStore.rejectedMaterial(currentMaterial.value.id,
												    currentMaterial.value.alumnoId, 
												   rejectOfModal.value.reason);

			 handleCerrarModalRechazo();
			 handleCerrarPanel();

			console.warn(' [ModeracionVw] La razón de Rechazado correctamente');
		}catch(err){
			console.warn(' [ModeracionVw] Error al rechazar el Material');
		}
	}
	
	/**
	 ** Personalizar comentario por seccion **/
	function handleCerrarModalRechazo(): void {
		rejectOfModal.value =  {visible: false, reason: ''};
	}

	function handleCerrarModalCofirmacion(): void {
		confirmationModal.value.visible =  false;
	}

	// ─────────────────────────────────
	// 	   Utilidades de Formato
	// ─────────────────────────────────
	function formatearFecha(fecha: Date | string): string {
		const dataObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

		return new Intl.DateTimeFormat('es-MX', {
		 	 year: 'numeric',
	 	 	 month: 'short',
		 	 day: 'numeric',
		 	 hour: '2-digit',
		 	 minute: '2-digit'
		}).format(dataObj);
	}

	// ───────────────────────
	// 	   LIFES OF CICLE
	// ───────────────────────

	// ===========================
	// 6. LIFECYCLE HOOKS
	// ==========================

	// =================================================================
	//  Que: Hooks de ciclo de vida de Vue
	//  Por-que: Ejecutar Lógica en momentos especifícos del componente.
	//  Notas: Principalmente para carga inicial de datos.
	// =================================================================
	onMounted( async ()=> {
	 	console.log('El commponente ha sido montado, cargando los datos..');
	 	 await handleActualizarDatos();
	 	 console.log(' [ModeracionVw] Los datos principales fueron cargados ');
	 	 await Promise.all([
			moderationStore.loadPendingsMaterials(),
			moderationStore.loadModerationStats(),
		]);
	});

	 // =======================================
	 //		WATCHER - SIM[OBSERVABLE PATTER]
	 // =======================================

	 /**
	 * Watcher: Resetea los Filtros cuando se cargan los nuevos materiales
	 * @responsability los materiales pendientes
	 * */  /*[cambio]  830**/
	watch(
	 	 () => pendigsMaterials.value.length,
	 	(newLength, oldLength) => {
	 	  	if(newLength>0 && oldLength === 0){
	 	  	 	filtros.value.search = '';
	 	  	 	filtros.value.clasify_material = '';
	 	  	}
	 	}
	);

	/** Cierra el panel, si el material actual se elimina de pendientes
	 * @responsability materialActual 842[negar cierpa panel, cuando no hay mats pendings]
	 * */
	watch(
	  () => currentMaterial.value,
	   (material) => {
	   	   if(material && !pendigsMaterials.value.find( m => m.id === material.id)){
	   	  	  console.warn(' [ModeracionVw] El Material actual ya no esta disponible en Pendientes');
	   	  	  handleCerrarPanel();
	   	  }
	   }
	);
</script>

<style scoped>
	   /** ===========================================================================
	    *    Estilos especifícos para esta vista que no estan cubiertos por Tailwind.
	    *  =========================================================================== **/
	/** ══════════════════════════════════════════════════════ **/
	/*** 		TRANSICIONES Y ANIMACIONES					  ***/
	/** ══════════════════════════════════════════════════════ **/

		/***
		 * ───────────────────────────────────────────────────
		 *      TransitioGroup para la lista de Materiales
		 * ───────────────────────────────────────────────────
		  ***/
		.material-list-move,
		.material-list-enter-active,
		.material-list-leave-active {
	 		transition: all 0.3s ease;
		}

		.material-list-enter-from {
			opacity: 0;
			transform: translateY(20px);
		}

		.material-list-leave-to {
			opacity: 0;
			transform: translateY(-20px);
		}

		.material-list-leave-active {
			position: absolute;
		}

		/***
		 * ───────────────────────────────────────────
		 *      Transicion de Panel Deslizante
		 * ───────────────────────────────────────────
		  ***/

		.slide-over-enter-from .absolute.inset-y-0,
		.slide-over-leave-to   .absolute.inset-y-0 {
			transform:  translateY(100%);
		}

	  .slide-over-enter-from .absolute.inset-0,
	  .slide-over-leave-to .absolute.inset-0 {
	  	 opacity: 0;
	  }

	  /***
		* ──────────────────────────────────
		*      Transición de Modales
		* ──────────────────────────────────
		 ***/
	  .modal-enter-active,
	  .modal-leave-active {
	  	 transition: all 0.2s ease;
	  }

	  .modal-enter-from,
	  .modal-leave-to {
	  		opacity: 0;
	  }
	  		/*Pseudoclases para  el Transition*/
		.modal-enter-from > div:last-child,
		.modal-leave-to > div:last-child {
			transform: scale(0.95);
		}

	  /***
		* ───────────────────────────────────────────
		*      TransitioGroup para comentarios
		* ───────────────────────────────────────────
		***/
	  	.comentario-list-move,
	  	.comentario-list-enter-active,
	  	.comentario-list-leave-active {
	  		transition: all 0.3s ease;
	  	}

	  	.comentario-list-enter-from {
	  		opacity: 0;
	  		transform: translateY(-20px);
	  	}

	  	.comentario-list-leave-to {
	  		opacity: 0;
	  		transform: translateY(20px);
	  	}

	/** ══════════════════════════════════════════════════════ **/
	/*** 				UTILIDADES PERSONALIZADAS 			  ***/	
	/** ══════════════════════════════════════════════════════ **/

		/***
		 * ──────────────────────────────────────────────────
		 *     line-clamp para truncar texto
		 * ──────────────────────────────────────────────────
		  ***/	
	   .line-clamp-2 {
	    	display: -webkit-box;
	    	-webkit-box-orient: vertical;
	    	overflow: hidden;
	   }

		 /***
		 * ──────────────────────────────────────────────────
		 *     Scroll suave en Panel
		 * ──────────────────────────────────────────────────
		  ***/			
		.overflow-y-auto {
			scrollbar-width: thin;
			scrollbar-color: rgba(156, 163, 175, 0.5);
		}-
		.overflow-y-auto::-webkit-scrollbar {
	    	width: 6px;
		}

		.overflow-y-auto::-webkit-scrollbar-track {
	    	background: transparent ;
		}

		.overflow-y-auto::-webkit-scrollbar-thumb {
			background-color: rgba(156, 163, 175, 0.5);
			border-radius: 3px;
		}

		.overflow-y-auto::-webkit-scrollbar:hover {
			background-color: rgba(156, 163, 175, 0.7);;
		}

</style>