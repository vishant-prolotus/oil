var express = require('express');
var app = express();
var Utils = require('../utils');
var router=express.Router();
var invokeBorrower=require('../Chaincodecall-API/api.js');
var invoke = require('../app/invoke-transaction.js');
var query = require('../app/query.js');
var config=require('../config.json');
var crypto=require('crypto');
var config=require('../config.json');
var helper=require('../app/helper.js');
var jwt = require('jsonwebtoken');
var crypto=require('crypto');
const mongo = require('mongodb');
var ObjectID   = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var peers=config.peers;


router.post('/getInitData',function(req,res){
	Utils.InitData().then(function(response) {
        return res.json({
        success: true,
        mongodb:response
        }).send();
    })
});

router.post('/readData',function(req,res){
	var arg = req.body.arg;
   var args=[];
    args.push(arg);
    query.queryChaincode('peer1', config.channelName, config.chaincodeName, args, 'read', req.username, req.orgname).then(function(message) {
	    res.json(message).send();
    });
});

router.post('/requestFinancialStatement',function(req,res){
    var borrowerId=req.body.borrowerId;
    var auditorId=req.body.auditorId;
    var requestId=crypto.createHash('md5').update(borrowerId+auditorId+Date.now()).digest('hex');

    var args=[requestId,borrowerId,auditorId];
    var fcn='requestFinancialStatement';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        if(!message) return res.send('error');

        Utils.SaveFinancialRequest(borrowerId,auditorId,requestId).then(function(data,err){
            if(err) return res.send(err);

            return res.json({
            success: true,
            message: message,
            mongodb:data
            }).send();
        });
    });
});

router.post('/addFinancialStatement',function(req,res){
    var Value;
    var fileData;
    req.pipe(req.busboy);
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        Value = JSON.parse(value);
    });
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        let chunks = [];
        file.on('data', function(chunk) {
            chunks.push(chunk);
        });
        file.on('end', function() {
            var fileData = Buffer.concat(chunks);
            fileData     = new mongo.Binary(fileData);
        });
    });
    req.busboy.on('finish', function() {
        var auditorId=Value.auditorId;//
        var requestId=Value.requestId;//
        var creditDays=Value.creditDays;//
        var date=JSON.stringify(Value.date);//
        var loanAmount=Value.loanAmount;//
        var obj = {
        auditorId:Value.auditorId,
        date:JSON.stringify(Value.date)
        };
        var string = JSON.stringify(obj);
        var hash = crypto.createHash('md5').update(string).digest('hex');
        var reportId=hash;//
        var args=[requestId,auditorId,reportId,creditDays,date,loanAmount];
        var collection = global.db.collection('Files');
        var fcn='addFinancialStatement';

        invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
            if(!message) return res.send('error');

                collection.insertOne({"Docs":fileData,"_id":hash,"Date":date}, function(err, response) {
                    if(err){
                        return res.send(err);
                    }

                    return res.json({
                    success: true,
                    message: message,
                    mongod:response
                    }).send();
                });
        });
    });
});

router.post('/addComplianceCertificate',function(req,res){
    var Value;
    var fileData;
    req.pipe(req.busboy);
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        Value = JSON.parse(value);
    });
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        let chunks = [];
        file.on('data', function(chunk) {
            chunks.push(chunk);
        });
        file.on('end', function() {
            var fileData = Buffer.concat(chunks);
            fileData     = new mongo.Binary(fileData);
        });
    });
    req.busboy.on('finish', function() {
        var obj = {
        borrowerId:Value.borrowerId,
        date:JSON.stringify(Value.date)
        };
        var string = JSON.stringify(obj);
        var hash = crypto.createHash('md5').update(string).digest('hex');
        var borrowerId=Value.borrowerId;
        var complianceRepId=hash;
        var date=JSON.stringify(Value.date);
        var args=[borrowerId,complianceRepId,date];
        console.log(args);
        var fcn='addComplianceCertificate';
        var collection = global.db.collection('Files');
        invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
            if(!message) return res.send('error');

            collection.insertOne({"Docs":fileData,"_id":hash,"Date":date}, function(err, response) {
                if(err){
                    return res.send(err);
                }

                return res.json({
                success: true,
                message: message,
                mongod:response
                }).send();
            });
        });
    });
});


router.post('/createCase',function(req,res){
    var values =[];
    let Docs = [];
    req.pipe(req.busboy);
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        values.push(value);
    });
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        let chunks = [];
        file.on('data', function(chunk) {
            chunks.push(chunk);
        });
        file.on('end', function() {
            var fileData = Buffer.concat(chunks);
            fileData     = new mongo.Binary(fileData);
            Docs.push(fileData);
        });
    });
    req.busboy.on('finish', function() {
        var Time = new Date();
        var value = JSON.parse(values[0]);
        var obj = {
        TimeStamp:Time,
        id:value.borrowerId
        };
        var string = JSON.stringify(obj);
        var hash = crypto.createHash('md5').update(string).digest('hex');
        var borrowerId=value.borrowerId;//borower id
        var CaseId=hash;//hash
        var amountRequested=value.amountRequested;
        var adminAgentId=value.adminAgentId;//adminid
        var requestTo=value.requestTo;//engineerid
        var numOfDocs=''+Docs.length;
        var args=[borrowerId,CaseId,amountRequested,adminAgentId,requestTo,numOfDocs];
        for (var i=0;i<Docs.length;i++){
            var obj = {
                TimeStamp:Time,
                id:value.borrowerId,
                docId:i
                };
            var string = JSON.stringify(obj);
            var docName = 'Docs';
            var docId = crypto.createHash('md5').update(string).digest('hex');
            args.push(docName);
            args.push(docId);
        }
        
        var fcn='createCase';
        invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
            if(!message) return res.send('error');

            var collection = global.db.collection('Files');
            for(var i=0;i<Docs.length;i++) {
                var obj = {
                    TimeStamp:Time,
                    id:value.borrowerId,
                    docId:i
                    };
                var string = JSON.stringify(obj);
                var hash = crypto.createHash('md5').update(string).digest('hex');
                collection.insertOne({"Docs":Docs[i],"_id":hash,"Case_id":CaseId}, function(err, response) {
                if(err){
                    return res.send(err);
                }
                });
            }
            var collection = global.db.collection('Cases');
            collection.insertOne({"value":JSON.parse(values),"_id":CaseId}, function(err, response) {
            if(err){
                return res.send(err);
            }
                return res.json({
                success: true,
                message: message,
                mongod:response
                }).send();
            });
        });
        
    });
});

router.post('/makeReserveReport',function(req,res){
    var Value;
    var fileData;
    req.pipe(req.busboy);
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        Value=JSON.parse(value);
    });
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        let chunks = [];
        file.on('data', function(chunk) {
            chunks.push(chunk);
        });
        file.on('end', function() {
            fileData = Buffer.concat(chunks);
            fileData = new mongo.Binary(fileData);
        });
    });
    req.busboy.on('finish', function() {
        var Time = new Date();
        var obj = {
        TimeStamp:Time,
        id:Value.engineerId
        };
        var string = JSON.stringify(obj);
        var hash = crypto.createHash('md5').update(string).digest('hex');
        var engineerId=Value.engineerId;
        var reqId= Value.requestId;
        var reportId=hash;//doc id 
        var date=JSON.stringify(Value.date);
        var developed=Value.developed;
        var undeveloped=Value.undeveloped;

        var args=[engineerId,reqId,reportId,date,developed,undeveloped];
        var fcn='makeReserveReport';
        invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
            if(!message) return res.send('error');

            var collection = global.db.collection('Files');
            collection.insertOne({"_id":reportId,"engineerId":engineerId,"Docs":fileData}, function(err, response) {
            if(err){
                return res.send(err);
            }
                return res.json({
                success: true,
                message: message,
                mongod:response
                }).send();
            });            
        });
    });
    
});


router.post('/updateLoanPackage',function(req,res){
    var administrativeAgentId=req.body.administrativeAgentId;//
    var CaseId=req.body.CaseId;//
    var status='verified';//

    var args=[administrativeAgentId,CaseId,status];
    var fcn='updateLoanPackage';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeProposals',function(req,res){
    var lenderId=req.body.lenderId;//
    var caseId=req.body.caseId;//
    var adminId=req.body.adminId;//
    var amount=req.body.amount;//
    var args=[lenderId,caseId,adminId,amount];
    var fcn='makeProposals';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeLoanPackage',function(req,res){
    let obj={
        date:req.body.approvalDate,
        Id:req.body.adminId,
    }
    var string = JSON.stringify(obj);
    var hash = crypto.createHash('md5').update(string).digest('hex');
    var adminId=req.body.adminId;//
    var caseId=req.body.caseId;//
    var loanId=hash;//hash
    var approvalDate=JSON.stringify(req.body.approvalDate);//
    var term=req.body.term//
    var loanAmount=req.body.loanAmount;//
    var numOfLenders=req.body.numOfLenders;//
    var lenders=req.body.lenders;//
    var args=[adminId,caseId,loanId,approvalDate,term,loanAmount,numOfLenders,lenders];
    var fcn='makeLoanPackage';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeCreditAgreement',function(req,res){
    let obj={
        loan:req.body.loanId,
        Id:req.body.adminId,
    }
    var string = JSON.stringify(obj);
    var hash = crypto.createHash('md5').update(string).digest('hex');
    var adminId=req.body.adminId;
    var creditId=hash;//hash
    var loanId=req.body.loanId;
    var interval=req.body.interval;
    var reserveRequired=req.body.reserveRequired;
    var args=[adminId,creditId,loanId,interval,reserveRequired];
    var fcn='makeCreditAgreement';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});


router.post('/breakHedgeForAdmin',function(req,res){
    var adminId=req.body.adminId;
    var hedgeId=req.body.hedgeId;
    var markToMarket=req.body.markToMarket;
    
    var args=[adminId,hedgeId,markToMarket];
    var fcn='breakHedgeForAdmin';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

 router.post('/addHedgeAgreementByAdminAgent',function(req,res){
    var adminId=req.body.adminId;
    var loanId=req.body.loanId;
    var hedgeId=req.body.hedgeId;
    var baseValue=req.body.baseValue;
    var docId=req.body.docId;//hash
    var docName='Doc';
    var hedgers=req.body.hedgers;
    var numOfHedgers=hedgers.length;
    var args=[adminId,loanId,hedgeId,baseValue,docId,docName,numOfHedgers];
    args.push(hedgers);
    var fcn='addHedgeAgreementByAdminAgent';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/addHedgeAgreementByLender',function(req,res){
    var lenderId=req.body.lenderId;
    var hedgeId = crypto.createHash('md5').update(lenderId+Date.now()).digest('hex');
    var loanId=req.body.loanId;
    var baseVaule=req.body.baseValue;
    var docId=req.body.docId
    var docName=req.body.docName;
    var args=[lenderId,hedgeId,loanId,baseVaule,documentId,docName];
    var fcn='addHedgeAgreementByLender';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/updateReserveRep',function(req,res){//engineer
    var Value;
    var fileData;
    req.pipe(req.busboy);
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        Value=JSON.parse(value);
    });
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        let chunks = [];
        file.on('data', function(chunk) {
            chunks.push(chunk);
        });
        file.on('end', function() {
            fileData = Buffer.concat(chunks);
            fileData = new mongo.Binary(fileData);
        });
    });
    req.busboy.on('finish', function() {
        let obj ={
            date:JSON.stringify(Value.date),
            engineerId:Value.engineerId
        }
        var string = JSON.stringify(obj);
        var hash = crypto.createHash('md5').update(string).digest('hex');
        var engineerId=Value.engineerId;
        var creditId=Value.creditId;
        var reportId=hash;//hash
        var date=JSON.stringify(Value.date);
        var developedCrude=Value.developedCrude;
        var undevelopedCrude=Value.undevelopedCrude;//////////
        var args=[engineerId,creditId,reportId,date,developedCrude,undevelopedCrude];
        var fcn='updateReserveRep';
        console.log(args);
        invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
            if(!message) return res.send('error');

            var collection = global.db.collection('Files');
            collection.insertOne({"_id":reportId,"engineerId":engineerId,"Docs":fileData}, function(err, response) {
            if(err){
                return res.send(err);
            }
                return res.json({
                success: true,
                message: message,
                mongod:response
                }).send();
            });            
        });
    });
});

module.exports=router;

