import { Router } from "express";
import {
  crearEvento,
  listarEventosPorHotel,
  obtenerEventoPorId,
  editarEvento,
  cancelarEvento,
  misEventos,
} from "./event.controller.js"
import { validarJWT } from "../middlewares/validar-JWT.js";

const router = Router();

router.get("/my-events", validarJWT, misEventos)
// Crear evento
router.post("/hotels/:hotelId/events", validarJWT, crearEvento);



// Listar eventos
router.get("/hotels/:hotelId/events", listarEventosPorHotel);

// Ver detalle
router.get("/:id", obtenerEventoPorId);

// Editar evento
router.put("/:id", editarEvento);

// Cancelar evento
router.delete("/:id", cancelarEvento);

export default router;
