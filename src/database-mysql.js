const mysql = require('mysql')
const {
    database
} = require('./keys')
const {
    promisify
} = require('util')
// mysql.createConnection //
const pool = mysql.createPool(database)
pool.getConnection((err, con) => {
    if(err) {
        if(err.code === "PROTOCOL_CONNECTION_LOST") {
            console.error('DATABASE CONNECTION WAS CLOSED')
        }
        if(err.code === 'ER_CON_COUNT_ERROR') {
            console.error('DATABASE HAS TO MANY CONNECTIONS')
        }
        if(err.code === 'ECONNREFUSED') {
            console.error('DATABASE CONNECTION WAS REFUSED')
        }
    } else if(con) {
        con.release()
        console.log('DB IS CONNECTED')
    } else {
        console.log('ALGO VA RARO')
    }
    return
})
pool.query = promisify(pool.query)
module.exports = pool
