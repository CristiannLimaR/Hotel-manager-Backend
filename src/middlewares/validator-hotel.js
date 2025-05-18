import Hotel from "../hotels/hotel.schema.js";
import { check, validationResult } from "express-validator";
import { validarCampos } from "./validar-campos.js";

export const validateSaveHotel = [
  check("name")
    .notEmpty()
    .withMessage("El nombre del hotel es obligatorio"),

  check("direction")
    .notEmpty()
    .withMessage("La dirección es obligatoria")
    .isString()
    .withMessage("La dirección debe ser una cadena de texto"),

  check("category")
    .isIn([
      "1 Estrella",
      "2 Estrellas",
      "3 Estrellas",
      "4 Estrellas",
      "5 Estrellas",
    ])
    .withMessage(
      "La categoría debe ser una de las siguientes: 1 Estrella, 2 Estrellas, 3 Estrellas, 4 Estrellas, 5 Estrellas"
    ),

  check("facilities")
    .isArray()
    .withMessage("Las instalaciones deben ser un arreglo")
    .notEmpty()
    .withMessage("Las instalaciones no pueden estar vacías"),

  check("rangeOfPrices")
    .isObject()
    .withMessage("El rango de precios debe ser un objeto")
    .custom((value) => {
      if (value.min && value.max && value.min > value.max) {
        throw new Error("El precio mínimo no puede ser mayor al precio máximo");
      }
      return true;
    }),
  validarCampos,
];

export const validateUpdateHotel = [
  check("name")
    .optional()
    .isString()
    .withMessage("El nombre debe ser una cadena de texto"),
  check("direction")
    .optional()
    .isString()
    .withMessage("La dirección debe ser una cadena de texto"),

  check("category")
    .optional()
    .isIn([
      "1 Estrella",
      "2 Estrellas",
      "3 Estrellas",
      "4 Estrellas",
      "5 Estrellas",
    ])
    .withMessage(
      "La categoría debe ser una de las siguientes: 1 Estrella, 2 Estrellas, 3 Estrellas, 4 Estrellas, 5 Estrellas"
    ),

  check("facilities")
    .optional()
    .isArray()
    .withMessage("Las comodidades deben ser un arreglo"),

  check("rangeOfPrices")
    .optional()
    .isObject()
    .withMessage("El rango de precios debe ser un objeto"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


export const hotelExists = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel || !hotel.state) {
      return res
        .status(404)
        .json({ message: "Hotel no encontrado o no disponible" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error al verificar el hotel", error });
  }
};
