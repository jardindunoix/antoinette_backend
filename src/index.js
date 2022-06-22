require('dotenv').config();
require('./database')
// const app = require('./app')
const express = require('express')                                                                          
//const morgan = require('morgan')
const cors = require('cors')
const { url_base,url_base2 } = require('./constants')
const {url_server, url_client} = require('./constants');

const notifRoutes = require('./routes/notifications.routes');

const userRoutes = require('./routes/user.routes');
const http = require('http');
const { Server } = require('socket.io');

//const iioClient = require('socket.io-client');
//const socketClient = iioClient.connect(`${url_server}`);


const app = express()
const server = http.createServer(app);


app.use(cors({
   'allowedHeaders': ['sessionId', 'Content-Type'],
   'exposedHeaders': ['sessionId'],
   'origin':  `*`,
//  'origin':  `${url_base}`,
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

app.use('/api/users', userRoutes);                                          
app.use('/api/notif', notifRoutes);  


//app.listen(process.env.PORT);

const io = new Server(server, { cors: { origin: `${url_client}`, methods: ['GET', 'POST'] } });

io.on('connection', (socket) => {
//   console.log('Conectado!!!!!');
//    io.emit('receive_message', 'retorno');
   socket.on('join', data => {
      try{
         io.emit('receive_message', data);
//         console.log(data);
      }catch(error){console.log('not sent', error);}

   });


   io.on('chat', data => {
      try{
         console.log(data, 'data Desde el  CAHT');
      }catch(error){console.log('ERROE chat', error);}

   });
   /* DESCONNECTION */
   socket.on('disconnect', () => {
      console.log('user disconnected', socket.id)
   });
});


// app.post('/gigio', (req, res) => {
//    counterWebHookProcess++
//    retorno = { items: req.body }
//    socketClient.emit('go', counterWebHookProcess)
//    console.log(req.body.action, counterWebHookProcess)
// })

//console.log('Server on port', process.env.PORT)

server.listen(process.env.PORT, () => console.log('server running in port ', process.env.PORT));
