const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que la carpeta uploads exista
const uploadsDir = path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    console.log(`Creando directorio de uploads en: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  // Verificar permisos de escritura
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log(`Directorio de uploads verificado con permisos de escritura: ${uploadsDir}`);
} catch (error) {
  console.error(`Error al configurar directorio de uploads: ${error.message}`);
  console.error('Path completo:', uploadsDir);
  console.error('Directorio actual:', __dirname);
  // No lanzamos error aquí para permitir que la app inicie,
  // pero registramos el error para diagnóstico
}

// Configuración de almacenamiento para multer con mejor manejo de errores
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Verificar nuevamente el directorio antes de cada upload (por si acaso)
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Directorio de uploads creado bajo demanda: ${uploadsDir}`);
      } catch (error) {
        console.error(`Error al crear directorio de uploads bajo demanda: ${error.message}`);
        return cb(new Error(`No se pudo crear el directorio de uploads: ${error.message}`));
      }
    }
    
    // Log detallado
    console.log(`Guardando archivo en: ${uploadsDir}`);
    console.log(`Archivo recibido: ${file.fieldname}, tipo: ${file.mimetype}`);
    
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const finalFilename = file.fieldname + '-' + uniqueSuffix + ext;
      
      console.log(`Generando nombre de archivo: ${finalFilename}`);
      
      cb(null, finalFilename);
    } catch (error) {
      console.error(`Error al generar nombre de archivo: ${error.message}`);
      cb(new Error(`Error al generar nombre de archivo: ${error.message}`));
    }
  },
});

// Función para filtrar los tipos de archivo
const fileFilter = (req, file, cb) => {
  try {
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedFileTypes.test(file.mimetype);
    let extname = false;
    
    if (file.originalname) {
      extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    }
    
    console.log(`Validando archivo: mimetype=${file.mimetype}, originalname=${file.originalname}`);
    console.log(`Resultado validación: mimetype=${mimetype}, extname=${extname}`);

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      console.log('Archivo rechazado: tipo no permitido');
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  } catch (error) {
    console.error(`Error al validar tipo de archivo: ${error.message}`);
    cb(new Error(`Error al validar tipo de archivo: ${error.message}`));
  }
};

// Configuración de multer con manejo de errores
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB máximo
  fileFilter: fileFilter,
}).single('profileImage');

// Exportamos un middleware mejorado que captura y maneja errores
module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('Error en middleware de upload:', err);
      
      // Errores específicos de Multer
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: 'El archivo es demasiado grande. Máximo 5MB permitido.' 
          });
        }
        return res.status(400).json({ 
          message: `Error de Multer: ${err.message}` 
        });
      }
      
      // Otros errores
      return res.status(500).json({ 
        message: err.message || 'Error al procesar la imagen' 
      });
    }
    
    // Todo bien, seguir con la ruta
    next();
  });
}; 