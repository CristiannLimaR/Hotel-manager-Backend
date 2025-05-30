import Event from "./event.model.js";
import Hotel from "../hotels/hotel.schema.js";

// Crear evento
export const crearEvento = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { nombre_evento, descripcion, fecha, recursos_asignados, servicios_adicionales, tipo_evento, images } = req.body;

    // Validar que el hotel exista
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel no encontrado" });
    }

    const user = req.user._id
    const nuevoEvento = new Event({
      nombre_evento,
      descripcion,
      fecha,
      user,
      hotel_id: hotelId,
      recursos_asignados,
      servicios_adicionales,
      tipo_evento,
      images,
    });

    await nuevoEvento.save();
    res.status(201).json(nuevoEvento);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el evento", error: error.message });
  }
};

// Listar eventos por hotel
export const listarEventosPorHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { fecha, tipo_evento } = req.query;

    const filtros = { hotel_id: hotelId };

    if (fecha) {
      filtros.fecha = { $gte: new Date(fecha) };
    }

    if (tipo_evento) {
      filtros.tipo_evento = tipo_evento;
    }

    const eventos = await Event.find(filtros);
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: "Error al listar eventos", error: error.message });
  }
};

// Obtener detalle del evento
export const obtenerEventoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Event.findById(id);

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el evento", error: error.message });
  }
};

// Editar evento
export const editarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

   

    const evento = await Event.findByIdAndUpdate(id, data, { new: true });

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: "Error al editar el evento", error: error.message });
  }
};

// Cancelar evento
export const cancelarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Event.findByIdAndUpdate(id, { estado: false }, { new: true });

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento cancelado", evento });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar el evento", error: error.message });
  }
};

export const misEventos = async (req, res) => {
  try {
    const user = req.user._id
    const events = await Event.find({user})

    res.status(200).json({
      message: "Eventos obtenidos exitosamente",
      events
    })
  } catch (error) {
    res.status(500).json({ message: "Error al obtener eventos", error: error.message });
  }
}