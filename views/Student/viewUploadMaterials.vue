<template>
  <div class="student-materials-container">
    <!-- Card Externo -->
    <div class="card-ext-student main-card">
      <h1 class="page-title">📚 Mis Materiales Educativos</h1>

      <!-- Formulario de Subida — solo visible para alumnos -->
      <div v-if="authStore3.userRole === 'student'" class="upload-section">
        <div class="card-int-student upload-form">
          <h2 class="section-title">
            <span class="icon">{{ isEditMode ? '✏️' : '📤' }}</span>
            {{ formTitle }}
          </h2>

          <form @submit.prevent="handleSubmit" class="form-grid">
            <!-- Título -->
            <div class="form-field">
              <label for="title" class="field-label">Título del Material *</label>
              <input
                id="title"
                v-model="form.titulo"
                type="text"
                placeholder="Ej: Introducción a la Física Cuántica"
                class="field-input"
                required
              />
            </div>

            <!-- Descripción -->
            <div class="form-field">
              <label for="description" class="field-label">Descripción</label>
              <textarea
                id="description"
                v-model="form.description"
                placeholder="Breve descripción del contenido..."
                class="field-textarea"
                rows="3"
              ></textarea>
            </div>

            <!-- Tags -->
            <div class="form-field">
              <label for="tags" class="field-label">Tags (separados por coma)</label>
              <input
                id="tags"
                v-model="tagsInput"
                type="text"
                placeholder="Ej: física, cuántica, introducción"
                class="field-input"
              />
            </div>

            <!-- Archivo PDF -->
            <div class="form-field">
              <label for="file" class="field-label">Archivo PDF *</label>
              <input
                id="file"
                type="file"
                accept="application/pdf"
                @change="handlePDFUpload"
                class="field-file"
              />
              <p v-if="pdfBase64" class="file-selected">
                ✅ Archivo seleccionado: {{ file?.name }}
              </p>
            </div>

            <!-- Botones -->
            <div class="form-actions">
              <button
                type="submit"
                :disabled="materialStore.loading || !form.titulo"
                class="btn-submit"
              >
                {{ submitButtonText }}
              </button>
              <button
                v-if="isEditMode"
                type="button"
                @click="cancelEdit"
                class="btn-reset"
              >
                ❌ Cancelar Edición
              </button>
              <button
                v-else
                type="button"
                @click="resetForm"
                class="btn-reset"
              >
                🔄 Limpiar Formulario
              </button>
            </div>
          </form>

          <!-- Vista Previa del PDF -->
          <transition name="fade">
            <div v-if="pdfBase64" class="pdf-preview">
              <h3 class="preview-title">👁️ Vista Previa</h3>
              <embed :src="pdfBase64" type="application/pdf" class="pdf-embed" />
            </div>
          </transition>
        </div>
      </div>

      <!-- Mensajes de Error -->
      <transition name="slide">
        <div v-if="materialStore.error" class="alert alert-error">
          ❌ {{ materialStore.error }}
          <button @click="materialStore.clearError()" class="alert-close">✕</button>
        </div>
      </transition>

      <!-- Lista de Materiales -->
      <div class="materials-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">📖</span>
            Mis Materiales: ({{ materialStore.myStats.total }})
          </h2>

          <!-- Estadísticas Rápidas -->
          <div class="quick-stats">
            <span class="stat-badge badge-pending">
              ⏳ Pendientes: {{ materialStore.myStats.pending }}
            </span>
            <span class="stat-badge badge-approved">
              ✅ Aprobados: {{ materialStore.myStats.approved }}
            </span>
            <span class="stat-badge badge-rejected">
              ❌ Rechazados: {{ materialStore.myStats.rejected }}
            </span>
          </div>
        </div>

        <!-- Filtro y Búsqueda -->
        <div class="controls-row">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Buscar materiales..."
              class="search-input"
              @input="handleSearch"
            />
          </div>

          <!-- FIX: selectedFilter descomentado + watch restaurado -->
          <div class="filter-material">
            <label for="filter-select" class="field-label">Mostrar Materiales</label>
            <select
              id="filter-select"
              v-model="selectedFilter"
              class="filter-materials"
            >
              <option value="all">📦 Todos los Materiales</option>
              <option value="today">🕒 Materiales de Hoy</option>
            </select>
              <!-- <pre> Valor: { selectedFilter } </pre>  disabled en caso de testear valor selector-->
               <pre>Materiales Totales<strong> {{materialStore.materials.length }} </strong></pre>
            <table v-if="selectedFilter === 'today'" class="w-full text-sm border-collapse" border="1">
              <thead class="bg-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-3 py-2 w-[30%] truncate">Título Asig Firebase</th>
                  <th class="px-3 py-2 w-[25%] truncate ">Dir. Personal</th>
                  <!-- <th class="px-3 py-2 w-[30%] truncate">URL Firebase</th> -->
                  <th class="px-3 py-2 w-[15%] withespace-nowrap">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="m in materialStore.materials" :key="m.autorId" 
                class="hover:bg-gray-50 transition-colors">
                   <td class="px-3 py-2 truncate max-w-0"> {{m.NombreFile}} </td>
                   <td class="px-3 py-2 truncate max-w-0 text-gray-500 text-xs">{{ m.PathCustom }}</td>
                   <!-- <td class="px-3 py-2 truncate max-w-0 text-blue-500 text-xs">{ m.archivoURL }</td> #La fecha se imprime con error d obj#-->
                   <td class="px-3 py-2 whitespace-nowrap text-gray-600">{{ formatearFecha(m.fecha, {locale: 'long'}) }}</td>
                   <!-- Los estilos no estan siendo aplicados; detalle menor con la fecha -->
                </tr>
              </tbody>
            </table>

          <table v-if="selectedFilter === 'all'" border="1" >
            <thead>
              <tr>
                <th>Uid Firebase</th>
                <th>Título Oficial</th>
                <th>Tít. Archivo</th>
                <th>Formato</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in materialStore.materials" :key="m.uid">
                 <td class="px-3 py-2 truncate max-w-0 text-blue-500 text-xs">{{m.autorId}}</td>
                 <td>{{ m.nombreArchivo }}</td>
                 <td>{{ m.titulo }}</td> 
                <td>{{m.tipoArchivo}}</td> 
              </tr>
            </tbody>
          </table>
            <pre>Materiales Totales<strong> {{materialStore.materials.length }} </strong></pre> <!-- ** -->
          </div>

           <!-- Crear en formato tabla y organizarlo en una sola condicion -->

           <!--  <div v-for="m in materialStore.materials" :key="m.autorId">
              {m.archivoURL}
              { m.NombreFile }
            </div> -->
        </div>

        <!-- Loading -->
        <div v-if="materialStore.loading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando materiales...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!materialStore.hasMaterials" class="empty-state">
          <span class="empty-icon">📭</span>
          <h3>No hay materiales aún</h3>
          <p>Sube tu primer material educativo usando el formulario de arriba</p>
        </div>

        <!-- Grid de Materiales -->
        <div v-else class="materials-grid">
          <div
            v-for="material in displayedMaterials"
            :key="material.uid"
            class="card-int-student material-card"
          >
            <!-- Header -->
            <div class="material-header">
              <h3 class="material-title">{{ material.titulo }}</h3>
              <span :class="['status-badge', `badge-${material.status}`]">
                {{ getStatusText(material.status) }}
              </span>
            </div>

            <!-- Descripción -->
            <p v-if="material.description" class="material-description">
              {{ material.description }}
            </p>

            <!-- Metadata -->
            <div class="material-metadata">
              <span class="metadata-item">📅 {{ formatDate(material.createdAt) }}</span>
              <span v-if="material.tags?.length" class="metadata-item">
                🏷️ {{ material.tags.join(', ') }}
              </span>
            </div>

            <!-- Razón de Rechazo -->
            <div
              v-if="material.status === 'rejected' && material.rejectionReason"
              class="rejection-reason"
            >
              <strong>Razón del rechazo:</strong>
              <p>{{ material.rejectionReason }}</p>
            </div>

            <!-- Acciones -->
            <div class="material-actions">
              <button
                v-if="material.status === 'pending'"
                @click="handleEdit(material)"
                class="btn-action btn-edit"
              >
                ✏️ Editar
              </button>
              <button
                @click="handleView(material)"
                class="btn-action btn-view"
              >
                👁️ Ver
              </button>
              <button
                v-if="material.status !== 'deleted'"
                @click="handleDelete(material.uid)"
                class="btn-action btn-delete"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted }    from 'vue';
import { storeToRefs } from 'pinia';
import { useMaterialStudentStore }            from '@/stores/materialStudentStore';
import {useMatBaseStore}                      from '@/stores/materialBaseStore';
import { useAuthStore3 }                      from '@/stores/authStore3';
import { useFormMaterial }                    from '@/composables/useFormMaterial';
import { useDateFormatter }                   from '@/composables/useDateFormatter';
import type { Material }                      from '@/types/interface.index';

// ============================================================
// STORES Y COMPOSABLES
// ============================================================
const materialStore = useMaterialStudentStore();
const baseStore = useMatBaseStore(); //*
const authStore3    = useAuthStore3();

// form, pdfBase64 y file vienen del composable
const { form, pdfBase64, file } = useFormMaterial();
const {uid_auth, currentUser} = storeToRefs(authStore3);
console.log('Usuarion con Id  -->',uid_auth.value);

const { formatearFecha} =  useDateFormatter();

// ============================================================
// BLOQUE: UI STATE
// ============================================================
const tagsInput      = ref<string>('');
const searchQuery    = ref<string>('');
const isEditMode     = ref<boolean>(false);
const editingId      = ref<string | null>(null);        // ID del material en edición
const originMaterial = ref<Material | null>(null);      // snapshot para detectar cambios

// FIX: selectedFilter estaba comentado pero referenciado en el template
const selectedFilter = ref<'all' | 'today'>('all');

// ============================================================
// COMPUTADOS
// ============================================================

/** Lista visible según búsqueda activa */
const displayedMaterials = computed((): Material[] => {
  if (searchQuery.value.trim()) return materialStore.filteredMaterials as Material[];
  return materialStore.myMaterials;
});

/** Texto del botón submit según modo */
const submitButtonText = computed((): string => {
  if (materialStore.loading) {
    return isEditMode.value ? '⏳ Actualizando...' : '⏳ Subiendo...';
  }
  return isEditMode.value ? '✅ Guardar Cambios' : '📤 Subir Material';
});

/** Título dinámico del formulario */
const formTitle = computed((): string =>
  isEditMode.value ? 'Editar Material' : 'Subir Nuevo Material'
);

// ============================================================
// WATCHERS
// ============================================================

// FIX: watch restaurado — estaba comentado con selectedFilter
watch(selectedFilter, async (value) => {
    if (!uid_auth.value) return;
    if (value === 'today') {
        await materialStore.fetchTodayMaterials(uid_auth.value);
    } else if( value === 'all') { //*
        await materialStore.fetchMyMaterials(uid_auth.value);
    } else{ //*
      baseStore.resetState();
    }
}, {immediate: true});

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(selectedFilter, async () => {
     // const uid = uid_auth.value;
    console.log('Id de Autorizacion -> ',uid_auth.value);
    if(uid_auth) return;
    if(value==='all')
       return await materialStore.fetchMyMaterials(uid_auth.value);
  if (!current_uid) return;
  else if(current_uid){
    await materialStore.fetchMyMaterials(uid_auth.value);
  }
});

// ============================================================
// HANDLERS — FORMULARIO
// ============================================================

/**
 * Captura el archivo PDF seleccionado y genera la preview en base64.
 * FIX: declarada void — eliminado el return incorrecto al final
 */
function handlePDFUpload(event: Event): void {
  const target   = event.target as HTMLInputElement;
  const uploaded = target.files?.[0];
  if (!uploaded) return;

  if (uploaded.type !== 'application/pdf') {
    materialStore.setError('Solo se aceptan archivos PDF');
    return;
  }

  file.value = uploaded;

  const reader    = new FileReader();
  reader.onload   = () => { pdfBase64.value = reader.result as string; };
  reader.readAsDataURL(uploaded);
}

/**
 * Parsea el input de tags en un array limpio.
 * FIX: .trim sin () → .trim() + filter correctamente encadenado
 */
function processTags(): void {
  if (tagsInput.value.trim()) {
    form.value.tags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())          // FIX: era tag.trim (referencia, no llamada)
      .filter(tag => tag.length > 0);  // FIX: filter ahora opera sobre strings
  }
}

/**
 * Entry point del formulario — decide entre crear o actualizar.
 * FIX: eliminada la doble ejecución (uploadMaterialFile + createMaterial en el mismo submit)
 */
async function handleSubmit(): Promise<void> {
  if (!authStore3.isAuthenticated) {
    materialStore.setError('Debes iniciar sesión');
    return;
  }

  processTags();

  if (isEditMode.value) {
    await updateMaterial();
  } else {
    await createMaterial();
  }
}

/**
 * Crea un nuevo material delegando al store.
 * FIX: authStore → authStore3
 */
async function createMaterial(): Promise<void> {
  if (!file.value) {
    materialStore.setError('Debes seleccionar un archivo PDF');
    return;
  }
  if (!form.value.titulo.trim()) {
    materialStore.setError('El título es obligatorio');
    return;
  }

  try {
    const materialData: Partial<Material> = {
      titulo:      form.value.titulo.trim(),
      description: form.value.description.trim(),
      tags:        form.value.tags,
      autorNombre: authStore3.user?.displayName || 'Sin Nombre', // FIX: authStore → authStore3
    };

    const result = await materialStore.uploadMaterialFile(file.value, materialData);

    if (result) {
      alert(`✅ Material "${form.value.titulo}" subido correctamente`);
      resetForm();
    }
  } catch (error: any) {
    materialStore.setError(error.message || 'Error al subir el material');
  }
}

/**
 * Actualiza el material en edición.
 * FIX: condición invertida (if sin !) lanzaba error cuando SÍ había material
 * FIX: editingMaterial → editingId (ref local correcto)
 */
async function updateMaterial(): Promise<void> {
  if (!editingId.value) {   // FIX: era "if (editingMaterial.value)" sin negación
    materialStore.setError('No hay material en edición');
    return;
  }
  if (!form.value.titulo.trim()) {
    materialStore.setError('El título es obligatorio');
    return;
  }

  try {
    const updates: Partial<Material> = {
      titulo:      form.value.titulo.trim(),
      description: form.value.description.trim(),
      tags:        form.value.tags,
    };

    const success = await materialStore.updateMyMaterial(editingId.value, updates);

    if (success) {
      alert(`✅ Material "${form.value.titulo}" actualizado correctamente`);
      resetEditState();
      resetForm();
    }
  } catch (error: any) {
    materialStore.setError(error.message || 'Error al actualizar el material');
  }
}

/**
 * Resetea el formulario al estado vacío.
 */
function resetForm(): void {
  form.value     = { titulo: '', description: '', tags: [] };
  tagsInput.value = '';
  file.value      = null;
  pdfBase64.value = null;
}

// ============================================================
// HANDLERS — ACCIONES DE MATERIAL
// ============================================================

function handleView(material: Material): void {
  if (material.fileUrl) {
    window.open(material.fileUrl, '_blank');
  } else {
    alert('Este material no tiene archivo asociado');
  }
}

/**
 * Activa el modo edición para un material.
 * FIX: manipulación de estado delegada a variables locales de la vista (SSV correcto)
 * FIX: async function handleEdit(...): void → Promise<void>
 */
async function handleEdit(material: Material): Promise<void> {
  try {
    if (material.status !== 'pending') {
      alert('⚠️ Solo se pueden editar materiales pendientes');
      return;
    }
    if (material.autorId !== authStore3.user?.uid) {
      alert('❌ No tienes permiso para editar este material');
      return;
    }

    isEditMode.value   = true;
    editingId.value    = material.uid;       // FIX: era editingMaterial (no declarado)
    originMaterial.value = { ...material };  // FIX: era originalMaterial (no declarado)

    form.value = {
      titulo:      material.titulo      ?? '',
      description: material.description ?? '',
      tags:        [...(material.tags   ?? [])],
    };
    tagsInput.value = material.tags?.join(', ') ?? '';
    pdfBase64.value = null;
    file.value      = null;

    scrollToForm();
    console.log('✏️ Modo edición activado para:', material.titulo);
  } catch (error) {
    materialStore.setError('Error al cargar el material para edición');
  }
}

/**
 * Cancela el modo edición con confirmación si hay cambios.
 */
function cancelEdit(): void {
  if (hasChanges() && !confirm('¿Descartar los cambios realizados?')) return;
  resetEditState();
  resetForm();
  console.log('❌ Edición cancelada');
}

/**
 * Elimina un material tras confirmación.
 * FIX: condición invertida — era "if (confirm) return" eliminaba al confirmar
 * FIX: tipo del parámetro era Material, debe ser string
 */
async function handleDelete(materialId: string): Promise<void> {
  if (!confirm('¿Estás seguro de eliminar este material?')) return; // FIX: faltaba negación

  const success = await materialStore.deleteMyMaterial(materialId);
  if (success) {
    alert('✅ Material eliminado correctamente');
  }
}

// ============================================================
// HANDLERS — BÚSQUEDA
// ============================================================

// FIX: handleSearch no existía — el template lo referenciaba pero el método se llamaba controladoraSearch
function handleSearch(): void {
  materialStore.searchMaterials(searchQuery.value);
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Detecta si hay cambios respecto al material original.
 * FIX: JSON.stringify mal aplicado como OR — ahora es comparación correcta
 */
function hasChanges(): boolean {
  if (!originMaterial.value) return false;
  return (
    form.value.titulo      !== originMaterial.value.titulo      ||
    form.value.description !== originMaterial.value.description ||
    JSON.stringify(form.value.tags) !== JSON.stringify(originMaterial.value.tags) || // FIX: era || suelto sin comparación
    file.value !== null
  );
}

/** Limpia el estado de edición sin tocar el formulario */
function resetEditState(): void {
  isEditMode.value    = false;
  editingId.value     = null;
  originMaterial.value = null;
}

/** Hace scroll al formulario de subida */
function scrollToForm(): void {
  const formElement = document.querySelector('.upload-form');
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); // FIX: 'smoth' → 'smooth'
  }
}

function formatDate(date: any): string {
  if (!date) return 'Sin Fecha';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('es-MX', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
     pending: '⏳ Pendiente',
    approved: '✅ Aprobado',
    rejected: '❌ Rechazado',
     deleted: '🗑️ Eliminado',
  };
  return statusMap[status] ?? status;
}
</script>
<style>
    @import '@/assets/styles/materialColors.css';
	/* ============================================ */
  /* CONTENEDOR PRINCIPAL                        */
  /* ============================================ */

  .student-materials-container {
    min-height: 100vh;
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .main-card {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-2xl);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-xl);
  }

  .page-title {
    color: white;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  /* ============================================ */
  /* SECCIÓN DE SUBIDA                           */
  /* ============================================ */

  .upload-section {
    margin-bottom: var(--spacing-2xl);
  }

  .upload-form {
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-lg);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-student);
    margin-bottom: var(--spacing-lg);
  }

  .icon {
    font-size: 1.75rem;
  }

  /* ============================================ */
  /* FORMULARIO                                  */
  /* ============================================ */

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .field-label {
    font-weight: 500;
    color: var(--color-text-primary);
    font-size: 0.875rem;
  }

  .field-input,
  .field-textarea,
  .field-file {
    padding: var(--spacing-md);
    border: 2px solid var(--color-border-light);
    border-radius: var(--border-radius-md);
    font-size: 1rem;
    transition: all var(--transition-base);
  }

  .field-input:focus,
  .field-textarea:focus {
    outline: none;
    border-color: var(--color-accent-student);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  .file-selected {
    color: var(--color-accent-student);
    font-size: 0.875rem;
    margin-top: var(--spacing-xs);
  }

  /* ============================================ */
  /* BOTONES                                     */
  /* ============================================ */

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
  }

  .btn-submit,
  .btn-reset {
    padding: var(--spacing-md) var(--spacing-xl);
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all var(--transition-base);
  }

  .btn-submit {
    flex: 1;
    background-color: var(--color-accent-student);
    color: white;
  }

  .btn-submit:hover:not(:disabled) {
    background-color: var(--color-accent-student-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-reset {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .btn-reset:hover {
    background-color: var(--color-border-medium);
  }

  /* ============================================ */
  /* VISTA PREVIA PDF                            */
  /* ============================================ */

  .pdf-preview {
    margin-top: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-radius: var(--border-radius-md);
  }

  .preview-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-md);
  }

  .pdf-embed {
    width: 100%;
    height: 400px;
    border-radius: var(--border-radius-md);
    border: 2px solid var(--color-border-light);
  }

  /* ============================================ */
  /* ALERTAS                                     */
  /* ============================================ */

  .alert {
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .alert-error {
    background-color: var(--color-status-rejected-bg);
    color: var(--color-status-rejected);
    border: 1px solid var(--color-status-rejected-border);
  }

  .alert-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: inherit;
  }

 /* ============================================ */
 /* LISTA DE MATERIALES                         */
 /* ============================================ */

  .materials-section {
    margin-top: var(--spacing-2xl);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .quick-stats {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .stat-badge {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
    font-size: 0.875rem;
    font-weight: 500;
  }

 /* ============================================ */
 /* BUSCADOR                                    */
 /* ============================================ */

  .search-box {
    margin-bottom: var(--spacing-lg);
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-md);
    border: 2px solid var(--color-border-light);
    border-radius: var(--border-radius-md);
    font-size: 1rem;
    transition: all var(--transition-base);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-student);
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  /* ============================================ */
  /* ESTADOS                                     */
  /* ============================================ */

  .loading-state,
  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-border-light);
    border-top-color: var(--color-accent-student);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-md);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: var(--spacing-md);
  }

 /* ============================================ */
 /* GRID DE MATERIALES                          */
 /* ============================================ */

  .materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
  }

  .material-card {
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .material-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: var(--spacing-md);
  }

  .material-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    flex: 1;
  }

  .status-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .material-description {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .material-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .rejection-reason {
    padding: var(--spacing-md);
    background-color: var(--color-status-rejected-bg);
    border-left: 3px solid var(--color-status-rejected);
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
  }

  .rejection-reason strong {
    display: block;
    margin-bottom: var(--spacing-xs);
    color: var(--color-status-rejected);
  }

   /* ============================================ */
   /* ACCIONES DE MATERIAL                        */
   /* ============================================ */

  .material-actions {
    display: flex;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border-light);
  }

  .btn-action {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-edit {
    background-color: #fef3c7;
    color: #92400e;
  }

  .btn-view {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .btn-delete {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .btn-action:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  /* ============================================ */
  /* TRANSICIONES                                */
  /* ============================================ */

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity var(--transition-base);
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all var(--transition-base);
  }

  .slide-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .slide-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }

  /* ============================================ */
  /* RESPONSIVE                                  */
  /* ============================================ */

  @media (max-width: 768px) {
    .student-materials-container {
      padding: var(--spacing-md);
    }

    .main-card {
      padding: var(--spacing-lg);
    }

    .page-title {
      font-size: 1.5rem;
    }

    .materials-grid {
      grid-template-columns: 1fr;
    }

    .form-actions {
      flex-direction: column;
    }

    .section-header {
      flex-direction: column;
      align-items: stretch;
    }
  }

  table {
   border-collapse: collapse;
  }

  /*th, td {
    border: 1px solid black;
    padding: 8px;
  }*/
   /*Cada vez que corrijo dos errores aparecen dos más. Esto ocurre porque la compilación es secuencial: el compilador analiza el código en orden y, en muchos casos, no puede continuar detectando errores posteriores hasta que se corrigen los anteriores. Una vez corregido un error, el compilador continúa leyendo el código de arriba hacia abajo y de izquierda a derecha hasta encontrar el siguiente. Si no hay errores, entonces comienza a analizar el siguiente archivo.*/

   /*En sumar cuando se corrigen errores aparecen nuevos porque el compilador analiza el código de forma secuencial.
    Primero debe resolver los errores iniciales antes de poder detectar los siguientes. Cuando no encuentra errores
    en un archivo, pasa al siguiente.*/
</style>