"use strict";

const express = require('express');
const bcrypt = require('bcrypt');

const db = require('../model/db');
const conf = require('../conf/conf');

const router = express.Router();

const WebsiteInfo = db.WebsiteInfo;
const User = db.User;


function redirectByUser(req, res) {
    switch (req.session.user.usertype) {
        case 'superadmin':
            res.send('/superadmin');
            break;
        case 'company':
            res.send('/company');
            break;
        case 'employee':
            res.send('/employee');
            break;
        default:
            req.session.user = null;
            res.status(400).send('Unsupported usertype');
            break;
    }
}


router.get(['/', '/index'], (req, res) => {
    let data = {
        howToApply: '',
        ourCompany: '',
        pricing: '',
        companies: [],
    };
    WebsiteInfo.findOne({
    }).then((websiteInfo) => {
        if (websiteInfo) {
            data.howToApply = websiteInfo.howToApply;
            data.ourCompany = websiteInfo.ourCompany;
            data.pricing = websiteInfo.pricing; 
        }
        User.find({
            usertype: 'company',
        }).then((companies) => {
            data.companies = companies.map((v) => {
                return v.username;
            });
            res.render('index.html', data);
        }).catch((err) => {
            console.log(err);
            res.render('index.html', data);
        });
    }).catch((err) => {
        console.log(err);
        res.render('index.html', data);
    });
});

router.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});

router.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        username: username
    }).then((user) => {
        if (!user) {
            return res.status(400).send('No such user exists');
        }
        bcrypt.compare(password, user.password, (err, same) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Cannot compare passwords');
            }
            if (!same) {
                return res.status(400).send('Incorrect password');
            }
            req.session.user = user;
            redirectByUser(req, res);
        });
    }).catch((err) => {
        console.log(err);
        res.status(400).send('Cannot find user');
    });

});

router.post('/reset-password', (req, res) => {

    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password != confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    const username = req.body.username;
    const email = req.body.email;

    bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Cannot hash the password');
        }

        User.findOneAndUpdate({
            username: username,
            email: email
        }, {
            $set: {
                password: hash
            }
        },{
            new: true
        }).then((user) => {
            if (!user) {
                return res.status(400).send('No such user exists');
            }
            res.send('ok');
            db.notifyUser(user._id, 'You have reset your password');
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot reset password for user');
        });
    });

});

router.post('/signup', (req, res) => {

    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (password != confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    const usertype = req.body.usertype;
    const username = req.body.username;
    const address = req.body.address;
    const email = req.body.email;
    const phone = req.body.phone;

    bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Cannot hash the password');
        }
        User.create({
            usertype: usertype,
            username: username,
            password: hash,
            address: address,
            email: email,
            phone: phone,
        }).then((user) => {
            if (!user) {
                return res.status(400).send('No such user exists');
            }
            req.session.user = user;
            redirectByUser(req, res);
            db.notifySuperadmin(`New user signed up: ${username} (${usertype})`);
            db.notifyUser(user._id, `Welcome, ${username}!`);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot create user');
        });
    });
});

router.post('/search', (req, res) => {

    const keywords = req.body.keywords;

    User.find({
        username: {
            $regex: keywords,
            $options: 'i',
        }
    }).then((users) => {
        const data = {
            results: users.map((user) => {
                return {
                    usertype: user.usertype,
                    username: user.username,
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find users');
    });
});


module.exports = router;