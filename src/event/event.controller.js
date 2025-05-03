import Event from "../event/event.js";
// import Hotel from "../hotel/Hotel.js"; agregar esta importacion cuando ya este hoteles


// Crear evento
export const crearEvento = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { nombre_evento, descripcion, fecha, recursos_asignados, servicios_adicionales, tipo_evento } = req.body;

    // Validar que el hotel exista
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel no encontrado" });
    }

    const nuevoEvento = new Event({
      nombre_evento,
      descripcion,
      fecha,
      hotel_id: hotelId,
      recursos_asignados,
      servicios_adicionales,
      tipo_evento,
    });

    await nuevoEvento.save();
    res.status(201).json(nuevoEvento);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el evento", error });
  }
};

// Listar eventos por hotel
export const listarEventosPorHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { fecha, tipo_evento } = req.query;

    const filtros = { hotel_id: hotelId, estado: true };

    if (fecha) {
      filtros.fecha = { $gte: new Date(fecha) };
    }

    if (tipo_evento) {
      filtros.tipo_evento = tipo_evento;
    }

    const eventos = await Event.find(filtros);
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: "Error al listar eventos", error });
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
    res.status(500).json({ message: "Error al obtener el evento", error });
  }
};

// Editar evento
export const editarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.fecha && new Date(data.fecha) <= new Date()) {
      return res.status(400).json({ message: "La fecha debe ser futura" });
    }

    const evento = await Event.findByIdAndUpdate(id, data, { new: true });

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: "Error al editar el evento", error });
  }
};

// Cancelar evento
export const cancelarEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await Event.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    );

    if (!evento) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json({ message: "Evento cancelado", evento });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar el evento", error });
  }
};
