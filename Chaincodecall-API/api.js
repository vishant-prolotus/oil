var invoke = require('../app/invoke-transaction.js');
var config=require('../config.json');
module.exports={

    initBorrower:function(borrowerId,name,regId,email,req,res){

        var args=[];
        args.push(borrowerId,name,regId,email);
        var peers=["localhost:7051","localhost:8051","localhost:9051","localhost:10051","localhost:11051"];
        var fcn='initBorrower';
        console.log('///////////////////////////////////////////////////////////');
        console.log(args);
        console.log(peers);
        console.log(req.username);
        console.log(config.channelName);
        console.log(config.chaincodeName);
        console.log('///////////////////////////////////////////////////////////');
        invoke.invokeChaincode(peers, config.channelName, config.chaincodeName, fcn, args, req.username, req.orgname)
	    .then(function(message) {
		res.send(message);
	});
    },

    /*read:function(args){
        query.queryChaincode('peer1', config.channelName, config.chaincodeName, args, 'read', req.username, req.orgname).then(function(message) {
		res.json(message);
	});
    }*/

}