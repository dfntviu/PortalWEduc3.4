import { ref, computed } from 'vue';
import type { Material } from '@/types';

export function useFormMaterial() {
  // Estado del formulario
  const form = ref<MaterialFormState>({
    titulo: '',
    description: '',
    // nombreArchivo: '',
    tags: []
  });
  
  const file = ref<File | null>(null);
  const pdfBase64 = ref<string | null>(null);
  const isEditMode = ref(false);
  const editingMaterialId = ref<string | null>(null);
  
  // Computed
  const isValid = computed(() => 
    form.value.titulo.trim().length > 0 && file.value !== null
  );
  
  const submitButtonText = computed(() => 
    isEditMode.value ? '✅ Guardar Cambios' : '📤 Subir Material'
  );
  
  // Métodos
  function handlePDFUploadTwo(event: Event): void {
    const target = event.target as HTMLInputElement;
    const uploaded = target.files?.[0];
    
    if (!uploaded || uploaded.type !== 'application/pdf') {
      throw new Error('Solo se aceptan archivos PDF');
    }
    
    file.value = uploaded;
    
    const reader = new FileReader();
    reader.onload = () => pdfBase64.value = reader.result as string;
    reader.readAsDataURL(uploaded);
  }
  
  function loadForEdit(material: Material): void {
    isEditMode.value = true;
    editingMaterialId.value = material.uid;
    form.value = {
      titulo: material.titulo ?? '',
      description: material.description ?? '',
      tags: material.tags ?? []
    };
  }
  
  function reset(): void {
    form.value = { titulo: '', description: '', tags: [] };
    file.value = null;
    pdfBase64.value = null;
    isEditMode.value = false;
    editingMaterialId.value = null;
  }
  
  return {
    form,
    file,
    pdfBase64,
    isEditMode,
    editingMaterialId,
    isValid,
    submitButtonText,
    // handlePDFUpload,
    loadForEdit,
    reset
  };
}