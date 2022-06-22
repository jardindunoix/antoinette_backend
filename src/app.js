const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const { url_base,url_base2 } = require('./constants')

const notifRoutes = require('./routes/notifications.routes');

const userRoutes = require('./routes/user.routes');
const app = express()

app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'origin':  `*`,
    //'origin':  `${url_base}`,
    // 'Access-Control-Allow-Origin': `${url_base}`,
    'Access-Control-Allow-Origin': `*`,  
    'Access-Control-Allow-Credentials': true,
    //'Access-Control-Allow-Credentials':false,
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));

app.use(express.json({ limit: '50mb', extended: false, parameterLimit: 50000 }));
app.use(express.urlencoded({ extended: false, limit: '50mb', parameterLimit: 50000 }));

//app.use(morgan('dev'))

/* presentacion */
app.get('/', (req, res) => {
    res.status(200).send(`
    <!DOCTYPE html/>
    <head>
    <title>ServerBK</title>
    </head>
    <body>
    <h1>SERVER RUNNING</h1>
    </body>
    `);
});

/* llamadas a la api */
app.use('/api/users', userRoutes);
app.use('/api/notif', notifRoutes);

module.exports = app;
