"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const conf = require('../conf/conf');

const websiteInfoSchema = mongoose.Schema({

    ourCompany: {
        type: String, required: true,
    },
    pricing: {
        type: String, required: true,
    },
    howToApply: {
        type: String, required: true,
    }

});

const userSchema = mongoose.Schema({

    usertype: {
        type: String, required: true,
    },
    username: {
        type: String, required: true, index: {unique: true},
    },
    password: {
        type: String, required: true,
    },
    address: {
        type: String, required: true,
    },
    email: {
        type: String, required: true, index: {unique: true},
    },
    phone: {
        type: String, required: true,
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null,
    },

});

const notifSchema = mongoose.Schema({

    to: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: true,
    },
    info: {
        type: String, required: true,
    },
    date: {
        type: Date, default: Date.now,
    },
    beRead: {
        type: Boolean, default: false,
    }

});

const groupSchema = mongoose.Schema({

    creator: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
    groupname: {
        type: String, required: true,
    },
    members: {
        type: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
        }], default: [], required: true,
    },

});

const taskSchema = mongoose.Schema({

    creator: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
    tasktype: {
        type: String, required: true,
    },
    taskname: {
        type: String, required: true,
    },
    taskcontent: {
        type: String, required: true,
    },
    assignedToEmployee: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null,
    },
    assignedToGroup: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null,
    },
    date: {
        type: Date, default: Date.now,
    },

});

const annSchema = mongoose.Schema({

    creator: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
    },
    anntitle: {
        type: String, required: true,
    },
    anncontent: {
        type: String, required: true,
    },
    date: {
        type: Date, default: Date.now,
    },

});

const WebsiteInfo = mongoose.model('WebsiteInfo', websiteInfoSchema);
const User = mongoose.model('User', userSchema);
const Notif = mongoose.model('Notif', notifSchema);
const Group = mongoose.model('Group', groupSchema);
const Task = mongoose.model('Task', taskSchema);
const Ann = mongoose.model('Ann', annSchema);

function createNotif(to, info) {
    Notif.create({
        to: to,
        info: info,
    }).then((notif) => {
        if (!notif) {
            console.log('no such notif exists');
        }
    }).catch((err) => {
        console.log(err);
    });
}

function notifySuperadmin(info) {
    User.find({
        usertype: 'superadmin'
    }).then((superadmins) => {
        for (const superadmin of superadmins) {
            createNotif(superadmin._id, info);
        }
    }).catch((err) => {
        console.log(err);
    });
}

function notifyUser(to, info) {
    return createNotif(to, info);
}

function removeMemberFromAllGroups(employee_id, company_id) {
    Group.updateMany({
        creator: company_id,
        members: employee_id,
    },{
        $pull: {
            members: employee_id,
        }
    }).catch((err) => {
        console.log(err);
    });
}

function deleteAllGroupsForCompany(company_id) {
    Group.deleteMany({
        creator: company_id,
    }).catch((err) => {
        console.log(err);
    });
}

function deleteAllTasksForMember(employee_id, company_id) {
    Task.deleteMany({
        creator: company_id,
        assignedToEmployee: employee_id,
    }).catch((err) => {
        console.log(err);
    });
}

function deleteAllTasksForGroup(group_id) {
    Task.deleteMany({
        assignedToGroup: group_id,
    }).catch((err) => {
        console.log(err);
    });
}

function deleteAllTasksForCompany(company_id) {
    Task.deleteMany({
        creator: company_id,
    }).catch((err) => {
        console.log(err);
    });
}

function deleteAllAnnsForCompany(company_id) {
    Ann.deleteMany({
        creator: company_id,
    }).catch((err) => {
        console.log(err);
    });
}

function initSuperadmin() {
    User.findOne({
        usertype: 'superadmin'
    }).then((user) => {
        if (user) {
            console.log(`found superadmin: ${user.username}`);
            return;
        }
        bcrypt.hash(conf.DEFAULT_SUPERADMIN_PASSWORD, conf.SALT_ROUNDS, (err, hash) => {
            if (err) {
                throw err;
            }
            User.create({
                usertype: 'superadmin',
                username: conf.DEFAULT_SUPERADMIN_USERNAME,
                password: hash,
                address: 'random address',
                email: conf.DEFAULT_SUPERADMIN_EMAIL,
                phone: 'random phone',
            }).then((user) => {
                if (!user) {
                    throw new Error('not such superadmin exists');
                }
                console.log('created default superadmin');
                createNotif(user._id, 'Account created using default settings');
            }).catch((err) => {
                throw err;
            });
        });
    }).catch((err) => {
        throw err;
    });
}

function initWebsiteInfo() {
    WebsiteInfo.findOne({
    }).then((websiteInfo) => {
        if (websiteInfo) {
            console.log('found website-info');
            return;
        }
        WebsiteInfo.create({
            ourCompany: conf.DEFAULT_WEBSITE_INFO_OUR_COMPANY,
            pricing: conf.DEFAULT_WEBSITE_INFO_PRICING,
            howToApply: conf.DEFAULT_WEBSITE_INFO_HOW_TO_APPLY,
        }).then((websiteInfo) => {
            if (!websiteInfo) {
                throw new Error('Cannot create website-info');
            }
            console.log('created default website-info');
        }).catch((err) => {
            throw err;
        });
    }).catch((err) => {
        throw err;
    });
}

mongoose.connect(conf.DB_URI, { useNewUrlParser: true }, (err) => {
    if (err) throw err;
    console.log(`Successfully connected to ${conf.DB_URI}`);
    initSuperadmin();
    initWebsiteInfo();
});

module.exports = {
    WebsiteInfo: WebsiteInfo,
    User: User,
    Notif: Notif,
    Group: Group,
    Task: Task,
    Ann: Ann,
    notifySuperadmin: notifySuperadmin,
    notifyUser: notifyUser,
    removeMemberFromAllGroups: removeMemberFromAllGroups,
    deleteAllGroupsForCompany: deleteAllGroupsForCompany,
    deleteAllTasksForMember: deleteAllTasksForMember,
    deleteAllTasksForGroup: deleteAllTasksForGroup,
    deleteAllTasksForCompany: deleteAllTasksForCompany,
    deleteAllAnnsForCompany: deleteAllAnnsForCompany,
};
