import Hotel from "./hotel.schema.js";
import Room from "../rooms/room.model.js";

export const saveHotel = async (req, res) => {
  try {
    const { name, direction, category, facilities, rangeOfPrices, services } =
      req.body;

    const hotel = new Hotel({
      name,
      direction,
      category,
      facilities,
      rangeOfPrices,
      services,
      busyRooms: 0,
      availableRooms: 0,
    });

    await hotel.save();

    res.status(201).json({
      msg: "Hotel saved successfully",
      hotel,
    });
  } catch (e) {
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
    const { name, direction, category, facilities, rangeOfPrices, services } =
      req.body;

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      {
        name,
        direction,
        category,
        facilities,
        rangeOfPrices,
        services,
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
