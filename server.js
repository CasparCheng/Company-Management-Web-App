"use strict";

const express = require('express');
const logger = require('morgan');
const path = require('path');
const mustache = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(logger('dev'));

app.use(session({
    secret: 'CS309 Project',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', mustache());

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

const routeIndex = require('./routes/index');
const routeSuperadmin = require('./routes/superadmin');
const routeCompany = require('./routes/company');
const routeEmployee = require('./routes/employee');

app.use(routeIndex);
app.use(routeSuperadmin);
app.use(routeCompany);
app.use(routeEmployee);

const server = app.listen(process.env.PORT || 3090, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`CS309 Project running at http://${host}:${port}`);
});
