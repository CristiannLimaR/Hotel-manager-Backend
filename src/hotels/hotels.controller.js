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

export const getHotels = async (req,res) => {
    try {
        const query = {state:true}
        const { category, direction } = req.query

        const hotels = await Hotel.find(query)

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

