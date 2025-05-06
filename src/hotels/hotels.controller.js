import Hotel from "./hotel.schema.js";

export const saveHotel = async (req,res) => {
    try {
        const {name,direction,category,facilities,rangeOfPrices} = req.body

        const hotel = new Hotel({
            name,
            direction,
            category,
            facilities,
            rangeOfPrices
        })

        await hotel.save()

        res.status(201).json({
            msg: "Hotel saved successfully",
            hotel
        })

    } catch (e) {
        return res.status(500).json({
            msg: "Error saving hotel",
            error: e.message
        })
    }
}

export const getHotels = async (req, res) => {
  try {
       const query = { state: true };
       const { nameCategory, direction, availability } = req.query


        // FILTERS

        if(nameCategory){
            query.category = nameCategory
        }

        if(direction){
            query.direction = { $regex: direction, $options: "i" } // Ignorar mayus y minus
        }

        if(availability){
            query.availableRooms = { $gte: parseInt(availability) }
        }
        // END OF FILTERS

        const hotels = await Hotel.find(query)
        .populate({
            path: "rooms",
            select: "-hotel_id -__v -createdAt -updatedAt" // No incluye el array de rooms que está en hotels
          })

        res.status(200).json({
            msg: "Hotels found",
            hotels
        })
        
    } catch (e) {
        return res.status(500).json({
            msg: "Error getting hotels",
            error: e.message
        })
    }
}