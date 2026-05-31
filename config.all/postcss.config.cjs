// 📁 postcss.config.js
  // modificarlo a cjs al tener esta notcacion
module.exports =  {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  // En package.json(ver. refactor) fueron aniadidas las lineas para su funcionamiento absoluto
 /*** optionals: line 2,3
   ** new line: lne4 **  ***/

/**
 * Es el script de configuracion general por defecto 
 * en PostCSS en Tailwind, su proposito
 * es fungir como analizador de ajustes de plugins
 * para ayudar al desempenio de Tailwind aqui agregaremos
 * todos los modulos instalados del PreprocessatorCSS Tailwind
 * */