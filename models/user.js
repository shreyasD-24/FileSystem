import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required: true
    },
    files : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "File"
    }
    ]
})

let User = mongoose.model("User", userSchema );
export default User;