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
  try {
    
  } catch (error) {
    
  }
  
}


module.exports = {
  loginUser,
};




