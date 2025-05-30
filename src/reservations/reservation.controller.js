import Reservation from "./reservation.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.schema.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const saveReservation = async (req, res) => {
  try {
    const { hotel, room: roomId, checkInDate, checkOutDate, services = [], guests, userId = req.user._id } = req.body;

    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");

    
    const isAvailable = !room.nonAvailability.some(period => {
      const reservationStart = dayjs(checkInDate);
      const reservationEnd = dayjs(checkOutDate);
      const periodStart = dayjs(period.start);
      const periodEnd = dayjs(period.end);

      
      return (
        (reservationStart.isAfter(periodStart) && reservationStart.isBefore(periodEnd)) ||
        (reservationEnd.isAfter(periodStart) && reservationEnd.isBefore(periodEnd)) ||
        (reservationStart.isSameOrBefore(periodStart) && reservationEnd.isSameOrAfter(periodEnd))
      );
    });

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        msg: "La habitación no está disponible en las fechas seleccionadas"
      });
    }

    const hotelData = await Hotel.findById(hotel);

    const reservation = new Reservation({
      user: userId,
      hotel: hotel.toString(),
      room: roomId.toString(),
      checkInDate,
      checkOutDate,
      services,
      guests
    });
    
    await reservation.save();

    
    if (hotelData) {
      const allRooms = await Room.find({
        hotel_id: hotelData._id,
        state: true,
      });

      const busyRoomsIds = await Reservation.distinct("room", {
        hotel: hotelData._id,
        status: "active",
      });

      const busyRooms = allRooms.filter((room) =>
        busyRoomsIds.map((id) => id.toString()).includes(room._id.toString())
      );
      const availableRooms = allRooms.filter(
        (room) =>
          !busyRoomsIds.map((id) => id.toString()).includes(room._id.toString())
      );

      hotelData.busyRooms = busyRooms.length;
      hotelData.availableRooms = availableRooms.length;

      await hotelData.save();
    }

    room.nonAvailability.push({ start: checkInDate, end: checkOutDate });
    room.available = false;
    await Room.findByIdAndUpdate(roomId, { 
      available: false,
      nonAvailability: room.nonAvailability 
    });

    res.status(201).json({
      success: true,
      msg: "Reservation saved successfully",
      reservation,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      msg: "Error saving reservation",
      error: e.message,
    });
  }
};

export const getReservations = async (req, res) => {
  try {
    const { userId, hotelId, status } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (hotelId) query.hotel = hotelId;
    if (status) query.status = status;

    const reservations = await Reservation.find(query);

    res.status(200).json({
      msg: "Reservations retrieved successfully",
      reservations,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error retrieving reservations",
      error: e.message,
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        msg: "Reservation not found",
      });
    }

    res.status(200).json({
      msg: "Reservation retrieved successfully",
      reservation,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error retrieving reservation",
      error: e.message,
    });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      checkInDate,
      checkOutDate,
      status,
      services,
      guests,
    } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      {
        checkInDate,
        checkOutDate,
        status,
        ...(services && { services }),
        guests,
      },
      { new: true }
    );

    if(reservation.status === "completed"){
      const room = await Room.findById(reservation.room);
      if (room) {
        room.available = true;
        await room.save();
      }
    }

    if (!reservation) {
      return res.status(404).json({
        msg: "Reservation not found",
      });
    }

    res.status(200).json({
      msg: "Reservation updated successfully",
      reservation,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error updating reservation",
      error: e.message,
    });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id);
    const hotelData = await Hotel.findById(reservation.hotel);

    if (!reservation) {
      return res.status(404).json({ msg: "Reservation not found" });
    }

    const room = await Room.findById(reservation.room);
    if (!room) throw new Error("Associated room not found");

    room.nonAvailability = room.nonAvailability.filter(period => {
      return !(
        dayjs(period.start).isSame(dayjs(reservation.checkInDate), "day") &&
        dayjs(period.end).isSame(dayjs(reservation.checkOutDate), "day")
      );
    });

    await Room.findByIdAndUpdate(reservation.room, { available: true });
    reservation.status = "cancelled";

    // Actualizar el availableRooms de Hotel.schema
    if (hotelData) {
      const allRooms = await Room.find({
        hotel_id: hotelData._id,
        state: true,
      });

      const busyRoomsIds = await Reservation.distinct("room", {
        hotel: hotelData._id,
        status: "active",
      });

      const busyRooms = allRooms.filter((room) =>
        busyRoomsIds.includes(room._id.toString())
      );
      const availableRooms = allRooms.filter(
        (room) => !busyRoomsIds.includes(room._id.toString())
      );

      hotelData.busyRooms = busyRooms.length;
      hotelData.availableRooms = availableRooms.length;

      await hotelData.save();
    }

    await Promise.all([reservation.save(), room.save()]);

    res.status(200).json({
      msg: "Reservation cancelled and room availability updated",
      reservation,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error cancelling reservation",
      error: e.message,
    });
  }
};

export const getReservationsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const reservations = await Reservation.find({ user: userId });
    res.status(200).json({
      msg: "Reservations retrieved successfully",
      reservations,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error retrieving reservations",
      error: e.message,
    });
  }
};

// GET FOR STATS
export const totalReservations = async (req, res) => {
  try {
    const { userId, hotelId, status } = req.query;

    const query = {};

    if (userId) query.user = userId;
    if (hotelId) query.hotel = hotelId;
    if (status) query.status = status;

    const totalReservations = await Reservation.countDocuments(query);

    res.status(200).json({
      msg: "Successfully retrieved total reservations",
      totalReservations,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error cancelling reservation",
      error: e.message,
    });
  }
};

export const getActiveUsersByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        msg: "Hotel no encontrado"
      });
    }

    
    const activeReservations = await Reservation.find({
      hotel: hotelId,
      status: "active"
    }).populate({
      path: 'user',
      select: 'nombre email role estado createdAt'
    }).sort({ checkInDate: -1 });

    const userMap = new Map();

   
    activeReservations.forEach(reservation => {
      const userId = reservation.user._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: reservation.user,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          room: reservation.room,
          guests: reservation.guests,
          totalReservations: 1
        });
      } else {
        const existingUser = userMap.get(userId);
        existingUser.totalReservations += 1;
      }
    });

    const activeUsers = Array.from(userMap.values());

    res.status(200).json({
      success: true,
      msg: "Usuarios con reservas activas obtenidos exitosamente",
      activeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al obtener usuarios con reservas activas",
      error: error.message
    });
  }
};
