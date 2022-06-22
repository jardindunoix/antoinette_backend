require('dotenv').config();
const url_base = process.env.URL_BASE;
const url_base2 = process.env.URL_BASE2;
const url_server = process.env.URL_SERVER;
const url_client = process.env.URL_CLIENT;

module.exports = {url_base, url_base2, url_client, url_server}
