const { pool_pg } = require('../database.js');
const {
  getAccounts,
  queryListAccountAnalisis,
  queryListAccountAnalisisNotListed,
  QUERY_LIST_ACCOUNT_ANALISIS,
  QUERY_LIST_ACCOUNT_ANALISIS_NOT_LISTED,
} = require('../constants');
const { getSingleMkpl, finalResultArray } = require('../services/fetchSingleItems.js');
const { getListGrantedFromDDBB, getListGrantedFromActive, getListGrantedFromActiveAgent } = require('../services/getListGrantedFromDDBB');
const { getOperationsAfterGlobal, getOperationsAfterGlobalDDBB } = require('../services/getOperations.js');
const { getOperationsItem } = require('../services/getOperationsItem');
const { getOperationsAfterGlobalInvoice } = require('../services/getOperationsAfterGlobal');
const { vRT } = require('../services/accessToken');

const {
  poolQuery,
  globalArrDetail,
  globalArrDetailSecond,
  globalArrDetailThird,
  globalArrDetailFourth,
  globalArrDetailFifth,
  globalArrDetailSixth,
  globalArrDetailFifthNotListed,
} = require('../services/database_mod/sellerInvoiceDetail');
const {
  poolQueryCopy,
  globalArrDetailCopy,
  globalArrDetailSecondCopy,
  globalArrDetailThirdCopy,
  globalArrDetailFourthCopy,
  globalArrDetailFifthCopy,
  globalArrDetailSixthCopy,
  globalArrDetailFifthNotListedCopy,
} = require('../services/database_mod/sellerInvoiceDetailCopy');

const { mailer } = require('../services/mailer/nodemailer');


/* ******************************************************************************************************* */
/* login */
const loginUser = async (req, res) => {

  const { user, pwd } = req.body

  const output_ = await pool_pg.query(`SELECT 
  name, username, password, owner_id, user_type, validation
  FROM users WHERE username='${user.toLowerCase().trim()}' AND password='${pwd.trim()}' LIMIT 1;`);

  const list = output_?.rows;

  const response = list.map((el) => {
    if (el['username'] === user && el['password'] === pwd) {
      return {
        name: el['name'],
        user_type: Number.parseInt(el['user_type']),
        validation: el['validation'],
        owner_id: el['owner_id'] ? el['owner_id'] : '',
      };
    }
  }).filter((el) => el)[0];


  if (response) {
    res.status(200).send({ name: response.name, user_type: response.user_type, refresh_token: '1', validation: response.validation, owner_id: response.owner_id, });
  }
  else {
    res.status(200).send({ name: '?', user_type: -1, refresh_token: '0', validation: null, owner_id: null });
  }
}


module.exports = {
  loginUser,
};




