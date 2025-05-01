import { Router } from "express";
import {
  crearEvento,
  listarEventosPorHotel,
  obtenerEventoPorId,
  editarEvento,
  cancelarEvento,
} from "../event/event.controller"

const router = Router();

// Crear evento
router.post("/api/hotels/:hotelId/events", crearEvento);

// Listar eventos
router.get("/api/hotels/:hotelId/events", listarEventosPorHotel);

// Ver detalle
router.get("/api/events/:id", obtenerEventoPorId);

// Editar evento
router.put("/api/events/:id", editarEvento);

// Cancelar evento
router.delete("/api/events/:id", cancelarEvento);

export default router;
