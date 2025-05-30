import Hotel from "./hotel.schema.js";
import Room from "../rooms/room.model.js";
import cloudinary from "../../configs/cloudinary.js";
import Reservation from "../reservations/reservation.model.js";
import dayjs from "dayjs";

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

    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart) {
      return `hotels/${lastPart.split(".")[0]}`;
    }

    return null;
  } catch (error) {
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
      admin,
    } = req.body;

    facilities =
      typeof facilities === "string" ? JSON.parse(facilities) : facilities;
    rangeOfPrices =
      typeof rangeOfPrices === "string"
        ? JSON.parse(rangeOfPrices)
        : rangeOfPrices;
    services = typeof services === "string" ? JSON.parse(services) : services;

    const imageUrls = req.files?.map((file) => file.path) || [];

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
      admin,
    } = req.body;

    const currentHotel = await Hotel.findById(id);
    if (!currentHotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    if (deletedImages.length > 0) {
      const deletePromises = deletedImages.map(async (imageUrl) => {
        const publicId = getPublicIdFromUrl(imageUrl);

        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
          }
        }
      });
      await Promise.all(deletePromises);
    }

    const currentImages = currentHotel.images || [];

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
      const shouldKeep = !deletedFileNames.has(fileName);
      return shouldKeep;
    });

    const newImages = req.files?.map((file) => file.path) || [];

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
      state: true,
    });

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

export const getHotelOccupancyStats = async (req, res) => {
  try {
    const hotels = await Hotel.find({ state: true });

    const stats = hotels.map((hotel) => {
      const totalRooms =
        (Number(hotel.availableRooms) || 0) + (Number(hotel.busyRooms) || 0);
      const porcentOccupied =
        totalRooms > 0
          ? (hotel.busyRooms / totalRooms) * 100
          : 0;

      return {
        name: hotel.name,
        porcentOccupied: porcentOccupied.toFixed(2),
      };
    });

    stats.sort((a, b) => b.porcentOccupied - a.porcentOccupied);

    res.status(200).json({ stats });
  } catch (e) {
    return res.status(500).json({
      ss: false,
      msg: "Error getting occupancy",
    });
  }
};

export const getReservationsForMonths = async (req, res) => {
  try {
    const userId = req.user._id;

    const hotel = await Hotel.findOne({ admin: userId, state: true });
    if (!hotel) {
      return res.status(404).json({
        ss: false,
        msg: "Hotel not found",
      });
    }

    const reservations = await Reservation.find({
      hotel: hotel._id,
      status: "active",
    });

    const monthCount = Array(12).fill(0);

    reservations.forEach((res) => {
      const monthIndex = dayjs(res.checkInDate).month();
      monthCount[monthIndex]++;
    });

    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const stats = months.map((name, i) => ({
      month: name,
      reservations: monthCount[i],
    }));

    res.status(200).json({
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      ss: false,
      msg: "Error getting reservations for months",
      error: error.message,
    });
  }
};

export const busyAndAvailableRooms = async (req, res) => {
  try {
    const userId = await req.user._id;
    const hotel = await Hotel.findOne({ admin: userId, state: true });

    if (!hotel) {
      return res.status(404).json({
        ss: false,
        msg: "Hotel not found",
      });
    }

    const allRooms = await Room.find({
      hotel_id: hotel._id,
      state: true,
    });

    const busyRoomsIds = await Reservation.distinct("room", {
      hotel: hotel._id,
      status: "active",
    });

    const busyRooms = allRooms.filter((room) =>
      busyRoomsIds.map((id) => id.toString()).includes(room._id.toString())
    );

    const availableRooms = allRooms.filter(
      (room) =>
        !busyRoomsIds.map((id) => id.toString()).includes(room._id.toString())
    );

    const totalRooms = busyRooms.length + availableRooms.length;

    const porcentBusy =
      totalRooms > 0 ? (busyRooms.length / totalRooms) * 100 : 0;
    const porcentAvailable =
      totalRooms > 0 ? (availableRooms.length / totalRooms) * 100 : 0;

    res.status(200).json({
      busyRooms: busyRooms.length,
      availableRooms: availableRooms.length,
      porcentBusy: porcentBusy.toFixed(2),
      porcentAvailable: porcentAvailable.toFixed(2),
    });
  } catch (error) {
    return res.status(500).json({
      ss: false,
      msg: "Error getting available and busy rooms",
      error: error.message,
    });
  }
};

export const getHotelByManager = async (req,res) => {
  try {
    const userId = req.user._id;
    const hotel = await Hotel.findOne({ admin: userId, state: true });

    if (!hotel) {
      return res.status(404).json({
        ss: false,
        msg: "Hotel not found for this user"
      })
    }

    res.status(200).json({
      hotel
    })
    
  } catch (error) {
    return res.status(500).json({
      ss: false,
      msg: "Error getting hotel by manager",
      error: error.message
    })
  }
}

const getMostOccupiedHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate('rooms')
      .lean();

    const hotelsWithStats = hotels.map(hotel => {
      const totalRooms = hotel.rooms.length;
      const occupiedRooms = hotel.rooms.filter(room => room.status === 'occupied').length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      return {
        ...hotel,
        occupancyRate
      };
    });

    const sortedHotels = hotelsWithStats.sort((a, b) => b.occupancyRate - a.occupancyRate);

    res.json(sortedHotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyReservations = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const reservations = await Reservation.find({ hotel: hotelId })
      .populate('room')
      .lean();

    const monthlyStats = {};
    reservations.forEach(reservation => {
      const month = new Date(reservation.checkIn).toLocaleString('default', { month: 'long' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = 0;
      }
      monthlyStats[month]++;
    });

    res.json(monthlyStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoomAvailability = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const hotel = await Hotel.findById(hotelId).populate('rooms');
    
    const availableRooms = hotel.rooms.filter(room => room.status === 'available').length;
    const occupiedRooms = hotel.rooms.filter(room => room.status === 'occupied').length;

    res.json({
      available: availableRooms,
      occupied: occupiedRooms,
      total: hotel.rooms.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};