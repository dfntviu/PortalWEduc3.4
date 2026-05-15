
<script setup lang="ts">
   import { ref, computed, onMounted, watch, nextTick } from 'vue';
   import { ReportService } from '@/services/ReporteService';  //* 'e' file
   import { ToastService } from '@/services/ToastService'
   import type { ReportData, MaterialReport} from '@/services/ReporteService'

   // ══════════════════════════════════════════
 	//		 PROPS Y EMITS
	// ══════════════════════════════════════════
   const props = defineProps<{
   	 isOpen: boolean;
   	   role: 'alumno' | 'profesor';
   	  userId?: string;
   }>();

   const emit = defineEmits<{
   	    close: [];
   	 minimize: [boolean];
   }>();

	// ══════════════════════════════════════════
	// 			STATE
	// ══════════════════════════════════════════
     const     loading = ref(false);
     const   exporting = ref(false);
     const downloading = ref(false);
     const isMinimized = ref(false); 
     const  activeTab = ref< 'week' | 'month'>('week');
     const exportFormat = ref< 'pdf' | 'xlsx'| 'docx'>('pdf');
     const reportData = ref<ReportData | null>(null);
    const visibleRows = ref<string[]>([]); //*como a vacio*

     // Canvas refs  --> (etiquetas p/definir <> modales )
      const weekCanvas = ref<HTMLCanvasElement | null>(null);
     const monthCanvas = ref<HTMLCanvasElement | null>(null);	

    // ══════════════════════════════
	// 			COMPUTED
	// ══════════════════════════════
    const currentMaterials = computed(() => {
     	if (!reportData.value) return [];
     		 return activeTab.value === 'week'
     		  ? reportData.value.semanaPasada
     		  : reportData.value.semanaMes;
    });

    function formatDate(date: Date): string {
      if(!date) return '-';
         return Intl.DateTimeFormat('es-MX',{
              day: '2-digit',
              month: 'short',
              year: 'numeric',
         }).format(date);

    }

    function estadoBadgeClass(estado: string): string {
         const map: Record<string, string>  = {
            approved: 'badge-approved',
            rejected: 'badge-rejected',
            pending:'badge-pending'
         };

         return map[estado] ?? 'badge-pending';
    }

    // const formatDate(date: Date): string
  // ════════════════════════════════
  //    METHODS - UI CONTROL
  // ════════════════════════════════
   function closeModal(){
      emit('close');
   }

   function toggleMinimize() {
       isMinimized.value = !isMinimized.value;
       emit('minimize', isMinimized.value);
   }


   function toggleRowVisibility(id: string) {
       const index = visibleRows.value.indexOf(id);

      if(index > -1){
          visibleRows.value.splice(index, 1);
      } else {
         visibleRows.value.push(id);
      }

   }

    // ════════════════════════════════
    //     METHODS - DATA LOADING
    // ════════════════════════════════

   async function loadReport() {
            // error en el encabezado de la f(n), parece que obtenerMa... y su f(n) auxiliar unicamente
      // necesita metodos estaticos y lo rechaza por su falta de alineacion,  -> [Checar a fondo]
        try{   //* obtener invoca a recuper, como auxiliar pero fuero recuperados los rangos x sus 2 filtros
            reportData.value = await ReportService.obtenerMaterialesRango(props.role, props.userId);
              // Animar canvas despues de cargar datos
            nextTick( () => { 
               animateWeekCanvas();
               animateMonthCanvas();
            });
        } catch(error){
            console.log('Error al cargar reporte:', error);
            // ToastService
        } finally {
           loading.value = false;
        }
   } 

    // ════════════════════════════════
    //     METHODS - DATA LOADING
    // ════════════════════════════════

   async function handleExport() {
       if(!reportData.value) return;

       exporting.value = true;

      try{

         const data = currentMaterials.value;
         const filename = `reporte_materiales_ ${activeTab.value}_ ${new Date().toISOString().split('T')[0]}`;

         if(exportFormat.value === 'pdf'){
               await ReportService.exportarAPDF(data,filename);
         } else if(exportFormat.value === 'xlsx'){
               await ReportService.exportarAExcel(data,filename);
         } else if(exportFormat.value === 'docx'){
               await ReportService.exportarADocx(data,filename);
         }

           // ToastService

      }catch(error){
         console.error('Error al exportar:', error);
         // ToastService.error('','');
      } finally {
          exporting.value = false;
      }
   }

   async function handleDownloadZip() {
      if(!reportData.value?.semanaPasada.length) return;

      downloading.value = true;
      
      try{
          await ReportService.descargaSemanalMaterialesZIP(reportData.value.semanaPasada);

          ToastService.success('','');
      
      }catch(error){
         console.error('Error al descargar ZIP', error);
         ToastService.error('', '');
      }finally{
         downloading.value = false;
      }
   }
   
   // ════════════════════════════════
   //    METHODS - CANVAS ANIMATIONS
   // ════════════════════════════════

   function animateWeekCanvas() {
         if(!weekCanvas.value) return;

         const ctx = weekCanvas.value.getContext('2d');
         if(!ctx) return;

         let progress = 0;

      const animate = () => {
         // no es React es 'Rect'
            ctx.clearRect(0, 0, 60, 60);

            // Circulo en progreso
         ctx.beginPath();
         ctx.arc(30,30,20, -Math.PI /2, -Math.PI/2 + (progress * 2 * Math.PI), false);
         ctx.lineWidth = 4;
         ctx.strokeStyle = '#3b82f6'  // blue-500
         ctx.stroke();

            progress += 0.002;

         if(progress < 1){
            requestAnimationFrame(animate);
         }
      };

         animate();
   }

   function animateMonthCanvas() {
      if(!monthCanvas.value) return;

      const ctx = monthCanvas.value.getContext('2d');
      if(!ctx) return;

      let progress = 0;

      const animate = () => {
         animate()
         ctx.clearReact(0,0,60, 60);
         ctx.beginPath();
         ctx.arc(30,30,20, -Math.PI /2, -Math.PI/2 +(progress*2*Math.PI), false);
         ctx.lineWidth = 4;
         ctx.strokeStyle = '#a855f7';  //purple-500
         ctx.stroke();

         progress += 0.015;

         if(progress<1){
            requestAnimationFrame(animate);
         }

      };
   }

   // ════════════════════════════
   //    WATCHERS
   // ════════════════════════════
   // olvide la flecha
   watch( () => props.isOpen, (newVal) => {

      if(newVal && !reportData.value){
         loadReport();
      }
   });

   // ════════════════════════════
   //    LYFECICLE
   // ════════════════════════════

   onMounted(() => {
      if(props.isOpen){
          loadReport();
      }
   });

</script><!-- $$ CULMINATED $$  -->

<template>
      <!-- ════════════════════════════════════════════════ -->
   <!--        REPORTE SUMMARY MODAL                    -->
   <!-- ════════════════════════════════════════════════ -->
   <Teleport to="body">
      <Transition name="modal-fade">
         <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
            <div class="modal-container" :class="{ 'modal-minimized': isMinimized }">
 
               <!-- ──────────────────────────────── -->
               <!--          HEADER                 -->
               <!-- ──────────────────────────────── -->
               <div class="modal-header">
                  <div class="flex items-center gap-2">
                     <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                           d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     <h2 class="text-base font-semibold text-gray-800">Reporte de Materiales</h2>
                     <span class="text-xs text-gray-400 capitalize">({{ role }})</span>
                  </div>
                  <div class="flex items-center gap-1">
                     <!-- Minimizar -->
                     <button @click="toggleMinimize"
                        class="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        :title="isMinimized ? 'Expandir' : 'Minimizar'">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              :d="isMinimized ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                        </svg>
                         Minimízar
                     </button>
                     <!-- Cerrar -->
                     <button @click="closeModal"
                        class="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                        title="Cerrar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg> Cerrar
                     </button>
                  </div>
               </div>
 
               <!-- ──────────────────────────────── -->
               <!--   BODY (oculto si minimizado)   -->
               <!-- ──────────────────────────────── -->
               <template v-if="!isMinimized">
 
                  <!-- Loading Overlay -->
                  <div v-if="loading" class="loading-overlay">
                     <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                     <p class="mt-3 text-sm text-gray-500">Cargando reporte...</p>
                  </div>
 
                  <!-- ── Stats con Canvas ── -->
                  <div class="stats-row">
                     <div class="stat-card">
                        <canvas ref="weekCanvas" width="60" height="60" class="stat-canvas"></canvas>
                        <div>
                           <p class="stat-number text-blue-600">{{ reportData?.totalSemanaPasada ?? 0 }}</p>
                           <p class="stat-label">Semana pasada</p>
                        </div>
                     </div>
                     <div class="stat-divider"></div>
                     <div class="stat-card">
                        <canvas ref="monthCanvas" width="60" height="60" class="stat-canvas"></canvas>
                        <div>
                           <p class="stat-number text-purple-600">{{ reportData?.totalMesPasado ?? 0 }}</p>
                           <p class="stat-label">Mes pasado</p>
                        </div>
                     </div>
                  </div>
 
                  <!-- ── Tabs ── -->
                  <div class="tab-bar">
                     <button
                        class="tab-btn"
                        :class="activeTab === 'week' ? 'tab-active' : 'tab-inactive'"
                        @click="activeTab = 'week'">
                        Semana
                     </button>
                     <button
                        class="tab-btn"
                        :class="activeTab === 'month' ? 'tab-active' : 'tab-inactive'"
                        @click="activeTab = 'month'">
                        Mes
                     </button>
                  </div>
 
                  <!-- ── Tabla de Materiales ── -->
                  <div class="table-wrapper">
                     <!-- Empty state -->
                     <div v-if="!loading && currentMaterials.length === 0"
                        class="flex flex-col items-center justify-center py-12 text-gray-400">
                        <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p class="text-sm">Sin materiales en este período</p>
                     </div>
 
                     <table v-else class="report-table">
                        <thead>
                           <tr>
                              <th class="w-8"></th>
                              <th>Título</th>
                              <th>Categoría</th>
                              <th>Estado</th>
                              <th>Fecha</th>
                              <th class="text-right">Tamaño</th>
                           </tr>
                        </thead>
                        <tbody>
                           <template v-for="material in currentMaterials" :key="material.id">
                              <!-- Fila principal -->
                              <tr class="table-row" @click="toggleRowVisibility(material.id)">
                                 <td class="text-center">
                                    <svg class="w-4 h-4 text-gray-400 mx-auto transition-transform duration-200"
                                       :class="visibleRows.includes(material.id) ? 'rotate-180' : ''"
                                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                 </td>
                                 <td class="font-medium text-gray-800 truncate max-w-[180px]" :title="material.titulo">
                                    {{ material.titulo }}
                                    <span v-if="material.recientemente_aprobado"
                                       class="ml-1 inline-block w-2 h-2 bg-green-400 rounded-full" title="Recientemente aprobado"></span>
                                 </td>
                                 <td>
                                    <span class="tag-categoria">{{ material.categoria }}</span>
                                 </td>
                                 <td>
                                    <span class="badge" :class="estadoBadgeClass(material.estado)">
                                       {{ material.estado }}
                                    </span>
                                 </td>
                                 <td class="text-gray-500 text-xs">{{ formatDate(material.fechaDeCreacion) }}</td>
                                 <td class="text-right text-gray-500 text-xs">{{ material.tamanioMB.toFixed(2) }} MB</td>
                              </tr>
 
                              <!-- Fila expandida -->
                              <Transition name="row-expand">
                                 <tr v-if="visibleRows.includes(material.id)" class="row-detail">
                                    <td colspan="6">
                                       <div class="row-detail-content">
                                          <p v-if="material.descripcion" class="text-sm text-gray-600 mb-2">
                                             {{ material.descripcion }}
                                          </p>
                                          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                                             <span><strong>Autor:</strong> {{ material.autorNombre }}</span>
                                             <span><strong>Email:</strong> {{ material.autorEmail }}</span>
                                          </div>
                                          <div v-if="material.tags?.length" class="flex flex-wrap gap-1 mb-2">
                                             <span v-for="tag in material.tags" :key="tag" class="tag-item">
                                                {{ tag }}
                                             </span>
                                          </div>
                                          <a v-if="material.archivoURL"
                                             :href="material.archivoURL"
                                             target="_blank"
                                             class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                             <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                             </svg>
                                             {{ material.archivoNombre || 'Descargar archivo' }}
                                          </a>
                                       </div>
                                    </td>
                                 </tr>
                              </Transition>
                           </template>
                        </tbody>
                     </table>
                  </div>
 
                  <!-- ──────────────────────────────── -->
                  <!--          FOOTER                 -->
                  <!-- ──────────────────────────────── -->
                  <div class="modal-footer">
                     <!-- Selector + Exportar -->
                     <div class="flex items-center gap-2">
                        <select v-model="exportFormat" class="format-select">
                           <option value="pdf">PDF</option>
                           <option value="xlsx">Excel</option>
                           <option value="docx">Word</option>
                        </select>
                        <button
                           @click="handleExport"
                           :disabled="exporting || !reportData"
                           class="btn-export">
                           <svg v-if="exporting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                           </svg>
                           {{ exporting ? 'Exportando...' : 'Exportar' }}
                        </button>
                     </div>
                     <!-- ZIP solo para alumno -->
                     <button
                        v-if="role === 'alumno'"
                        @click="handleDownloadZip"
                        :disabled="downloading || !reportData?.semanaPasada?.length"
                        class="btn-zip">
                        <svg v-if="downloading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        {{ downloading ? 'Descargando...' : 'Descargar ZIP' }}
                     </button>
                  </div>
 
               </template>
            </div>
         </div>
      </Transition>
   </Teleport>
</template>

  <style>
    /* ════════════════════════════════════════ */
   /*         MODAL BASE                      */
   /* ════════════════════════════════════════ */
   .modal-backdrop {
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.45);
   backdrop-filter: blur(3px);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 9999;
   padding: 1rem;
   }
 
   .modal-container {
   background: #ffffff;
   border-radius: 12px;
   box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
   width: 100%;
   max-width: 760px;
   max-height: 90vh;
   display: flex;
   flex-direction: column;
   overflow: hidden;
   transition: all 0.3s ease;
   }
 
    .modal-minimized {
      max-height: 56px;
      overflow: hidden;
    }
    
   /* ════════════════════════════════════════ */
   /*         HEADER                          */
   /* ════════════════════════════════════════ */
   .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      flex-shrink: 0;
   }
    
   /* ════════════════════════════════════════ */
   /*         LOADING                         */
   /* ════════════════════════════════════════ */
   .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
   }
    
   /* ════════════════════════════════════════ */
   /*         STATS                           */
   /* ════════════════════════════════════════ */
   .stats-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
   }
    
   .stat-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
   }
    
   .stat-canvas {
      flex-shrink: 0;
   }
    
   .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
   }
    
   .stat-label {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.125rem;
   }
    
   .stat-divider {
      width: 1px;
      height: 48px;
      background: #e2e8f0;
   }
    
   /* ════════════════════════════════════════ */
   /*         TABS                            */
   /* ════════════════════════════════════════ */
   .tab-bar {
      display: flex;
      gap: 0;
      padding: 0.625rem 1.25rem 0;
      border-bottom: 1px solid #e2e8f0;
   }
    
   .tab-btn {
      padding: 0.375rem 1rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
      margin-bottom: -1px;
   }
    
   .tab-active {
      color: #2563eb;
      border-bottom-color: #2563eb;
   }
    
   .tab-inactive {
      color: #94a3b8;
   }
    
   .tab-inactive:hover {
      color: #64748b;
   }
    
   /* ════════════════════════════════════════ */
   /*         TABLA                           */
   /* ════════════════════════════════════════ */
   .table-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 0;
   }
    
   .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
   }
    
   .report-table thead tr {
      background: #f8fafc;
      position: sticky;
      top: 0;
      z-index: 1;
   }
    
   .report-table th {
      text-align: left;
      padding: 0.625rem 0.875rem;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      border-bottom: 1px solid #e2e8f0;
   }
    
   .table-row {
      cursor: pointer;
      transition: background 0.15s;
   }
    
   .table-row:hover {
      background: #f8fafc;
   }
    
   .report-table td {
      padding: 0.625rem 0.875rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
   }
    
   /* ── Badges ── */
   .badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: capitalize;
   }
    
   .badge-approved { background: #dcfce7; color: #16a34a; }
   .badge-rejected { background: #fee2e2; color: #dc2626; }
   .badge-pending  { background: #fef9c3; color: #ca8a04; }
    
   .tag-categoria {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      background: #eff6ff;
      color: #3b82f6;
      border-radius: 4px;
      font-size: 0.7rem;
   }
    
   /* ── Fila expandida ── */
   .row-detail td {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
   }
    
   .row-detail-content {
      padding: 0.5rem 0.25rem;
   }
    
   .tag-item {
      display: inline-block;
      padding: 0.1rem 0.5rem;
      background: #e2e8f0;
      color: #475569;
      border-radius: 4px;
      font-size: 0.7rem;
   }
    
   /* ════════════════════════════════════════ */
   /*         FOOTER                          */
   /* ════════════════════════════════════════ */
   .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1.25rem;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
      flex-shrink: 0;
   }
    
   .format-select {
      padding: 0.375rem 0.625rem;
      font-size: 0.8125rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      color: #374151;
      outline: none;
      cursor: pointer;
   }
    
   .btn-export {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      background: #2563eb;
      color: white;
      border-radius: 6px;
      transition: background 0.15s;
   }
    
   .btn-export:hover:not(:disabled) { background: #1d4ed8; }
   .btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
    
   .btn-zip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      background: white;
      color: #374151;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      transition: all 0.15s;
   }
    
   .btn-zip:hover:not(:disabled) { background: #f1f5f9; }
   .btn-zip:disabled { opacity: 0.5; cursor: not-allowed; }
    
   /* ════════════════════════════════════════ */
   /*         TRANSITIONS                     */
   /* ════════════════════════════════════════ */
   .modal-fade-enter-active,
   .modal-fade-leave-active {
      transition: all 0.25s ease;
   }
    
   .modal-fade-enter-from,
   .modal-fade-leave-to {
      opacity: 0;
      transform: scale(0.97) translateY(8px);
   }
    
   .row-expand-enter-active,
   .row-expand-leave-active {
      transition: all 0.2s ease;
      overflow: hidden;
   }
    
   .row-expand-enter-from,
   .row-expand-leave-to {
      opacity: 0;
      transform: translateY(-4px);
   }
  </style>