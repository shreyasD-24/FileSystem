import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

let File = mongoose.model("File", fileSchema);
export default File;