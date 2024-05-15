import express from "express";
import { isLoggedIn } from "../utils/middleware.js";
import wrapAsync from "../utils/wrapAsync.js";
import multer from "multer";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../utils/firebaseconfig.js";
import {getStorage,ref,getDownloadURL,uploadBytesResumable, deleteObject} from "firebase/storage";
import File from "../models/file.js";
import User from "../models/user.js";
const fileRouter = express.Router();

initializeApp(firebaseConfig);
const storage = getStorage();

const upload = multer({storage : multer.memoryStorage()});

fileRouter.get("/",wrapAsync(async (req,res)=>{
    if(req.user){
        let {fileName} = req.query;
        if(fileName){
            let user = await User.findOne({email : req.user._json.email}).populate({path : "files"});
            let files = user.files.filter(o=>o.name == fileName);
            if(files.length == 0){
                req.flash("error","No such file exists!");
                return res.redirect("/file");
            }
            return res.render("./file/show.ejs",{files});
        }
        let user = await User.findOne({email : req.user._json.email}).populate({path : "files"});
        return res.render("./file/show.ejs",{files : user.files});
    }
    res.render("./file/show.ejs");
    
}));

fileRouter.get("/upload",(req,res)=>{
    res.render("./file/upload.ejs");
})

fileRouter.post("/upload",isLoggedIn, upload.single('fileUpload'),wrapAsync(async (req,res)=>{
    try{
        if(req.file){
            let fileName = req.body.fileName || req.file.originalname;
            let userName = req.user._json.email;
            let user= await User.findOne({email : req.user._json.email}).populate("files");
            let obj = user.files.find(o=>o.name==fileName);
            if(!obj){
                const storageRef = ref(storage,"files/"+userName+fileName );
            const metadata = {
                contentType: req.file.mimetype,
            };
            const snapshot = await uploadBytesResumable(storageRef,req.file.buffer,metadata);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            
            let data = new File({
                name: fileName,
                url: downloadUrl,
            })
            data.owner = req.user._id;
            data = await data.save();
            let user = await User.findOne({email : req.user._json.email});
            user.files.push(data);
            await user.save();
            req.flash("success", "File Uploaded Successfully");
            res.redirect("/file");
            }else{
                req.flash("error", "File with similar name already exists");
                res.redirect("/file");
            }
            
        }
    }catch(e){
        console.log(e);
    }
}))

fileRouter.delete("/:name/:id",isLoggedIn, wrapAsync(async (req,res)=>{
    try{
        let {name,id} = req.params
    let fileName = req.user._json.email + name;
    let file = await File.findById(id);
    if(!file){
        req.flash("error","No such file exists");
        return res.redirect("/file");
    }
    const storageRef = ref(storage,"files/"+fileName );
    await deleteObject(storageRef);
    await File.findByIdAndDelete(id);
    let user = await User.findOne({email: req.user._json.email});
    let index = user.files.indexOf(id);
    user.files.splice(index,1);
    await user.save();
    req.flash("success", "File deleted successfully");
    res.redirect("/file");
    }catch(e){
        console.log(e);
    }
}))

export default fileRouter;