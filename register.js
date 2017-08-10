var express = require('express');
var app = express();
var ObjectID   = require('mongodb').ObjectID;
const mongo = require('mongodb');
var helper = require('./app/helper.js');
var router=express.Router();
var jwt = require('jsonwebtoken');
var invokeBorrower=require('./Chaincodecall-API/api.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var config=require('./config.json');
var crypto=require('crypto');
var Utils = require('./utils');
var config=require('./config.json');
var peers=config.peers;


router.get('/notify',function(req,res){
    global.response=res;
    global.request=req;
});

router.post('/',function(req,res){
    var type = req.body.UserType;
    switch(type){
        case "Lender":
            RegisterLender(req,res);
            break;
        case "Admin":
            RegisterAdmin(req,res);
            break;
        case "Auditor":
            RegisterAuditor(req,res);
            break;
        case "Engineer":
            RegisterEngineer(req,res);
            break;
        case "Borrower":
            RegisterBorrower(req,res);
            break;
    }
});


function RegisterBorrower(req,res){
    
    var obj = {
        TimeStamp:new Date(),
        name:req.body.Name,
        number:req.body.phone,
        email:req.body.Email
    };
    var string = JSON.stringify(obj);
    Utils.CheckUser(req.body.Name,req.body.phone,req.body.Email,req.body.UserType).then(function(record){
        if(record!=null) return res.send('user already registered');

        Utils.CreateID(string).then(function(result,error){
            if(error) return res.send(error);

            var number=req.body.phone;
            var username = req.body.Name;
            var buisness_no = req.body.LegalBNo;
            var taxId_no = req.body.TaxIdNo;
            var passwrd = req.body.password;
            var type = req.body.UserType;
            var orgName = "org1";
            var registrationId='reg3';//
            var email=req.body.Email;//
            var BorrowerId = result;//
            var name=''+req.body.Name;//
            var args=[];
            args.push(BorrowerId,name,registrationId,email);
            var fcn='initBorrower';
            
            var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
            username: username,
            orgName: orgName
            }, 'thisismysecret');
            helper.getRegisteredUsers(username, orgName, true).then(function(response) {
                if (response && typeof response !== 'string') {
                    response.token = token;

                    invoke.invokeChaincode(peers, config.channelName, config.chaincodeName, fcn, args, username,orgName )
                    .then(function(message) {
                        if(!message) return res.send('error');

                        Utils.SaveUser(BorrowerId,name,number,email,type,buisness_no,taxId_no,passwrd).then(function(data,err){
                            if(err) return res.send(err);

                            return res.json({
                            success: true,
                            message: message,
                            response:response,
                            mongodb:data
                            }).send();
                        });
                    });
                } else {
                    return res.json({
                        success: false,
                        message: response
                    }).send();
                }
            });
        });
    });
    //invokeBorrower.initBorrower(id,name,number,email,req,res);
}


function RegisterAdmin(req,res){
    var obj = {
        TimeStamp:new Date(),
        name:req.body.Name,
        number:req.body.phone,
        email:req.body.Email
    };
    var string = JSON.stringify(obj);
    Utils.CheckUser(req.body.Name,req.body.phone,req.body.Email,req.body.UserType).then(function(record){
        if(record!=null) return res.send('user already registered');

        Utils.CreateID(string).then(function(result,error){
            if(error) return res.send(error);

            var number=req.body.phone;
            var username = req.body.Name;
            var buisness_no = req.body.LegalBNo;
            var taxId_no = req.body.TaxIdNo;
            var passwrd = req.body.password;
            var type = req.body.UserType;
            var orgName = "org1";
            var registrationId='reg2';//
            var email=req.body.Email;//
            var AdminId = result;//
            var name=''+req.body.Name;//
            var args=[];
            args.push(AdminId,name,email);
            var fcn='initAdministrativeAgent';
            
            var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
            username: username,
            orgName: orgName
            }, 'thisismysecret');
            helper.getRegisteredUsers(username, orgName, true).then(function(response) {
                if (response && typeof response !== 'string') {
                    response.token = token;

                    invoke.invokeChaincode(peers, config.channelName, config.chaincodeName, fcn, args, username,orgName )
                    .then(function(message) {
                        if(!message) return res.send('error');

                        Utils.SaveUser(AdminId,name,number,email,type,buisness_no,taxId_no,passwrd).then(function(data,err){
                            if(err) return res.send(err);

                            return res.json({
                            success: true,
                            message: message,
                            response:response,
                            mongodb:data
                            }).send();
                        });
                    });
                } else {
                    return res.json({
                        success: false,
                        message: response
                    }).send();
                }
            });
        });
    });
}


function RegisterLender(req,res){
        
    var obj = {
        TimeStamp:new Date(),
        name:req.body.Name,
        number:req.body.phone,
        email:req.body.Email
    };
    var string = JSON.stringify(obj);
    Utils.CheckUser(req.body.Name,req.body.phone,req.body.Email,req.body.UserType).then(function(record){
        if(record!=null) return res.send('user already registered');

        Utils.CreateID(string).then(function(result,error){
            if(error) return res.send(error);

            var number=req.body.phone;
            var username = req.body.Name;
            var buisness_no = req.body.LegalBNo;
            var taxId_no = req.body.TaxIdNo;
            var passwrd = req.body.password;
            var type = req.body.UserType;
            var orgName = "org1";
            var email=req.body.Email;//
            var lenderId = result;//
            var name=''+req.body.Name;//
            var args=[];
            args.push(lenderId,name,email);
            var fcn='initLender';
            
            var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
            username: username,
            orgName: orgName
            }, 'thisismysecret');
            helper.getRegisteredUsers(username, orgName, true).then(function(response) {
                if (response && typeof response !== 'string') {
                    response.token = token;

                    invoke.invokeChaincode(peers, config.channelName, config.chaincodeName, fcn, args, username,orgName )
                    .then(function(message) {
                        if(!message) return res.send('error');

                        Utils.SaveUser(lenderId,name,number,email,type,buisness_no,taxId_no,passwrd).then(function(data,err){
                            if(err) return res.send(err);

                            return res.json({
                            success: true,
                            message: message,
                            response:response,
                            mongodb:data
                            }).send();
                        });
                    });
                } else {
                    return res.json({
                        success: false,
                        message: response
                    }).send();
                }
            });
        });
    });
}

function RegisterAuditor(req,res){
   
    var obj = {
        TimeStamp:new Date(),
        name:req.body.Name,
        number:req.body.phone,
        email:req.body.Email
    };
    var string = JSON.stringify(obj);
    Utils.CheckUser(req.body.Name,req.body.phone,req.body.Email,req.body.UserType).then(function(record){
        if(record!=null) return res.send('user already registered');

        Utils.CreateID(string).then(function(result,error){
            if(error) return res.send(error);

            var number=req.body.phone;
            var username = req.body.Name;
            var buisness_no = req.body.LegalBNo;
            var taxId_no = req.body.TaxIdNo;
            var passwrd = req.body.password;
            var type = req.body.UserType;
            var orgName = "org1";
            var registrationId='reg2';//
            var email=req.body.Email;//
            var AuditorId = result;//
            var name= req.body.Name;//
            var args=[];
            args.push(AuditorId,name,email);
            var fcn='initAuditor';
            
            var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
            username: username,
            orgName: orgName
            }, 'thisismysecret');
            helper.getRegisteredUsers(username, orgName, true).then(function(response) {
                if (response && typeof response !== 'string') {
                    response.token = token;

                    invoke.invokeChaincode(peers, config.channelName, config.chaincodeName, fcn, args, username,orgName )
                    .then(function(message) {
                        if(!message) return res.send('error');

                        Utils.SaveUser(AuditorId,name,number,email,type,buisness_no,taxId_no,passwrd).then(function(data,err){
                            if(err) return res.send(err);

                            return res.json({
                            success: true,
                            message: message,
                            response:response,
                            mongodb:data
                            }).send();
                        });
                    });
                } else {
                    return res.json({
                        success: false,
                        message: response
                    }).send();
                }
            });
        });
    });
}

function RegisterEngineer(req,res){
    
    var obj = {
        TimeStamp:new Date(),
        name:req.body.Name,
        number:req.body.phone,
        email:req.body.Email
    };
    var string = JSON.stringify(obj);
    Utils.CheckUser(req.body.Name,req.body.phone,req.body.Email,req.body.UserType).then(function(record){
        if(record!=null) return res.send('user already registered');

        Utils.CreateID(string).then(function(result,error){
            if(error) return res.send(error);

            var number=req.body.phone;
            var username = req.body.Name;
            var buisness_no = req.body.LegalBNo;
            var taxId_no = req.body.TaxIdNo;
            var passwrd = req.body.password;
            var type = req.body.UserType;
            var orgName = "org1";
            var registrationId='reg2';//
            var email=req.body.Email;//
            var BorrowerId = result;//
            var name=''+req.body.Name;//
            var args=[];
            args.push(BorrowerId,name,registrationId,email);
            var fcn='initEngineer';
            
            var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(config.jwt_expiretime),
            username: username,
            orgName: orgName
            }, 'thisismysecret');
            helper.getRegisteredUsers(username, orgName, true).then(function(response) {
                if (response && typeof response !== 'string') {
                    response.token = token;

                    invoke.invokeChaincode(peers, config.channelName, config.chaincodeName, fcn, args, username,orgName )
                    .then(function(message) {
                        if(!message) return res.send('error');

                        Utils.SaveUser(BorrowerId,name,number,email,type,buisness_no,taxId_no,passwrd).then(function(data,err){
                            if(err) return res.send(err);

                            return res.json({
                            success: true,
                            message: message,
                            response:response,
                            mongodb:data
                            }).send();
                        });
                    });
                } else {
                    return res.json({
                        success: false,
                        message: response
                    }).send();
                }
            });
        });
    });    
}

module.exports=router;