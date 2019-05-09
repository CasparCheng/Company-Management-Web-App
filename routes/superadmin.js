"use strict";

const express = require('express');
const bcrypt = require('bcrypt');
const moment = require('moment');

const common = require('./common');
const db = require('../model/db');
const conf = require('../conf/conf');

const router = express.Router();

const WebsiteInfo = db.WebsiteInfo;
const User = db.User;
const Notif = db.Notif;


router.get('/superadmin', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.redirect('/');
    }

    const superadmin = req.session.user;
    const data = {
        username: superadmin.username,
        address: superadmin.address,
        email: superadmin.email,
        phone: superadmin.phone,
        numNewNotifications: 0,
    };

    Notif.find({
        to: superadmin._id
    }).then((notifs) => {
        data.numNewNotifications = notifs.filter((notif) => !notif.beRead).length;
        res.render('superadmin.html', data);
    }).catch((err) => {
        console.log(err);
        res.render('superadmin.html', data);
    });
});

router.get('/superadmin/profile', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;
    const data = {
        username: superadmin.username,
        address: superadmin.address,
        email: superadmin.email,
        phone: superadmin.phone,
        numNewNotifications: 0,
    };

    Notif.find({
        to: superadmin._id
    }).then((notifs) => {
        data.numNewNotifications = notifs.filter((notif) => !notif.beRead).length;
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.json(data);
    });
});

router.post('/superadmin/profile', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const password = req.body.password;

    if (password.length != 0) {
        const confirmPassword = req.body.confirmPassword;

        if (password != confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }
    }

    const superadmin = req.session.user;

    const username = superadmin.username;
    const address = req.body.address;
    const email = req.body.email;
    const phone = req.body.phone;

    if (password.length != 0) {
        bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Cannot hash the password');
            }

            User.findOneAndUpdate({
                usertype: 'superadmin',
                username: username
            }, {
                $set: {
                    password: hash,
                    address: address,
                    email: email,
                    phone: phone,
                }
            }, {
                new: true
            }).then((superadmin) => {
                if (!superadmin) {
                    return res.status(400).send('No such superadmin exists');
                }
                req.session.user = superadmin;
                res.send('ok');
                db.notifyUser(superadmin._id, 'You have updated your profile');
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Cannot update superadmin');
            });
        });
    } else {
        User.findOneAndUpdate({
            usertype: 'superadmin',
            username: username
        }, {
            $set: {
                address: address,
                email: email,
                phone: phone,
            }
        }, {
            new: true
        }).then((superadmin) => {
            if (!superadmin) {
                return res.status(400).send('No such superadmin exists');
            }
            req.session.user = superadmin;
            res.send('ok');
            db.notifyUser(superadmin._id, 'You have updated your profile');
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot update superadmin');
        });
    }
});

router.get('/superadmin/num-new-notifs', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    Notif.find({
        to: superadmin._id
    }).then((notifs) => {
        const data = {
            numNewNotifications: notifs.filter((notif) => !notif.beRead).length,
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find notifs');
    });
});

router.get('/superadmin/notifs', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    Notif.find({
        to: superadmin._id
    }).then((notifs) => {
        let data = {
            notifs: notifs.map((notif) => {
                return {
                    id: notif._id,
                    info: notif.info,
                    date: moment(notif.date).format('llll'),
                    beRead: notif.beRead
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find notifs');
    });
});

router.post('/superadmin/read-notif', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    const id = req.body.id;

    Notif.findOneAndUpdate({
        _id: id,
        to: superadmin._id
    }, {
        $set: {
            beRead: true
        }
    }, {
        new: true
    }).then((notif) => {
        if (!notif) {
            return res.status(400).send('No such notif exists');
        }
        res.send('ok');
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find and update notif');
    });
});

router.post('/superadmin/delete-notif', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    const id = req.body.id;

    Notif.findOneAndDelete({
        _id: id,
        to: superadmin._id
    }).then(() => {
        res.send('ok');
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find and delete notif');
    });
});

router.get('/website-info', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    WebsiteInfo.findOne({
    }).then((websiteInfo) => {
        if (!websiteInfo) {
            return res.status(400).send('No such website-info exists');
        }
        const data = {
            howToApply: websiteInfo.howToApply,
            ourCompany: websiteInfo.ourCompany,
            pricing: websiteInfo.pricing,
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find website-info');
    });
});

router.post('/website-info', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    const username = superadmin.username;

    const howToApply = req.body.howToApply;
    const ourCompany = req.body.ourCompany;
    const pricing = req.body.pricing;

    WebsiteInfo.findOneAndUpdate({}, {
        howToApply: howToApply,
        ourCompany: ourCompany,
        pricing: pricing,
    }, {
        new: true
    }).then((websiteInfo) => {
        if (!websiteInfo) {
            return res.status(400).send('No such website-info exists');
        }
        res.send('ok');
        db.notifySuperadmin(`Website-info has been updated by ${username}`);
        db.notifyUser(superadmin._id, 'You have updated website-info');
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot update website-info');
    });
});

router.get('/all-companies', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    User.find({
        usertype: 'company'
    }).then((companies) => {
        const data = {
            'companies': companies.map((company) => {
                return {
                    username: company.username,
                    address: company.address,
                    email: company.email,
                    phone: company.phone,
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all companies');
    });
});

router.get('/get-company', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const usernameCompany = req.query.username;
    User.findOne({
        usertype: 'company',
        username: usernameCompany,
    }).then((company) => {
        if (!company) {
            return res.status(400).send('No such company exists');
        }
        const data = {
            username: company.username,
            address: company.address,
            email: company.email,
            phone: company.phone,
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find company');
    });
});

router.post('/set-company', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const password = req.body.password;

    if (password.length != 0) {
        const confirmPassword = req.body.confirmPassword;

        if (password != confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }
    }

    const superadmin = req.session.user;

    const usernameSuperadmin = superadmin.username;
    const usernameCompany = req.body.username;
    const address = req.body.address;
    const email = req.body.email;
    const phone = req.body.phone;

    if (password.length != 0) {
        bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Cannot hash the password');
            }

            User.findOneAndUpdate({
                usertype: 'company',
                username: usernameCompany
            }, {
                $set: {
                    password: hash,
                    address: address,
                    email: email,
                    phone: phone,
                }
            }, {
                new: true
            }).then((company) => {
                if (!company) {
                    return res.status(400).send('No such company exists');
                }
                res.send('ok');
                db.notifyUser(company._id, `Your profile have been updated by ${usernameSuperadmin}`);
                db.notifyUser(superadmin._id, `You have updated the profile of ${usernameCompany}`);
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Cannot update company');
            });
        });
    } else {
        User.findOneAndUpdate({
            usertype: 'company',
            username: usernameCompany
        }, {
            $set: {
                address: address,
                email: email,
                phone: phone,
            }
        }, {
            new: true
        }).then((company) => {
            if (!company) {
                return res.status(400).send('No such company exists');
            }
            res.send('ok');
            db.notifyUser(company._id, `Your profile have been updated by ${usernameSuperadmin}`);
            db.notifyUser(superadmin._id, `You have updated the profile of ${usernameCompany}`);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot update company');
        });
    }
});

router.post('/delete-company', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    const usernameSuperadmin = superadmin.username;
    const usernameCompany = req.body.username;

    User.findOneAndRemove({
        usertype: 'company',
        username: usernameCompany,
    }).then((company) => {
        if (!company) {
            return res.status(400).send('No such company exists');
        }
        db.notifySuperadmin(`Company: ${usernameCompany} has been deleted by ${usernameSuperadmin}`);
        db.notifyUser(superadmin._id, `You have deleted ${usernameCompany}`);
        User.find({
            usertype: 'employee',
            belongsTo: company._id, 
        }).then((employees) => {
            res.send('ok');
            db.deleteAllGroupsForCompany(company._id);
            db.deleteAllTasksForCompany(company._id);
            db.deleteAllAnnsForCompany(company._id);
            for (let employee of employees) {
                employee.belongsTo = null;
                employee.save((err) => {
                    if (err) {
                        console.log(err);
                    }
                    db.notifyUser(employee._id, `You no longer work for ${usernameCompany}`);
                });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find employees');
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find company');
    });
});

router.get('/all-employees', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    User.find({
        usertype: 'employee'
    }).populate(
        'belongsTo'
    ).then((employees) => {
        const data = {
            'employees': employees.map((employee) => {
                let belongsTo = '';
                if (employee.belongsTo) {
                    belongsTo = employee.belongsTo.username;
                }
                return {
                    username: employee.username,
                    address: employee.address,
                    email: employee.email,
                    phone: employee.phone,
                    belongsTo: belongsTo
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all employees');
    });
});

router.get('/get-employee', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const usernameEmployee = req.query.username;
    User.findOne({
        usertype: 'employee',
        username: usernameEmployee,
    }).then((employee) => {
        let data = {
            username: employee.username,
            address: employee.address,
            email: employee.email,
            phone: employee.phone,
            companies: [],
        };
        User.find({
            usertype: 'company',
        }).then((companies) => {
            data.companies = companies.map((company) => {
                return {
                    id: company._id,
                    username: company.username,
                    selected: company._id.equals(employee.belongsTo),
                };
            });
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find companies');
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find employee');
    });
});

router.post('/set-employee', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const password = req.body.password;

    if (password.length != 0) {
        const confirmPassword = req.body.confirmPassword;

        if (password != confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }
    }

    const superadmin = req.session.user;

    const usernameSuperadmin = superadmin.username;
    const usernameEmployee = req.body.username;
    const address = req.body.address;
    const email = req.body.email;
    const phone = req.body.phone;
    let belongsTo;
    if (req.body.belongsTo.length != 0) {
        belongsTo = req.body.belongsTo;
    } else {
        belongsTo = null;
    }

    if (password.length != 0) {
        bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Cannot hash the password');
            }

            User.findOne({
                usertype: 'employee',
                username: usernameEmployee
            }).then((employee) => {
                if (!employee) {
                    return res.status(400).send('No such employee exists');
                }
                const oldBelongsTo = employee.belongsTo;
                employee.password = hash;
                employee.address = address;
                employee.email = email;
                employee.phone = phone;
                employee.belongsTo = belongsTo;
                employee.save((err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Cannot update employee');
                    }
                    res.send('ok');
                    db.notifyUser(employee._id, `Your profile have been updated by ${usernameSuperadmin}`);
                    db.notifyUser(superadmin._id, `You have updated the profile of ${usernameEmployee}`);
                    if (String(oldBelongsTo) != String(belongsTo)) {
                        if (oldBelongsTo) {
                            console.log(`oldBelongsTo: ${oldBelongsTo}`);
                            db.notifyUser(oldBelongsTo, `Employee: ${usernameEmployee} left your company`);
                            db.removeMemberFromAllGroups(employee._id, oldBelongsTo);
                            db.deleteAllTasksForMember(employee._id, oldBelongsTo);
                            User.findById(
                                oldBelongsTo
                            ).then((company) => {
                                if (!company) {
                                    console.log(err);
                                    return;
                                }
                                const usernameCompany = company.username;
                                db.notifyUser(employee._id, `You left ${usernameCompany}`);
                            }).catch((err) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                        if (belongsTo) {
                            console.log(`belongsTo: ${belongsTo}`);
                            db.notifyUser(belongsTo, `Employee: ${usernameEmployee} joined your company`);
                            User.findById(
                                belongsTo
                            ).then((company) => {
                                if (!company) {
                                    console.log(err);
                                    return;
                                }
                                const usernameCompany = company.username;
                                db.notifyUser(employee._id, `You joined ${usernameCompany}`);
                            }).catch((err) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    }
                });
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Cannot find employee');
            });
        });
    } else {
        User.findOne({
            usertype: 'employee',
            username: usernameEmployee
        }).then((employee) => {
            if (!employee) {
                return res.status(400).send('No such employee exists');
            }
            const oldBelongsTo = employee.belongsTo;
            employee.address = address;
            employee.email = email;
            employee.phone = phone;
            employee.belongsTo = belongsTo;
            employee.save((err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Cannot update employee');
                }
                res.send('ok');
                db.notifyUser(employee._id, `Your profile have been updated by ${usernameSuperadmin}`);
                db.notifyUser(superadmin._id, `You have updated the profile of ${usernameEmployee}`);
                if (String(oldBelongsTo) != String(belongsTo)) {
                    if (oldBelongsTo) {
                        console.log(`oldBelongsTo: ${oldBelongsTo}`);
                        db.notifyUser(oldBelongsTo, `Employee: ${usernameEmployee} left your company`);
                        db.removeMemberFromAllGroups(employee._id, oldBelongsTo);
                        db.deleteAllTasksForMember(employee._id, oldBelongsTo);
                        User.findById(
                            oldBelongsTo
                        ).then((company) => {
                            if (!company) {
                                console.log(err);
                                return;
                            }
                            const usernameCompany = company.username;
                            db.notifyUser(employee._id, `You left ${usernameCompany}`);
                        }).catch((err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    if (belongsTo) {
                        console.log(`belongsTo: ${belongsTo}`);
                        db.notifyUser(belongsTo, `Employee: ${usernameEmployee} joined your company`);
                        User.findById(
                            belongsTo
                        ).then((company) => {
                            if (!company) {
                                console.log(err);
                                return;
                            }
                            const usernameCompany = company.username;
                            db.notifyUser(employee._id, `You joined ${usernameCompany}`);
                        }).catch((err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                }
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find user');
        });
    }
});

router.post('/delete-employee', (req, res) => {
    if (!common.auth(req, res, 'superadmin')) {
        return res.status(401).send('not auth\'ed');
    }

    const superadmin = req.session.user;

    const usernameSuperadmin = superadmin.username;
    const usernameEmployee = req.body.username;

    User.findOneAndRemove({
        usertype: 'employee',
        username: usernameEmployee,
    }).then((employee) => {
        if (!employee) {
            return res.status(400).send('No such employee exists');
        }
        res.send('ok');
        db.notifySuperadmin(`Employee: ${usernameEmployee} has been deleted by ${usernameSuperadmin}`);
        db.notifyUser(superadmin._id, `You have deleted ${usernameEmployee}`);
        if (employee.belongsTo) {
            db.notifyUser(employee.belongsTo, `Employee: ${usernameEmployee} left your company`);
            db.removeMemberFromAllGroups(employee._id, employee.belongsTo);
            db.deleteAllTasksForMember(employee._id, employee.belongsTo);
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find employee');
    });
});

module.exports = router;