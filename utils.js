var crypto=require('crypto');
const mongo = require('mongodb');
var ObjectID   = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;


module.exports = {

    CreateID: function(secret){
        return new Promise(function(resolve,reject){
            var string = crypto.createHash('md5').update(secret).digest('hex');
            resolve(string);
        });
    },

    SaveUser: function(ID,name,number,email,type,buisness_no,taxId_no,passwrd){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection(type);
            collection.insertOne({"_id":ID,"User_name":name,"Contact_no":number,"Email":email
            ,"buisness_no":buisness_no,"tax_id":taxId_no,"password":passwrd,"type":type}, function(err, res) {
                if(err){
                    reject(err);
                }
                resolve(res);
                });
        });
    },

    GetUser: function(username,orgName,passwrd,type){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection(type);
            collection.findOne({$and:[{"password":passwrd},{"User_name":username}]}, {fields:{User_name:1,type:1}},function(err, res) {
                if(err){
                    reject(err);
                }

                resolve(res);
            });
        });
    },

    SaveFiles: function(req,res){
        let Docs = [];
        var values = [];
        req.pipe(req.busboy);
        return new Promise(function(resolve,reject){
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
                var collection = global.db.collection('Cases');
                collection.insertOne({"document":Docs,"value":values}, function(err, response) {
                if(err){
                    reject(err);
                }
                resolve(response);
                });
            });
        });
    },

    DownloadFile: function(req,res) {
        
        global.db.collection('users').findOne({ _id: ObjectID("598058a0cddb705d5bd810a2")},{fields:{document:1}},function(err, doc) {
        if (err) return res.send(err);
        
        res.writeHead(200, {'Content-Type': 'text/plain','Content-disposition':'attachment; filename=file.txt'});
        for(var i=0;i<doc.document.length;i++)
        {
            var img = new Buffer(doc.document[i].buffer, 'base64');
            res.write(img);
        }
        res.end();
        });
        
    },

    SaveFinancialRequest: function(bId,aId,rId) {
        return new Promise(function(resolve,reject) {
            var collection = global.db.collection('request');
            collection.insertOne({"Auditor_id":aId,"Borrower_id":bId,"Status":'Pending',"_id":rId}, function(err, response) {
            if(err){
                reject(err);
            }
            resolve(response);
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
            var collection = global.db.collection('Auditor');
            collection.find({}).toArray(function(Ae, Ar) {
                var collection = global.db.collection('Admin');
                collection.find({}).toArray(function(Ade, Adr) {
                    var collection = global.db.collection('Engineer');
                    collection.find({}).toArray(function(Ee, Er) {
                        resolve({
                            Auditor:Ar,
                            Admin:Adr,
                            Engineer:Er
                        });
                    });
                });
            });
        });
    },

    CheckUser: function(name,phone,email,type){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection(type);
            collection.findOne({$or:[{"User_name":name},{"Contact_no":phone},{"Email":email}]}, {fields:{User_name:1,type:1}},function(err, res) {
                if(err){
                    reject(err);
                }
                resolve(res);
            });
        });
    },


}