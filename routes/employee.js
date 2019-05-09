"use strict";

const express = require('express');
const bcrypt = require('bcrypt');
const moment = require('moment');

const common = require('./common');
const db = require('../model/db');
const conf = require('../conf/conf');

const router = express.Router();

const User = db.User;
const Notif = db.Notif;
const Group = db.Group;
const Task = db.Task;
const Ann = db.Ann;

router.get('/employee', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.redirect('/');
    }

    const employee = req.session.user;
    const data = {
        username: employee.username,
        address: employee.address,
        email: employee.email,
        phone: employee.phone,
        numNewNotifications: 0,
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
        Notif.find({
            to: employee._id
        }).then((notifs) => {
            data.numNewNotifications = notifs.filter((notif) => !notif.beRead).length;
            res.render('employee.html', data);
        }).catch((err) => {
            console.log(err);
            res.render('employee.html', data);
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find companies');
    });
});

router.get('/employee/profile', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;
    const data = {
        username: employee.username,
        address: employee.address,
        email: employee.email,
        phone: employee.phone,
        numNewNotifications: 0,
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
        Notif.find({
            to: employee._id
        }).then((notifs) => {
            data.numNewNotifications = notifs.filter((notif) => !notif.beRead).length;
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.json(data);
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find companies');
    });
});

router.post('/employee/profile', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const password = req.body.password;

    if (password.length != 0) {
        const confirmPassword = req.body.confirmPassword;

        if (password != confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }
    }

    const employee = req.session.user;

    const username = employee.username;
    const address = req.body.address;
    const email = req.body.email;
    const phone = req.body.phone;
    let belongsTo;
    if (req.body.belongsTo.length != 0) {
        belongsTo = req.body.belongsTo;
    } else {
        belongsTo = null;
    }
    const oldBelongsTo = employee.belongsTo;

    if (password.length != 0) {
        bcrypt.hash(password, conf.SALT_ROUNDS, (err, hash) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Cannot hash the password');
            }

            User.findOneAndUpdate({
                username: username
            }, {
                $set: {
                    password: hash,
                    address: address,
                    email: email,
                    phone: phone,
                    belongsTo: belongsTo,
                }
            }, {
                new: true
            }).then((employee) => {
                if (!employee) {
                    return res.status(400).send('No such employee exists');
                }
                req.session.user = employee;
                res.send('ok');
                db.notifyUser(employee._id, 'You have updated your profile');
                if (String(oldBelongsTo) != String(belongsTo)) {
                    if (oldBelongsTo) {
                        db.notifyUser(oldBelongsTo, `Employee: ${username} left your company`);
                        db.removeMemberFromAllGroups(employee._id, oldBelongsTo);
                        db.deleteAllTasksForMember(employee._id, oldBelongsTo);
                    }
                    if (belongsTo) {
                        db.notifyUser(belongsTo, `Employee: ${username} joined your company`);
                    }
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Cannot update employee');
            });
        });
    } else {
        User.findOneAndUpdate({
            username: username
        }, {
            $set: {
                address: address,
                email: email,
                phone: phone,
                belongsTo: belongsTo,
            }
        }, {
            new: true
        }).then((employee) => {
            if (!employee) {
                return res.status(400).send('No such employee exists');
            }
            req.session.user = employee;
            res.send('ok');
            db.notifyUser(employee._id, 'You have updated your profile');
            if (String(oldBelongsTo) != String(belongsTo)) {
                if (oldBelongsTo) {
                    db.notifyUser(oldBelongsTo, `Employee: ${username} left your company`);
                    db.removeMemberFromAllGroups(employee._id, oldBelongsTo);
                    db.deleteAllTasksForMember(employee._id, oldBelongsTo);
                }
                if (belongsTo) {
                    db.notifyUser(belongsTo, `Employee: ${username} joined your company`);
                }
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot update employee');
        });
    }
});

router.get('/employee/all-groups', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    Group.find({
        members: employee._id
    }).populate(
        'members'
    ).populate(
        'creator'
    ).then((groups) => {
        const data = {
            groups: groups.map((group) => {
                return {
                    id: group._id,
                    creator: group.creator.username,
                    groupname: group.groupname,
                    members: group.members.map((member) => member.username),
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all groups');
    });
});

router.get('/employee/all-tasks', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    Group.find({
        members: employee._id
    }).then((groups) => {
        const group_ids = groups.map((group) => group._id);
        Task.find({
            $or: [
                {
                    assignedToEmployee: employee._id,
                },{
                    assignedToGroup: { $in: group_ids }
                }
            ]
        }).populate(
            'creator'
        ).populate(
            'assignedToEmployee'
        ).populate(
            'assignedToGroup'
        ).then((tasks) => {
            const data = {
                tasks: tasks.map((task) => {
                    let assignedTo;
                    if (task.assignedToEmployee) {
                        assignedTo = task.assignedToEmployee.username;
                    } else {
                        assignedTo = task.assignedToGroup.groupname;
                    }
                    return {
                        id: task._id,
                        creator: task.creator.username,
                        tasktype: task.tasktype,
                        taskname: task.taskname,
                        taskcontent: task.taskcontent,
                        date: moment(task.date).format('YYYY-MM-DD'),
                        assignedTo: assignedTo,
                    };
                })
            };
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find all tasks');
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all groups');
    });
});

router.get('/employee/all-anns', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    const data = {
        anns: []
    };

    if (!employee.belongsTo) {
        return res.json(data);
    }

    Ann.find({
        creator: employee.belongsTo
    }).then((anns) => {
        data.anns = anns.map((ann) => {
            return {
                id: ann._id,
                anntitle: ann.anntitle,
                anncontent: ann.anncontent,
                date: moment(ann.date).format('YYYY-MM-DD'),
            };
        });
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all anns');
    });
});

router.get('/employee/num-new-notifs', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    Notif.find({
        to: employee._id
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

router.get('/employee/notifs', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    Notif.find({
        to: employee._id
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

router.post('/employee/read-notif', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    const id = req.body.id;

    Notif.findByIdAndUpdate({
        _id: id,
        to: employee._id
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

router.post('/employee/delete-notif', (req, res) => {
    if (!common.auth(req, res, 'employee')) {
        return res.status(401).send('not auth\'ed');
    }

    const employee = req.session.user;

    const id = req.body.id;

    Notif.findByIdAndDelete({
        _id: id,
        to: employee._id
    }).then(() => {
        res.send('ok');
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find and delete notif');
    });
});

module.exports = router;