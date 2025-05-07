import Hotel from "./hotel.schema.js";
import Room from "../rooms/room.model.js"

export const saveHotel = async (req, res) => {
  try {
    const { name, direction, category, facilities, rangeOfPrices } = req.body;

    const hotel = new Hotel({
      name,
      direction,
      category,
      facilities,
      rangeOfPrices,
    });

    await hotel.save();

    res.status(201).json({
      msg: "Hotel saved successfully",
      hotel,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error saving hotel",
      error: e.message,
    });
  }
};

export const getHotels = async (req, res) => {
  try {
    const query = { state: true };
    const { nameCategory, direction, availability } = req.query;

    // FILTERS

    if (nameCategory) {
      query.category = nameCategory;
    }

    if (direction) {
      query.direction = { $regex: direction, $options: "i" }; // Ignorar mayus y minus
    }

    if (availability) {
      query.availableRooms = { $gte: parseInt(availability) };
    }
    // END OF FILTERS

    const hotels = await Hotel.find(query).populate({
      path: "rooms",
      select: "-hotel_id -__v -createdAt -updatedAt", // No incluye el array de rooms que está en hotels
    });

    res.status(200).json({
      msg: "Hotels found",
      hotels,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error getting hotels",
      error: e.message,
    });
  }
};

export const searchHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate({
      path: "rooms",
      select: "-hotel_id -__v -createdAt -updatedAt", // No incluye el array de rooms que está en hotels
    });

    if (!hotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    res.status(200).json({
      msg: "Hotel found",
      hotel,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error searching hotel",
      error: error.message,
    });
  }
};

export const upgradeHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, direction, category, facilities, rangeOfPrices } = req.body;

    const updatedHotel = await Hotel.findByIdAndUpdate(id, {
      name,
      direction,
      category,
      facilities,
      rangeOfPrices,
    }, { new: true });


    if (!updatedHotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }
    
    res.status(200).json({
        ss: true,
        msg: "Hotel updated",
        updatedHotel
    })


  } catch (e) {
    return res.status(500).json({
      ss: false,
      error: e.message,
    });
  }
};

export const deleteHotel = async (req,res) => {
    try {
        const { id } = req.params
        const { confirm } = req.body

        if (!id) {
            return res.status(404).json({
                msg: "Hotel not found",
            });
        }

        if (!confirm) {
            return res.status(400).json({
                msg: "Admin, ¿Seguro que querés eliminar este hotel? Cambia el valor a 'true' para confirmar"
            })
        }

        const hotel = await Hotel.findByIdAndUpdate(id, { state: false }, { new: true })
        await Room.deleteMany({ hotel_id: id }) // Eliminar rooms asociadas



        res.status(200).json({
            ss: true,
            msg: "Hotel deleted",
            hotel,
        });

    } catch (e) {
        return res.status(500).json({
            ss:false,
            error: e.message
        })
    }
}