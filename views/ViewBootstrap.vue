<!-- Esta vista Aun no es Usable en el Portal  -->
<template>
	<!-- ──────────────────────────────────────────────────────-->
	<!--	VISTA BOOTSTRAP  Puente Cognitivo de primer acceso
			PORTAL WED EDUCATIVO FI-UAEMex  v3.3.2
			Arquitectura: SSV·Sin store·Sin Firebase
			Responsabilidad unica: Informar + redirigir -->
	<!-- ──────────────────────────────────────────────────────-->
	<div class="bootstrap-shell">
		<!-- Fondo decorativo -->
		<div class="bg-grid"></div>
		<div class="bg-glow"></div>
		<!-- Main Target[Tarjeta] -->
		<div class="bootstrap-card" :class="{'card-visible': mounted}">
			<!-- Encabezado de la FI-UAEMex -->
			<header class="bootstrap-header">
				<div class="logo-ring">
					<svg viewBox="0 0 48 48" fill="none" class="logo-icon">
						<path d="M24 4L6 14v20l18 10 18-10V14L24 4z"
						stroke="currentColor" stroke-width="2"
						stroke-line-join="round" fill="none"/>
						<path d="M24 4v40M6 14l18 10 18-10"
						stroke="currentColor" stroke-width="1.5"
						stroke-line-join="round" opacity="0.5"/>
					</svg>
				</div>
				<div class="header-text">
					<span class="inst-label">FI-UAEMEX</span>
					<h1 class="portal-title">Portal W. Educativo</h1>
				</div>
			</header>

			<!-- Linea Divisoria -->
			<div class="divider"></div>
			<!-- Cuerpo de la vista -->
			<main class="bootstrap-body">
				<div class="status-badge">
					<span class="status-dot"></span>
					Primera Ejecución detectada
				</div>

				<h2 class="body-heading">
				 El Sistema requiere <br/>
					<em>su registro Inicial</em>
				</h2>

				<p class="body-description">No existe ninguna cuenta registrada en el Sistema.
				 Para comenzar a operar el Portal Educativo es necesario crear la primera cuenta
				 como "Role2: Profesor", antes de habilitar el acceso a los demás usuarios.
				</p>
				<!-- Pasos visualaes -->
				<ol class="steps-list">
					<li class="step-item">
						<span class="step-number"style="--delay">01</span>
						<span class="step-text">Registrar la cuenta inicial del Sistema</span>
					</li>
					<li class="step-item" style="--delay">
						<span class="step-number">02</span>
						<span>Iniciar sesión con las credenciales generadas.</span>
					</li>
					<li class="step-item">
						<span class="step-number">03</span>
					 	<span class="step-text">El sistema operará con normalidad desde este momento</span>
					</li>
				</ol>
			</main>

			<!-- Accion Principal [Pie de Pagina] -->
			<footer class="bootstrap-footer">
				<!-- Sin mostrarse -->
				<button class="btn-bootstrap" :class="{'btn-ready' : mounted}" @click="handleRedirect" :disabled="redirecting">
					<span v-if="!redirecting" class="btn-content">
						<svg  viewBox="0 0 20 20"  fill="none" class="btn-icon">
							<path  d="M10 3a7 7 0 110 14A7 7 0 0110 3z"
							  stroke="currentColor" stroke-width="1.5"/>
							 <path d="M10 7v3l2 2" stroke="currentColor"
							 stroke-width="1.5" stroke-linecap="round"/>
						</svg>
						Iniciar Registro del Sistema
					</span>
					<span v-else class="btn-content">
						<span class="btn-spinner"></span>
						 Redirigiendo...
					</span>
				</button>
				<p class="footer-note">
					Esta pantalla no volverá a mostrarse una vez completado el registro.
				</p>
			</footer>
		</div>
	</div>
</template>

<script setup lang="ts">
	/**
	 * Responsabilidad unica- Informar al operador que el sistema esta sin 
	 * inicializar y redirigirlo a la vista de registro d profesor: vwRegTeacher
	 *
	 * Sin Store (Pinia): La operacion puntual, estado local suficientemente
	 * sin Firebase. no ejecuta logica del negocio, solo navega.
	 * El guardh garantizara que si esta vista indep. se muestra,
	 * entonces el bootstrap no esta completo.
	 * 
	 * @component ViewBootrstrap*/

	import {ref,onMounted} from 'vue';
	import {useRouter} from 'vue-router';

	const router = useRouter();
	const mounted = ref(false);
	const redirecting = ref(false);

	// Activacion de animaciones de entrada una vez que el DOM esta listo

	onMounted(() => {
		requestAnimationFrame(() => {
			mounted.value = true;
		});
	});

	/**
	 * Redireccion del formulario de registro del primer usuario.
	 * La f(n)  initalingFirstUse() se ejecuta desde viewRegisterTeacher y esta
	 * vista no se encarga de invocarla **/
	async function handleRedirect(): Promise <void> {
			// console.log('Hiciste click en Registro de Profesores...')
		// Pausa instantanea, para que el usuario perciba la transicion entre vistas
		await new Promise( resolve => setTimeout(resolve, 600));
			router.push({name: 'viewRegisterTeacher'});
	}
</script>

<style scoped>
	:root {
		--bs-bg:#0f1923;
		--bs-surface:#162030;
		--bs-border:rgba(255, 255, 255, 0.08);
		--bs-accent:#3b82f6;
		--bs-accent-2:#1d4ed8;
		--bs-text:#e2e8f0;
		--bs-mutted:#94a3b8;
		--bs-glow:rgba(59, 130, 266, 0.15);
	}

	.bootstrap-shell{
		min-heighdisplay: 100vh;
		align-items: center;
		display: flex;
		justify-content: center;
		background: #0f1923;
		padding: 2rem;
		position:relative;
		overflow: hidden;
		font-family: 'Segoe UI', system-ui, sans-serif;
	}
	/*Gride decorativo( como fondo) */
	.bg-grid{
		position: absolute;
		inset: 0;
		background-image: 
			linear-gradient(rgba(59,130,246,0.04), transparent 1px),
			linear-gradient(90deg,rgba(59,130,246,0.04),1px,transparent 1px);
		background-size: 48px 48px;
		pointer-events: none;
	}
		/*Efecto_resplandor Centrado*/
	.bg-glow{
		position: absolute;
		top: 20%;
		left: 50%;
		transform: translateX(-50%);
		width: 600px;
		height: 400px;
		background: radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%);
		pointer-events: none;
	}

	.bootstrap-card .card-visible {
		position: absolute;
		width: 100%;
		max-width: 520px;
		background: #162030;
		border: 1px solid rgba(255,255,255,0.08);
		border-radius: 20px;
		padding: 2rem;
		box-shadow: 0 0 1px rgba(59,130,246,0.1);
		opacity: 0;
		/* Estado Inicial - invisible desplazada */
		transform: translateY(24px);
		transition: 
			opacity 0.5s cubic-beizer(0.22,1,0.36,1),
			transform 0.5s cubic-beizer(0.22,1,0.36,1);
	}

	.bootstrap-card .card-visible{
		opacity: 1;
		transform: translateY(0);
	}
	/* ENCABEZADO ────────────────────────────────────────*/
	.bootstrap-header{
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.logo-ring{ 
		width: 52px;
		height: 52px;
		border-radius: 14px;
		background: rgba(59, 130, 246, 0.12);
		border: 1px solid rgba(59, 130, 246, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #3b82f6;
		flex-shrink: 0;
	}

	.logo-icon { 
		width: 26px;
		height: 26px;
	}

	.inst-label { 
		display: block;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		color: #3b82f6;
		text-transform: uppercase;
		margin-bottom: 0.15rem;
	}

	.portal-title {
		font-size: 1.1rem;
		font-weight: 700;
		color: #e2e8f0;
		margin: 0;
		line-height: 1;
	}

	/*L. DIVISION ────────────────────────────────────────*/

	.divider {
		height: 1px;
		background: linear-gradient(90deg,
		 transparent,
		 rgba(59,130,246,0.3) 30%,
		 rgba(59,130,246,0.3) 70%,
		 transparent
		);
		margin-bottom: 1.75rem;
	}
	/* CUERPO ────────────────────────────────────────*/
	.bootstrap-body { 
		margin-bottom: 2rem;
	}

	.status-badge{
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #f59e0b;
		background: rgba(245,158,11,0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: 100px;
		padding: 0.3rem 0.75rem;
		margin-bottom: 1.25rem;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #f59e0b;
		animation:pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0% , 100% {opacity: 1; transform: scale(1);}
		50% {opacity: 0.4; transform: scale(0.8);}
	}

	.body-heading {
		font-size: 1.65rem;
		font-weight: 700;
		color: #f1f5f9;
		line-height: 1.3;
		margin: 0 0 1rem;
	}

	.body-heading em {
		font-style: normal;
		color: #3b82f6;
	}

	.body-description{
		font-size: 0.9rem;
		color: #94a3b8;
		line-height: 1.7;
		margin: 0 0 1.5rem;
	}

	/* PASOS ────────────────────────────────────────*/
	.steps-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.step-item{
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.65rem 0.85rem;
		background: rgba(255, 255, 255, 0.03);
		border:1px solid rgba(255, 255, 255, 0.6);
		border-radius: 10px;
		/*Efecto de animacion escalonada*/
		opacity:   0;
  		transform: translateX(-12px); 
  		 animation:  slide-in 0.4s cubic-beizer(0.22, 1, 0.36, 1) forwards;
  		animation-delay: var(--delay, 0s);
	}

		/*Solo se anima cuando la tarjeta es visible*/
	.card-visible .step-item {
		animation-play-state: running;
	}

	@keyframes slide-in {
		to { 
			opacity:1;
			transform:translateX(0); 
		}
	}

	.step-number {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08rem;
		color: #3b8f26;
		background: #3b82f6;
		background: rgba(59,130,246,0.1);
		border:  1px solid rgba(59,130,246,0.2);
		border-radius: 6px;
		padding: 0.2rem 0.45rem;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
	}
	
	.step-text {
		font-size: 0.85rem;
		color: #cbd5e1;
		line-height: 1.4;
	}

	/* FOOTER/BOTON ────────────────────────────────────────*/
	.bootstrap-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	.btn-bootstrap {
		width: 100%;
		padding: 0.9rem 15rem;
		border-radius: 12px;
		border: 1px solid rgba(59, 130, 256, 0.4);
		background: linear-gradient(135deg, #1d4ed8,#2563eb);
		color: #fff;
		font-size: 0.92rem;
		font-weight: 600;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition:
			transform 0.15s ease,
			box-shadow 0.2s ease,
			opacity 0.15s ease;

		/* Inicio de sesion invisible - (se muestra en la tarjeta) */
		opacity: 0;
		transform: translateY(8px);
	}
	.btn-bootstrap .btn-ready {
		opacity: 1;
		transform: translateY(0);
		transition:
		 	opacity 0.5s 0.4s cubic-beizer(0.22,1, 0.36,1),
		 	transform 0.5s 0.4s cubic-beizer(0.22,1, 0.36,1),
		 	box-shadow 0.2s ease;
	}

	.btn-bootstrap:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(37, 99, 235,0.4);
	}

	.btn-bootstrap:active:not(:disabled) {
		transform: translateY(0);
	}

	.btn-bootstrap:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
	}

	.btn-icon {
		width: 18px;
		height: 18px;
	}
	/* Spinner de carga */
	.btn-spinner {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: spin 0.7s linear infinite;
		display: inline-block;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.footer-note {
		font-size: 0.75rem;
		color: #475569;
		text-align: center;
		margin: 0;
		line-height: 1.5;
	}

	/* RESPONSIVIDAD  ────────────────────────────────────────*/

	@media (max-width: 480px) {
		.bootstrap-card { padding: 1.75rem 1.25rem ;}
		.body-heading { font-size: 1.4rem;}
	}
	/*De Vital Importancia:  Unicamente la propiedad transition
	puede embeber subpropiedades y estas son relacionadas
	exclusivamente con la animacion*/
</style>