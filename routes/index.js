import express from "express";
import userRouter from "./user.js";
import fileRouter from "./file.js";
const indexRouter = express.Router();

indexRouter.use("/user", userRouter);
indexRouter.use("/file", fileRouter);

export default indexRouter;