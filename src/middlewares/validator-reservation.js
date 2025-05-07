import { check } from "express-validator";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.schema.js";
import User from "../users/user.model.js";
import Reservation from "../reservations/reservation.model.js";

export const validateReservationInput = [
  check("hotel", "Hotel ID is required").not().isEmpty(),
  check("hotel").custom(async (id) => {
    const exists = await Hotel.findById(id);
    if (!exists) throw new Error("Hotel does not exist");
  }),
  check("room", "Room ID is required").not().isEmpty(),
  check("room").custom(async (id) => {
    const exists = await Room.findById(id);
    if (!exists) throw new Error("Room does not exist");
  }),
  check("checkInDate", "Check-in date is required").isISO8601(),
  check("checkOutDate", "Check-out date is required").isISO8601(),
  check("checkOutDate").custom((checkOutDate, { req }) => {
    if (new Date(checkOutDate) <= new Date(req.body.checkInDate)) {
      throw new Error("Check-out date must be after check-in date");
    }
    return true;
  }),
];

export const validateReservationUpdate = [
  check("id").isMongoId().withMessage("Invalid reservation ID"),

  check("status")
    .optional()
    .isIn(["active", "cancelled", "completed"])
    .withMessage("Invalid reservation status"),

  check("checkInDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid check-in date"),

  check("checkOutDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid check-out date")
    .custom((checkOutDate, { req }) => {
      if (
        req.body.checkInDate &&
        new Date(checkOutDate) <= new Date(req.body.checkInDate)
      ) {
        throw new Error("Check-out date must be after check-in date");
      }
      return true;
    }),
];

export const ReservationExists = async (req, res, next) => {
    try {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation || !reservation.state) {
        return res
          .status(404)
          .json({ message: "Reservacion no encontrada o no disponible" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error al verificar la reservacion", error });
    }
  };


  export const validateUserOrAdmin = async (req, res, next) => {
    try {
      const reservationId = req.params.id;
      const authentificatedUser = req.usuario._id;
      const roleFromUser = authentificatedUser.role;
  
      const reservation = await Reservation.findById(reservationId);
  
      if (!reservation) {
        return res.status(404).json({ msg: "Reservation not found" });
      }
  
      const isOwner = reservation.user.toString() === authentificatedUser;
      const isAdminOrManager = roleFromUser === "ADMIN_ROLE" || roleFromUser === "MANAGER_ROLE";
  
      if (!isOwner && !isAdminOrManager) {
        return res.status(403).json({ msg: "You are not authorized to modify this reservation" });
      }
  
      next();
    } catch (err) {
      res.status(500).json({ msg: "Error validating user permissions", error: err.message });
    }
  };
  


  