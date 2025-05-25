import Hotel from "./hotel.schema.js";
import Room from "../rooms/room.model.js";
import cloudinary from '../../configs/cloudinary.js';


const getPublicIdFromUrl = (url) => {
  try {

    const fullPattern = /\/v\d+\/([^/]+)\.\w+$/;
    let matches = url.match(fullPattern);
    
    if (matches) {
      return matches[1];
    }

    const simplePattern = /hotels\/([^/]+)\.\w+$/;
    matches = url.match(simplePattern);
    
    if (matches) {
      return `hotels/${matches[1]}`;
    }
    
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart) {
      return `hotels/${lastPart.split('.')[0]}`;
    }

    return null;
  } catch (error) {
    console.error('Error al extraer public_id:', error);
    return null;
  }
};

export const saveHotel = async (req, res) => {
  try {
    let {
      name,
      direction,
      location,
      category,
      facilities,
      rangeOfPrices,
      services,
      admin
    } = req.body;

    facilities = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
    rangeOfPrices = typeof rangeOfPrices === 'string' ? JSON.parse(rangeOfPrices) : rangeOfPrices;
    services = typeof services === 'string' ? JSON.parse(services) : services;

    console.log("req.files:", req.files);
    const imageUrls = req.files?.map(file => file.path) || [];

    const hotel = new Hotel({
      name,
      direction,
      location,
      category,
      facilities,
      rangeOfPrices,
      services,
      images: imageUrls,
      admin,
      busyRooms: 0,
      availableRooms: 0,
    });

    await hotel.save();

    res.status(201).json({
      msg: "Hotel saved successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error saving hotel",
      error: e.message,
    });
  }
};

export const getHotels = async (req, res) => {
  try {
    const query = { state: true };
    const { category, direction, minAvailableRooms } = req.query;

    // FILTERS
    if (category) {
      query.category = category;
    }

    if (direction) {
      query.direction = { $regex: direction, $options: "i" };
    }

    if (minAvailableRooms) {
      query.availableRooms = { $gte: parseInt(minAvailableRooms) };
    }

    const hotels = await Hotel.find(query)
      .populate({
        path: "rooms",
        select: "-hotel_id -__v -createdAt -updatedAt",
      })
      .populate({
        path: "services",
        select: "-__v -createdAt -updatedAt",
      });

    res.status(200).json({
      msg: "Hotels found",
      hotels,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error getting hotels",
      error: e.message,
    });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id)
      .populate({
        path: "rooms",
        select: "-hotel_id -__v -createdAt -updatedAt",
      })
      .populate({
        path: "services",
        select: "-__v -createdAt -updatedAt",
      });

    if (!hotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    res.status(200).json({
      msg: "Hotel found",
      hotel,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error getting hotel",
      error: error.message,
    });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      direction, 
      location,
      category, 
      facilities, 
      rangeOfPrices, 
      services, 
      existingImages = [],
      deletedImages = [],
      admin 
    } = req.body;

    console.log('Body completo:', req.body);
    console.log('Imágenes a eliminar:', deletedImages);

    const currentHotel = await Hotel.findById(id);
    if (!currentHotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    if (deletedImages.length > 0) {
      console.log('Iniciando eliminación de imágenes...');
      const deletePromises = deletedImages.map(async (imageUrl) => {
        console.log('Procesando URL para eliminar:', imageUrl);
        const publicId = getPublicIdFromUrl(imageUrl);
        console.log('Public ID extraído:', publicId);
        
        if (publicId) {
          try {
            console.log('Intentando eliminar imagen con ID:', publicId);
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('Resultado de eliminación:', result);
          } catch (error) {
            console.error(`Error eliminando imagen ${publicId}:`, error);
          }
        } else {
          console.log('No se pudo extraer public_id de la URL:', imageUrl);
        }
      });
      await Promise.all(deletePromises);
      console.log('Proceso de eliminación completado');
    }

    const currentImages = currentHotel.images || [];
    console.log('Imágenes actuales:', currentImages);

    const normalizeUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname.split('/').pop();
      } catch {
        return url.split('/').pop();
      }
    };

    const deletedFileNames = new Set(deletedImages.map(normalizeUrl));
    console.log('Nombres de archivo eliminados:', Array.from(deletedFileNames));

    const remainingImages = currentImages.filter(img => {
      const fileName = normalizeUrl(img);
      const shouldKeep = !deletedFileNames.has(fileName);
      console.log(`Imagen ${fileName} - ¿Mantener?: ${shouldKeep}`);
      return shouldKeep;
    });

    console.log('Imágenes restantes después del filtrado:', remainingImages);

    const newImages = req.files?.map(file => file.path) || [];

    const updatedImages = [...remainingImages, ...newImages];

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      {
        name,
        direction,
        location,
        category,
        facilities,
        rangeOfPrices,
        services,
        admin,
        images: updatedImages,
      },
      { new: true }
    )
      .populate({
        path: "rooms",
        select: "-hotel_id -__v -createdAt -updatedAt",
      })
      .populate({
        path: "services",
        select: "-__v -createdAt -updatedAt",
      });

    if (!updatedHotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: "Error updating hotel",
      error: e.message,
    });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        msg: "Please confirm deletion by setting 'confirm' to true",
      });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      { state: false },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    await Room.updateMany({ hotel_id: id }, { available: false });

    res.status(200).json({
      success: true,
      msg: "Hotel and associated rooms disabled successfully",
      hotel,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: "Error deleting hotel",
      error: e.message,
    });
  }
};

export const getHotelByAdmin = async (req, res) => {
  try {
    const user = req.user;

    const hotel = await Hotel.findOne({ 
      admin: user._id,
      state: true 
    })

    if (!hotel) {
      return res.status(404).json({
        success: false,
        msg: "No se encontró un hotel administrado por este usuario",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Hotel encontrado",
      hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Error al buscar el hotel",
      error: error.message,
    });
  }
};
