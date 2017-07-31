'use strict';
var MyMethods           = require('./api/borrower.js');
var mongoose            = require('mongoose');
var grid                = require('gridfs-stream');
var formidable          = require('formidable');
var ObjectID            = require('mongodb').ObjectID;
const co                = require('co');
var BorrowerRouter      = require('./routes/borrower_routes');
var EngineerRouter      = require('./routes/engineer_routes');
var AuditorRouter        = require('./routes/auditor_routes');
var LenderRouter        = require('./routes/lender_routes');
var HedgeRouter         = require('./routes/hedge_provider');
var AdminRoutes         = require('./routes/administrative_agent_routes');
var Common              = require('./api/common');


module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('login.ejs');
    });

    app.use('/auditor', isLoggedIn , AuditorRouter);

    app.use('/common', Common.SaveVideo);

    app.use('/view', Common.Download);

    app.use('/hedge', isLoggedIn , HedgeRouter);

    app.use('/engineer',isLoggedIn, EngineerRouter);

    app.use('/admin',isLoggedIn ,AdminRoutes);

    app.use('/lender', isLoggedIn , LenderRouter);

    app.use('/borrower',isLoggedIn , BorrowerRouter);

    app.get('/profile', isLoggedIn ,function(req, res) {

        // MyMethods.GetCaseData(req, res).then(function(response,error){
            // if(error) 
            // res.render('borrower-dashboard.ejs');

        //     console.log(response);
        //     res.render('borrower-dashboard.ejs', {
        //     // data : response.Values,
        //     user : req.user
        // });
        res.sendFile('borrower-dashboard.ejs');
        // });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/download', function(req, res) {
        MyMethods.DownloadFile(req, res).then(function(response,error){
            if(error)
            res.send(error);

            res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=file.txt'});
            for(var i=0;i<response.Documents.length;i++)
            {
                var img = new Buffer(response.Documents[i].buffer, 'base64');
                res.write(img);
            }
            res.end();
            // res.type('image/jpg;base64');
            // res.type('text/plain;base64');
            // for(var i=0;i<response.Documents.length;i++)
            // {
            //     var img = new Buffer(response.Documents[i].buffer, 'base64');
            //     res.write(img);
            // }
            // res.end();
        })
    });

    app.get('/manage-cases.ejs', function(req , res){
        res.render('manage-cases.ejs');
    });

    app.post('/upload', function(req, res) {
        MyMethods.UploadFile(req, res).then(function(response, error){
            if(error)
            res.send(error);
            
            let Doc = { Reference:req.user._id , Documents: response.docs ,Values:response.value};
            co(function*() {
                yield global.db.collection('manage-report').insert(Doc);
            });
            res.send('uploaded sucessfully');
        })
    });

    app.get('/financial-statement', function(req , res){
        res.render('financial-statement.ejs');
    });

    app.get('/administrator-agent', function(req , res){
        res.render('administrator-agent.ejs');
    });

    app.get('/new-case', function(req , res){
        res.render('new-case.ejs');
    });

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login', 
        failureFlash : true 
    }));

    app.get('/signup', function(req, res) {
        res.render('sign-up.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', 
        failureRedirect : '/signup', 
        failureFlash : true 
    }));

    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    });

    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/connect/local', 
        failureFlash : true 
    }));

    app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
