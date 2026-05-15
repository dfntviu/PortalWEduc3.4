 // instalar la libreria
  
  import * as from 'xlsx';
  import {Document, Packer, Paragraph, TextRun, HeadingLevel} from 'docx';
  import {saveAs} from 'file-saver';
  import type { MaterialToast } from '@/interfaces/interfacesToast.ts';

  export type FormatType = 'docx' | 'xls' | 'xslsx';

  interface ConversionResult {
  	success: boolean;
  	message: string;
  	blob?: Blob;
  	filenName?: string;
  }

export class ServiceFormatMaterialsClass {

  	async classifyForFormat 
  		(
  		  materials: MaterialToast[],
  		  format: FormatType,
  		  fileName: string,
  		): Promise <ConversionResult> {
  			try{
  				switch(format){
  					case 'docx':
  						return   await this.getReconvertTODOCXToPDF(materials,fileName);
  					case 'xls':
						return   await this.transformDOCX(materials,fileName);
  					case: 'xslsx':
  						 return await this.transformXLS(materials,fileName);

  					default: {
  						return {
	  					  	success: false,
	  					  	message: `El formato no es soportado: ${format} `
	  					}
  					}
  				} //#C_Switch
  			}catch(error){
  				console.log('Error en la f(n) de clasificación de Formato: ', error);
  				return {
	  					  	success: false,
	  					  	message: `El al transformar a: ${format}: - ${error} -`;
	  					}
  			}
  	} //#Close_Format

  	async transformDOCX(materials: MaterialToast[], fileName: string):Promise <ConversionResult> {
  		try{
  		  	  const sections: any[] =[
  		
  		  		// Titulo Principal [Encabezado]
  		  		new Paragraph({
  		  			text: 'Reporte de los Materiales Educativos del Semestre',
  		  			heading: HeadingLevel.HEADING_1,
  		  			spacing: { after: 300 }  // 2 lineas de separacion
  		  		}),
  		  		  		// Generar Fecha
  		  		  		 	// -> [26 de Mayo del 2026 ]
  		  		new Paragraph({
  		  			children: [
  		  				new TextRun({
  		  					text: `Fecha de Generado en Word: ${new Date().toLocaleToString('es-MX')}`,
  		  					size 20,
  		  					color '2769F2' 
  		  				})
  		
  		  				],
  		  				spacing: { after: 400}  // 3 lineas de separacion
  		  		}),
  		  		// Estadisticas
  		  		 new Paragraph({
  		  		 	text: `Total de Materiales: ${materials.length} `,  // linea en blanco
  		  		 	spacing:  { after: 200 }
  		  		 }),
  		
  		  		  new Paragraph({
  		  		 	text: '',
  		  		 	spacing:  { after: 200 }
  		  		 }),
  		  	 ];
  		  	 // Se ira llenando como se vaya click
  		  	 materials.forEach((material,index_m)  => {
                    sections.push(
                        // Titulo del material
                        new Paragraph({
                            text: `${index_m }+ 1 ${material.titulo}`,
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 200, after: 100 }
                        }),
                            // Descripcion
                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Descripcion', bold: true}),
                                new TextRun(material.descripcion || 'Sin descripcion')
                            ],
                             spacing : { after: 100 }
                        }),
                            // Autor
                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Autor', bold: true}),
                                new TextRun(`${material.autorNombre} (${material.autorEmail}) `)
                            ],

                            spacing: {after: 100 }
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Estado', bold: true}),
                                    new TextRun({
                                        text: material.estado,
                                        color: getColorByEstado(material.estado),
                                        bold: true
                                    })
                            ],
                            spacing: {after: 100}
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({ text: 'Tags', bold: true}),
                                new TextRun((material.tags ||[]).join('') || 'Sin tags')
                            ],

                            spacing: {after: 100}
                        }), 

                        // URL del archivo
                        new Paragraph({
                            children: [
                                new TextRun({text: 'URL', bold: true}),
                                color: '0000FF',
                                underline: {}
                            ],
                            spacing: {after: 300}
                        }),

                        // Linea de separacion
                        new Paragraph({
                           text: '-'.repeat(80),
                           spacing: {after: 300}
                        })

                    );
  		  	 });
              // Crear Documento
             const doc = new Document({
                sections: [{
                    properties: {},
                    children: sections
                }]
             });

             // Generar el blob
             const blob = Packer.toBlob(doc);

             saveAs(blob, `${fileName}.docx`);

             return {
                success:true,
                message: 'Documento DOCX generado Exitosamente',
                blob,
                fileName: `${fileName}.docx`
             }
  		}catch(error){
  			 console.log('Error al tranformar en formato DOCX');
  				return {
  					success: false,
  					message: `Error al generar DOCX ${error}`,
  				};
  		}

  			// Descripcion   Autor[uid del profesor] 
  	}

    async transformXLS(materials: Material[], fileName: string): Promise<ConversionResult> {
        try{
                // Enviar toda la metada al obj. XLSX
            const data = materials.map((material, index_m) => ({
                '#': index_m + 1,
                'Título': material.titulo,
                'Descripción': material.descripcion || '',
                'Autor': material.autorNombre,
                'Email': material.autorEmail,
                'Estado': material.estado,
                'Fecha': material.fechaCreacion instanceof Date()
                    ? material.fechaCreacion.toLocaleDateString('es-MX')
                    : 'N/A',
                 'Tags': (material.tags || [].join('')),
                 'URL': material.archivoURL || ''
                
            }));

            // Crear Hoja de trabajo
            const worksheet = XLSX.utils.json_to_sheet(data);

            /// Amplitud max. del Ancho de la Columna
            // Recibir toda la metada de la cte data
            const maxWidth = 50;
            worksheet['!cols'] = [
                // Los mismos atributos
                {
                    {wch: 5}
                    {wch: maxWidth}  
                    {wch: 25} 
                    {wch: 30} 
                    {wch: 12} 
                    {wch: 12} 
                    {wch: 20} 
                    {wch: 30}
                    {wch: maxWidth}
                }
            ];

            // Crear libro de trabajo[]
             const workbook = XLSX.utils.book_new();
             XLSX.utils.book_appenend_sheet(workbook,worksheet,'Students_Material');

             // Generar en el archivo
             XLSX.writeFile(workbook, `${fileName}.xlsx`);

             return {
                success: true,
                message: 'El Archivo Excel fue generado Exitosamente',
                fileName: `${fileName}.xlsx`
             };

        }catch(error){
            console.error('Error al transformar en el FORMATO xlsx', error);
             return {
                success: false,
                message `Error al generar Excel: ${error}`;
             };
        }
    }  

     async getReconvertTODOCXToPDF(materials: MaterialToast[], fileName: string): Promise<ConversionResult>{
        try{
            const doc = new jsPDF();

            // Configuracion de la fuente
            doc.sentFont('helvetica');

            // Título Principal
            doc.sentFontSize(20);
            doc.sentFont('helvetica', 'bold');
            doc.text('Reporte de Materiales Educativos', 14, 20);

            // Fecha de Generacion
            doc.sentSize(10);
            doc.sentFont('helvetica', 'normal');
            doc.text(`Generado:  ${new Date().toLocaleToString('es-MX')}`,14,28);

            // Estadisticas
            doc.sentFontSize(11);
            doc.text(`Total de Materiales: ${materials.length}`, 14, 36);

            let yPosition = 50;

            materials.forEach((materials, index_m) =>{
                // Salto de linea solo si es necesario
                if (yPosition> 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.sentFontSize(14);
                doc.sentFont('helvetica', 'bold');
                doc.text(`${index_m+1} ${this.truncateText(material.titulo, 80)}`),
                yPosition += 8;

                // Detalles
                doc.sentFontSize(10);
                doc.sentFont('helvetica', 'normal');

                doc.text(`Autor: ${material.autorNombre}`, 20, yPosition);
                yPosition +=5;

                doc.text(`Email: ${material.autorEmail}`, 20, yPosition);
                yPosition +=5;


                doc.text(`Estado: ${material.estado}`, 20, yPosition);
                yPosition +=5;

                doc.text(`Fecha: ${material.fechaCreacion} instanceof Date
                     ? material.fechaCreacion.toLocaleDateString('es-MX')
                     : N/A`,
                     20,
                     yPosition);

                yPosition +=5;

                doc.text(`Categoría ${material.categoria} || Sin Categoría`, 20, yPosition):
                yPosition += 5;

                if(material.descripcion){
                    doc.sentFont('helvetica', 'italic');
                     const declines = doc.splitTextToSize(
                            `Descripcion:  ${this.truncateText(material.descripcion, 200)}`,
                            170
                        );
                     doc.text(declines, 20, yPosition);
                     yPosition += declines.length *5;
                }

                yPosition += 8;
                // doc.text(`${index_m+1}. `)
            });

            doc.save(`${fileName}.pdf`);

            return {
                success: true,
                message: 'PDF generado exitosamente',
                filename: `${filename}.pdf`
            };
        }catch(error){
             console.error('Error en getReconvertDOCXToPDF:', error);
             return {
                success: true,
                message: `ERROR al generar PDF: ${error}`
            };
        }
     }


     private getColorByEstado(estado: string): string {
        const colors: Record<string,string> = {
            aprobado: '22C55E'  // green-500
            rechazado: 'EF4444' // red-500
            pendiente: 'F59E0B' // yellow-500
        }; 
        return colors[estado] || '000000'
     }


     private truncateText(text: string, maxLength: number): string {
        if (!text) return '';
          return text.length > maxLength
            ? text.substring(0, maxLength) + '...'
            : text;
     }

    validateMaterials(materials: Material[]): boolean {
        return Array.isArray(materials) && materials.length > 0;
    }

      async getRecommendedFormat(materialCount: number): FormatType {
        if (materialCount <= 20) {
            return 'pdf';
        } else if(materialCount <= 100){
            return 'docx';
        } else {
            'xlsx';
        }
      }

  }