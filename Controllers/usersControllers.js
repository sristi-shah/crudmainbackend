const users = require("../models/usersSchema");
const moment=require("moment")
const csv=require("fast-csv")
const fs=require("fs")
const BASE_URL=process.env.BASE_URL
//register user
exports.userpost=async(req,res)=>{
    // console.log(req.file);
    // console.log(req.body);

    const file=req.file.filename;
    const {fname,lname,email,mobile,gender,location,status} = req.body;
    if(!fname || !lname || !email || !mobile || !gender || !location || !status){
        res.status(401).json("All inputs are required")
    }
    try{
        const peruser= await users.findOne({email:email});
        if(peruser){
            res.status(401).json("This user already exists")
        }else{
            const datecreated =moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
            const userData=new users({
                fname,lname,email,mobile,gender,location,status,profile:file,datecreated
            });
            await userData.save();
            res.status(200).json(userData);
        }
    }catch(error){
        res.status(401).json(error);
        console.log("catch block error")
    }
}

//user display(user get)
exports.userget=async(req,res)=> {
    const search=req.query.search || ""
    const gender=req.query.gender || ""
    const status=req.query.status || ""
    const sort=req.query.sort || ""
    
    const query={
        fname:{$regex:search,$options:"i"}
    }
    if(gender!=="All"){
        query.gender=gender
    }
    if(status!=="All"){
        query.status=status
    }

    try{
        const usersdata=await users.find(query)
        .sort({datecreated:sort=="New"?-1:1})

        res.status(200).json({usersdata})
    }catch(error){
        res.status(401).json(error)
        
    }
}

//single user page
exports.singleuserget=async(req,res)=> {
    const {id}=req.params;
    try{
        const usersdata=await users.findOne({_id:id});
        res.status(200).json(usersdata)
    }catch(error){
        res.status(401).json(error)
        
    }
}

//user edit
exports.useredit=async(req,res)=> {
    const {id}=req.params;
    const {fname,lname,email,mobile,gender,location,status,user_profile} = req.body;
    const file=req.file?req.file.filename:user_profile;
    
    const dateUpdated=moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
    try{
        const updateuser=await users.findByIdAndUpdate({_id:id},{
            fname,lname,email,mobile,gender,location,status,profile:file,dateUpdated
        },{
            new:true
        });
        await updateuser.save();
        res.status(200).json(updateuser);
    }catch(error){
        res.status(401).json(error)
        
    }
}

exports.userdelete=async(req,res)=> {
    const {id}=req.params;
    try{
        const deleteuser=await users.findByIdAndDelete({_id:id});
        res.status(200).json(deleteuser);
    }catch(error){
        res.status(401).json(error)
        
    }
}
//change status
exports.userstatus=async(req,res)=> {
    const {id}=req.params;
    const {data}=req.body;
    try{
        const userstatusupdate=await users.findByIdAndUpdate({_id:id},{status:data},{new:true});
        res.status(200).json(userstatusupdate);
    }catch(error){
        res.status(401).json(error)
        
    }

}
//export to csv
exports.userExport=async(req,res)=> {
    try{
        const usersdata=await users.find();
        const csvStream=csv.format({headers:true});
        if(!fs.existsSync("public/files/export")){
            if(!fs.existsSync("public/files")){
                fs.mkdirSync("public/files/")
            }
            if(!fs.existsSync("public/files/export")){
                fs.mkdirSync("./public/files/export")
            }
        }
        const writablestream=fs.createWriteStream(
            "public/files/export/users.csv"
        )
        csvStream.pipe(writablestream);
        writablestream.on("finish",function(){
            res.json({
                downloadUrl:`${BASE_URL}/files/export/users.csv`
            })
        })

        if (usersdata.length > 0) {
            usersdata.map((user) => {
                csvStream.write({
                    FirstName: user.fname ? user.fname : "-",
                    LastName: user.lname ? user.lname : "-",
                    Email: user.email ? user.email : "-",
                    Phone: user.mobile ? user.mobile : "-",
                    Gender: user.gender ? user.gender : "-",
                    Status: user.status ? user.status : "-",
                    Profile: user.profile ? user.profile : "-",
                    Location: user.location ? user.location : "-",
                    DateCreated: user.datecreated ? user.datecreated : "-",
                    DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
                })
            })
        }
        csvStream.end();
        writablestream.end();
        
    }catch(error){
        res.status(401).json(error)
        
    }

}