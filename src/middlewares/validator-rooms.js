import { check } from "express-validator";
import Room from "../rooms/room.model.js";

export const validateRoomCreation = [
  check("hotelId").isMongoId().withMessage("Invalid hotel ID in URL"),
  check("type").notEmpty().withMessage("Room type is required"),
  check("capacity").isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
  check("price_per_night").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  check("availability").isArray().withMessage("Availability must be an array"),
  check("availability.*.start")
    .isISO8601()
    .toDate()
    .withMessage("Each availability start must be a valid date"),
  check("availability.*.end")
    .isISO8601()
    .toDate()
    .withMessage("Each availability end must be a valid date"),
];




export const validateRoomId = [
  check("id").isMongoId().withMessage("Invalid room ID"),
];

export const validateRoomUpdate = [
  check("id").isMongoId().withMessage("Invalid room ID"),

  check("type").optional().isString().withMessage("Type must be a string"),
  check("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
  check("price_per_night").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  check("availability").optional().isArray().withMessage("Availability must be an array"),
  check("availability.*.start")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Availability start must be a valid date"),
  check("availability.*.end")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Availability end must be a valid date"),
  check("available").optional().isBoolean().withMessage("Available must be true or false"),
];

export const RoomExists = async (req, res, next) => {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || !room.state) {
        return res
          .status(404)
          .json({ message: "habitación no encontrada o no disponible" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error al verificar la habitación", error });
    }
  };