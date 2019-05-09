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


router.get('/company', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.redirect('/');
    }

    const company = req.session.user;
    const data = {
        username: company.username,
        address: company.address,
        email: company.email,
        phone: company.phone,
        numNewNotifications: 0,
    };
    Notif.find({
        to: company._id
    }).then((notifs) => {
        data.numNewNotifications = notifs.filter((notif) => !notif.beRead).length;
        res.render('company.html', data);
    }).catch((err) => {
        console.log(err);
        res.render('company.html', data);
    });
});

router.get('/company/profile', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;
    const data = {
        username: company.username,
        address: company.address,
        email: company.email,
        phone: company.phone,
        numNewNotifications: 0,
    };
    Notif.find({
        to: company._id
    }).then((notifs) => {
        data.numNewNotifications = notifs.filter((notif) => !notif.beRead).length;
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.json(data);
    });
});

router.post('/company/profile', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const password = req.body.password;

    if (password.length != 0) {
        const confirmPassword = req.body.confirmPassword;

        if (password != confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }
    }

    const company = req.session.user;
    const username = company.username;
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
            }).then((company) => {
                if (!company) {
                    return res.status(400).send('No such company exists');
                }
                req.session.user = company;
                res.send('ok');
                db.notifyUser(company._id, 'You have updated your profile');
            }).catch((err) => {
                console.log(err);
                res.status(500).send('Cannot update company');
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
            }
        }, {
            new: true
        }).then((company) => {
            if (!company) {
                return res.status(400).send('No such company exists');
            }
            req.session.user = company;
            res.send('ok');
            db.notifyUser(company._id, 'You have updated your profile');
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot update company');
        });
    }
});

router.get('/company/all-employees', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    User.find({
        usertype: 'employee',
        belongsTo: company._id,
    }).then((employees) => {
        const data = {
            'employees': employees.map((employee) => {
                return {
                    id: employee._id,
                    username: employee.username,
                    address: employee.address,
                    email: employee.email,
                    phone: employee.phone,
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all employees');
    });
});

router.post('/company/remove-employee', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;
    const usernameCompany = company.username;
    const usernameEmmployee = req.body.username;

    User.findOneAndUpdate({
        username: usernameEmmployee
    }, {
        $set: {
            belongsTo: null
        }
    }, {
        new: true
    }).then((employee) => {
        if (!employee) {
            return res.status(400).send('No such employee exists');
        }
        res.send('ok');
        db.notifyUser(company._id, `You have removed employee: ${usernameEmmployee}`);
        db.notifyUser(employee._id, `You no longer work for ${usernameCompany}`);
        db.removeMemberFromAllGroups(employee._id, company._id);
        db.deleteAllTasksForMember(employee._id, company._id);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find employee');
    });
});

router.get('/company/all-groups', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    Group.find({
        creator: company._id,
    }).populate(
        'members'
    ).then((groups) => {
        const data = {
            groups: groups.map((group) => {
                return {
                    id: group._id,
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

router.get('/company/get-group', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.query.id;

    Group.findOne({
        _id: id,
        creator: company._id,
    }).then((group) => {
        if (!group) {
            return res.status(400).send('No such group exists');
        }
        const data = {
            id: group._id,
            groupname: group.groupname,
            members: group.members,
        };
        User.find({
            usertype: 'employee',
            belongsTo: company._id,
        }).then((employees) => {
            data.employees = employees.map((employee) => {
                let isOldMember = false;
                for (const member of data.members) {
                    if (String(employee._id) == String(member)) {
                        isOldMember = true;
                        break;
                    }
                }
                return {
                    id: employee._id,
                    username: employee.username,
                    selected: isOldMember,
                };
            });
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find all employees');
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all groups');
    });
});

router.post('/company/set-group', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.body.id;
    const groupname = req.body.groupname;
    let members = req.body.members;
    if (members !== null && members !== undefined) {
        if (!Array.isArray(members)) {
            members = [members];
        }
    } else {
        members = [];
    }
    members = members.map((member) => member.split(' ')[0]);

    if (id.length == 0) {
        Group.create({
            creator: company._id,
            groupname: groupname,
            members: members,
        }).then((group) => {
            if (!group) {
                return res.status(400).send('No such group exists');
            }
            res.send('ok');
            db.notifyUser(company._id, `You have created group: ${groupname}`);
            for (const member of members) {
                db.notifyUser(member, `You are now a member of group: ${groupname}`);
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot create group');
        });
    } else {
        Group.findOneAndUpdate({
            _id: id,
            creator: company._id,
        }, {
            $set: {
                groupname: groupname,
                members: members,
            }
        }).then((group) => {
            if (!group) {
                return res.status(400).send('No such group exists');
            }
            res.send('ok');
            db.notifyUser(company._id, `You have updated group: ${groupname}`);
            const oldMembers = group.members;
            for (const member of members) {
                let isOldMember = false;
                for (const oldMember of oldMembers) {
                    if (String(oldMember) == String(member)) {
                        isOldMember = true;
                        break;
                    }
                }
                if (!isOldMember) {
                    db.notifyUser(member, `You are now a member of group: ${groupname}`);
                }
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot create group');
        });
    }
});

router.post('/company/delete-group', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.body.id;

    Group.findOneAndRemove({
        _id: id,
        creator: company._id,
    }).then((group) => {
        if (!group) {
            return res.status(400).send('No such group exists');
        }
        res.send('ok');
        const groupname = group.groupname;
        db.notifyUser(company._id, `You have deleted group: ${groupname}`);
        const members = group.members;
        for (const member of members) {
            db.notifyUser(member._id, `You are not longer one member of group: ${groupname}`);
        }
        db.deleteAllTasksForGroup(group._id);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find group');
    });
});

router.get('/company/all-tasks', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    Task.find({
        creator: company._id,
    }).populate(
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
});

router.post('/company/set-task', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const taskname = req.body.taskname;
    const taskcontent = req.body.taskcontent;
    const [assignedTo, tasktype] = req.body.assignedTo.split(' ');

    Task.create({
        creator: company._id,
        tasktype: tasktype,
        taskname: taskname,
        taskcontent: taskcontent,
        assignedToEmployee: tasktype == 'employee' ? assignedTo : null,
        assignedToGroup: tasktype == 'group' ? assignedTo : null,
    }).then((task) => {
        if (!task) {
            return res.status(400).send('No such task exists');
        }
        res.send('ok');
        db.notifyUser(company._id, `You have created task: ${taskname}`);
        if (tasktype == 'employee') {
            db.notifyUser(assignedTo, `You are now assigned with task: ${taskname}`);
        } else {
            Task.populate(
                task,
                {path: 'assignedToGroup'}
            ).then((task) => {
                const members = task.assignedToGroup.members;
                for (const member of members) {
                    db.notifyUser(member, `You are now assigned with group task: ${taskname}`);
                }
            }).catch((err) => {
                console.log(err);
            });
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot create task');
    });
});

router.post('/company/delete-task', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.body.id;

    Task.findOneAndRemove({
        _id: id,
        creator: company._id,
    }).populate(
        'assignedToGroup'
    ).then((task) => {
        if (!task) {
            return res.status(400).send('No such task exists');
        }
        res.send('ok');
        const taskname = task.taskname;
        db.notifyUser(company._id, `You have cancelled task: ${taskname}`);
        const tasktype = task.tasktype;
        if (tasktype == 'employee') {
            db.notifyUser(task.assignedToEmployee, `Task: ${taskname} have been cancelled`);
        } else {
            const members = task.assignedToGroup.members;
            for (const member of members) {
                db.notifyUser(member, `Group task: ${taskname} have been cancelled`);
            }
        }
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find group');
    });
});

router.get('/company/all-anns', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    Ann.find({
        creator: company._id,
    }).then((anns) => {
        const data = {
            anns: anns.map((ann) => {
                return {
                    id: ann._id,
                    anntitle: ann.anntitle,
                    anncontent: ann.anncontent,
                    date: moment(ann.date).format('YYYY-MM-DD'),
                };
            })
        };
        res.json(data);
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find all anns');
    });
});

router.post('/company/set-ann', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const anntitle = req.body.anntitle;
    const anncontent = req.body.anncontent;

    Ann.create({
        creator: company._id,
        anntitle: anntitle,
        anncontent: anncontent,
    }).then((ann) => {
        if (!ann) {
            return res.status(400).send('No such ann exists');
        }
        res.send('ok');
        db.notifyUser(company._id, `You have created announcement: ${anntitle}`);
        User.find({
            usertype: 'employee',
            belongsTo: company._id,
        }).then((employees) => {
            for (const employee of employees) {
                db.notifyUser(employee._id, `You have received announcement: ${anntitle}`);
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find all employees');
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot create ann');
    });
});

router.post('/company/delete-ann', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.body.id;

    Ann.findOneAndRemove({
        _id: id,
        creator: company._id,
    }).then((ann) => {
        if (!ann) {
            return res.status(400).send('No such ann exists');
        }
        res.send('ok');
        const anntitle = ann.anntitle;
        db.notifyUser(company._id, `You have deleted announcement: ${anntitle}`);
        User.find({
            usertype: 'employee',
            belongsTo: company._id,
        }).then((employees) => {
            for (const employee of employees) {
                db.notifyUser(employee._id, `Your company deleted announcement: ${anntitle}`);
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).send('Cannot find all employees');
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find ann');
    });
});

router.get('/company/num-new-notifs', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    Notif.find({
        to: company._id
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

router.get('/company/notifs', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    Notif.find({
        to: company._id
    }).then((notifs) => {
        const data = {
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

router.post('/company/read-notif', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.body.id;

    Notif.findByIdAndUpdate({
        _id: id,
        to: company._id
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

router.post('/company/delete-notif', (req, res) => {
    if (!common.auth(req, res, 'company')) {
        return res.status(401).send('not auth\'ed');
    }

    const company = req.session.user;

    const id = req.body.id;

    Notif.findByIdAndDelete({
        _id: id,
        to: company._id
    }).then(() => {
        res.send('ok');
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Cannot find and delete notif');
    });
});

module.exports = router;