import Reservation from "./reservation.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.schema.js";
import dayjs from "dayjs";

export const saveReservation = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      hotel,
      room: roomId,
      checkInDate,
      checkOutDate,
      services = [],
    } = req.body;
    const hotelData = await Hotel.findById(hotel);

    const reservation = new Reservation({
      user: userId,
      hotel: hotel.toString(),
      room: roomId.toString(),
      checkInDate,
      checkOutDate,
      services,
    });
    await reservation.save();

    // Calcular ocupadas / disponibles
    if (hotelData) {
      const allRooms = await Room.find({
        hotel_id: hotelData._id,
        state: true,
        //available: true,
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

    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");

    room.nonAvailability.push({ start: checkInDate, end: checkOutDate });
    await room.save();

    res.status(201).json({
      msg: "Reservation saved successfully",
      reservation,
    });
  } catch (e) {
    res.status(500).json({
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
    const { checkInDate, checkOutDate, status, services } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      {
        checkInDate,
        checkOutDate,
        status,
        ...(services && { services }),
      },
      { new: true }
    );

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

    // Eliminar el rango de fechas de nonAvailability
    room.nonAvailability = room.nonAvailability.filter((period) => {
      return !(
        dayjs(period.start).isSame(dayjs(reservation.checkInDate), "day") &&
        dayjs(period.end).isSame(dayjs(reservation.checkOutDate), "day")
      );
    });

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
