import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../configs/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hotels',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

export const uploadHotelImages = upload.array('images', 10); // hasta 10 imágenes
