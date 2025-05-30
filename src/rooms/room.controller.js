import Room from "./room.model.js";
import Hotel from "../hotels/hotel.schema.js";
import cloudinary from "../../configs/cloudinary.js";

const getPublicIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && pathParts[uploadIndex + 2]) {
      return pathParts[uploadIndex + 2].split('.')[0];
    }
  } catch (error) {
    console.error('Error al extraer public_id:', error);
  }
  return null;
};

export const saveRoom = async (req, res) => {
  try {
    const { type, capacity, price_per_night, hotel_id } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    const room = new Room({
      type,
      capacity,
      price_per_night,
      hotel_id,
      images,
    });

    await room.save();

    const hotel = await Hotel.findById(hotel_id).select("-rooms");
    hotel.rooms.push(room._id);
    hotel.availableRooms = (hotel.availableRooms || 0) + 1;

    await hotel.save();

    res.status(201).json({
      msg: "Room saved successfully",
      room: {
        uid: room._id,
        type,
        capacity,
        price_per_night,
        images,
        hotel_id: {
          _id: hotel._id,
          name: hotel.name,
          direction: hotel.direction,
          category: hotel.category,
          facilities: hotel.facilities,
        },
      },
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error saving room",
      error: e.message,
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { type, capacity, price } = req.query;

    let query = { hotel_id: hotelId, state: true};

    if (type) query.type = type;
    if (capacity) query.capacity = capacity;
    if (price) query.price_per_night = { $lte: price };

    const rooms = await Room.find(query);

    res.status(200).json({
      msg: "Rooms found",
      rooms,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error getting rooms",
      error: e.message,
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        msg: "Room not found",
      });
    }

    res.status(200).json({
      msg: "Room found",
      room,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error getting room",
      error: e.message,
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, capacity, price_per_night, existingImages = [], deletedImages = [] } = req.body;

    const currentRoom = await Room.findById(id);
    if (!currentRoom) {
      return res.status(404).json({
        msg: "Room not found",
      });
    }

    if (deletedImages.length > 0) {
      const deletePromises = deletedImages.map(async (imageUrl) => {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.error(`Error eliminando imagen ${publicId}:`, error);
          }
        }
      });
      await Promise.all(deletePromises);
    }

    const currentImages = currentRoom.images || [];
    const normalizeUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname.split("/").pop();
      } catch {
        return url.split("/").pop();
      }
    };

    const deletedFileNames = new Set(deletedImages.map(normalizeUrl));
    const remainingImages = currentImages.filter((img) => {
      const fileName = normalizeUrl(img);
      return !deletedFileNames.has(fileName);
    });

    const newImages = req.files?.map((file) => file.path) || [];
    const updatedImages = [...remainingImages, ...newImages];

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      {
        type,
        capacity,
        price_per_night,
        images: updatedImages,
      },
      { new: true }
    ).populate({
      path: "hotel_id",
      select: "name direction category facilities",
    });

    if (!updatedRoom) {
      return res.status(404).json({
        msg: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: "Error updating room",
      error: e.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndUpdate(id, { state: false }, { new: true });

    if (!room) {
      return res.status(404).json({
        msg: "Room not found",
      });
    }

    res.status(200).json({
      msg: "Room deleted successfully",
      room,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error deleting room",
      error: e.message,
    });
  }
};

export const disableRoom = async (req, res) => {
    try {
      const { id } = req.params;
      const { available } = req.body;
      console.log(available)
      const room = await Room.findByIdAndUpdate(id, {available: available}, { new: true });
  
      if (!room) {
        return res.status(404).json({
          msg: "Room not found",
        });
      }
  
      res.status(200).json({
        msg: "Room deleted successfully",
        room,
      });
    } catch (e) {
      res.status(500).json({
        msg: "Error deleting room",
        error: e.message,
      });
    }
  };

export const updateRoomsAvailability = async () => {
  try {
    const currentDate = new Date();
    
    
    const rooms = await Room.find({
      'nonAvailability.end': { $lt: currentDate },
      available: false
    });

    
    for (const room of rooms) {
      room.nonAvailability = room.nonAvailability.filter(period => 
        new Date(period.end) >= currentDate
      );
      
      if (room.nonAvailability.length === 0) {
        await Room.findByIdAndUpdate(room._id, { 
          available: true,
          nonAvailability: []
        });
      }
    }
  } catch (error) {
    console.error('Error updating rooms availability:', error);
  }
};

export const enableRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndUpdate(id, { available: true }, { new: true });

    if (!room) {
      return res.status(404).json({
        msg: "Habitación no encontrada",
      });
    }

    res.status(200).json({
      msg: "Habitación activada exitosamente",
      room,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error al activar la habitación",
      error: e.message,
    });
  }
};