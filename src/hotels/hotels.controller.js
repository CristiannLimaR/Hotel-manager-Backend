import Hotel from "./hotel.model.js";

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
    res.status(500).json({
      msg: "Error saving hotel",
      error: e.message,
    });
  }
};


export const getHotels = async (req, res) => {
  try {
    const query = { state: true };

    const hotels = await Hotel.find(query);

    res.status(200).json({
      msg: "Hotels found",
      hotels,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error getting hotels",
      error: e.message,
    });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    res.status(200).json({
      msg: "Hotel found",
      hotel,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error getting hotel",
      error: e.message,
    });
  }
};


export const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, direction, category, facilities, rangeOfPrices } = req.body;

    
    const hotel = await Hotel.findByIdAndUpdate(
      id,
      {
        name,
        direction,
        category,
        facilities,
        rangeOfPrices,
      },
      { new: true } 
    );

    if (!hotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    res.status(200).json({
      msg: "Hotel updated successfully",
      hotel,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error updating hotel",
      error: e.message,
    });
  }
};


export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByIdAndUpdate(id, { state: false }, { new: true });

    if (!hotel) {
      return res.status(404).json({
        msg: "Hotel not found",
      });
    }

    res.status(200).json({
      msg: "Hotel deleted successfully",
      hotel,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error deleting hotel",
      error: e.message,
    });
  }
};
