var express = require('express');
var app = express();
var router=express.Router();
var invokeBorrower=require('../Chaincodecall-API/api.js');
var invoke = require('../app/invoke-transaction.js');
var query = require('../app/query.js');
var config=require('../config.json');
var crypto=require('crypto');
var config=require('../config.json');
var helper=require('../app/helper.js');
var jwt = require('jsonwebtoken');
var peers=config.peers;

router.get('/readData',function(req,res){
	let arg = req.query.arg;
    console.log(arg);
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
        res.send(message);
    });
});

router.post('/addFinancialStatement',function(req,res){
    var reportId=req.body.reportId;
    var auditorId=req.body.auditorId;
    var requestId=req.body.requestId;
    var creditDays=req.body.creditDays;
    var date=req.body.date;
    var loanAmount=req.body.loanAmount;

    var args=[requestId,auditorId,reportId,creditDays,date,loanAmount];
    var fcn='addFinancialStatement';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/addComplianceCertificate',function(req,res){
    var borrowerId=req.body.borrowerId;
    var complianceRepId=req.body.complianceRepId;
    var date=req.body.date;
    

    var args=[borrowerId,complianceRepId,date];
    var fcn='addComplianceCertificate';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});


router.post('/createCase',function(req,res){
    var borrowerId=req.body.borrowerId;
    var CaseId=req.body.CaseId;
    var amountRequested=req.body.amountRequested;
    var adminAgentId=req.body.adminAgentId;
    var requestTo=req.body.requestTo;
    var numOfDocs=req.body.numOfDocs;
    var docs=req.body.docs;
    var args=[borrowerId,CaseId,amountRequested,adminAgentId,requestTo,numOfDocs];
    for (var i=0;i<docs.length;i++){
        args.push(docs[i].docName);
        args.push(docs[i].docId);
    }
    
    var fcn='createCase';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeReserveReport',function(req,res){
    var engineerId=req.body.engineerId;
    var reqId=req.body.reqId;
    var reportId=req.body.reportId;
    var date=req.body.date;
    var developed=req.body.developed;
    var undeveloped=req.body.undeveloped;

    var args=[engineerId,reqId,reportId,date,developed,undeveloped];
    var fcn='makeReserveReport';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});


router.post('/updateLoanPackage',function(req,res){
    var administrativeAgentId=req.body.administrativeAgentId;
    var CaseId=req.body.CaseId;
    var status=req.body.status;

    var args=[administrativeAgentId,CaseId,status];
    var fcn='updateLoanPackage';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeProposals',function(req,res){
    var lenderId=req.body.lenderId;
    var caseId=req.body.caseId;
    var adminId=req.body.adminId;
    var amount=req.body.amount;
    var args=[lenderId,caseId,adminId,amount];
    var fcn='makeProposals';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeLoanPackage',function(req,res){
    var adminId=req.body.adminId;
    var caseId=req.body.caseId;
    var loanId=req.body.loanId;
    var approvalDate=req.body.approvalDate;
    var term=req.body.term
    var loanAmount=req.body.loanAmount;
    var numOfLenders=req.body.numOfLenders;
    var lenders=req.body.lenders;
    var args=[adminId,caseId,loanId,approvalDate,term,loanAmount,numOfLenders,lenders];
    var fcn='makeLoanPackage';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/makeCreditAgreement',function(req,res){
    var adminId=req.body.adminId;
    var creditId=req.body.creditId;
    var loanId=req.body.loanId;
    var interval=req.body.interval;
    var reserveRequired=req.body.reserveRequired;
    var args=[adminId,creditId,loanId,interval,reserveRequired];
    var fcn='makeCreditAgreement';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});


router.post('/initHedger',function(req,res){
    var hedgerId=req.body.hedgerId;
    var name=req.body.name;
    var email=req.body.email;
    
    var args=[hedgerId,name,email];
    var fcn='initHedger';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/requestHedging',function(req,res){
    var borrowerId=req.body.borrowerId;
    var requestId=req.body.requestId;
    var hedgerId=req.body.hedgerId;
    var loanId=req.body.loanId;
    var args=[borrowerId,requestId,hedgerId,loanId];
    var fcn='requestHedging';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/AddHedgeAggreement',function(req,res){
    var hedgerId=req.body.hedgerId;
    var requestId=req.body.requestId;
    var documentId=req.body.documentId;
    var docName=req.body.docName;
    var args=[hedgerId,requestId,documentId,docName];
    var fcn='AddHedgeAggreement';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        res.send(message);
    });
});

router.post('/updateReserveRep',function(req,res){
    var engineerId=req.body.engineerId;
    var creditId=req.body.creditId;
    var reportId=req.body.reportId;
    var date=req.body.date;
    var developedCrude=req.body.developedCrude;
    var undevelopedCrude=req.body.undevelopedCrude;
    var args=[engineerId,creditId,reportId,date,developedCrude,undevelopedCrude];
    var fcn='updateReserveRep';
    invoke.invokeChaincode(peers,config.channelName,config.chaincodeName,fcn,args,req.username,req.orgname).then(function(message){
        console.log('The message is'+message);
        res.send(message);
    });
});

// router.post('/test',function(req,res){
//     helper.enrollUser(req.body.username,'org1',req.body.secret,req,res);
// });

module.exports=router;

