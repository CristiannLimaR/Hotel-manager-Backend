import Invoice from "./invoice.model.js";
import Reservation from "./reservation.model.js";
import Room from "./room.model.js"; // Necesario para obtener el precio de la habitación

export const saveInvoice = async (req, res) => {
  try {
    const { reservationId } = req.body;

    
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        msg: "Reservation not found",
      });
    }

    
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)); 

    
    const room = await Room.findById(reservation.room);
    if (!room) {
      return res.status(404).json({
        msg: "Room not found",
      });
    }
    const roomPricePerNight = parseFloat(room.price);
    const roomTotal = nights * roomPricePerNight;

    
    const services = reservation.services.map((s) => {
      const total = parseFloat(s.service.price) * s.quantity;
      return {
        name: s.service.name,
        price: s.service.price,
        quantity: s.quantity,
        total,
      };
    });

    
    const servicesTotal = services.reduce((acc, s) => acc + parseFloat(s.total), 0);
    const total_pagar = roomTotal + servicesTotal;

    
    const invoice = new Invoice({
      reservation: reservation._id,
      nights,
      roomPricePerNight,
      roomTotal,
      services,
      total_pagar,
    });

    await invoice.save();

    res.status(201).json({
      msg: "Invoice created successfully",
      invoice,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error creating invoice",
      error: e.message,
    });
  }
};

export const getInvoices = async (req, res) => {
    try {
      const { userId, hotelId, statusInvoice, startDate, endDate } = req.query;
  
      const query = { status: true };
  
      if (statusInvoice) query.statusInvoice = statusInvoice;
  
      if (startDate || endDate) {
        query.Date = {};
        if (startDate) query.Date.$gte = new Date(startDate);
        if (endDate) query.Date.$lte = new Date(endDate);
      }
  
      if (userId) query["reservation.user"] = userId;
      if (hotelId) query["reservation.hotel"] = hotelId;
  
      const invoices = await Invoice.find(query);
  
      res.status(200).json({
        msg: "Invoices retrieved successfully",
        invoices,
      });
    } catch (e) {
      res.status(500).json({ msg: "Error retrieving invoices", error: e.message });
    }
  };

  
  export const updateInvoice = async (req, res) => {
    try {
      const { id } = req.params;
      const { statusInvoice, status } = req.body;
  
      const invoice = await Invoice.findByIdAndUpdate(
        id,
        {
          ...(statusInvoice && { statusInvoice }),
          ...(typeof status === "boolean" && { status }),
        },
        { new: true }
      );
  
      if (!invoice) {
        return res.status(404).json({ msg: "Invoice not found" });
      }
  
      res.status(200).json({
        msg: "Invoice updated successfully",
        invoice,
      });
    } catch (e) {
      res.status(500).json({ msg: "Error updating invoice", error: e.message });
    }
  };

  export const getInvoicesForUser = async (req, res) => {
    try {
      const { userId } = req.user;
  
      const invoices = await Invoice.find({ "reservation.user": userId });
  
      if (!invoices || invoices.length === 0) {
        return res.status(404).json({ msg: "No invoices found for this user" });
      }
  
      res.status(200).json({
        msg: "Invoices retrieved successfully",
        invoices,
      });
    } catch (e) {
      res.status(500).json({
        msg: "Error retrieving invoices",
        error: e.message,
      });
    }
  };

  export const deleteInvoice = async (req, res) => {
    try {
      const { id } = req.params;
  
      const invoice = await Invoice.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
      );
  
      if (!invoice) {
        return res.status(404).json({ msg: "Invoice not found" });
      }
  
      res.status(200).json({
        msg: "Invoice deleted successfully",
        invoice,
      });
    } catch (e) {
      res.status(500).json({ msg: "Error deleting invoice", error: e.message });
    }
  };
  