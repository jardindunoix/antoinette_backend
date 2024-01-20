require('./database')
// const app = require('./app')
const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser');
// const { url_base, url_base2 } = require('./constants');
// const { url_server, url_client } = require('./constants');
// const fileUpload = require('express-fileupload');

const chargerRoute = require('./routes/charger.routes.js');
const http = require('http');

// const { Server } = require('socket.io');

//const iioClient = require('socket.io-client');
//const socketClient = iioClient.connect(`${url_server}`);

const app = express();
const server = http.createServer(app);


// app.use(fileUpload({ createParentPath: true }));

app.use(cors({
   'allowedHeaders': ['sessionId', 'Content-Type'],
   'exposedHeaders': ['sessionId'],

   // 'origin': `${url_base}`,
   // 'Access-Control-Allow-Origin': `${url_base}`,
   // 'Access-Control-Allow-Credentials': true,

   'origin': "*",
   'Access-Control-Allow-Origin': "*",
   'Access-Control-Allow-Credentials': false,

   'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
   'preflightContinue': false
}));


// app.use(bodyParser.urlencoded({ extended: true, parameterLimit: '1000000000000', limit: '10000000000mb' }));
// app.use(bodyParser.json({ limit: '10000000000mb', extended: true, parameterLimit: 1000000000000 }));

app.use(express.urlencoded({ extended: true, limit: '51000000000000mb', parameterLimit: 5100000000000000 }));
app.use(express.json({ limit: '51000000000000mb', extended: true, parameterLimit: 5100000000000000 }));

// app.use(express.json({ limit: '5000mb', extended: true }));
// app.use(express.urlencoded({ extended: true, limit: '5000mb' }));

//app.use(morgan('dev'))

/* routes */
app.use('/api/charger', chargerRoute);

// const io = new Server(server, { cors: { origin: `${url_client}`, methods: ['GET', 'POST'] } });

// io.on('connection', (socket) => {
//    //   console.log('Conectado!!!!!');
//    //    io.emit('receive_message', 'retorno');
//    socket.on('join', data => {
//       try {
//          io.emit('receive_message', data);
//          //         console.log(data);
//       } catch (error) { console.log('not sent', error); }
//    });

//    io.on('chat', data => {
//       try {
//          console.log(data, 'data Desde el  CAHT');
//       } catch (error) { console.log('ERROE chat', error); }

//    });

//    /* DESCONNECTION */
//    socket.on('disconnect', () => {
//       console.log('user disconnected', socket.id)
//    });
// });

//app.listen(process.env.PORT);
//console.log('Server on port', process.env.PORT)

server.listen(process.env.PORT, () => console.log('ANTO WEB PAGE SERVER running in port ', process.env.PORT));
