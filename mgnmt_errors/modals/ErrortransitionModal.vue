<template>
	<Teleport to="body">
		<Transition name="etm-slide" appear>
			<div class="etm-host" 
			 v-if="modalStore.isVisible && activeConfig"
			  class="etm-host" role="alert" :arial-live="isBlockingError ?  'assertive' : 'polite' "
			  :aria-label="activeConfig.tittle">
				<div class="etm-panel" :style="{ 'etm-accent': activeConfig.accentColor}" >
					<div class="etm-accent-stripe" aria-hidden="true">
						<!-- Canbecera del panel  -->
						<div class="etm-header">
							<!-- Icono mas protocolo http -->
							<div class="etm-icon-wrap" aria-hidden="true">
								<span class="etm-icon"> {{activeConfig.icon}} </span>
							</div>

							<div class="etm-title-group">
								<span class="etm-badge" :class="activeConfig.badgeClass">
									HTTP {{activeConfig.httpCode}}
								</span>
								<h3 class="etm-title"> {{activeConfig.tittle}} </h3>
								<p class="etm-context"> {{activeConfig.context}} </p>
							</div>
							<!-- Boton p/cerrar -->
							<button class="etm-close-btn"
								@click="handleDemiss"
								aria-label="Cerrar la Notificación de error"
								type="button">
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M1 1L3 13M13 1L1 13" stroke="currentColor" stroke-width="2"
									stroke-linecap="round"></path>
								</svg>
							</button>
							</div>
						<!--  ─── Cuerpo ───────────────────────────────────────────────────-->
						<div class="etm-body">
							<p class="etm-description">  {{activeConfig.description}} </p>
							<!-- Ruta afectada (si esta disponible) -->
								<div v-if="modalStore.payload?.path" class="etm-meta">
									 <span class="etm-meta-label">Ruta:</span>
								   <code class="etm-meta-value"> {{modalStore.payload?.path}} </code>
								</div>
								<!-- Detalles tecnicos opcionales -->
								<div v-if="modalStore.payload?.details" class="etm-meta">
									 <span class="etm-meta-label">Detalles:</span>
								   <code class="etm-meta-value"> {{modalStore.payload?.details}} </code>
								</div>
									<!-- Pie: countdown + barra de progreso -->
								<div class="etm-footer">
									 <span class="etm-coutdown">
									 	Cerrando en {{modalStore.secondRemaining}}
									 </span>
								   <code class="etm-meta-value"></code>
								</div>
								<!-- Barra de Progreso(Drena de derecha - izquierda 60 segs)  -->
								<div class="etm-progres-track" aria-hidden="true">
									 <div class="etm-progreess-fill"	
									 	:class="activeConfig.progressClass"
									 	:style="{ width = `${modalStore.progressPercent}%`}"
									 ></div>
								</div>
						</div>
					</div>

				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
	import {computed} from 'vue';
	import { useErrorModalStore } from '@/mgnmt_errors/store/errorModalStore.vue';
	import { ERROR_MODAL_CATALOG, ErrorModalType } from '@/mgnmt_errors/service/ErrorModalService.ts';
	import type { ErrorModalConfig } from  '@/mgnmt_errors/modals/errorModal.types';

	// ─── Store(Estado) ─────────────────────────────────────────────
	 const modalStore = useErrorModalStore();
	// ─── Computado ─────────────────────────────────────────────────
	 /**
	  * Configuracion visual activa, segun el tipo de error del payload 
	  * */
	 const activeConfig = computed<ErrorModalConfig | null>(null)(() => {
	 	if(modalStore.payload) return null;
	 	 return ERROR_MODAL_CATALOG[modalStore.payload.type] ?? null;
	 });

	 /**
	  * Los errores 401/403 son bloqueantes (assertive),
	  * los demas son informativos (de cortesia/polite)
	  * */
	 const isBlockingError = computed<boolean>(() => {
	 	return (
	 		modalStore.payload?.type === ErrorModalType.UNAUTHORIZED ||
	 		modalStore.payload?.type ===ErrorModalType.FORBIDDEN
	 	);
	 });

	// ─── manejadores ─────────────────────────────────────
	 function handleDemiss(): void {
	 	modalStore.hide();
	 }
</script>

<style scoped>
	.etm-host{
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		z-index: 9999;
		max-width: 26rem;
		width: 100%;
		pointer-events: none%;   /*El host no captura los eventos*/
	}
	/*─── El Panel ───────────────────────────────────────────────────*/
	.etm-panel{
		pointer-events: auto;
		position: relative;
		background: #ffff;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
		      0 4px 6px -1px rgba(0,0,0,.08),
    		0 10px 30px -5px rgba(0,0,0,.14),
    		0 0 0 1px rgba(0,0,0,.05);
    	  display:      flex;
   		flex-direction: column;
   		gap: 0;
	}

	.etm-accent-stripe{
		position: absolute;
		left: top;
		top: 0;
		bottom: 0;
		width: 4px;
		background: linear(--etm-accent, #6b7280);
		border-radius: 12px 0 0 12xp;
	}

	.etm-header{
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem 1rem 0.5rem 1.25rem;
	}

	.etm-icon-wrap{
		width:  2.5rem;
		height: 2.5rem;
		border-radius: 10px;
		background: color-mix(in srgb,var(--etm-accent, #6b7280) 12%, white);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink:  0;
		margin-top: 0.125rem;
	}

	.etm-icon{
		font-size: 1.25rem;
		line-height: 1;
	}

	.etm-title-group{
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}	

	.etm-badge{
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.45rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight:  700;
		letter-spacing: 'Counter New', monospace;
		width: fit-content;
	}

	.etm-title{
		margin: 0;
		font-size: 0.9rem;
		font-weight: 700;
		color: #111827;
		line-height: 1.3;
	}

	.etm-context{
		margin: 0;
		font-size: 0.7rem;
		color: #6b7280;
		font-weight: 500;

	}

	.etm-close-btn{
		flex-shrink:  0;
  		width:        1.75rem;
  		height:       1.75rem;
  		border-radius: 6px;
  		border:       none;
  		background:   transparent;
  		color:        #9ca3af;
  		cursor:       pointer;
  		display: flex;
  		align-items: center;
  		justify-content: center;
  		transition: background 0.15s, color 015s;
  		margin-top: -0.1rem;
  		margin-right: -0.25rem;
	}

	.etm-close-btn: hover{
		background: #f3f4f6;
		color: #374151;
	}
	 /*─── Cuerpo del Modal ───────────────────────────────────────────────────*/
	.etm-body{
		padding:  0 1rem 0.75rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.etm-description{
		margin: 0;
		font-size: 0.775rem;
		color: #4b5563;
		line-height: 1.55;
	}

	.etm-meta{
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.etm-meta-label{
		font-size: 0.7rem;
		font-weight: 600;
		color: #6b7280;
		flex-shrink: 0;
	}

	.etm-meta-value{
		font-family: 'Courrier New', monospace;
		font-size: 0.7rem;
		color: #374151;
		background: #f3f4f6;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		word-break: break-all;
	}
	/* ─── Pie de Pagina ───────────────────────────────────────────────────*/
	.etm-footer{
		padding: 0 1rem 0.5rem 1rem;
	}

	.etm-countdown {
		font-size: 0.68rem;
		color: #9ca3af;
		font-variant-numeric: tabular-nums;
	}
	/*  ─── Barra de Progreso ───────────────────────────────────────────────────*/
	.etm-progress-track{
		height: 3px;
		background: #f3f4f6;
		overflow: hidden;
	}

	.etm-progreess-fill {
		height: 100%;
		transition: width 0.05s linear;
		border-radius: 0 2px 2px 0;
	}


	/** ════════════════════════════════════════════════════════════════════════
	 * 			TRANSITION: slide-up desde bottom con fade
	  * ════════════════════════════════════════════════════════════════════════ */

	.etm-slide-enter-active {
		transition: opacity 0.3s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.etm-slide-leave-active {
		transition: opacity 0.25s ease, transform 0.3s ease;
	}

	.etm-slide-enter-from {
		  opacity: 0;
		  transform: translateY(1rem) scale(0.97);
	}

	.etm-slide-leave-to {
	  opacity: 0;
	  transform: translateY(1rem) scale(0.98);
	}

	/** ───Web Responsive Mobiele ────────────────────────────────────────────────*/
	@media (max-width: 580px) {
		.etm-host{
			bottom: 0;
			right: 0;
			left: 0;
			max-width: 100%;
		}

		.etm-panel{
			border-radius: 12px 12px 0 0;
		}
	}
</style>