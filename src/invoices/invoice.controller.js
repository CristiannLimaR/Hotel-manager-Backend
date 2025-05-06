import Invoice from "./invoice.model";
import User from "../users/user.model.js";
import Hotel from "../hotels/hotel.model.js";
import Service from "../services/service.model.js";

export const createInvoice = async (req, res) => {
    const { hotel, user, services, total } = req.body;
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Solo los administradores pueden crear facturas.' });
    }
    try {
        const invoice = new Invoice({
            user: req.user._id,
            hotel,
            services,
            total,
        });
        await invoice.save();
        
        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente.',
            invoice
        });
    }catch (error) {
        res.status(500).json({
            success: false,
            message: "No se pudo crear la factura",
            error
        });
    }
};