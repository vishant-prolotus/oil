var crypto=require('crypto');
const mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;


module.exports = {

    CreateID: function(secret){
        return new Promise(function(resolve,reject){
            crypto.pbkdf2(secret, 'salt', 100000, 512, 'sha512', (err, derivedKey) => {
            if (err) reject(err);

            resolve(derivedKey.toString('hex'));
            });
        });
    },

    SaveUser: function(ID,name,number,email,type,buisness_no,taxId_no,passwrd){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection('users');
            collection.insertOne({"_id":ID,"User_name":name,"Contact_no":number,"Email":email
            ,"buisness_no":buisness_no,"tax_id":taxId_no,"password":passwrd,"Type":type}, function(err, res) {
                if(err){
                    global.db.close();
                    reject(err);
                }
                global.db.close();
                resolve(res);
                });
        });
    },

    GetUser: function(username,orgName,passwrd){
        return new Promise(function(resolve,reject){
            var collection = global.db.collection('users');
            collection.find({$and:[{"password":passwrd},{"User_name":orgName}]}, {fields:{Email:1}},function(err, res) {
                if(err){
                    global.db.close();
                    reject(err);
                }
                global.db.close();
                resolve(res);
                });
        });
    },

    ValidateForm: function(req,res){
        if(!req.body.Name)
           return  res.send('username Missing');

        else if(!req.body.UserType)
            return res.send('User type missing');

        else if(!req.body.phone)
            return res.send('phone number missing');

        else if(!req.body.Email)
            return res.send('email is missing');

        else if(!req.body.LegalBNo)
            return res.send('legal buisness no is missing');

        else if(!req.body.TaxIdNo)
            return res.send('tax id is missing');

        else return;
    },

    SaveToken: function(token,username,orgName){
        return new promise(function(resolve,reject){
            MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
            var collection = db.collection('users');
            collection.findOneAndUpdate({$and:[{"username":username},{"OrgName":orgName}]}
            , {$set: {"token":token}}
            , {
                 returnOriginal: false
                , upsert: true
            }).then(function(r) {
                    db.close();
                    resolve(r);
                });
            });
        });
    },

    SaveFiles: function(req,res){
        let Docs = [];
        req.pipe(req.busboy);
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
            var collection = global.db.collection('users');
            collection.insertOne({"document":Docs}, function(err, res) {
            if(err){
                global.db.close();
                return err;
            }
            global.db.close();
            return res;
            });
        });
    }

}