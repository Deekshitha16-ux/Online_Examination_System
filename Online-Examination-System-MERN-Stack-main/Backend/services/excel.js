var Excel = require('exceljs');
var path=require('path');
var fs=require("fs");
var gresults = require("./generateResults");
var ResultModel = require("../models/results");
var AnswersheetModel = require("../models/answersheet");
var TestpaperModel = require("../models/testpaper");
var QuestionModel = require("../models/questions");

let getMaxMarks = (testid)=>{
  return new Promise((resolve,reject)=>{
    TestpaperModel.findOne({_id:testid},{questions:1})
    .populate({
      path : 'questions',
      model : QuestionModel,
      select : {'weightage' : 1}
    })
    .exec(function(err,test){
      if(err){
        reject(err)
      }else if(!test){
        reject(new Error('Invalid testid'))
      }else{
        let marks = 0;
        test.questions.map((question)=>{
          marks += question.weightage;
        })
        resolve(marks)
      }
    })
  })
}

let buildWorkbook = (testid, MaxMarks)=>{
  var workbook = new Excel.Workbook();
  return new Promise((resolve,reject)=>{
    TestpaperModel.findOne({_id : testid,testconducted : true},{testconducted : 1,type:1,title:1}).then((test)=>{
      if(!test){
        reject(new Error('Result is not available for this test'))
      }else{
        ResultModel.find({testid : testid},{score : 1,userid : 1,testid: 1})
        .populate('userid')
        .populate('testid')
        .exec(function(err,results){
          if(err){
            reject(err)
          }else{
            const maxMarksLoader = MaxMarks || getMaxMarks;
            maxMarksLoader(testid).then((Mmarks)=>{
              var worksheet = workbook.addWorksheet('Results',{pageSetup:{paperSize: 9, orientation:'landscape'}});
              worksheet.columns = [
                { header: 'Type', key: 'Type', width: 20 },
                { header: 'Test-Title', key: 'Title', width: 20 },
                { header: 'Name', key: 'Name', width: 30 },
                { header: 'Email', key: 'Email', width: 70 },
                { header: 'Contact', key: 'Contact', width: 35, outlineLevel: 1 },
                { header: 'Organisation', key: 'Organisation', width: 70 },
                { header: 'Score', key: 'Score', width: 20 },
                { header: 'Max Marks', key: 'Outof', width : 20}
              ];
              results.map((d)=>{
                worksheet.addRow({Name: d.userid.name, Email: d.userid.emailid, Contact : d.userid.contact,Organisation : d.userid.organisation,Type : d.testid.type,Title : d.testid.title,Score : d.score,Outof:Mmarks});
              })
              resolve(workbook);
            }).catch((err)=>{
              reject(err)
            })
          }
        })
      }
    }).catch((err)=>{
      reject(err)
    })
  })
}

let result = (testid,MaxMarks)=>{
  console.log('1')
  return buildWorkbook(testid, MaxMarks).then((workbook)=>{
    return new Promise((resolve,reject)=>{
      const resultDir = path.join(__dirname, '..', 'public', 'result');
      const resultFile = path.join(resultDir, `result-${testid}.xlsx`);
      fs.mkdir(resultDir, { recursive: true }, (mkdirErr) => {
        if (mkdirErr) {
          reject(mkdirErr)
          return;
        }
        workbook.xlsx.writeFile(resultFile)
        .then(function(r) {
          resolve("Done");
        }).catch((err)=>{
          console.log(err);
          reject(err)
        })
      })
    })
  })
}

let resultBuffer = (testid)=>{
  return buildWorkbook(testid).then((workbook)=>{
    return workbook.xlsx.writeBuffer();
  })
}

module.exports ={result,resultBuffer};
    
