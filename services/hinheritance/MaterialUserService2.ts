import type { Material } from '@/types/indexInterface.ts';

export class MaterialUserService extends StaticsServiceUnify {
  static MAX_WEEKLY_MATERIALS = 10;
  static MAX_MONTHLY_MATERIALS = 30;

  static async uploadWeeklyMaterials(materials: Partial<Material>[], uid: string) {
    // Obtener materiales ya subidos esta semana usando super
    const currentWeekMaterials = await super.getStudentWeeklyMaterials(uid); // suponer método adaptado
    const totalAfterUpload = currentWeekMaterials.length + materials.length;

    if (totalAfterUpload > this.MAX_WEEKLY_MATERIALS) {
      throw new Error(`No puedes subir más de ${this.MAX_WEEKLY_MATERIALS} materiales por semana.`);
    }

    for (const mat of materials) {
      await super.saveMaterialsEduc?.({ 
        titulo: mat.titulo ?? '', 
        descripcion: mat.descripcion ?? '',
        archivoURL: mat.archivoURL,
        fechaCreacion: mat.fechaCreacion,
        autor: mat.autor,
        id: mat.id
      });
    }

    console.log(`[MaterialUserService] ✅ Subidos ${materials.length} materiales para UID: ${uid}`);
  }

  static async uploadMonthlyMaterials(materials: Partial<Material>[], uid: string) {
    const currentMonthMaterials = await super.getStudentMonthlyMaterials(uid); // método padre
    const totalAfterUpload = currentMonthMaterials.length + materials.length;

    if (totalAfterUpload > this.MAX_MONTHLY_MATERIALS) {
      throw new Error(`No puedes subir más de ${this.MAX_MONTHLY_MATERIALS} materiales por mes.`);
    }

    for (const mat of materials) {
      await super.saveMaterialsEduc?.({ 
        titulo: mat.titulo ?? '', 
        descripcion: mat.descripcion ?? '',
        archivoURL: mat.archivoURL,
        fechaCreacion: mat.fechaCreacion,
        autor: mat.autor,
        id: mat.id
      });
    }
  }

  // Métodos de consulta por semana/mes reutilizando métodos padre de estadísticas
  static async getWeeklyMaterials(uid: string) {
    return super.getStudentWeeklyMaterials(uid);
  }

  static async getMonthlyMaterials(uid: string) {
    return super.getStudentMonthlyMaterials(uid);
  }
}