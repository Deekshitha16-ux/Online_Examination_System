let TestPaperModel = require("../models/testpaper");
const appRoot = require("app-root-path");
const path = require("path");
const fs = require("fs");
let FeedbackModel=require("../models/feedback");
let resultBuffer = require("./excel").resultBuffer;

let stopRegistration = (req,res,next)=>{
    if(req.user.type==='TRAINER'){
        
        var id  =  req.body.id;
        var s = req.body.status;
        TestPaperModel.findById(id,{testbegins:1,testconducted:1}).then((d)=>{
            if(d){
                if(d.testbegins!=true && d.testconducted!=true){
                    TestPaperModel.findOneAndUpdate({_id : id},{isRegistrationavailable : s})      
                    .exec(function (err){
                        if (err){
                            console.log(err)
                            res.status(500).json({
                                success : false,
                                message : "Unable to change registration status"
                            })
                        }
                        else{
                            res.json({
                                success : true,
                                message : `Registration status changed!`,
                                currentStatus : s
                            })       
                        }
                    })
                }
                else{
                    res.json({
                        success : false,
                        message : "Unable to change registration status"
                    })
                }
            }
            else{
                res.status(500).json({
                    success : false,
                    message : "Unable to change registration status"
                })
            }

        }).catch((e)=>{
            console.log(e);
            res.status(500).json({
                success : false,
                message : "Unable to change registration status"
            })
        })
    }
 
    else{
        res.status(401).json({
            success : false,
            message : "Permissions not granted!"
        })
    }
}
/*
let Download = (req,res,next)=>{
    var testid = req.body.id;
    if(req.user.type === 'TRAINER'){
        const file = `${appRoot}/public/result/result-${testid}.xlsx`;
        res.download(file);
    }else{
       res.status(401).json({
           success : false,
           message : "Permissions not granted!"
       })
    }

}
*/
let Download = (req,res,next)=>{
    var testid = req.body.id;
    if(req.user.type === 'TRAINER'){
        const file = path.join(__dirname, '..', 'public', 'result', `result-${testid}.xlsx`);
        if (!req.body.download) {
            res.json({
                success : true,
                message : 'File sent successfully',
                file : `${req.protocol + '://' + req.get('host')}/result/result-${testid}.xlsx`
            })
            return;
        }
        if (!fs.existsSync(file)) {
            resultBuffer(testid).then((buffer)=>{
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="result-${testid}.xlsx"`);
                res.send(buffer);
            }).catch((err)=>{
                console.log(err);
                res.status(500).json({
                    success : false,
                    message : "Unable to generate result sheet."
                })
            })
            return;
        }
        res.download(file, `result-${testid}.xlsx`);
    }else{
       res.status(401).json({
           success : false,
           message : "Permissions not granted!"
       })
    }

}




let getFeedBack =(req,res,next)=>{
    var testid = req.body.testid;
    if(req.user.type === 'TRAINER'){
        FeedbackModel.find({testid:testid})
        .populate('userid')
        .exec((err,data)=>{
            if(err){
                console.log(err);
                res.status(500).json({
                    success:false,
                    message:"Server Error"
                })
            }
            else{
                res.json({
                    success:true,
                    message:"Feedbacks Sent Successfully",
                    data:data
                })
            } 
        })
    }else{
       res.status(401).json({
           success : false,
           message : "Permissions not granted!"
       })
    }
}

module.exports = {stopRegistration,Download,getFeedBack}
