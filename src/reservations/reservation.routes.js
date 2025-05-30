import express from "express";
import {
  saveReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getReservationsByUser,
  totalReservations,
  getActiveUsersByHotel
} from "./reservation.controller.js";

import { validarJWT } from "../middlewares/validar-JWT.js";
import { validarAdmin } from "../middlewares/validar-admin.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validateReservationInput, validateReservationUpdate, ReservationExists, validateUserOrAdmin } from "../middlewares/validator-reservation.js";

const router = express.Router();


router.post(
  "/",
  [validarJWT, validateReservationInput],
  validarCampos,
  saveReservation
);

// STAT
router.get("/busyRooms", [validarJWT, validarAdmin], totalReservations);

router.get(
  "/",
  [validarJWT, validarAdmin], 
  validarCampos, 
  getReservations
);

router.get(
  "/my-reservations",
  [validarJWT], 
  validarCampos, 
  getReservationsByUser
);

router.get(
  "/:id",
  [validarJWT],
  validarCampos,
  getReservationById
);


router.put(
  "/:id",
  [validarJWT, validateReservationUpdate, ReservationExists, validateUserOrAdmin],
  validarCampos,
  updateReservation
);


router.delete(
  "/:id",
  [validarJWT, ReservationExists],
  validarCampos,
  deleteReservation
);

router.get(
  "/active-users/:hotelId",
  [validarJWT, validarAdmin],
  validarCampos,
  getActiveUsersByHotel
);

export default router;
