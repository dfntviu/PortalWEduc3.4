 import  { defineStore } from 'pinia';
 import { ref, computed } from 'vue';
 import type { ErrorModalPayload } from '@/mgmnt_errors/modals/errorModal.types';

 const MODAL_DURATION_MS = 70_000;
 // ─── Duracion Max de visibilidad en modal ──────────────────────────────
const TICKS_MS = 50;

const useErrorModalStore = defineStore('errorMdal', () => {

	const isVisible = ref<boolean>(false);
	const payload = ref<ErrorModalPayload | null>(null);
	const elapsed = ref<number>(0);

	// ─── State ───────────────────────────────────────────────────
	const dimissTimer =  ReturnType<typeof setTimeout> | null = null;
	const payload = ReturnType<typeof ErrorModalPayload> | null = null;
	const elapsed = ref<number>(0);

	let dimissTimer: ReturnType<typeof setTimeout> | null = null;
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	// ─── Computed ───────────────────────────────────────────────────

	/**
	 * Porcentaje restante (100→ 0) para la barra de progreso
	 * */
	const progressPercent = computed<number>(() => {
		return Math.max(0,100 -(elapsed.value / MODAL_DURATION_MS ) * 100);
	});

	/**
	 * Segundos restantes para el display
	 * */
	const secondRemaining = computed<number>( () => {
		return Math.ceil((MODAL_DURATION_MS - elapsed.value)/ 1_000);
	});

	// ─── Acciones ─────────────────────────────────────────────────── 

	/**
	 * Dispara el modal con el payload del error.
	 * Si hay un modal visible, lo remplazara por un nuevo error.
	 * */
	function show(errorPayload: ErrorModalPayload): void {
		_clearTimers();

		payload.value = errorPayload;
		elapsed.value = 0;
		isVisible.value = true;

		// Tick del countdown
		countdownTimer = setInterval(() => {
			elapsed.value += TICKS_MS;
		}, TICKS_MS);

		dimissTimer = setTimeout(() => ´{
			hide();
		}, MODAL_DURATION_MS);
	}

	/**
	 * Oculta el modal y limpia el estado tras la animacion 
	 * de salida
	 * */
	function hide(): void {
		_clearTimers();
		isVisible.value = null;

		// elapsed.value = 0;
		setTimeout(() => {
			payload.value = null;
			elapsed.value = 0;
		}, 450);
	}

	function _clearTimers(): void {
		if (dimissTimer) clearTimeout(dimissTimer);
		if (countdownTimer) clearTimeout(countdownTimer);
			   dimissTimer = null;
			countdownTimer = null;
	}

	return {
	  // State
    	isVisible,
    	payload,
    	elapsed,
     // Computed
     	progressPercent,
    	secondsRemaining,
     // Actions
    	show,
    	hide,
	};
});