import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../configs/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hotels',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

export const uploadHotelImages = upload.array('images', 10); // hasta 10 imágenes

// Middleware para subir imágenes de habitaciones
const roomStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rooms',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const roomUpload = multer({ storage: roomStorage });
export const uploadRoomImages = roomUpload.array('images', 5); // hasta 5 imágenes por habitación
