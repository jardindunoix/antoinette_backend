require('dotenv').config()
module.exports = {
    database: {
        host: process.env.DB_HOST_MYSQL,
        user: process.env.DB_USER_MYSQL,
        password: process.env.DB_PASSWORD_MYSQL,
        database: process.env.DB_NAME_MYSQL,

    }
}