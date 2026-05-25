<template>
  <main class="register-view">
    <!-- ══════════════════════════════════════════════════ -->
    <!-- HEADER -->
    <!-- ══════════════════════════════════════════════════ -->
    <header class="register-header">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Registro de Usuario
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 mt-2">
        Selecciona el método de registro preferido
      </p>
    </header>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- REGISTRATION TYPE SELECTOR -->
    <!-- ══════════════════════════════════════════════════ -->
    <nav class="registration-selector" role="tablist">
      <button
        v-for="type in REGISTRATION_TYPES"
        :key="type.id"
        :class="[
          'selector-button',
          { 'selector-button-active': registrationType === type.id }
        ]"
        :aria-selected="registrationType === type.id"
        role="tab"
        @click="handleTypeChange(type.id)"
      >
        <span class="button-icon" v-html="type.icon"></span>
        <span class="button-text">{{ type.label }}</span>
      </button>
    </nav>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- FORMS CONTAINER -->
    <!-- ══════════════════════════════════════════════════ -->
    <section class="forms-container">
      <Transition name="fade" mode="out-in">
        <article
          :key="registrationType"
          class="registration-panel"
          role="tabpanel"
        >
          <!-- ══════════════════════════════════════════════════ -->
          <!-- TRADITIONAL REGISTRATION FORM -->
          <!-- ══════════════════════════════════════════════════ -->
          <form
            v-if="registrationType === 'tradicional'"
            class="registration-form"
            novalidate
            @submit.prevent="handleTraditionalSubmit"
          >
            <h2 class="form-title">Registro Tradicional</h2>
            
            <div class="form-grid">
              <!-- Nombre -->
              <div class="form-group">
                <label for="name" class="form-label">
                  Nombre <span class="required">*</span>
                </label>
                <input
                  id="name"
                  v-model.trim="formData.name"
                  type="text"
                  class="form-input"
                  placeholder="Ingresa tu nombre"
                  required
                  maxlength="50"
                  :disabled="isSubmitting"
                  :aria-invalid="hasFieldError('name')"
                  aria-describedby="name-error"
                />
                <span
                  v-if="hasFieldError('name')"
                  id="name-error"
                  class="field-error"
                >
                  {{getFieldError('name')}}
                </span>
              </div>

              <!-- Apellido -->
              <div class="form-group">
                <label for="lname" class="form-label">
                  Apellido <span class="required">*</span>
                </label>
                <input
                  id="lname"
                  v-model.trim="formData.lname"
                  type="text"
                  class="form-input"
                  placeholder="Ingresa tu apellido"
                  required
                  maxlength="50"
                  :disabled="isSubmitting"
                  :aria-invalid="hasFieldError('lname')"
                  aria-describedby="lname-error"
                />
                <span
                  v-if="hasFieldError('lname')"
                  id="lname-error"
                  class="field-error"
                >
                  {{ getFieldError('lname') }}
                </span>
              </div>

              <!-- Email -->
              <div class="form-group full-width">
                <label for="email" class="form-label">
                  Correo Institucional <span class="required">*</span>
                </label>
                <input
                  id="email"
                  v-model.trim="formData.email"
                  type="email"
                  class="form-input"
                  placeholder="correo@ejemplo.com"
                  required
                  maxlength="100"
                  :disabled="isSubmitting"
                  :aria-invalid="hasFieldError('email')"
                   aria-describedby="email-error"
                />
                <span
                  v-if="hasFieldError('email')"
                  id="email-error"
                  class="field-error"
                >
                  {{ getFieldError('email') }}
                </span>
              </div>

              <!-- Contraseña -->
              <div class="form-group full-width">
                <label for="password" class="form-label">
                  Contraseña <span class="required">*</span>
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  class="form-input"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minlength="6"
                  maxlength="50"
                  :disabled="isSubmitting"
                  :aria-invalid="hasFieldError('password')"
                  aria-describedby="password-error"
                />
                <span
                  v-if="hasFieldError('password')"
                  id="password-error"
                  class="field-error"
                >
                  {{ getFieldError('password') }}
                </span>
              </div>

              <!-- Número de Cuenta -->
              <div class="form-group">
                <label for="numCuenta" class="form-label">
                  Número de Cuenta
                </label>
                <input
                  id="numCuenta"
                  v-model.trim="formData.numCuenta"
                  type="text"
                  class="form-input"
                  placeholder="Ej: 1141392"
                  maxlength="20"
                  :disabled="isSubmitting"
                />
              </div>

              <!-- Área Académica -->
              <div class="form-group">
                <label for="area" class="form-label">
                  Área Académica
                </label>
                <input
                  id="area"
                  v-model.trim="formData.area"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Desarrollo de Software"
                  maxlength="50"
                  :disabled="isSubmitting"
                />
              </div>
              <!-- *Foto de 'teacher' *  -->
              <div class="form-group full-width">
                 <label for="form-label">
                    <span style="color: gray, font-size: 12px;">
                      (opcional)
                    </span>
                  Foto del Perfil</label>
                 <input type="file"
                 accept="image/*"
                 class="form-input"
                 :disabled="isSubmitting"
                @change="PhotoFileController">
               </div>
              <!-- Rol -->
              <div class="form-group full-width">
                <label for="role" class="form-label">
                  Tipo de Usuario <span class="required">*</span>
                </label>
                <select
                  id="role"
                  v-model="formData.role"
                  class="form-select"
                  required
                  :disabled="isSubmitting"
                  :aria-invalid="hasFieldError('role')"
                  aria-describedby="role-error"
                >
                  <option value="">Selecciona un valor</option>
                  <option value="alumno">Alumno</option>
                  <option value="profesor">Profesor</option>
                </select>
                <span
                  v-if="hasFieldError('role')"
                  id="role-error"
                  class="field-error"
                >
                  {{ getFieldError('role') }}
                </span>
              </div>
            </div>

            <button
              type="submit"
              class="submit-button"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
            >
              <span v-if="!isSubmitting" class="loading-content">
                Registrar
              </span>
              <span v-else class="loading-content">
                <span class="spinner" aria-hidden="true"></span>
                Procesando...
              </span>
            </button>
          </form>

          <!-- ══════════════════════════════════════════════════ -->
          <!-- FACEBOOK REGISTRATION -->
          <!-- ══════════════════════════════════════════════════ -->
          <div
            v-else-if="registrationType === 'facebook'"
            class="social-registration"
          >
            <h2 class="form-title">Registro con Facebook</h2>
            <p class="social-description">
              Inicia sesión con tu cuenta de Facebook para crear tu perfil automáticamente
            </p>
            
            <button
              class="social-button facebook"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
              @click="handleFacebookLogin"
            >
              <span class="social-icon" aria-hidden="true">👥</span>
              <span v-if="!isSubmitting">Continuar con Facebook</span>
              <span v-else>Conectando...</span>
            </button>

            <button
              class="cancel-button"
              :disabled="isSubmitting"
              @click="handleCancelSocial"
            >
              Cancelar
            </button>
          </div>

          <!-- ══════════════════════════════════════════════════ -->
          <!-- GOOGLE REGISTRATION -->
          <!-- ══════════════════════════════════════════════════ -->
          <div
            v-else-if="registrationType === 'google'"
            class="social-registration"
          >
            <h2 class="form-title">Registro con Google</h2>
            <p class="social-description">
              Inicia sesión mediante tu cuenta de Google para crear tu perfil automáticamente
            </p>

            <button
              class="social-button google"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
              @click="handleGoogleLogin"
            >
              <span class="social-icon" aria-hidden="true">🔍</span>
              <span v-if="!isSubmitting">Continuar con Google</span>
              <span v-else>Conectando...</span>
            </button>

            <button
              class="cancel-button"
              :disabled="isSubmitting"
              @click="handleCancelSocial"
            >
              Cancelar
            </button>
          </div>
          <!-- ═══════════════════════════════════════-->
          <!-- FIRST USING - [AUTOMATIC ACCT]  -->
          <!-- ═══════════════════════════════════════-->
          <!-- <div v-else-if="registrationType === 'noneusers'" class="inital-bootraps-use">
            <h2>Registro del Primer Usuario</h2>
             <button  @click="handleBootstrap" class="f-register">
               Crear
             </button>
          </div> -->
        </article>
      </Transition>
    </section>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- PROFILE EDITOR MODAL -->
    <!-- ══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showProfileEditor"
          class="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          @click.self="handleCloseModal"
        >
          <article class="modal-content">
            <header class="modal-header">
              <h3 id="modal-title" class="modal-title">
                Completar Perfil
              </h3>
              <button
                class="modal-close"
                aria-label="Cerrar modal"
                :disabled="isSubmitting"
                @click="handleCloseModal"
              >
                ✕
              </button>
            </header>

            <form class="modal-form" @submit.prevent="handleProfileSubmit">
              <div class="form-grid">
                <!-- Nombre -->
                <div class="form-group">
                  <label for="modal-name" class="form-label">Nombre</label>
                  <input
                    id="modal-name"
                    v-model.trim="profileFormData.name"
                    type="text"
                    class="form-input"
                    :disabled="isSubmitting"
                  />
                </div>

                <!-- Apellido -->
                <div class="form-group">
                  <label for="modal-lname" class="form-label">Apellido</label>
                  <input
                    id="modal-lname"
                    v-model.trim="profileFormData.lname"
                    type="text"
                    class="form-input"
                    :disabled="isSubmitting"
                  />
                </div>

                <!-- Email -->
                <div class="form-group full-width">
                  <label for="modal-email" class="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    id="modal-email"
                    v-model.trim="profileFormData.email"
                    type="email"
                    class="form-input"
                    :disabled="isSubmitting"
                  />
                </div>

                <!-- Número de Cuenta -->
                <div class="form-group">
                  <label for="modal-cuenta" class="form-label">
                    Núm. Cuenta
                  </label>
                  <input
                    id="modal-cuenta"
                    v-model.trim="profileFormData.numCuenta"
                    type="text"
                    class="form-input"
                    :disabled="isSubmitting"
                  />
                </div>

                <!-- Área -->
                <div class="form-group">
                  <label for="modal-area" class="form-label">Área</label>
                  <input
                    id="modal-area"
                    v-model.trim="profileFormData.area"
                    type="text"
                    class="form-input"
                    :disabled="isSubmitting"
                  />
                </div>

                <!-- Rol -->
                <div class="form-group full-width">
                  <label for="modal-role" class="form-label">Rol</label>
                  <select
                    id="modal-role"
                    v-model="profileFormData.role"
                    class="form-select"
                    :disabled="isSubmitting"
                  >
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                  </select>
                </div>
              </div>

              <footer class="modal-actions">
                <button
                  type="button"
                  class="action-button delete"
                  :disabled="isSubmitting"
                  @click="handleDeleteProfile"
                >
                  Eliminar
                </button>
                <button
                  type="submit"
                  class="action-button edit"
                  :disabled="isSubmitting"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  class="action-button cancel"
                  :disabled="isSubmitting"
                  @click="handleCloseModal"
                >
                  Cerrar
                </button>
              </footer>
            </form>
          </article>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- NOTIFICATIONS MODULE -->
    <!-- ══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <TransitionGroup name="notification-list" tag="div" class="notifications-container">
        <article
          v-for="notification in activeNotifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
          role="alert"
          :aria-live="notification.type === 'error' ? 'assertive' : 'polite'"
        >
          <span class="notification-icon" aria-hidden="true">
            {{ notification.icon }}
          </span>
          <p class="notification-message">
            {{ notification.message }}
          </p>
          <button
            class="notification-close"
            aria-label="Cerrar notificación"
            @click="dismissNotification(notification.id)"
          >
            ✕
          </button>
        </article>
      </TransitionGroup>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import {storeToRefs} from 'pinia';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore3 } from '@/stores/authStore3'; 
import { useNotifications } from '@/composables/useNotifications';
import { useFormValidation } from '@/composables/useFormValidation';
import { useRegistrationForm } from '@/composables/useRegistrationForm';
import type { RegistrationType, RegistrationTypeOption, UserRole } from '@/types/registration.types';



// ══════════════════════════════════════════════════════
// COMPOSABLES
// ══════════════════════════════════════════════════════

const router = useRouter();
const profileStore = useProfileStore();
const authStore3 = useAuthStore3();
const { showNotification, activeNotifications, dismissNotification } = useNotifications();
const { validateField, hasFieldError, getFieldError, clearErrors } = useFormValidation();
const { 
  formData, 
  profileFormData, 
  validateTraditionalForm, 
  syncProfileToForm, 
  resetForm,
  uid_auth,
} = useRegistrationForm();

// ══════════════════════════════════════════════════════
// REACTIVE STATES
// ══════════════════════════════════════════════════════

const registrationType = ref<RegistrationType>('tradicional');
const isSubmitting = ref<boolean>(false);
const showProfileEditor = ref<boolean>(false);
  /*No existe showNotification*/
// ══════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════

const REGISTRATION_TYPES: readonly RegistrationTypeOption[] = [
  { 
    id: 'tradicional', 
    label: 'Registro Tradicional', 
    icon: '📝' 
  },
  { 
    id: 'facebook', 
    label: 'Facebook', 
    icon: '👥' 
  },
  { 
    id: 'google', 
    label: 'Google', 
    icon: '🔍' 
  },
 /* {
    id: 'noneusers',
    label: 'None',
    icon: '❌👥'
  }*/
] as const;

  const ROLE_MAP: Record<string, 'student' | 'teacher'> = {
    alumno: 'student',
    profesor: 'teacher'
  }

const ROLE_ROUTES: Record<UserRole, string> = {
  profesor: '/vw-bienvenida-teacher',
  alumno: '/vw-bienvenida-student'
} as const;

// ══════════════════════════════════════════════════════
// COMPUTED PROPERTIES
// ══════════════════════════════════════════════════════

const currentUserProfile = computed(() => profileStore.profile);
const isAuthenticated = computed(() => authStore3.isAuthenticated);

//  ═════════════════════════════
//   CONSTANTS REFERENCEDES
//  ═════════════════════════════

  const isBootstrapMode = ref(false);
  const bootrapError = ref('');
  // nva -> Subir la Foto de perfil
  const photoFile = ref<File | null>(null);

  const PhotoFileController = (e: Event) => {
    const input = e.target as HTMLInputElement;

    photoFile.value = input.files?.[0] ?? null
  }

// ══════════════════════════════════════════════════════
// WATCHERS
// ══════════════════════════════════════════════════════

watch(
  () => profileStore.profile,
  (newProfile) => {
    if (newProfile) {
      syncProfileToForm(newProfile);
      showProfileEditor.value = true;
    }
  },
  { deep: true }
);

watch(
  () => profileStore.error,
  (error) => {
    if (error) {
      showNotification({
        type: 'error',
        message: 'Hubo un error al acceder al perfil'
      });
    }
  }
);

watch(
  () => profileStore.message,
  (message) => {
    if (message && profileFormData.role) {
      showNotification({
        type: 'success',
        message: `Ingresando a tu perfil como: ${profileFormData.role}`
      });
    }
  }
);

// ══════════════════════════════════════════════════════
// EVENT HANDLERS
// ══════════════════════════════════════════════════════

/**
 * Maneja el cambio de tipo de registro
 */
const handleTypeChange = (type: RegistrationType): void => {
  registrationType.value = type;
  clearErrors();
};

  /*async function handleBootstrap(){
    const result = await RoleFirstUsingService.initialingFirstUse();

      if(result?.success){
        console.log('[Bootstrap] Sistema inicializado:', result.credentials);
         router.push({name: 'viewLoginMultiuser'});
      } else {
        bootrapError.value = result?.message ?? 'Error al inicializar el Sistema';
      }
  }*/
/**
 * Maneja el envío del formulario tradicional
 */
const handleTraditionalSubmit = async (): Promise<void> => {
  clearErrors();
  const {uid_auth} = storeToRefs(authStore3);

  const validationResult = validateTraditionalForm();

  if (!validationResult.isValid) {
    // Aplicar errores de validación
    Object.entries(validationResult.errors).forEach(([field, message]) => {
      validateField(field, message);
    });
    return;
  }

  isSubmitting.value = true;

  try {
    await profileStore.registerTraditional({
      nombre: formData.name, //*
      apellido: formData.lname,
      correo: formData.email,
      passwd: formData.password,
      cuenta: formData.numCuenta,
      areaTrab: formData.area, //*
      // Cammbios efectuados 21/05/2026
      role: ROLE_MAP[formData.role],
      uid_teacher: uid_auth.value,
      photoFile: photoFile.value //?? null new, subida de Imagen
    });

    showNotification({
      type: 'success',
      message: `Registro exitoso como ${formData.role}`
    });

    await nextTick();

    const targetRoute = ROLE_ROUTES[formData.role];
    await router.push(targetRoute);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    showNotification({
      type: 'error',
      message: 'Ocurrió un error al procesar el registro'
    });
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Maneja el login con Facebook
 */
const handleFacebookLogin = async (): Promise<void> => {
  isSubmitting.value = true;

  try {
    await profileStore.signInWithFacebook();

    showNotification({
      type: 'success',
      message: 'Conexión exitosa mediante Facebook'
    });
  } catch (error) {
    console.error('Error en login de Facebook:', error);
    showNotification({
      type: 'error',
      message: 'No fue posible conectar con Facebook'
    });
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Maneja el login con Google
 */
const handleGoogleLogin = async (): Promise<void> => {
  isSubmitting.value = true;

  try {
    await profileStore.signInWithGoogle();

    showNotification({
      type: 'success',
      message: 'Conexión exitosa mediante Google'
    });
  } catch (error) {
    console.error('Error en login de Google:', error);
    showNotification({
      type: 'error',
      message: 'No fue posible conectar con Google'
    });
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Cancela el registro social y vuelve al tradicional
 */
const handleCancelSocial = (): void => {
  profileStore.clearSocial();
  registrationType.value = 'tradicional';
};

/**
 * Maneja el envío del formulario de perfil
 */
const handleProfileSubmit = async (): Promise<void> => {
  const uid = profileStore.typeUser?.uid;
  if (!uid) {
    showNotification({
      type: 'error',
      message: 'No se encontró el UID del usuario'
    });
    return;
  }

  isSubmitting.value = true;

  try {
    await profileStore.editProfile(uid, {
      nomb: profileFormData.name,
      apellido: profileFormData.lname,
      correo: profileFormData.email,
      cuenta: profileFormData.numCuenta,
      areaTrab: profileFormData.area, 
      //* Cambios, a partir de la foto *
      role: ROLE_MAP[formData.role],
      uid_teacher: uid_auth.value,
      photoFile
    });

    showNotification({
      type: 'success',
      message: 'El perfil fue actualizado correctamente'
    });

    showProfileEditor.value = false;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    showNotification({
      type: 'error',
      message: 'No fue posible editar la información del perfil'
    });
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Maneja la eliminación del perfil
 */
const handleDeleteProfile = async (): Promise<void> => {
  const uid = profileStore.typeUser?.uid;
  if (!uid) return;

  const confirmed = confirm('¿Está seguro de eliminar este perfil?');
  if (!confirmed) return;

  isSubmitting.value = true;

  try {
    await profileStore.deleteProfiles(uid);

    showNotification({
      type: 'info',
      message: 'El perfil fue eliminado exitosamente'
    });

    showProfileEditor.value = false;
  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    showNotification({
      type: 'error',
      message: 'No fue posible eliminar el perfil'
    });
  } finally {
    isSubmitting.value = false;
  }
};


/**
 * Cierra el modal de edición de perfil
 */
const handleCloseModal = (): void => {
  if (!isSubmitting.value) {
    showProfileEditor.value = false;
    profileStore.clearSocial();
  }
};

// ══════════════════════════════════════════════════════
// LIFECYCLE HOOKS
// ══════════════════════════════════════════════════════

onMounted(async () => {
  const uid = authStore3.currentUser?.uid;

  if (uid) {
    try {
      await profileStore.getStudentById(uid);
      // Limpiando la memoria
      // profieStore.$reset();
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
    }
  }
});

/*onMounted(async () => {
   const completed = await RoleFirstUsingService.initialingFirstUse();
   isBootstrapMode.value = !completed;
});*/

   // await handleBootstrap();
</script>

<style scoped>
/* ══════════════════════════════════════════════════════ */
/* ANIMATIONS */
/* ══════════════════════════════════════════════════════ */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ══════════════════════════════════════════════════════ */
/* LAYOUT */
/* ══════════════════════════════════════════════════════ */

.register-view {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100;
  @apply dark:from-gray-900 dark:to-gray-800 py-8 px-4;
  animation: fadeIn 0.5s ease-out;
}

.register-header {
  @apply max-w-4xl mx-auto text-center mb-8;
  animation: slideInDown 0.6s ease-out;
}

/* ══════════════════════════════════════════════════════ */
/* REGISTRATION TYPE SELECTOR */
/* ══════════════════════════════════════════════════════ */

.registration-selector {
  @apply max-w-4xl mx-auto mb-8 flex gap-4 justify-center flex-wrap;
}

.selector-button {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-300;
  @apply bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200;
  @apply hover:bg-blue-50 dark:hover:bg-gray-600 hover:scale-105;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
  @apply flex items-center gap-2 shadow-md;
}

.selector-button-active {
  @apply bg-blue-600 text-white dark:bg-blue-500 shadow-lg scale-105;
  animation: bounce 0.5s ease-out;
}

.button-icon {
  @apply text-xl;
}

.button-text {
  @apply text-sm sm:text-base;
}

/* ══════════════════════════════════════════════════════ */
/* FORMS CONTAINER */
/* ══════════════════════════════════════════════════════ */

.forms-container {
  @apply max-w-2xl mx-auto;
}

.registration-panel {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8;
  animation: scaleIn 0.4s ease-out;
}

/* ══════════════════════════════════════════════════════ */
/* FORMS STYLES */
/* ══════════════════════════════════════════════════════ */

.registration-form,
.social-registration {
  @apply space-y-6;
}

.form-title {
  @apply text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6;
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-group {
  @apply flex flex-col gap-2;
}

.form-group.full-width {
  @apply md:col-span-2;
}

.form-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.required {
  @apply text-red-500;
}

.form-input,
.form-select {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg;
  @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply transition-all duration-200;
}

.form-input:hover:not(:disabled),
.form-select:hover:not(:disabled) {
  @apply border-blue-400 dark:border-blue-500;
}

.form-input[aria-invalid="true"],
.form-select[aria-invalid="true"] {
  @apply border-red-500 focus:ring-red-500;
  animation: bounce 0.5s ease-out;
}

.field-error {
  @apply text-sm text-red-600 dark:text-red-400;
  animation: slideInUp 0.3s ease-out;
}

/* ══════════════════════════════════════════════════════ */
/* BUTTONS */
/* ══════════════════════════════════════════════════════ */

.submit-button,
.social-button,
.cancel-button,
.action-button {
  @apply w-full px-6 py-3 rounded-lg font-medium;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.submit-button {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
  @apply dark:bg-blue-500 dark:hover:bg-blue-600;
  @apply focus:ring-blue-500 hover:scale-105 shadow-lg;
}

.social-button {
  @apply text-white flex items-center justify-center gap-2;
  @apply hover:scale-105 shadow-lg;
}

.social-button.facebook {
  @apply bg-blue-600 hover:bg-blue-700 focus:ring-blue-500;
}

.social-button.google {
  @apply bg-red-600 hover:bg-red-700 focus:ring-red-500;
}

.cancel-button {
  @apply mt-4 bg-gray-200 dark:bg-gray-600;
  @apply text-gray-700 dark:text-gray-200;
  @apply hover:bg-gray-300 dark:hover:bg-gray-500;
}

.loading-content {
  @apply flex items-center justify-center gap-2;
}

.spinner {
  @apply inline-block w-4 h-4 border-2 border-white;
  @apply border-t-transparent rounded-full;
  animation: spin 1s linear infinite;
}

.social-icon {
  @apply text-xl;
}

.social-description {
  @apply text-gray-600 dark:text-gray-400 mb-6 text-center;
}

/* ══════════════════════════════════════════════════════ */
/* MODAL */
/* ══════════════════════════════════════════════════════ */

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center;
  @apply z-50 p-4;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-2xl;
  @apply max-w-2xl w-full max-h-[90vh] overflow-y-auto;
  animation: scaleIn 0.3s ease-out;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b;
  @apply border-gray-200 dark:border-gray-700;
}

.modal-title {
  @apply text-xl font-bold text-gray-800 dark:text-gray-100;
}

.modal-close {
  @apply text-gray-500 hover:text-gray-700 dark:text-gray-400;
  @apply dark:hover:text-gray-200 text-2xl;
  @apply transition-colors duration-200;
}

.modal-form {
  @apply p-6;
}

.modal-actions {
  @apply flex gap-4 mt-6 flex-wrap;
}

.action-button {
  @apply flex-1 min-w-[120px];
}

.action-button.delete {
  @apply bg-red-600 hover:bg-red-700 text-white;
  @apply focus:ring-red-500;
}

.action-button.edit {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
  @apply focus:ring-blue-500;
}

.action-button.cancel {
  @apply bg-gray-200 dark:bg-gray-600 text-gray-700;
  @apply dark:text-gray-200 hover:bg-gray-300;
  @apply dark:hover:bg-gray-500;
}

/* ══════════════════════════════════════════════════════ */
/* NOTIFICATIONS */
/* ══════════════════════════════════════════════════════ */

.notifications-container {
  @apply fixed top-4 right-4 z-50 flex flex-col gap-3;
  @apply max-w-md w-full;
}

.notification {
  @apply flex items-start gap-3 p-4 rounded-lg shadow-lg;
  @apply bg-white dark:bg-gray-800 border-l-4;
  animation: slideInDown 0.3s ease-out;
}

.notification-success {
  @apply border-green-500;
}

.notification-error {
  @apply border-red-500;
}

.notification-info {
  @apply border-blue-500;
}

.notification-warning {
  @apply border-yellow-500;
}

.notification-icon {
  @apply text-2xl flex-shrink-0;
}

.notification-message {
  @apply flex-1 text-sm text-gray-700 dark:text-gray-200;
}

.notification-close {
  @apply text-gray-500 hover:text-gray-700 dark:text-gray-400;
  @apply dark:hover:text-gray-200 transition-colors;
}

/* ══════════════════════════════════════════════════════ */
/* TRANSITIONS */
/* ══════════════════════════════════════════════════════ */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-list-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>