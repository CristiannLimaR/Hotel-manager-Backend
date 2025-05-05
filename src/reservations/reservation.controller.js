import Reservation from "./reservation.model.js";

export const saveReservation = async (req, res) => {
  try {
    const {
      user,
      hotel,
      room,
      checkInDate,
      checkOutDate,
      services = []
    } = req.body;

    const reservation = new Reservation({
      user,
      hotel,
      room,
      checkInDate,
      checkOutDate,
      services,
    });

    await reservation.save();

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
    const {
      checkInDate,
      checkOutDate,
      status,
      services,
    } = req.body;

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

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({
        msg: "Reservation not found",
      });
    }

    res.status(200).json({
      msg: "Reservation cancelled successfully",
      reservation,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error cancelling reservation",
      error: e.message,
    });
  }
};
