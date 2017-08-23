var crypto=require('crypto');
const mongo = require('mongodb');
var query = require('./app/query.js');
var config=require('./config.json');
var ObjectID   = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');


module.exports = {

    CreateID: function(secret){
        return new Promise(function(resolve,reject){
            var string = crypto.createHash('md5').update(secret).digest('hex');
            resolve(string);
        });
    },

    SaveUser: function(ID,name,number,email,type,buisness_no,taxId_no,passwrd){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection('Users');
            collection.insertOne({"_id":ID,"User_name":name,"Contact_no":number,"Email":email
            ,"buisness_no":buisness_no,"tax_id":taxId_no,"password":passwrd,"type":type}, function(err, res) {
                if(err){
                    reject(err);
                }
                resolve(res);
                });
        });
    },

    GetUser: function(username,orgName,passwrd){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection('Users');
            collection.findOne({$and:[{"password":passwrd},{"User_name":username}]}, {fields:{User_name:1,type:1}},function(err, res) {
                if(err){
                    reject(err);
                }

                resolve(res);
            });
        });
    },

    GetStatements: function(req,res) {
        return new Promise(function(resolve,reject) {
            var collection = global.db.collection('request');
            collection.findOne({},{fields:{document:1}}, function(err, response) {
            if(err){
                reject(err);
            }
            resolve(response);
            });
        });
    },

    InitData: function() {
        return new Promise(function(resolve,reject){
            var collection = global.db.collection('Users');
            collection.find({"type":"Auditor"}).toArray(function(Ae, Ar) {
                collection.find({"type":"Admin"}).toArray(function(Ade, Adr) {
                    collection.find({"type":"Engineer"}).toArray(function(Ee, Er) {
                        collection.find({"type":"Lender"}).toArray(function(Le, Lr) {
                            resolve({
                            Auditor:Ar,
                            Admin:Adr,
                            Engineer:Er,
                            Lender:Lr
                            });
                        });
                    });
                });
            });
        });
    },

    CheckUser: function(name,phone,email,type){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection('Users');
            collection.findOne({$or:[{"User_name":name},{"Contact_no":phone},{"Email":email}]}, {fields:{User_name:1,type:1}},function(err, res) {
                if(err){
                    reject(err);
                }
                resolve(res);
            });
        });
    },
    
    BreakHedgeForAdmin: function(id,hid,req) {
        var args=[];
        args.push(id);
        query.queryChaincode('peer1', config.channelName, config.chaincodeName, args, 'read', req.username, req.orgname).then(function(data) {
            var temp = JSON.parse(data);
            var abc = temp.hedgeAgreements;
            var na=[];
            var notify=[];
            _.each(abc,function(obj) {
                if(obj.hedgeId==hid){
                    na.push(obj.loanId);
                }
            });
            _.each(na,function(value) {
                _.each(temp.loans,function(obj) {
                    if(obj.loanId==value) {
                        _.each(obj.lenders,function(id) {
                            notify.push(id);
                        });
                        notify.push(obj.loanCase.borrowerId);
                        _.each(obj.hedgeAgreements,function(ids) {
                            var inc=0;
                            _.each(notify,function(match) {
                                if(ids.hedgerId==match) {
                                    inc++;
                                }
                            });
                            if(inc==0){
                                notify.push(ids.hedgerId);
                            }
                        });
                    }
                });
            });
            var collection = global.db.collection('notifications');
            _.each(notify,function(push) {
                collection.insertOne({"_id":push,"Status":'Unseen',"message":"Admin breaked Hedge Agreement"}, function(err, response) {
                if(err){
                    console.log(err);
                }
                console.log(response);
                });
            });
            console.log(notify);
        });
    },

    BreakHedgeForLander: function(req) {
        var lenderId=req.body.lenderId;
        var hedgeId=req.body.hedgeId;
        var args=[];
        args.push(lenderId);
        query.queryChaincode('peer1', config.channelName, config.chaincodeName, args, 'read', req.username, req.orgname).then(function(data) {
            var temp = JSON.parse(data);
            var abc = temp.hedgeAgreements;
            var na=[];
            var notify=[];
            _.each(abc,function(obj) {
                if(obj.hedgeId==hedgeId){
                    na.push(obj.loanId);
                }
            });
            _.each(na,function(value) {
                _.each(temp.loans,function(obj) {
                    if(obj.loanId==value) {
                        _.each(obj.lenders,function(id) {
                            notify.push(id);
                        });
                        notify.push(obj.loanCase.borrowerId);
                        notify.push(obj.loanCase.administrativeAgentId);
                        _.each(obj.hedgeAgreements,function(ids) {
                            var inc=0;
                            _.each(notify,function(match) {
                                if(ids.hedgerId==match) {
                                    inc++;
                                }
                            });
                            if(inc==0){
                                notify.push(ids.hedgerId);
                            }
                        });
                    }
                });
            });
            var collection = global.db.collection('notifications');
            _.each(notify,function(push) {
                collection.insertOne({"_id":push,"Status":'Unseen',"message":"Lender breaked Hedge Agreement"}, function(err, response) {
                if(err){
                    console.log(err);
                }
                console.log(response);
                });
            });
            console.log(notify);
        });
    },

    getNotifications: function(id) {
        var collection = global.db.collection('notifications');
        return new Promise(function(resolve,reject) {
            collection.find({$and:[{"_id":id},{"Status":'Unseen'}]}).toArray(function(err, res) {
            if(err) reject(err);

            _.each(res,function(cs) {
                collection.findAndModify({"_id":cs._id},[],{$set:{"Status":"seen"}}, function(error, result) {
                   if(error) console.log(error);
                   
                    resolve(res);
                });
            }); 
            });
        });
    }

}