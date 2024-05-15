import mongoose from "mongoose";
import { config } from "dotenv";
config();

export async function connectToDb(){
    await mongoose.connect(process.env.MONGODB_URL)
    .catch((err) => {
        console.log(err);
        throw new Error("Can't connect to Database")
    });
}

