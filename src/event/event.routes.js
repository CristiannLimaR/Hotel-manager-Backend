import { Router } from "express";
import {
  crearEvento,
  listarEventosPorHotel,
  obtenerEventoPorId,
  editarEvento,
  cancelarEvento,
} from "./event.controller.js"

const router = Router();

// Crear evento
router.post("/hotels/:hotelId/events",  crearEvento);

// Listar eventos
router.get("/hotels/:hotelId/events", listarEventosPorHotel);

// Ver detalle
router.get("/:id", obtenerEventoPorId);

// Editar evento
router.put("/:id", editarEvento);

// Cancelar evento
router.delete("/:id", cancelarEvento);

export default router;
