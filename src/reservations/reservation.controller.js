import Reservation from "./reservation.model.js";
import Room from "../rooms/room.model.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const saveReservation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hotel, room: roomId, checkInDate, checkOutDate, services = [], guests } = req.body;

    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");

    // Verificar si la habitación está disponible en las fechas indicadas
    const isAvailable = !room.nonAvailability.some(period => {
      const reservationStart = dayjs(checkInDate);
      const reservationEnd = dayjs(checkOutDate);
      const periodStart = dayjs(period.start);
      const periodEnd = dayjs(period.end);

      // Verificar si hay solapamiento de fechas
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

    const reservation = new Reservation({
      user: userId,
      hotel,
      room: roomId,
      checkInDate,
      checkOutDate,
      services,
      guests
    });

    room.nonAvailability.push({ start: checkInDate, end: checkOutDate });

    await Promise.all([
      reservation.save(),
      room.save()
    ]);

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

    if (!reservation) {
      return res.status(404).json({ msg: "Reservation not found" });
    }

    const room = await Room.findById(reservation.room);
    if (!room) throw new Error("Associated room not found");

   
    room.nonAvailability = room.nonAvailability.filter(period => {
      return !(
        dayjs(period.start).isSame(dayjs(reservation.checkInDate), 'day') &&
        dayjs(period.end).isSame(dayjs(reservation.checkOutDate), 'day')
      );
    });

    reservation.status = "cancelled";

    await Promise.all([
      reservation.save(),
      room.save()
    ]);

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
