import {Schema, model} from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

const HotelSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    direction:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    facilities:{
        type: [String],
        required: true
    },
    rangeOfPrices:{
        min: Number,
        max: Number
    },
    state:{
        type: Boolean,
        default: true
    }
})


HotelSchema.methods.toJSON = function () {
    const {__v, _id, ...hotel} = this.toObject()
    hotel.uid = _id
    return hotel
}

HotelSchema.plugin(mongooseAutoPopulate);

export default model("Hotel", HotelSchema);