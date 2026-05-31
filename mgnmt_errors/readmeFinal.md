# Portal Web Educativo — FI-UAEMEX
### Facultad de Ingeniería · Universidad Autónoma del Estado de México
**Versión:** 3.3 · **Autor:** Daniel Gómez Pérez · **Año:** 2026

---

## Descripción

Sistema web educativo como gestor y moderador de materiales académicos desarrollado como proyecto de Titulación bajo la modalidad *Reporte de Aplicación de Conocimientos*. Permite a estudiantes subir materiales educativos en formato PDF y a profesores moderarlos mediante un flujo de aprobación o rechazo con retroalimentación.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework Frontend | Vue 3 + Composition API |
| Lenguaje | TypeScript |
| Estado Global | Pinia (patrón SSV) |
| Estilos | Tailwind CSS 3.4 |
| Backend / BaaS | Firebase (Auth, Firestore, Storage) |
| Bundler | Vite |
| Patrón Arquitectónico | Services → Stores → Views (SSV) |

---

## Funcionalidades Operativas

### Rol Estudiante
- ✅ Registro de cuenta con email institucional (`@alumno.uaemex.mx`)
- ✅ Login con selección de rol
- ✅ Subida de materiales PDF a Firebase Storage con metadatos en Firestore
- ✅ Vista de mis materiales con filtros: Todos, Aprobados, Pendientes, Rechazados
- ✅ Visualización del estado de moderación por material
- ✅ Estadísticas personales: total, aprobados, pendientes, rechazados
- ✅ Gestión de perfil con foto
- ✅ Reporte de materiales semanal y mensual (ReportSummaryModal)
- ✅ Logout con limpieza de estado

### Rol Profesor
- ✅ Registro de cuenta con email institucional (`@profesor.uaemex.mx`)
- ✅ Login con selección de rol
- ✅ Vista de moderación con listado de materiales pendientes
- ✅ Aprobación de materiales con confirmación
- ✅ Rechazo de materiales con razón enviada al estudiante
- ✅ Comentarios de retroalimentación por material
- ✅ Vista de materiales individuales con filtros temporales:
  - Todos los materiales
  - Más recientes primero
  - Por nombre de usuario
  - Subidos hoy
  - Últimos 2 días
  - Última semana
- ✅ Estadísticas globales del sistema
- ✅ Gestión de perfil
- ✅ Logout con limpieza de estado

### Sistema
- ✅ Autenticación por roles con guardias de navegación (RouterGuardService)
- ✅ Arquitectura SSV con separación estricta de capas
- ✅ Índices compuestos de Firestore configurados
- ✅ Persistencia de estadísticas de moderación en colección `Moderation_Statistics`
- ✅ Notificaciones internas del sistema
- ✅ Tema oscuro/claro en vistas principales

---

## Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta de Firebase con proyecto configurado
- Navegador moderno (Chrome recomendado para la demo)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/portal-educativo-fi-uaemex.git
cd portal-educativo-fi-uaemex
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 4. Verificar configuración de Tailwind

Asegúrate de que `tailwind.config.js` en la raíz tenga:

```js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El portal estará disponible en `http://localhost:5173`

---

## Estructura del Proyecto

```
src/
├── assets/
│   └── main.css               # Directivas Tailwind + estilos globales
├── config/
│   └── initializeFirebaseConf.ts   # Inicialización centralizada de Firebase
├── router/
│   ├── index.ts               # Router principal
│   ├── routesStudent.ts       # Rutas del rol estudiante
│   ├── routesTeacher.ts       # Rutas del rol profesor
│   └── RouterGuardService.ts  # Guardias de navegación por rol
├── services/
│   ├── materials/
│   │   ├── MaterialBaseService.ts
│   │   ├── MaterialStudentService.ts
│   │   └── MaterialAdmServProffesor.ts
│   ├── moderation/
│   │   └── ModerationService.ts
│   └── profile/
│       ├── BaseProfileService.ts
│       ├── ProfileStudentService.ts
│       └── ProfileTeacherService.ts
├── stores/
│   ├── authStore3.ts          # Store de autenticación (fuente de verdad)
│   ├── materialBaseStore.ts
│   ├── materialStudentStore.ts
│   ├── materialTeacherStore.ts
│   ├── moderationStore.ts
│   └── statisticsAdmStore.ts
├── views/
│   ├── Student/               # Vistas del rol estudiante
│   └── Teacher/               # Vistas del rol profesor
└── types/
    └── indexInterface.ts      # Interfaces y tipos globales
```

---

## Flujo de Testing

### Paso 1 — Crear cuentas demo

**Profesor:**
1. Ve a `http://localhost:5173/teachers/teacher-register`
2. Registra una cuenta con email `@profesor.uaemex.mx`
3. Verifica en Firebase Authentication y `teacher_register` en Firestore

**Estudiante:**
1. Ve a `http://localhost:5173/students/vw-register-student`
2. Registra una cuenta con email `@alumno.uaemex.mx`
3. Verifica en Firebase Authentication y `student_register` en Firestore

### Paso 2 — Flujo del estudiante

1. Login con cuenta de estudiante → seleccionar rol **Estudiante**
2. Ir a **Subir Material** → completar campos y seleccionar PDF
3. Verificar que aparece en `Students_Materials` en Firestore con `estado: "pendiente"`
4. Ir a **Mis Materiales** → confirmar que el material aparece en pestaña Pendientes
5. Ir a **Perfil** → verificar datos y foto

### Paso 3 — Flujo del profesor

1. Login con cuenta de profesor → seleccionar rol **Profesor**
2. Ir a **Moderar Materiales** → verificar que aparecen los materiales pendientes
3. Seleccionar un material → agregar comentario → **Aprobar**
4. Seleccionar otro material → agregar comentario → **Rechazar** con razón
5. Verificar que el listado se actualiza (4 → 3 → 2 materiales pendientes)
6. Ir a **Estadísticas** → verificar contadores actualizados
7. Ir a **Materiales Estudiantes** → probar filtros temporales

### Paso 4 — Verificación cruzada

1. Volver a sesión del estudiante
2. Ir a **Mis Materiales** → verificar que Aprobados y Rechazados muestran el material correcto
3. Verificar que en Firestore `Students_Materials` el campo `estado` cambió a `aprobado` o `rechazado`
4. Verificar que `Moderation_Statistics` → `global` actualizó `totalAprobados` y `totalRechazados`

---

## Colecciones de Firebase

| Colección | Descripción |
|---|---|
| `Students_Materials` | Materiales subidos por estudiantes |
| `student_register` | Perfiles de estudiantes registrados |
| `teacher_register` | Perfiles de profesores registrados |
| `profiles_students` | Fotos de perfil de estudiantes |
| `Comments_Moderation` | Comentarios de retroalimentación del profesor |
| `Moderation_Statistics` | Contadores globales de moderación |
| `Notifications` | Notificaciones internas del sistema |
| `system_config` | Configuración general del sistema |

---

## Exportar Colecciones de Firebase (Backup)

### Opción 1 — Firebase CLI (recomendado)

```bash
# Instalar Firebase CLI si no está instalado
npm install -g firebase-tools

# Autenticarse
firebase login

# Exportar todas las colecciones de Firestore
firebase firestore:export gs://tu-bucket.appspot.com/backup-$(date +%Y%m%d)

# O exportar a carpeta local
gcloud firestore export gs://tu-proyecto.appspot.com/backups/
```

### Opción 2 — Desde la Consola de Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Selecciona tu proyecto → **Firestore Database**
3. Clic en los **tres puntos** (⋮) arriba a la derecha
4. Selecciona **Exportar datos**
5. Elige un bucket de Cloud Storage como destino
6. Clic en **Exportar**

### Opción 3 — Script Node.js para exportar a JSON local

```js
// exportFirestore.js
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const collections = [
  'Students_Materials',
  'student_register',
  'teacher_register',
  'Comments_Moderation',
  'Moderation_Statistics',
  'Notifications'
];

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = {};
  snapshot.forEach(doc => {
    data[doc.id] = doc.data();
  });
  fs.writeFileSync(
    `./backup/${collectionName}.json`,
    JSON.stringify(data, null, 2)
  );
  console.log(`✅ ${collectionName} exportada — ${snapshot.size} documentos`);
}

async function main() {
  fs.mkdirSync('./backup', { recursive: true });
  for (const col of collections) {
    await exportCollection(col);
  }
  console.log('✅ Exportación completa');
}

main().catch(console.error);
```

```bash
# Ejecutar
node exportFirestore.js
```

> **Nota:** Para usar la Opción 3 necesitas descargar el archivo `serviceAccountKey.json` desde Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada.

---

## Comportamientos Conocidos

| Comportamiento | Naturaleza | Estado |
|---|---|---|
| `viewMaterialIndividual` — crash al navegar fuera | Bug de desmontaje de `TransitionGroup` con `tag="tbody"` en Vue | Documentado — mejora v2.0 |
| Contadores en `vwAdmMaterials` inician en 0 al primer acceso | Requiere navegar a Subir Material y regresar | Documentado |
| Registro por Google/Facebook | No implementado en esta versión | Registro tradicional disponible |
| Nombre del autor en vista de materiales del profesor | Muestra `autorId` en lugar del nombre | Mejora pendiente v2.0 |

---

## Build para Producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`.

---

*Portal Web Educativo FI-UAEMEX · Facultad de Ingeniería · UAEMéx · 2026*