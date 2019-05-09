"use strict";

const DB_URI = 'mongodb://heroku:939747@cs309-proj-shard-00-00-ndnxy.mongodb.net:27017,cs309-proj-shard-00-01-ndnxy.mongodb.net:27017,cs309-proj-shard-00-02-ndnxy.mongodb.net:27017/test?ssl=true&replicaSet=cs309-proj-shard-0&authSource=admin&retryWrites=true';
const SALT_ROUNDS = 10;

const DEFAULT_SUPERADMIN_USERNAME = 'superadmin';
const DEFAULT_SUPERADMIN_PASSWORD = 'superadmin';
const DEFAULT_SUPERADMIN_EMAIL = 'superadmin@cs309.edu';

const DEFAULT_WEBSITE_INFO_OUR_COMPANY = 'Our company management system allows registered companies to directly manage their company staff or event with our web system. Many small size companies or groups do not have a suitable or completed management system to manage company staff or deal with company agenda. Let’s start your business management!';
const DEFAULT_WEBSITE_INFO_PRICING = 'Exciting news! This web app is totally free now! Feel free to enjoy our company management system!';
const DEFAULT_WEBSITE_INFO_HOW_TO_APPLY = 'If you are new one to this website, just click the sign up button to fill in the required information for your company or group. After company sign up, Indicate your role in the company, you will have the user page or the manager page.';


module.exports = {
    DB_URI: DB_URI,
    SALT_ROUNDS: SALT_ROUNDS,
    DEFAULT_SUPERADMIN_USERNAME: DEFAULT_SUPERADMIN_USERNAME,
    DEFAULT_SUPERADMIN_PASSWORD: DEFAULT_SUPERADMIN_PASSWORD,
    DEFAULT_SUPERADMIN_EMAIL: DEFAULT_SUPERADMIN_EMAIL,
    DEFAULT_WEBSITE_INFO_OUR_COMPANY: DEFAULT_WEBSITE_INFO_OUR_COMPANY,
    DEFAULT_WEBSITE_INFO_PRICING: DEFAULT_WEBSITE_INFO_PRICING,
    DEFAULT_WEBSITE_INFO_HOW_TO_APPLY: DEFAULT_WEBSITE_INFO_HOW_TO_APPLY
};
