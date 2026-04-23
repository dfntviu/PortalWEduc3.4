<template>
  <!-- ============================================================ -->
  <!--   OVERLAY DE CIERRE DE SESIÓN - PORTAL EDUCATIVO FI-UAEMEX  -->
  <!--   Animación: Potro salta y aterriza al cerrar sesión         -->
  <!-- ============================================================ -->
  <Transition name="overlay-appear">
    <div
      v-if="visible"
      class="logout-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cerrando sesión"
    >
      <!-- FONDO INSTITUCIONAL -->
      <div class="logout-bg" aria-hidden="true" />

      <!-- ESCENA PRINCIPAL -->
      <div class="logout-scene">

        <!-- =====================================
             STAGE DEL POTRO + SUELO
        ====================================== -->
        <div class="horse-stage" aria-hidden="true">

          <!-- Wrapper con la clase de fase para las animaciones CSS -->
          <div class="horse-wrapper" :class="`phase-${currentPhase}`">

            <!--
              Imagen PNG del potro (255×255px).
              Coloca el archivo en: src/assets/potro.png
              Si no existe, se muestra el SVG de respaldo automáticamente.
            -->
            <img
              v-if="!imgError"
              ref="imgRef"
              src="@/assets/wild_horse.png"
              alt="Potro FI-UAEMEX"
              width="255"
              height="255"
              class="potro-img"
              @error="imgError = true"
            />

            <!-- SVG POTRO DE RESPALDO (pose de salto) -->
            <svg
              v-else
              viewBox="0 0 255 255"
              xmlns="http://www.w3.org/2000/svg"
              class="potro-img potro-svg"
              aria-hidden="true"
            >
              <!-- Cuerpo -->
              <ellipse cx="135" cy="152" rx="63" ry="30" fill="#8B5E3C" />
              <!-- Cuello -->
              <path
                d="M 98 137 Q 82 108 90 80 Q 98 68 112 72 Q 117 98 107 134 Z"
                fill="#8B5E3C"
              />
              <!-- Cabeza -->
              <ellipse
                cx="96"
                cy="67"
                rx="22"
                ry="14"
                transform="rotate(-20 96 67)"
                fill="#8B5E3C"
              />
              <!-- Oreja -->
              <polygon points="87,54 83,43 95,51" fill="#8B5E3C" />
              <!-- Hocico -->
              <ellipse cx="80" cy="73" rx="8" ry="6" fill="#A0714F" />
              <!-- Ojo -->
              <circle cx="100" cy="62" r="4" fill="#1a1a1a" />
              <circle cx="101" cy="61" r="1.5" fill="white" />
              <!-- Ollares -->
              <ellipse cx="78" cy="76" rx="3" ry="2" fill="#6B3E1E" />
              <!-- Crin -->
              <path
                d="M 93 61 Q 86 84 89 114 Q 90 124 94 134"
                stroke="#6B2C0F"
                stroke-width="6"
                fill="none"
                stroke-linecap="round"
              />
              <!-- Patas delanteras - extendidas hacia adelante (salto) -->
              <line x1="110" y1="178" x2="80" y2="224" stroke="#7A5230" stroke-width="10" stroke-linecap="round" />
              <line x1="122" y1="180" x2="97" y2="227" stroke="#7A5230" stroke-width="10" stroke-linecap="round" />
              <!-- Cascos delanteros -->
              <ellipse cx="79"  cy="227" rx="9" ry="5" fill="#2d2d2d" />
              <ellipse cx="97"  cy="230" rx="9" ry="5" fill="#2d2d2d" />
              <!-- Patas traseras - hacia atrás (impulso) -->
              <line x1="163" y1="175" x2="196" y2="213" stroke="#7A5230" stroke-width="10" stroke-linecap="round" />
              <line x1="175" y1="178" x2="212" y2="216" stroke="#7A5230" stroke-width="10" stroke-linecap="round" />
              <!-- Cascos traseros -->
              <ellipse cx="197" cy="216" rx="9" ry="5" fill="#2d2d2d" />
              <ellipse cx="213" cy="219" rx="9" ry="5" fill="#2d2d2d" />
              <!-- Cola -->
              <path
                d="M 197 146 Q 231 133 226 158 Q 219 178 236 193"
                stroke="#6B2C0F"
                stroke-width="7"
                fill="none"
                stroke-linecap="round"
              />
              <path
                d="M 236 193 Q 246 204 239 216"
                stroke="#6B2C0F"
                stroke-width="5"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <!-- NUBE DE POLVO AL ATERRIZAR -->
          <Transition name="dust-appear">
            <div v-if="showDust" class="dust-wrapper" aria-hidden="true">
              <span class="dust-particle dp-1" />
              <span class="dust-particle dp-2" />
              <span class="dust-particle dp-3" />
              <span class="dust-particle dp-4" />
              <span class="dust-particle dp-5" />
            </div>
          </Transition>

          <!-- LÍNEA DEL SUELO -->
          <div class="ground-line" aria-hidden="true" />
        </div>

        <!-- =====================================
             TARJETA DE DESPEDIDA
        ====================================== -->
        <Transition name="message-appear">
          <div v-if="showMessage" class="farewell-card">
            <div class="farewell-icon" aria-hidden="true">🎓</div>

            <h2 class="farewell-title">Portal Web Educativo</h2>

            <hr class="farewell-divider" />

            <p class="farewell-body">Tu sesión ha sido terminada</p>

            <p class="farewell-user">{{ userName }}</p>

            <!-- Cuenta regresiva (visible en los últimos 10 s) -->
            <Transition name="counter-appear">
              <p v-if="countdown <= 10" class="farewell-countdown">
                Redirigiendo en
                <strong>{{ countdown }}</strong>
                segundo{{ countdown !== 1 ? 's' : '' }}…
              </p>
            </Transition>

            <!-- Botón para saltar la animación -->
            <button class="skip-btn" @click="skipAnimation" type="button">
              Continuar ahora &rarr;
            </button>
          </div>
        </Transition>

      </div><!-- /logout-scene -->
    </div><!-- /logout-overlay -->
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

// ============================================================
//   PROPS
// ============================================================
const props = defineProps<{
  /** Controla la visibilidad del overlay */
  visible: boolean;
  /** Nombre completo del usuario que cierra sesión */
  userName: string;
}>();

// ============================================================
//   EMITS
// ============================================================
const emit = defineEmits<{
  /** Emitido al concluir la animación (o al saltar) */
  (e: 'animation-complete'): void;
}>();

// ============================================================
//   TIPOS
// ============================================================
type HorsePhase = 'idle' | 'jumping' | 'peak' | 'landing' | 'landed';

// ============================================================
//   STATE REACTIVO
// ============================================================
const currentPhase = ref<HorsePhase>('idle');
const showDust     = ref(false);
const showMessage  = ref(false);
const countdown    = ref(45);
const imgError     = ref(false);
const imgRef       = ref<HTMLImageElement | null>(null);

// ============================================================
//   TIMERS (colección para limpiar al desmontar)
// ============================================================
const timers: ReturnType<typeof setTimeout>[] = [];
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// ============================================================
//   ANIMACIÓN PRINCIPAL
//   Duración total: 45 segundos (dinamico p /TOTAL_MS)
// ============================================================
const TOTAL_MS = 45_000; // 45 segundos → emit('animation-complete')

function runAnimation(): void {
  // --- Reset ---
  currentPhase.value = 'idle';
  showDust.value     = false;
  showMessage.value  = false;
  countdown.value    = 45;
  imgError.value     = false;

  // Fase 1 → Crouch + salto (600 ms)
  timers.push(setTimeout(() => {
    currentPhase.value = 'jumping';
  }, 600));

  // Fase 2 → Pico del salto (1 600 ms)
  timers.push(setTimeout(() => {
    currentPhase.value = 'peak';
  }, 1_600));

  // Fase 3 → Descenso (2 700 ms)
  timers.push(setTimeout(() => {
    currentPhase.value = 'landing';
  }, 2_700));

  // Fase 4 → Impacto + polvo (3 300 ms)
  timers.push(setTimeout(() => {
    currentPhase.value = 'landed';
    showDust.value     = true;
  }, 3_300));

  // Fase 5 → Mensaje de despedida (4 200 ms)
  timers.push(setTimeout(() => {
    showMessage.value = true;
    startCountdown();
  }, 4_200));

  // Fase 6 → Redirigir al terminar
  timers.push(setTimeout(() => {
    emit('animation-complete');
  }, TOTAL_MS));
}

/** Inicia la cuenta regresiva numérica en pantalla */
function startCountdown(): void {
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else if (countdownTimer) {
      clearInterval(countdownTimer);
    }
  }, 1_000);
}

/** Salta la animación de inmediato */
function skipAnimation(): void {
  clearAll();
  emit('animation-complete');
}

/** Limpia todos los timers */
function clearAll(): void {
  timers.forEach(id => clearTimeout(id));
  timers.length = 0;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

// ============================================================
//   WATCHERS
// ============================================================
watch(() => props.visible, (isVisible) => {
  if (isVisible) runAnimation();
  else           clearAll();
});

// ============================================================
//   CICLO DE VIDA
// ============================================================
onBeforeUnmount(clearAll);
</script>

<style scoped>
/* ======================================================
   OVERLAY BASE
====================================================== */
.logout-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    #002d00 0%,
    #004d00 35%,
    #006400 65%,
    #1a3a5c 100%
  );
  opacity: 0.97;
}

/* ======================================================
   ESCENA
====================================================== */
.logout-scene {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.25rem;
  width: 100%;
  padding: 2rem 1rem;
}

/* ======================================================
   STAGE DEL POTRO
====================================================== */
.horse-stage {
  position: relative;
  width: 340px;
  height: 310px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.horse-wrapper {
  position: absolute;
  bottom: 22px;     /* encima de la línea de suelo */
  width: 255px;
  height: 255px;
  transform-origin: bottom center;
  will-change: transform;
}

.potro-img {
  width: 255px;
  height: 255px;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.55));
  display: block;
}

.potro-svg {
  /* el SVG ya tiene su propio viewBox */
  overflow: visible;
}

/* ======================================================
   FASES DE LA ANIMACIÓN DEL POTRO
====================================================== */

/* Reposo */
.phase-idle {
  transform: translateY(0) scaleY(1);
  transition: transform 0.25s ease;
}

/* Salto */
.phase-jumping {
  animation: horseJumpUp 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

/* Pico en el aire */
.phase-peak {
  transform: translateY(-165px) rotate(-7deg);
  transition: transform 0.35s ease-out;
}

/* Descenso */
.phase-landing {
  animation: horseLand 0.65s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

/* Impacto con rebote suave */
.phase-landed {
  animation: horseBounce 0.55s ease-out forwards;
}

/* --- Keyframes --- */
@keyframes horseJumpUp {
  0%   { transform: translateY(0)     scaleY(0.87) rotate(0deg); }
  12%  { transform: translateY(-10px) scaleY(1.06) rotate(0deg); }
  100% { transform: translateY(-165px) scaleY(1)   rotate(-7deg); }
}

@keyframes horseLand {
  0%   { transform: translateY(-165px) rotate(-7deg) scaleY(1); }
  75%  { transform: translateY(5px)    rotate(0deg)  scaleY(0.83); }
  100% { transform: translateY(0)      rotate(0deg)  scaleY(0.90); }
}

@keyframes horseBounce {
  0%   { transform: translateY(0) scaleY(0.90); }
  38%  { transform: translateY(-14px) scaleY(1.04); }
  68%  { transform: translateY(0) scaleY(0.97); }
  100% { transform: translateY(0) scaleY(1); }
}

/* ======================================================
   LÍNEA DEL SUELO
====================================================== */
.ground-line {
  position: absolute;
  bottom: 14px;
  left: -20px;
  right: -20px;
  height: 3px;
  background: rgba(255, 255, 255, 0.28);
  border-radius: 2px;
}

/* ======================================================
   POLVO AL ATERRIZAR
====================================================== */
.dust-wrapper {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 70px;
  pointer-events: none;
}

.dust-particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(240, 235, 200, 0.75);
  animation: dustExpand 1.4s ease-out forwards;
}

.dp-1 { width: 38px; height: 38px; left: 28%; bottom: 0; animation-delay: 0.00s; }
.dp-2 { width: 56px; height: 56px; left: 43%; bottom: 0; animation-delay: 0.07s; }
.dp-3 { width: 32px; height: 32px; left: 60%; bottom: 0; animation-delay: 0.04s; }
.dp-4 { width: 22px; height: 22px; left: 18%; bottom: 0; animation-delay: 0.12s; }
.dp-5 { width: 28px; height: 28px; left: 68%; bottom: 0; animation-delay: 0.09s; }

@keyframes dustExpand {
  0%   { transform: scale(0) translateY(0); opacity: 0.9; }
  50%  { transform: scale(1.2) translateY(-10px); opacity: 0.6; }
  100% { transform: scale(1.9) translateY(-28px); opacity: 0; }
}

/* ======================================================
   TARJETA DE DESPEDIDA
====================================================== */
.farewell-card {
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1.25rem;
  padding: 2rem 2.75rem;
  text-align: center;
  color: #fff;
  max-width: 430px;
  width: 90%;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.farewell-icon {
  font-size: 2.6rem;
  line-height: 1;
  margin-bottom: 0.6rem;
}

.farewell-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #ffd700;
  margin: 0 0 0.8rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.farewell-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  margin: 0.8rem 0;
}

.farewell-body {
  font-size: 0.95rem;
  opacity: 0.82;
  margin: 0.4rem 0;
}

.farewell-user {
  font-size: 1.3rem;
  font-weight: 600;
  color: #90EE90;
  margin: 0.25rem 0 1.1rem;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.farewell-countdown {
  font-size: 0.78rem;
  opacity: 0.58;
  margin: 0.3rem 0 0;
  letter-spacing: 0.02em;
}

.farewell-countdown strong {
  font-variant-numeric: tabular-nums;
}

/* Botón para saltar */
.skip-btn {
  margin-top: 1.1rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.75);
  padding: 0.45rem 1.4rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  letter-spacing: 0.02em;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.24);
  color: #fff;
}

.skip-btn:focus-visible {
  outline: 2px solid #ffd700;
  outline-offset: 3px;
}

/* ======================================================
   TRANSICIONES VUE
====================================================== */

/* Overlay completo */
.overlay-appear-enter-active { transition: opacity 0.55s ease; }
.overlay-appear-leave-active { transition: opacity 0.45s ease; }
.overlay-appear-enter-from,
.overlay-appear-leave-to    { opacity: 0; }

/* Polvo */
.dust-appear-enter-active { transition: opacity 0.08s; }
.dust-appear-leave-active { transition: opacity 0.5s ease; }
.dust-appear-enter-from   { opacity: 0; }
.dust-appear-leave-to     { opacity: 0; }

/* Tarjeta de despedida */
.message-appear-enter-active {
  transition: opacity 0.65s ease, transform 0.65s ease;
}
.message-appear-enter-from {
  opacity: 0;
  transform: translateY(22px);
}

/* Contador */
.counter-appear-enter-active { transition: opacity 0.4s ease; }
.counter-appear-enter-from   { opacity: 0; }
</style>