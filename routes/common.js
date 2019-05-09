"use strict";

function auth(req, res, usertype) {
    if (!req.session.user) {
        return false;
    }
    switch (req.session.user.usertype) {
        case 'superadmin':
            if (usertype != 'superadmin') {
                return false;
            }
            break;
        case 'company':
            if (usertype != 'company') {
                return false;
            }
            break;
        case 'employee':
            if (usertype != 'employee') {
                return false;
            }
            break;
        default:
            req.session.user = null;
            return false;
    }
    return true;
}

module.exports = {
    auth: auth,
};
