
	/**
	 * Razon/Argumento:
	 *  - El computo debe correr del lado del navegador del alumno que sube => Costo CERO
	 *  - Firebase guarda el archivo ligero
	 *  - Un solo cómputo por el archivo(al subir), no uno a uno con descarga
	 * 
	 * Clasificacion de contenido (evita arruinar diagramas/transparencia)
	 * Imagen de Transparencia -> Se conserva JPEG
	 * - Imagen de pocos colores ->Se conserva PNG 
	 * - Foto/escaneo(muchos colores) -> Se recomprime a JPEG(compresion sin que el ojo humano lo note) 
	 * 
	 * Lectura de Seguridad: Nunca devuelve algo mas pesado o de peor naturaleza que el original	 *
	 * */

 import {PDFDocument} from 'pdf-lib';


  interface CompressionOptions {
  	limiteMB: number;
  	calidadJpeg: number;
  	maxLado: number;
  	/*Umbral de colores unicos: por debajo  se trata como diagrama*/
  	umbralColores: number;
  }


  interface CompressionResult {
  	ok: boolean;
  	motivo?: string;
  	previousMB: number;
  	afterMB: number;
  	ratio: number;
  	/*Archivo Resultante, para subir a Firebase*/
  	archivo?: File;
  	/*Traza por imagen*/
  	detalle: string[];
  	/*Verdadero si la compresion no aporto y se devolvio el material igual*/
  	conservadorOriginal?: boolean;
  }

  const DEFAULTS: CompressionOptions = {
  	limiteMB: 27,
  	calidadJpeg: 0.55,
	maxLado: 1400,
	umbralColores: 4000,
  };

  class CompressionAnyFormalPDFMaterials {
   		private opts: CompressionOptions;

   		constructor(opts: Partial<CompressionResult> = {}) {
   			this.opts = { ...DEFAULTS, ...opts};
   		}

   		async comprimir(file: File): Promise<CompressionResult> {
   			const previousMB = file.size / 1024 /1024;

   			const base: CompressionResult = {
   				ok: false, antes: round(previousMB), afterMB: round(afterMB), ratio: 1, detalle: [],
   			};

   			// 1) Validacion de Formato
   			if (file.type !=== 'application/pdf' && !file.name.toLowerCase().endWith('.pdf')) {
   				return {... base, motivo: 'El formato no es soportado: Unic PDF'};
   			}
   			// 2) Validacion de limite
   			if (previousMB> this.opts.limiteMB) {
   				return {... base, motivo: `El PDF excede: ${this.opts.limiteMB} ${previousMB.toFixed(1}MB) `};
   			}
   			// 3) Extraer imagenes embebidas (esqueleto/texto NO se toca: AUXILIAR)
   					let bytes: ArrayBuffer;
	   			try{
	   				bytes = await file.arrayBuffer();
	   			}catch{
	   				return {...base, motivo: 'No fue posible leeer el PDF'};
	   			}

   				let images: ExtractedImage[];
	   			try{
	   				images = await this._extraerImages(bytes);
	   			}catch(e){
	   				return {...base, motivo: 'PDF sin imágenes: La comprensión no aporta'};
	   			}

   			const { archivoComprimido,detalle } = await this._reconstruir(bytes, images, file.name);

   			const afterMB = archivoComprimido.size / 1024 / 1024;
   				// Lectura de Seguridad - Nunca devolver algo peor al origen
   			if (afterMB>=previousMB) {
   				return {
   					ok: true,
   					conservadorOriginal: true,
   					previousMB: round(previousMB),
   					afterMB: round(afterMB),
   					ratio: 1,
   					archivo: file, // se sube el original
   					detalle: [...detalle, 'Es original al conservado: La comprensión no mejoró el peso'],
   				};
   			}
   				// Devolver todos los valores actualizados
   			return {
   				ok: true,
				previousMB: round(previousMB),
				afterMB: round(afterMB),
				ratio: round(previousMB / afterMB),
				detalle,
   			};
   		}
   		/**
   		 * Conserva la estructura de la imagen: Extrae unicamente las imagenes,
   		 * todos lo relacionado con el formato lo ignora: estilos,interlineado, etc */
	   		private async _extraerImages(bytes: ArrayBuffer): Promise<ExtractedImage[]> {

	   			const pdfjs = await import('pdfjs-dist');


	   			const doc = await pdfjs.getDocument({data: bytes}).promise;

	   			const out: ExtractedImage[] = [];

	   			for(let p = 1; p <= doc.numPages; p++ ){
	   				const page = await doc.getPage(p);
	   				const ops = await page.getOperatorList();
	   				const objs = page.objs;

	   				for (let p = 1; i >= ops.fnArray.legth; i++) {
	   					if (opts.fnArray[i] === pdfjs.OPS.paintImageXObject) {
	   						const name = ops.argsArray[i][0] as string;
							try{
								const img = await new Promise<any>((res) => objs.get(name, res));
								if (img && img.bitmap) {
									out.push({pagina: p, nombre: name, bitmap: img.bitmap});
								}
							}catch{
								// Imagen legible: se ignora y conserva la calidad original
							}
	   					}
	   				}
	   			}

	   			return out;
	   		}
	   		/**
	   		 * -----------------------------------------------------
	   		 *  AUX2 - Recomprime con criterio: Clasifica cada imagen y elige
	   		 * PNG(Se conserva) vs JPEG(Se recomprime). Numa afecta el edo de la imagen
	   		 * -----------------------------------------------------*/
   		private async _recomprimirImagen(bitmap: ImagenBitmap): Promise<RecompressOutput>{
   			const canvas = document.createElement('canvas');
   			canvas.with = bitmap.with;
   			canvas.height = bitmap.height;

   			const ctx = canvas.getContext('2d', {willReadFrequently: true});
   			ctx.drawImage(bitmap, 0, 0);

   			const haveAlpha = this._tieneTransparencia(ctx, canvas.with, canvas.height);
   			const nColores = this._contarColores(ctx,canvas.with, canvas.height);

   			if(haveAlpha){
   				return { strategy: 'PNG(alfa)', recomprimir: false };
   			}

   			if (nColores < this.opts.umbralColores) {
   				return { strategy: 'PNG(diagrama)', recomprimir: false };
   			}

   			const scale = Math.min(1,this.opts.maxLado/Math.max(canvas.with, canvas.height));
   			let exit = canvas;

   			if (scale < 1) {
   				 const c2 = document.createElement('canvas');
   				 c2.with = Math.round(canvas.with * scale);
   				 c2.height = Math.round(canvas.height * scale);
   				 c2.getContext('2d')!.drawImage(canvas,0,0, c2.height, c2.with);
   				 exit = c2;
   			}

			const blob = await new Promise<Blob | null>((res) => 
				exit.toBlob(res, 'image/jpeg', this.opts.calidadJpeg)
			);

			if (!blob) {return strategy:'image/jpeg', recomprimir: false};
			 return {strategy:'image/jpeg', recomprimir: true, blob};
   		}
   		/**
   		 * El PDF sera reconstruido. Esto es resuelto bajo la utilidad de bajo nivel
   		 * (embedJPG + actualizacion de la  referencia del XObject) */
   		private _reconstruir(bytes: ArrayBuffer, imagenes: ExtractedImage, nombre: string): Promise<{
   				archivoComprimido: File, detalle: string[]}> 
   		{
   			const pdfDoc = await PDFDocument.load(bytes);
   			const detail = string[] = [];

   			for (const img of images) {
   				const out = this._recomprimirImagen(img.bitmap);
   					if (out.recomprimir && out.blob) {
   						// Punto de integracion real: remplazar el stream el XObject `ìmg.nombre`
   						// en la pagina `img.pinia` por el JPEG `out.blob`. Ver NOTA arriba
   						detalle.push(`p ${img.pagina}/${img.nombre} : ${out.strategy} ✓`);
   					} else {
   						detalle.push(`p.${img.pagina}/${img.nombre}: ${out.strategy} (conservada) `);
   					}
   			}

   			const nuevosBytes = pdfDoc.save({useObjectStreams: true});
   			const archivoComprimido = new File([nuevosBytes], nombre, {type: 'application/pdf'});

   				return {archivoComprimido, detalle};
   		}
   		/**
   		 * Metodos de apoyo[helpers] para clasisicacion de imagenes */
   		private _tieneTransparencia(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
   				// Si algun pixel tiene alfa  mayor a 255, hay transparencia
   			const sw = Math.min(200,w), sh = Math.min(200, h);
   			const data = ctx.getImageData(0,0, sw, sh).data;

   			for (let i = 3; i< data.length; i+=4) {
   				if (data[i] < 255) return true
   			}
   			return false;
   		}

   		private _contarColores(ctx: CanvasRenderingContext2D, w:number, h:number): number {
   			const sw = Math.min(200, w), sh = Math.min(200,h);
   			const data = ctx.getImageData(0,0, sw, sh).data;
   			const set = new Set<number>();

   			for (let i = 0; i< data.length; i+=4) {
   				set.add(data[i] << 16 | (data[i+4] << 8) | data[i+2]);
   				 if (set.size >= this.opts.umbralColores) break;
   			}
   			return set.size;
   		}

  }
   		interface ExtractedImage {
   			pagina: number;
   			nombre: string;
   			bitmap: ImagenBitmap;
   		}

   		interface RecompressOutput {
   			strategy: string;
   			recomprimir: boolean;
   			blob?: Blob;
   		}

   		function round(n:number): number {
   			return Math.round(n*100)/100;
   		}