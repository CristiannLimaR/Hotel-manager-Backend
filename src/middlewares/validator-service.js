import { check } from "express-validator";
import Service from "../services/service.model.js";

export const validateServiceBody = [
  check("name")
    .notEmpty()
    .withMessage("Service name is required")
    .isString()
    .withMessage("Service name must be a string")
    .isLength({ min: 3 })
    .withMessage("Service name must be at least 3 characters long"),

  check("price")
    .notEmpty()
    .withMessage("Service price is required")
    .isNumeric()
    .withMessage("Service price must be a number")
    .custom((value) => value > 0)
    .withMessage("Service price must be greater than 0"),

  check("description")
    .optional()
    .isString()
    .withMessage("Service description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description cannot be longer than 500 characters"),

  check("category")
    .optional()
    .isString()
    .withMessage("Service category must be a string"),

  check("available")
    .optional()
    .isBoolean()
    .withMessage("Service availability must be a boolean"),
];

export const ServiceExists = async (req, res, next) => {
    try {
      const service = await Service.findById(req.params.id);
      if (!service || !service.available) {
        return res
          .status(404)
          .json({ message: "Servicio no encontrado o no disponible" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error al verificar el servicio", error });
    }
  };