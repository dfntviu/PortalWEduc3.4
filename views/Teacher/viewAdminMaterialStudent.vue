<template>
  <!-- ╔══════════════════════════════════════════════════════════════════════╗
       ║  VISTA: Gestión de Materiales Educativos (Docente)                   ║
       ║  Patrón: Services-Stores-Views                                       ║
       ║  Responsabilidad: UI State + Interacciones de Usuario                ║
       ╚══════════════════════════════════════════════════════════════════════╝ -->

  <!-- ═══════════════════════════════════════════════════════════════════════
       MAIN CONTAINER
       - Contenedor raíz con soporte para modo transparencia (glassmorphism)
       - La clase 'glass-mode' se activa/desactiva via toggle
       ═══════════════════════════════════════════════════════════════════════ -->
  <main 
    :class="[
      'main-container',
      'min-h-screen',
      'transition-all duration-500 ease-in-out',
      modoTransparencia 
        ? 'bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-xl'
        : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'
    ]"
  >
    <!-- ─────────────────────────────────────────────────────────────────────
         CONTENT WRAPPER
         - Centraliza el contenido con max-width responsivo
         - Padding adaptativo según breakpoint
         ───────────────────────────────────────────────────────────────────── -->
    <div class="content-wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- ═══════════════════════════════════════════════════════════════════
           HEADER SECTION
           - Animación de entrada con fade + slide
           - Sombra sutil en hover para profundidad
           ═══════════════════════════════════════════════════════════════════ -->
      <header 
        :class="[
          'header-section',
          'mb-8 p-6 rounded-2xl',
          'animate-header-entrance',
          'transition-all duration-300 ease-out',
          modoTransparencia
            ? 'glass-card border border-white/10'
            : 'bg-white dark:bg-slate-800 shadow-soft hover:shadow-elevated'
        ]"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="header-text-group">
            <h1 
              class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 
                     tracking-tight animate-text-glow"
            >
              Gestión de Materiales Educativos
            </h1>
            <p 
              class="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base
                     animate-fade-in-delayed"
            >
              Administra y filtra los materiales académicos de tus estudiantes
            </p>
          </div>
          
          <!-- Badge de estado general -->
          <div 
            v-if="totalMateriales > 0"
            class="status-badge self-start sm:self-center px-4 py-2 
                   bg-emerald-100 dark:bg-emerald-900/30 
                   text-emerald-700 dark:text-emerald-400
                   rounded-full text-sm font-medium
                   animate-scale-in shadow-sm"
          >
            {{ totalMateriales }} material(es) cargados
          </div>
        </div>
      </header>

      <!-- ═══════════════════════════════════════════════════════════════════
           FILTER SECTION
           - Controles de filtrado con transiciones suaves
           - Descripción dinámica del filtro activo
           ═══════════════════════════════════════════════════════════════════ -->
      <section 
        :class="[
          'filter-section',
          'mb-6 p-6 rounded-xl',
          'animate-slide-up',
          'transition-all duration-300 ease-out',
          modoTransparencia
            ? 'glass-card border border-white/10'
            : 'bg-white dark:bg-slate-800 shadow-soft hover:shadow-elevated'
        ]"
        aria-labelledby="filter-heading"
      >
        <h2 id="filter-heading" class="sr-only">Opciones de Filtrado</h2>
        
        <div class="flex flex-col lg:flex-row lg:items-end gap-4">
          <!-- Select Group -->
          <div class="filter-control-group flex-1">
            <label 
              for="filter-select" 
              class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
            >
              Seleccionar filtro de visualización
            </label>
            
            <select 
              id="filter-select"
              v-model="filtroSeleccionado"
              @change="handleFiltroChange"
              :class="[
                'filter-select',
                'w-full px-4 py-3 rounded-lg',
                'border-2 transition-all duration-200',
                'cursor-pointer',
                'focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none',
                modoTransparencia
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                  : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500'
              ]"
            >
              <option :value="null" disabled>-- Selecciona un filtro --</option>
              <option 
                v-for="opcion in OPCIONES_FILTRO" 
                :key="opcion.id"
                :value="opcion.id"
              >
                {{ opcion.label }}
              </option>
            </select>
          </div>
          
          <!-- Action Button -->
          <button
            @click="handleFiltroChange"
            :disabled="!esValidoFiltroSeleccionado()"
            :class="[
              'action-button',
              'px-6 py-3 rounded-lg font-medium',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              esValidoFiltroSeleccionado()
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg focus:ring-blue-500'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            ]"
          >
            Aplicar Filtro
          </button>
        </div>
        
        <!-- Filter Description Badge - Con transición -->
        <Transition name="fade-slide">
          <div 
            v-if="descripcionFiltroActivo"
            class="filter-description mt-4 p-4 
                   bg-blue-50 dark:bg-blue-900/20 
                   border-l-4 border-blue-500 
                   rounded-r-lg animate-fade-in"
          >
            <div class="flex items-center gap-2">
              <svg 
                class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fill-rule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clip-rule="evenodd" 
                />
              </svg>
              <div>
                <span class="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  Filtro Activo:
                </span>
                <p class="text-sm text-blue-800 dark:text-blue-200 mt-0.5">
                  {{ descripcionFiltroActivo }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </section>
      <!-- ═══════════════════════════════════════════════════════════════════
           CONTENT SECTION - Estados Mutuamente Excluyentes
           - Solo un estado se renderiza a la vez (v-if/v-else-if)
           - Transiciones suaves entre estados
           ═══════════════════════════════════════════════════════════════════ -->
      <Transition name="fade-scale" mode="out-in">
        
        <!-- ─────────────────────────────────────────────────────────────────
             LOADING STATE
             - Spinner animado con mensaje descriptivo
             - Accesibilidad: role="status" + aria-label
             ───────────────────────────────────────────────────────────────── -->
        <section 
          v-if="materialStore.loading"
          key="loading"
          :class="[
            'state-container state-loading',
            'p-12 rounded-xl text-center',
            modoTransparencia
              ? 'glass-card border border-white/10'
              : 'bg-white dark:bg-slate-800 shadow-soft'
          ]"
        >
          <div 
            role="status" 
            class="flex flex-col items-center justify-center space-y-4"
            aria-label="Cargando materiales"
          >
            <div class="loading-spinner relative">
              <div class="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
              <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
            </div>
            <p class="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
              Cargando materiales...
            </p>
          </div>
        </section>

        <!-- ─────────────────────────────────────────────────────────────────
             ERROR STATE
             - Mensaje de error con opción de reintento
             - Animación shake para llamar la atención
             ───────────────────────────────────────────────────────────────── -->
        <section 
          v-else-if="materialStore.error"
          key="error"
          :class="[
            'state-container state-error',
            'p-6 rounded-xl',
            'animate-shake',
            modoTransparencia
              ? 'glass-card border border-red-500/30'
              : 'bg-white dark:bg-slate-800 shadow-soft'
          ]"
        >
          <div 
            class="flex items-start space-x-4 p-4 
                   bg-red-50 dark:bg-red-900/20 
                   border-l-4 border-red-500 rounded-r-lg"
          >
            <svg 
              class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" 
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path 
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="flex-1">
              <h3 class="text-red-800 dark:text-red-300 font-semibold mb-1">
                Error al cargar los materiales
              </h3>
              <p class="text-red-700 dark:text-red-400 text-sm">
                {{ materialStore.error }}
              </p>
              <button
                @click="reintentar"
                class="mt-3 px-4 py-2 
                       bg-red-600 hover:bg-red-700 active:bg-red-800 
                       text-white rounded-lg text-sm font-medium 
                       transition-colors duration-200 
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                       shadow-md hover:shadow-lg"
                aria-label="Reintentar la carga de materiales"
              >
                Reintentar
              </button>
            </div>
          </div>
        </section>

        <!-- ─────────────────────────────────────────────────────────────────
             RESULTS STATE
             - Grid responsivo de materiales
             - TransitionGroup para animación de lista
             ───────────────────────────────────────────────────────────────── -->
        <section 
          v-else-if="tieneMateriales"
          key="results"
          :class="[
            'state-container state-results',
            'p-6 rounded-xl',
            'animate-fade-in',
            modoTransparencia
              ? 'glass-card border border-white/10'
              : 'bg-white dark:bg-slate-800 shadow-soft'
          ]"
        >
          <!-- Results Header -->
          <header 
            class="results-header flex flex-col sm:flex-row sm:items-center sm:justify-between 
                   mb-6 pb-4 border-b border-slate-200 dark:border-slate-700"
          >
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                Resultados del Filtro
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {{ totalMateriales }} material(es) encontrado(s)
              </p>
            </div>
            
            <!-- Counter Badge -->
            <div 
              class="counter-badge mt-3 sm:mt-0 px-4 py-2 
                     bg-blue-100 dark:bg-blue-900/30 
                     rounded-lg animate-scale-in self-start sm:self-center"
            >
              <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ totalMateriales }}
              </span>
            </div>
          </header>

          <!-- Materials Grid -->
          <TransitionGroup 
            name="list-stagger" 
            tag="div" 
            class="materials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <article 
              v-for="(material, index) in materialesFiltrados" 
              :key="material.id || index"
              :class="[
                'material-card',
                'p-4 rounded-lg',
                'transition-all duration-300 ease-out',
                'hover:scale-[1.02] hover:-translate-y-1',
                modoTransparencia
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                  : 'bg-slate-50 dark:bg-slate-700/50 hover:shadow-md'
              ]"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <!-- Card Header -->
              <div class="flex items-start justify-between mb-3">
                <h3 
                  class="font-semibold text-slate-900 dark:text-slate-100 
                         line-clamp-2 flex-1 pr-2"
                >
                  {{ material.title }}
                </h3>
                <span 
                  class="ml-2 px-2 py-1 
                         bg-emerald-100 dark:bg-emerald-900/30 
                         text-emerald-700 dark:text-emerald-400 
                         text-xs font-medium rounded-full flex-shrink-0"
                >
                  {{ material.fileType || 'PDF' }}
                </span>
              </div>

              <!-- Card Meta Info -->
              <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <!-- Author -->
                <div class="flex items-center space-x-2">
                  <svg 
                    class="w-4 h-4 flex-shrink-0" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >     <!-- Cambio efectuado en la linea 372: En dado caso de que el algoritmo de 
                    guardado con el campo nombreCompleto->nombreAlumno falle entonces sera mostrada
                    la tercera opcion-->
                    <path 
                      fill-rule="evenodd" 
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                      clip-rule="evenodd" 
                    />
                  </svg>
                  <span>{{  material.nombreAlumno || material.uploadedBy || 'Sin autor' }}</span>
                </div>
                
                <!-- Date -->
                <div class="flex items-center space-x-2">
                  <svg 
                    class="w-4 h-4 flex-shrink-0" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fill-rule="evenodd" 
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ formatearFechaLocal(material.uploadedAt) }}</span>
                </div>
              </div>
            </article>
          </TransitionGroup>
        </section>

        <!-- ─────────────────────────────────────────────────────────────────
             EMPTY STATE
             - Cuando el filtro no retorna resultados
             - Icono ilustrativo + mensaje descriptivo
             ───────────────────────────────────────────────────────────────── -->
        <section 
          v-else-if="filtroSeleccionado !== null && !materialStore.loading"
          key="empty"
          :class="[
            'state-container state-empty',
            'p-12 rounded-xl text-center',
            modoTransparencia
              ? 'glass-card border border-white/10'
              : 'bg-white dark:bg-slate-800 shadow-soft'
          ]"
        >
          <div class="flex flex-col items-center space-y-4">
            <svg 
              class="w-20 h-20 text-slate-300 dark:text-slate-600 animate-bounce-slow" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No hay materiales disponibles
              </h3>
              <p class="text-slate-600 dark:text-slate-400 max-w-md">
                No se encontraron materiales con el filtro seleccionado. 
                Intenta con otro criterio de búsqueda.
              </p>
            </div>
          </div>

        </section>

        <!-- ─────────────────────────────────────────────────────────────────
             INITIAL STATE
             - Estado por defecto antes de seleccionar filtro
             - Call-to-action visual
             ───────────────────────────────────────────────────────────────── -->
        <section 
          v-else
          key="initial"
          :class="[
            'state-container state-initial',
            'p-12 rounded-xl text-center',
            modoTransparencia
              ? 'glass-card border border-white/10'
              : 'bg-white dark:bg-slate-800 shadow-soft'
          ]"
          role="status"
          aria-live="polite"
        >
          <div class="flex flex-col items-center justify-center space-y-4">
            <svg 
              class="w-20 h-20 text-blue-500 dark:text-blue-400 animate-pulse-slow" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
              />
            </svg>
            <div>
              <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Selecciona un Filtro
              </h3>
              <p class="text-slate-600 dark:text-slate-400">
                Elige una opción de filtrado para visualizar los materiales
              </p>
            </div>
          </div>
        </section>
      </Transition>

      <!-- ═══════════════════════════════════════════════════════════════════
           TRANSPARENCY TOGGLE CONTROL
           - Ubicado al final del template según especificación
           - Controla el modo glassmorphism de toda la vista
           ═══════════════════════════════════════════════════════════════════ -->
      <div class="transparency-toggle-container fixed bottom-6 right-6 z-40">
        <button
          @click="toggleModoTransparencia"
          :class="[
            'toggle-button',
            'flex items-center gap-2 px-4 py-3 rounded-full',
            'font-medium text-sm',
            'transition-all duration-300 ease-out',
            'shadow-lg hover:shadow-xl',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            modoTransparencia
              ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 focus:ring-white/50'
              : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-500'
          ]"
          :aria-pressed="modoTransparencia"
          aria-label="Alternar modo transparencia"
        >
          <!-- Icono dinámico según estado -->
          <svg 
            v-if="modoTransparencia"
            class="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            stroke-width="2"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <svg 
            v-else
            class="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            stroke-width="2"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span class="hidden sm:inline">
            {{ modoTransparencia ? 'Modo Sólido' : 'Modo Glass' }}
          </span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         TELEPORT: Sistema de Notificaciones
         - Renderizado en body para evitar problemas de z-index
         - Posición fixed en esquina superior derecha
         ═══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="notification-slide">
        <div 
          v-if="mostrarNotificacion"
          class="notification-container fixed top-4 right-4 z-50 max-w-md animate-slide-in"
        >
          <div 
            :class="[
              'notification-card',
              'flex items-start gap-3 p-4 rounded-lg shadow-2xl',
              'border-l-4 backdrop-blur-sm',
              notificacionClass
            ]"
          >
            <!-- Notification Icon -->
            <svg 
              class="w-6 h-6 flex-shrink-0"
              :class="notificacionIconClass"
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <!-- Success Icon -->
              <path 
                v-if="notificacionTipo === 'success'"
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
              <!-- Error Icon -->
              <path 
                v-else-if="notificacionTipo === 'error'"
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
              <!-- Info Icon (default) -->
              <path 
                v-else
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              />
            </svg>
            
            <!-- Notification Content -->
            <div class="flex-1">
              <p class="font-medium text-slate-900 dark:text-slate-100">
                {{ notificacionMensaje }}
              </p>
            </div>
            
            <!-- Close Button -->
            <button
              @click="cerrarNotificacion"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 
                     transition-colors duration-200 p-1 rounded
                     focus:outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Cerrar notificación"
            >
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
      <!-- <div>
        <div class="material-card loading-spinner"  v-if="lastFilter === 3 && !loading && materials.length > 0">
          <template v-for="(mats, autor) in materialsByAuthor" :key="autor"> 
             coorreg interpolacion, comments
            < --Encabezado de grupo -- --
            <h3 class="text-lg font-semibold text-gray-700 mt-6 mb-3 border-b pb-2">
              { autor }}
            </h3>

            <--Tarjetas del grupo -- --
            <section v-for="(m, index) in mats" :key="m.id"
              class="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4 mb-2 shadow-sm">
              
              <span class="text-xs text-gray-400 w-6 text-center font-mono">
                { index + 1 }}
              </span>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{ m.title }}</p>
                <p class="text-sm text-gray-500">{ m.uploadedBy }}</p>
              </div>
              <p class="text-sm text-gray-400">
                { m.uploadedAt?.toDate().toLocaleDateString('es-MX') }}}
              </p>
              <span class="text-xs px-2 py-1 rounded-full"
                :class="m.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-green-100 text-green-700'">
                { m.status }}
              </span>

            </section>
          </template>
        </div> 
      </section> END_GROUPED-AUTHOR -->
    </Teleport>
  </main>
</template>

<script setup lang="ts">
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                              IMPORTS                                     ║
// ║  Orden: Vue Core → Stores → Composables → Types                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// Vue Core
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// Libreria Pinia
 import {storeToRefs } from 'pinia';

// Stores
import { useMaterialTeachStore } from '@/stores/materialTeacherStore';

// Composables
import { useDateFormatter } from '@/composables/useDateFormatter';
import { useNotifications } from '@/composables/useNotifications';

// Types
import type { Material } from '@interfaces/Profilte.types.ts';
import type { Timestamp } from 'firebase/firestore';
	// import { Material} from '@/interfaces/Profilte.types.ts';


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                            COMPOSABLES                                   ║
// ║  Inicialización de funcionalidad reutilizable                            ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const { formatearFecha } = useDateFormatter(); 

const {
  mostrarNotificacion,
  notificacionMensaje,
  notificacionTipo,
  notificacionClass,
  notificacionIconClass,
  mostrar: mostrarNotificacionFn,
  cerrar: cerrarNotificacion
} = useNotifications();


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                              STORES                                       ║
// ║  Acceso al estado global de materiales                                   ║
// ╚══════════════════════════════════════════════════════════════════════════╝

const materialStore = useMaterialTeachStore();
// const  { materials} = storeToRefs(materialStore);
// const materialStore =  computed( () => useMaterialTeachStore());
// const { materials, loading, error, lastFilter, materialsByAuthor } = storeToRefs(materialStore);
  // descomentar cuando se funcional el filtro especializado -> funcionaba en la ult prueba: 7/05/26
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                         VARIABLES REACTIVAS                               ║
// ║  Estado local del componente                                             ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/** Filtro actualmente seleccionado (null = ninguno) */
const filtroSeleccionado = ref<number | null>(null);


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                            CONSTANTES                                     ║
// ║  Configuración inmutable del componente                                  ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/** Opciones disponibles para el filtrado de materiales */
const OPCIONES_FILTRO = [
  {
    id: 1,
    label: 'Todos los materiales',
    description: 'Muestra todos los materiales subidos por estudiantes',
  },
  {
    id: 2,
    label: 'Más recientes primero[De las últimas 2 semanas]',
    description: 'Materiales ordenados por fecha de subida (más nuevos primero)',
  },
  {
    id: 3,
    label: 'Por nombre de usuario',
    description: 'Materiales agrupados por el nombre del estudiante que lo subió',
  },
  {
    id: 4,
    label: 'Subidos hoy',
    description: 'Solo materiales subidos el día de hoy',
  },
  {
    id: 5,
    label: 'Últimos 2 días',
    description: 'Materiales subidos en las últimas 48 horas',
  },
  {
    id: 6,
    label: 'Última semana',
    description: 'Materiales subidos en los últimos 7 días',
  },
  // Aniadir opcion 7, cuando se corrija el Filtro con data imp todos los mats d c/uid, por secciones
] as const;

/** Rango válido de IDs de filtro para validación */
const RANGO_FILTRO_VALIDO = { MIN: 1, MAX: 6 } as const;

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                       PROPIEDADES COMPUTADAS                              ║
// ║  Valores derivados del estado (reactivos y cacheados)                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/**
 * Materiales filtrados obtenidos del store.
 * Derivación pura del estado global.
 */
const materialesFiltrados = computed<Material[]>(() => {
  return materialStore.materials || [];
});

/**
 * Indica si hay materiales para mostrar.
 * Usado para condicionar el renderizado del estado RESULTS.
 */
const tieneMateriales = computed<boolean>(() => {
  return materialesFiltrados.value.length > 0;
});

/**
 * Total de materiales encontrados.
 * Mostrado en badges y headers.
 */
const totalMateriales = computed<number>(() => {
  return materialesFiltrados.value.length;
});

/**
 * Descripción del filtro actualmente seleccionado.
 * Null si no hay filtro seleccionado.
 */
const descripcionFiltroActivo = computed<string | null>(() => {
  if (filtroSeleccionado.value === null) return null;

  const opcion = OPCIONES_FILTRO.find(opt => opt.id === filtroSeleccionado.value);
  return opcion?.description || null;
});


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                             WATCHERS                                      ║
// ║  Observadores de cambios en el estado                                    ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/**
 * Observa cambios en el error del store para mostrar notificaciones.
 * Se dispara automáticamente cuando materialStore.error cambia.
 */
watch(
  () => materialStore.error,
  (nuevoError) => {
    if (nuevoError) {
      mostrarNotificacionFn(nuevoError, 'error');
    }
  }
);

/**
 * Observa cuando se cargan los materiales exitosamente.
 * Muestra notificación de éxito con el conteo.
 */
watch(
  () => materialStore.materials,
  (nuevosMateriales, materialesPrevios) => {
    // Solo notificar si hay un filtro activo y había datos previos (o era vacío)
    const teníaDatosPrevios = !materialesPrevios || materialesPrevios.length === 0;
    
    if (teníaDatosPrevios && filtroSeleccionado.value !== null && nuevosMateriales) {
      mostrarNotificacionFn(
        `Se encontraron: ${nuevosMateriales.length} material(es)`,
        'success'
      );
    }

    /*if (filtroSeleccionado === 7 && nuevosMateriales.length>0) {
      alert('Mostrando autor con elementos Especificios.');
    }*/
  }
);

/*watch(lastFilter, (newFilter) => { console.log('ingresaste al Watch de filtro'); if (newFilter === 3) 
 {  materialStore.fetchMaterialsByFilter(3);  } .-> se fue al watch principal de ex. de conteo });

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                              MÉTODOS                                      ║
// ║  Handlers de eventos y lógica de negocio                                 ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/**
 * Maneja el cambio del selector de filtros.
 * Valida la entrada y delega la operación al store.
 */
const handleFiltroChange = (): void => {
  if (!esValidoFiltroSeleccionado()) {
    mostrarNotificacionFn('Debes seleccionar un filtro válido', 'error');
    return;
  }

  // Delegación pura al store - la vista no conoce la implementación
  materialStore.fetchMaterialsByFilter(filtroSeleccionado.value!);
};

/**
 * Reintenta la última operación fallida.
 * Útil para recuperarse de errores de red.
 */
const reintentar = (): void => {
  if (!esValidoFiltroSeleccionado()) {
    mostrarNotificacionFn('No hay filtro seleccionado para reintentar', 'info');
    return;
  }

  materialStore.fetchMaterialsByFilter(filtroSeleccionado.value!);
};

/**
 * Formatea una fecha usando el composable.
 * Wrapper local que maneja el formato de tiempo local con fallbacks.
 * 
 * @param timestamp - Timestamp de Firebase, Date, o null
 * @returns Fecha formateada o mensaje de error
 */
const formatearFechaLocal = (timestamp: Timestamp | Date | null): string => {
  if (!timestamp) return 'Fecha desconocida';

  try {
    return formatearFecha(timestamp);
  } catch (error) {
    console.error('[vwAdminMaterials] Error al formatear fecha:', error);
    return 'Fecha no válida';
  }
};


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                           VALIDACIONES                                    ║
// ║  Funciones de validación de datos                                        ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/**
 * Valida si el filtro seleccionado está en el rango correcto.
 * 
 * @returns true si el filtro es válido, false en caso contrario
 */
const esValidoFiltroSeleccionado = (): boolean => {
  const valor = filtroSeleccionado.value;
  
  if (valor === null) return false;

  return (
    Number.isInteger(valor) &&
    valor >= RANGO_FILTRO_VALIDO.MIN &&
    valor <= RANGO_FILTRO_VALIDO.MAX
  );
};


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                          LIFECYCLE HOOKS                                  ║
// ║  Inicialización y limpieza del componente                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/**
 * Inicialización del componente.
 * Limpia el estado del store al montar.
 */
onMounted(() => {
  // Reinicia el store a estado limpio
  materialStore.$reset();
  
  // Limpia notificaciones previas
  cerrarNotificacion();
});

/**
 * Limpieza al desmontar.
 * Previene memory leaks y estados inconsistentes.
 */
onUnmounted(() => {
  cerrarNotificacion();
});


// ╔══════════════════════════════════════════════════════════════════════════╗
// ║                    LÓGICA DE TRANSPARENCIA (TOGGLE)                       ║
// ║  Ubicada al final del script según especificación                        ║
// ║  Controla el modo glassmorphism de toda la vista                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝

/** Estado del modo transparencia (glassmorphism) */
const modoTransparencia = ref<boolean>(false);

/**
 * Alterna el modo de transparencia de la vista.
 * Afecta todos los contenedores que soporten glassmorphism.
 */
const toggleModoTransparencia = (): void => {
  modoTransparencia.value = !modoTransparencia.value;
  
  // Notificación opcional del cambio de modo
  mostrarNotificacionFn(
    modoTransparencia.value 
      ? 'Modo Glass activado' 
      : 'Modo sólido activado',
    'info'
  );
};
</script>

<style scoped>
/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                         ESTILOS GLOBALES                                  ║
   ║  Variables CSS y configuración base                                      ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */

/* ─────────────────────────────────────────────────────────────────────────────
   SOMBRAS PERSONALIZADAS
   - shadow-soft: Sombra sutil para estado normal
   - shadow-elevated: Sombra pronunciada para hover/focus
   ───────────────────────────────────────────────────────────────────────────── */
.shadow-soft {
  box-shadow: 
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.shadow-elevated {
  box-shadow: 
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

/* ─────────────────────────────────────────────────────────────────────────────
   EFECTO GLASSMORPHISM
   - Fondo semi-transparente con blur
   - Borde sutil para definición
   ───────────────────────────────────────────────────────────────────────────── */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                         ANIMACIONES DE ENTRADA                            ║
   ║  Keyframes para la aparición inicial de elementos                        ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER ENTRANCE
   - Combinación de fade + slide desde arriba
   - Timing suave con ease-out
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes header-entrance {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-header-entrance {
  animation: header-entrance 0.6s ease-out forwards;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEXT GLOW
   - Efecto sutil de brillo en el título
   - Solo visible en modo oscuro
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes text-glow {
  0%, 100% {
    text-shadow: 0 0 0 transparent;
  }
  50% {
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }
}

.animate-text-glow {
  animation: text-glow 3s ease-in-out infinite;
}

/* ─────────────────────────────────────────────────────────────────────────────
   FADE IN DELAYED
   - Fade simple con delay para secuenciación
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes fade-in-delayed {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animate-fade-in-delayed {
  animation: fade-in-delayed 0.8s ease-out 0.3s forwards;
  opacity: 0;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SLIDE UP
   - Entrada desde abajo para secciones
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCALE IN
   - Aparición con efecto de escala para badges
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

/* ─────────────────────────────────────────────────────────────────────────────
   FADE IN SIMPLE
   - Fade básico sin transformaciones
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out forwards;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHAKE
   - Animación de error/atención
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.6s ease-in-out;
}

/* ─────────────────────────────────────────────────────────────────────────────
   BOUNCE SLOW
   - Bounce suave para iconos de estado vacío
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PULSE SLOW
   - Pulso suave para iconos de estado inicial
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2.5s ease-in-out infinite;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SLIDE IN (Notificaciones)
   - Entrada lateral para notificaciones
   ───────────────────────────────────────────────────────────────────────────── */
@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                        TRANSICIONES DE VUE                                ║
   ║  Clases para <Transition> y <TransitionGroup>                            ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */

/* ─────────────────────────────────────────────────────────────────────────────
   FADE-SCALE
   - Transición principal entre estados del contenido
   - Combina fade con escala sutil
   ───────────────────────────────────────────────────────────────────────────── */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease-out;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* ─────────────────────────────────────────────────────────────────────────────
   FADE-SLIDE
   - Para descripción del filtro activo
   ───────────────────────────────────────────────────────────────────────────── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ─────────────────────────────────────────────────────────────────────────────
   LIST-STAGGER
   - Para TransitionGroup de materiales
   - Efecto escalonado (stagger) mediante animation-delay
   ───────────────────────────────────────────────────────────────────────────── */
.list-stagger-enter-active {
  transition: all 0.4s ease-out;
}

.list-stagger-leave-active {
  transition: all 0.3s ease-in;
  position: absolute;
}

.list-stagger-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.list-stagger-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}

.list-stagger-move {
  transition: transform 0.4s ease-out;
}

/* ─────────────────────────────────────────────────────────────────────────────
   NOTIFICATION-SLIDE
   - Transición para el sistema de notificaciones
   ───────────────────────────────────────────────────────────────────────────── */
.notification-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-slide-leave-active {
  transition: all 0.2s ease-in;
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(50%) scale(0.9);
}

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                      ESTILOS DE COMPONENTES                               ║
   ║  Clases específicas para elementos del template                          ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */

/* ─────────────────────────────────────────────────────────────────────────────
   MATERIAL CARD
   - Tarjeta individual de material
   - Transiciones suaves en hover
   ───────────────────────────────────────────────────────────────────────────── */
.material-card {
  will-change: transform, box-shadow;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOADING SPINNER
   - Contenedor relativo para el spinner absoluto
   ───────────────────────────────────────────────────────────────────────────── */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOGGLE BUTTON
   - Botón flotante de transparencia
   - Efecto de elevación en hover
   ───────────────────────────────────────────────────────────────────────────── */
.toggle-button {
  will-change: transform, box-shadow;
}

.toggle-button:hover {
  transform: translateY(-2px);
}

.toggle-button:active {
  transform: translateY(0);
}

/* ─────────────────────────────────────────────────────────────────────────────
   FILTER SELECT
   - Estilos adicionales para el select de filtros
   ───────────────────────────────────────────────────────────────────────────── */
.filter-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║                      UTILIDADES RESPONSIVAS                               ║
   ║  Ajustes específicos por breakpoint                                      ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */

@media (max-width: 640px) {
  .transparency-toggle-container {
    bottom: 1rem;
    right: 1rem;
  }
  
  .toggle-button {
    padding: 0.75rem;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   REDUCED MOTION
   - Respeta preferencias de accesibilidad del usuario
   ───────────────────────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>