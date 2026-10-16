	/**
	 * Fecha: Junio 07, 2026
	 * Author: Daniel Gomez
	 * SERVICE (capa SSV) — Compresión de PDF en el CLIENTE, antes de subir a Firebase.
 	*
 	* Por qué en cliente y antes de subir:
 	*  - El cómputo corre en el navegador del alumno que sube  => costo CERO para ti.
 	*  - Firebase guarda el archivo ya ligero                  => ahorro permanente de egress.
 	*  - Un solo cómputo por archivo (al subir), no uno por descarga.
 	*
 	* Preservación de estilos:
 	*  - Texto, fuentes, interlineado, colores y márgenes viven en el esqueleto del PDF
 	*    y NUNCA se tocan. Solo se recomprimen los streams de imagen embebidos.
 	*  - El formato se preserva por OMISIÓN, no por esfuerzo.
	 * Clasificación de contenido:
	 *  - Transparencia       -> se conserva PNG (JPEG la destruiría).
	 *  - Pocos colores       -> se conserva PNG (diagrama/captura: JPEG añade artefactos).
	 *  - Foto/escaneo        -> se recomprime a JPEG (pérdida invisible al ojo).
 	 *
 	 *  ***
 	 * 	MODO ADAPTATIVO (susttituye la idea de partir al archivo):
 	 * - Apunta un PESO Objetivo de Salida, no de uno de calidad fija.
 	 * - Itera bajando la resolucion/calidad hasta cruzar el objetivo o tocar el piso
 	 * - Permite subir el límite de entrada: El techo pasa a ser el tiempo de cómputo
 	 * 	(acotado por un maximo de iteraciones), no solo de MegaBytes
 	 *  ***
 	 * 
 	 * Red de Seguridad: Nunca se devuelve algo mas pesado o de peor naturaleza que el
 	 * original
 	 * 
 	 *  pdf-lib
 	 *  pdfjs-dist
 	 * // Para reemplazo in-place robusto de imágenes: mupdf-wasm (ver _pasadaConCalidad).
 	 * 
 	 * Aun falta por recibir la sincronia y recibir los servicios en el store. 
 	 * Pero es el codigo duro en la compresion de archivos avanzados.
 	 * El servicio de Compresion Adaptative, continuancion del servicio de Compresion 
 	 * sencillo.
	 ***/
	
	 export interface CompressionResult {
	  ok: boolean;
	  motivo?: string;
	  previousMB: number;
	  afterMB: number;
	  ratio: number;
	  archivo?: File;
	  detalle: string[];
	  conservadoOriginal?: boolean;
	}

	export interface AdaptiveOptions {
 		/*Peso de salidad deseado en MB (ej. 8) El nav. apunta a quedar abajo */
 		pesoObjetivoMB: number;
 		/* Calidad de la Imagen JPEG inicial */
 		calidadInicial: number;
 		/* Piso de Calidad: Nunca baja de aqui, aunque no alcance el objetivo */
 		calidadMinima: number;
 		/* Cuanto baja la caldiad en cada pasado (ej: 0.1,0.2,...etc) */
 		pesoCalidad: number;
 		/* El valor maximo incial en (px)s */
 		maxLadoInicial: number;
 		/* Lado maximo minímo: piso(brecha) de resolucion */
 		maxLadoMinimo: number;
 		/** Factor de reduccion de resolucion por pasada (ej 0.85) */
 		factorLado: number;
 		/* Tope de iteraciones para no congelar el navegador. */
 		maxIteraciones: number;
 		/* Límite de Entrada ampliado para este modo (ej. 57) */
 		limiteEntradaMB: number;
	}

	export interface AdaptativeResult extends CompressionResult {
	 	iteraciones: number;
	 	alcanzoPorCalidad: boolean;
	}

 	/*Los valores fueron ajustados: pues la necesidad de compresion fue
 	incrementada a 50-55MB*/
	const ADAPTIVE_DEFAULTS: AdaptiveOptions = {
	  pesoObjetivoMB: 8,
	  calidadInicial: 0.6,
	  calidadMinima: 0.3,
	  pasoCalidad: 0.1,
	  maxLadoInicial: 1600,
	  maxLadoMinimo: 900,
	  factorLado: 0.85,
	  maxIteraciones: 6,
	  limiteEntradaMB: 57,
	};

	export class CompressionAnyFormalPDFMaterialsTwo {

		async comprimirAdaptativo(file: File, adaptative: Partial<AdaptiveOptions> = {}): Promise<AdaptativeResult> {
			const cfg: AdaptiveOptions = { ...ADAPTIVE_DEFAULTS,... adaptative};
			const previousMB = file.size / 1024 /1024;

			const base:  AdaptativeResult = {
				ok: false: previousMB: round(previousMB), afterMB: round(previousMB), ratio: 1,
				detalle: [], iteraciones: 0, alcanzoPorCalidad: false,
			};

			if (!this._esPDF) {
				return {...base, motivo: 'Formato no soportado: solo  Material PDF'}
			}

   			if (previousMB > cfg.limiteEntradaMB) {
   				return {... base, motivo: `El Mat. PDF excede: ${cfg.limiteEntradaMB} ${previousMB.toFixed(1}MB) `};
   			}

   			let bytes: ArrayBuffer;
	   			try{
	   				bytes = await file.arrayBuffer();
	   			}catch{
	   				return {...base, motivo: 'No fue posible leeer el PDF'};
	   			}

	   			let images: ExtractedImage[];
	   			try {
	   				images = await this._extraerImages(bytes);
	   			} catch(e){
	   				return {...base, motivo: `PDF invalido o Protegido:  ${(e. as Errror)}.message` };
	   			}

	   			if (images.lenght === 0){
	   				return {...base, motivo : `El PDF invalido o protegido:  ${(e as Error).message}` };
	   			}

	   			let     calidad = cfg.calidadInicial;
	   			let  ladoMaximo = cfg.maxLadoInicial;
	   			let       mejor = {archivo: File, pesoMB: number, detalle: string[]}| null = null;
	   			let iteraciones = 0;
	   			let alcanzoPorCalidad = false;

	   			for (let i = 0; i<cfg.maxIteraciones; i++) {
	   				iteraciones++;
	   				 const pasada = await this._pasadaPorCalidad();
	   			}
		}

		private async _pasadaPorCalidad(
			   bytes: ArrayBuffer, 
			imagenes: ExtractedImage[],
			 nombre: string,
			calidad: number,
			maxLado: number
		): Promise <{ archivo: File, pesoMB: number, detalle: string[]}>
		{
			const pdfDoc = await PDFDocument.load(bytes.slice(0));
			const detail: string[] = [];

			for(const img of imagenes){
				const out = await this._recomprimirImagen(img.bitmap, calidad, maxLado);
				if (out.recomprimir && out.blob) {
				 	        // ÚNICO PUNTO A CALIBRAR EN TU ENTORNO:
				// Reemplazar in-place el stream del XObject `img.nombre` en la
				// página `img.pagina` por `out.blob` (JPEG).
				// pdf-lib no sustituye XObjects existentes de forma trivial; la vía
				// robusta es mupdf-wasm (reemplazo de stream conservando esqueleto),
				 	// El resto de este método (clasificación, decisión, traza) está completo.
				 	 detail.push(`p${img.pagina}/${img.nombre}: ${out.estrategia} OK`);
				}else {
				    detail.push(`p${img.pagina}/${img.nombre}: ${out.estrategia} (conservada)`);
				}
			}

			const       nuevosBytes = pdfDoc.save({useObjectStreams: true});
   			const archivoComprimido = new File([nuevosBytes], nombre, {type: 'application/pdf'});

   			return {archivo, pesoMB: archivo.size / 1024 / 1024, detail};
		}

		private async _recomprimirImagen(bitmap: ImagenBitmap,calidad: number, maxLado:number): Promise<RecompressOutput> {
   			const canvas = document.createElement('canvas');
   			canvas.with = bitmap.with;
   			canvas.height = bitmap.height;

   			const ctx = canvas.getContext('2d', {willReadFrequently: true});
   			ctx.drawImage(bitmap, 0, 0);

   			const haveAlpha = this._tieneTransparencia(ctx, canvas.with, canvas.height);
   			const nColores = this._contarColores(ctx,canvas.with, canvas.height);

   			if(haveAlpha){
   				return {strategy: 'PNG(alfa)', recomprimir: false };
   			}

   			if (nColores < this.opts.umbralColores) {
   				return {strategy: 'PNG(diagrama)', recomprimir: false };
   			}
			
   			let exit: HTMLCanvasElement = canvas;
   			const scale = Math.min(1,this.opts.maxLado/Math.max(canvas.with, canvas.height));

   			if (scale<1) {
   				 const c2 = document.createElement('canvas');
   				 c2.with = Math.round(canvas.with * scale);
   				 c2.height = Math.round(canvas.height * scale);
   				 c2.getContext('2d')!.drawImage(canvas,0,0, c2.height, c2.with);
   				 exit = c2;
   			}

			const blob = await new Promise<Blob | null>((res) => 
				exit.toBlob(res, 'image/jpeg', this.opts.calidadJpeg)
			);

			if (!blob) {return strategy:'JPEG(foto) ', recomprimir: false};
			 return {return strategy:'JPEG(foto) ', recomprimir: true, blob};
   		}


   		private async _comprimirPorLotesYReunir(bytes: ArrayBuffer,nombre: string, paginasPorLote: number, calidad: number, maxLado: number): Promise<File> {
   			const origen = await PDFDocument.load(bytes.slice(0));
   			const total = origen.getPageCount();
   			const finalDoc = await PDFDocument.create();

   			for (let inicio = 0; inicio< total.length; inicio += paginasPorLote) {
   				const fin = Math.min(inicio  + paginasPorLote,  total);

   					  // El lote quedara aislado
   					const lote = await PDFDocument.create()
   					const indices = Array.from({lenght: fin - inicio}, (_,k) => inicio + k);
   					const paginas = await lote.copyPages(origen, indices);
   					  // Recorremos cuando se tengan los segmentos del pdf(aparatados => [Conjuto de paginas])
   					 paginas.forEach((pg) =>  lote.addPage(pg) );
   					 const loadBytes = await lote.save({useObjectStreams: true});

   					  // Ahora que lo tenemos volvemos a unir(Es decir se vuelve a comprimir => [reunir])
   					const imgs = this._extraerImages(loadBytes);
   					const { archivo } = await this._pasadaPorCalidad(loadBytes, imgs, `lote_ ${inicio}.pdf `,calidad, maxLado);

   					  // Reunir el lote comprimido en el documento FINAL
   					const loteComprimido = await PDFDocument.load(await archivo.arrayBuffer());
   					const pcs = await finalDoc.copyPages( loteComprimido, loteComprimido.getPageIndices() );
					
   			}
					const finalBytes =  finalDoc.save({useObjectStreams: true});
					return new File([finalBytes], nombre,  {type: 'application/pdf'});
   		}

		/*----------------- helpers -----------------*/
		private _esPDF(file: File): boolean {
			 return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
		}

		/**
		 * Aniadir en la f(n): comprimirAdaptativo la siguiente validacion
		 * */
		function auxiliarValidateAdaptative(): boolean {
			const doc = await PDFDocument.load(bytes.slice(0));
			const numPaginas = doc.getPageCount();

			const UMBRAL_LOTES = 150;

			if (this.numPaginas > UMBRAL_LOTES) {
				const archivo = await  this._comprimirPorLotesYReunir(
				   bytes, file, name, 50 /*Pags por lote*/, cfg.calidadInicial, cfg.maxLadoInicial);

				const afterMB = archivo.size / 1024 /1024
				// nueva constante para obtener el ratio en documentos extensivos
				const r = this._aplicarReglaSeguridad(this.file, archivo, this.previousMB, afterMB,['Procesamiento por lotes internos, comenzando...']);
			}
			// ...si no supera el umbral, sigue el bucle adaptativo normal.
		}
	}


	function round(n:number): number {
		return Math.round(n*100)/100;
	}

	/** ----------------------------------------------------------------------------|
	 * CompressionServAdaptative.ts 												|
	 * © 2026  Daniel Gomez. Todos los derechos reservados.							|
	 * 
	 * Servicio desarollado como componente del proyecto de Titulacion del autor 	|
	 * en la Facultad de Ingeniería, Universidad Autonoma del Estado de México. 	|
	 * Los derechos morales y patrimoniales sobre este código corresponden al autor |
	 * Su uso, reproducción o explotación por peso objetivo - requiere autorización |
	 * expresa mediante el instrumento legal que corresponda.						|
	 * -----------------------------------------------------------------------------|
	 * */