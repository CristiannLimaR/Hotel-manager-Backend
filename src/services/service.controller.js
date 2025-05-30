import Service from "./service.model.js";
import Hotel from "../hotels/hotel.schema.js";


export const createService = async (req, res) => {
  try {
    const { name, description, price, category, available, hotel } = req.body;

    if (!name || !category || price === undefined || !hotel) {
      return res.status(400).json({ msg: "Name, category, price and hotel are required" });
    }

    // Eliminar el índice único si existe
    try {
      await Service.collection.dropIndex('name_1');
    } catch (error) {
      // Ignorar el error si el índice no existe
    }

    const hotelExists = await Hotel.findById(hotel);
    if (!hotelExists) {
      return res.status(404).json({ msg: "Hotel not found" });
    }
    
    const service = new Service({
      name,
      description,
      price,
      category,
      available,
    });

    await service.save();

    // Añadir el servicio al array de servicios del hotel
    await Hotel.findByIdAndUpdate(
      hotel,
      { $push: { services: service._id } }
    );

    res.status(201).json({
      msg: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error creating service",
      error: error.message,
    });
  }
};


export const getServices = async (req, res) => {
  try {
    const { category, available } = req.query;

    let query = {};

    if (category) query.category = category;
    if (available !== undefined) query.available = available === "true";

    const services = await Service.find(query);

    res.status(200).json({
      msg: "Services retrieved successfully",
      services,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error fetching services",
      error: error.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        msg: "Service not found",
      });
    }

    res.status(200).json({
      msg: "Service retrieved successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error retrieving service",
      error: error.message,
    });
  }
};


export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, available } = req.body;

    const service = await Service.findByIdAndUpdate(
      id,
      { name, description, price, category, available },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        msg: "Service not found",
      });
    }

    res.status(200).json({
      msg: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error updating service",
      error: error.message,
    });
  }
};



export const disableService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      { available: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        msg: "Service not found",
      });
    }

    res.status(200).json({
      msg: "Service disabled successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error disabling service",
      error: error.message,
    });
  }
};

const addService = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const serviceData = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel no encontrado' });
    }

    hotel.services.push(serviceData);
    await hotel.save();

    res.status(201).json(hotel.services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
