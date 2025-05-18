import Room from "./room.model.js";
import Hotel from "../hotels/hotel.schema.js";

export const saveRoom = async (req, res) => {
  try {
    const { type, capacity, price_per_night, hotel_id, images } = req.body;

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

    let query = { hotel_id: hotelId, available: true };

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
    const { type, capacity, price_per_night, available } = req.body;

    const room = await Room.findByIdAndUpdate(
      id,
      {
        type,
        capacity,
        price_per_night,
        available,
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        msg: "Room not found",
      });
    }

    res.status(200).json({
      msg: "Room updated successfully",
      room,
    });
  } catch (e) {
    res.status(500).json({
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
  
      const room = await Room.findByIdAndUpdate(id, { available: false }, { new: true });
  
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