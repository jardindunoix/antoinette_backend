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
const { getOperationsAfterGlobal } = require('../services/getOperations.js');
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
  FROM users WHERE username='${user}' AND password='${pwd}' LIMIT 1;`);

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

const mailcode = async (req, res) => {
  const { mail, owner_id, code, } = req.body;
  await mailer(mail.trim(), code, owner_id);
  res.status(200).send('ok');
}

const saveNewPasswordFirstEntrance = async (req, res) => {
  const { owner_id, passwordNew } = req.body;

  const returnComparativePass = (passRows, passReq) => passRows !== passReq ? 'ok' : 'same';
  const compare_pass = await pool_pg.query(`SELECT password FROM users WHERE owner_id='${owner_id}' LIMIT 1;`);
  const msg = returnComparativePass(compare_pass.rows[0].password, passwordNew);

  console.log(compare_pass.rows[0].password, passwordNew, msg,);
  if (msg === 'ok') {
    await pool_pg.query(`UPDATE users SET password='${passwordNew}', validation='ok'  WHERE owner_id='${owner_id}';`);
  }

  //



  res.status(200).send(msg);
}

/* ????????????????????????????????????????????????????????????????????????????????????????? */
const newreload = (req, res) => {

  res.status(200).send('ok');
}
/* ????????????????????????????????????????????????????????????????????????????????????????? */

/* save users */
const saveUser = async (req, res) => {
  try {
    await pool_pg.query(`insert into users (username, password, refresh_token, user_type, name) 
    values 
    (
        '${req.body['username']}',
        '${req.body['password']}',
        '123',
         ${req.body['user_type']},
        '${req.body['name']}')
        ;`);
    res.status(200).send('User saved!');
  } catch (error) {
    res.status(500).send('Server Error!');
  }
}


/* list sellers */
const listUsers = async (req, res) => {
  try {
    const sellersList = await pool_pg.query(`select * from users;`);
    res.status(200).send(sellersList['rows']);
  } catch (error) { console.log(`error en axios`, error); j }
}

const statistics = async (req, res) => {

  const quant = await pool_pg.query(`
            SELECT status_granted,
            count(status_granted)
            FROM sellers_active
            WHERE nickname <> 'MAMA6075595' -- 
            AND nickname <> 'TESTQZ6KDYZG' -- 
            AND nickname <> 'TESTYNQN2K5C' -- 
            AND nickname <> 'TETE2018224' -- 
            AND nickname <> 'USBLTRADING' -- 
            AND nickname <> 'USBLTRAIDING' -- 
            GROUP BY status_granted
            ORDER BY status_granted ASC
            ;
            `);

  /* 
 USBLTRAIDING | TG-638658a4988610000122d87d-731199549
 USBLTRADING  | 
 TETE2018224  | TG-637e34942e860800017b8995-829950255
 TESTYNQN2K5C | 
 TESTQZ6KDYZG | TG-62dac49765cfd500139762ad-764560202
 MAMA6075595  | 
 */

  const usblTrading = await pool_pg.query(`
            SELECT 
            id,
            nickname,
            -- registration_date,
            refresh_token,
            seller_id,
            status_granted,
            user_registered,
            fecha AS registration_date
            FROM sellers_active
            WHERE nickname = 'USBLTRAIDING'
            ORDER BY status_granted DESC, nickname ASC
            ;  
            `);

  const stockQuery = `
SELECT 
one.items + two.items AS items,
one.value_ + two.value_ AS value_
FROM (
      SELECT SUM(summary1.avail_quant) AS items, SUM(summary1.total_value) AS value_
      FROM (SELECT id, cast(price AS DECIMAL) AS price, cast(available_quantity AS INT) AS avail_quant, 
      cast(price AS DECIMAL) * cast(available_quantity AS INT) AS total_value
      FROM mlc_stock WHERE (inventory_id <> '' OR variations_inventory_id <> '')
      GROUP BY id, price, available_quantity) AS summary1
) AS one, 
(
      SELECT SUM(summary2.avail_quant) AS items, SUM(summary2.total_value) AS value_
      FROM (SELECT id, cast(price AS DECIMAL) AS price, cast(available_quantity AS INT) AS avail_quant, 
      cast(price AS DECIMAL) * cast(available_quantity AS INT) AS total_value
      FROM mlc_stock WHERE (inventory_id <> '' AND variations_inventory_id <> '')
      GROUP BY id, price, available_quantity) AS summary2
) AS two
;
            `;

  const stockQuery2 = `
        SELECT 
        SUM(available_quantity) AS items,
        SUM(value_) AS value_
        FROM (SELECT avail_det, available_quantity, price_api,
            available_quantity * price_api AS value_ FROM stock_oper 
            WHERE available_quantity>0
            ) AS var
        ;
  `;

  const stock = await pool_pg.query(stockQuery2);

  const items = stock['rows'][0]['items']
  const value = (Number.parseFloat(stock['rows'][0]['value_'])).toFixed(2);
  const usbltraiding = usblTrading['rows'][0];

  const results = {
    /* stock */
    items,
    value,
    usbltraiding,
    /* SELLERS STATS */
    actives: Number.parseInt(quant['rows'][0]['count']),
    inactives: Number.parseInt(quant['rows'][1]['count']),
    total: Number.parseInt(quant['rows'][0]['count']) + Number.parseInt(quant['rows'][1]['count']),
  };

  // console.log(results['items'], results['value']);

  res.status(200).send(results);
}

/* list granted ACTIVES for the menu */
const listGrantedActive = async (req, res) => {
  try {
    const list = await getListGrantedFromDDBB();
    res.status(200).send(list)
  } catch (error) { console.log(`ERRorror`, error); }
}

/* list granted users  AGENT */
const listGrantedUsers = async (req, res) => {
  try {
    const list = await getListGrantedFromActiveAgent();
    res.status(200).send(list);
  } catch (error) { console.log(`ERRorror`, error); }
}

/* lista para admin con refresh token ADMIN  */
const listGrantedUsersAdmin = async (req, res) => {
  try {
    const list = await getListGrantedFromActive();
    res.status(200).send(list)
  } catch (error) { console.log(`ERRorror`, error); }
}

/* list of items mlc */
const singleMkpl = async (req, res) => {
  try {


    const { refresh, mlc } = await req.body;
    // const mlcData = await pool_pg.query(`
    // SELECT * FROM mlc_variations WHERE id_mlc = '${mlc}'
    // ;`);
    // mlcData['rows'].forEach((q) => {
    //   console.log(q['id_mlc'], q['cbt_item_id']);
    // });

    // const arrFinal = mlcData['rows'];

    const singleData = await getSingleMkpl(refresh, mlc)
      .then(resp => resp, fail => console.log(`fail`)).catch(err => console.log(`err`));
    const singDat = await Promise.all(singleData).then((e) => e);
    const arrFinal = finalResultArray(singDat);

    res.status(200).send({ items: arrFinal });
  } catch (error) { console.log(`error en el get single mkpl`, error) }
}

/* fetch from invoice table total and values */
const sellersInvoiceList = async (req, res) => {
  try {
    const list = await pool_pg.query(getAccounts);
    list ? res.status(200).send({ list: list['rows'] })
      : res.status(200).send({ list: [] })
  } catch (error) { console.log(`first`, error) }
}

/* fetch details of seller values and items quantities */
const sellerInvoiceDetails = async (req, res) => {
  try {
    const { data } = req.body;
    const list = await poolQuery(queryListAccountAnalisis, data);
    const listNotListed = await poolQuery(queryListAccountAnalisisNotListed, data);
    if (list && listNotListed) {
      if (list['rows'].length > 0) {
        /* 1 */
        const globalArr = globalArrDetail(list['rows']);
        const finalList = globalArrDetailSecond(globalArr);
        const finalfinal = globalArrDetailThird(finalList);
        const finalfinalfinal = globalArrDetailFourth(finalfinal.flat(Infinity));
        const finalfinalfinalfinal = globalArrDetailFifth(finalfinalfinal);
        const finalfinalfinalfinalfinal = await globalArrDetailSixth(finalfinalfinalfinal);
        /* 2 */
        const finalNotListed = await globalArrDetailFifthNotListed(listNotListed['rows']);
        const finalNotListedlisted = await globalArrDetailSixth(finalNotListed);

        let selling_value_total_item_listed = 0;
        let iva_total_item_listed = 0;
        let fee_total_item_listed = 0;
        finalfinalfinalfinalfinal.forEach((item) => {
          if (item['selling_value_total_item'] > 0) selling_value_total_item_listed += item['selling_value_total_item'];
          if (item['iva_total_item'] > 0) iva_total_item_listed += item['iva_total_item'];
          if (item['fee_total_item'] > 0) fee_total_item_listed += item['fee_total_item'];
        })

        let selling_value_total_item_not_listed = 0;
        let iva_total_item_not_listed = 0;
        let fee_total_item_not_listed = 0;
        finalNotListedlisted.forEach((item) => {
          if (item['selling_value_total_item'] > 0) selling_value_total_item_not_listed += item['selling_value_total_item'];
          if (item['iva_total_item'] > 0) iva_total_item_not_listed += item['iva_total_item'];
          if (item['fee_total_item'] > 0) fee_total_item_not_listed += item['fee_total_item'];
        })

        fee_total_item_not_listed = Number.parseFloat(finalNotListedlisted.reduce((acc, item) => acc += item['fee_total_item'], 0));

        const totals = {
          selling_value_item: selling_value_total_item_listed + selling_value_total_item_not_listed,
          iva_item: iva_total_item_listed + iva_total_item_not_listed,
          fee_item: fee_total_item_listed + fee_total_item_not_listed,
        }

        res.status(200).send({
          list: finalfinalfinalfinalfinal.length > 0 ? finalfinalfinalfinalfinal : [],
          listNL: finalNotListedlisted.length > 0 ? finalNotListedlisted : [],
          invoicesNum: [],
          totals: totals,
        });
      } else { res.status(200).send({ list: [], listNL: [], invoicesNum: [], totals: [], }); }
    } else { res.status(200).send({ list: [], listNL: [], invoicesNum: [], totals: [], }); }
  } catch (error) { console.log(`Error details`, error) }
}

/* list of operations */
const getOperaciones = async (req, res) => {

  // hola desde local

  const { 
    usr_id, 
    sell_Id, 
    inventID, 
    inventID_variations, 
    refToken, 
    mkpl_id } = req.body;

  const data = { 
    inventory_id: inventID, 
    inventory_id_variations: inventID_variations,
    seller_id: sell_Id, 
    refToken, 
    usrId: usr_id, 
    mlcItem: mkpl_id };

  // console.log(data)

  await getOperationsAfterGlobal(data);
  res.status(200).send('ok');
} 

/* list of operations */
const getOperacionesItems = async (req, res) => {
  const { owner_id } = req.body;

  // (async function resolving(res) {
  //   try {
  //     const oper_ = await getOperationsItem(owner_id[0]);
  //     const oper = oper_ ? oper_['rows'] : [];
  //     res.status(200).send(oper);
  //   } catch (error) { console.log(`ERORR SUOER??`, error); }
  // }
  // )(res);

  setTimeout(async () => {
    try {
      const oper_ = await getOperationsItem(owner_id[0]);
      const oper = oper_ ? oper_['rows'] : [];
      res.status(200).send(oper);
    } catch (error) { console.log(`ERORR SUOER??`, error); }
  }, 5000);
}

/* TODO CHECK improvement  */
const getSellerInfo = async (req, res) => {
  try {
    const { name } = req.body;

    console.log(name);

    const data = await pool_pg.query(`SELECT owner_id FROM users WHERE name = '${name}' LIMIT 1;`);
    const ownerId = data['rows'][0]['owner_id'];

    console.log('CHECK IT!!!!!!!');

    const list = await poolQueryCopy(QUERY_LIST_ACCOUNT_ANALISIS, ownerId);
    const listNotListed = await poolQueryCopy(QUERY_LIST_ACCOUNT_ANALISIS_NOT_LISTED, data['rows'][0]['owner_id']);

    if (list && listNotListed) {
      /* 1 LISTED */
      const globalArr = list['rows'].length > 0 ? globalArrDetailCopy(list['rows']) : [];
      const finalList = globalArr.length > 0 ? globalArrDetailSecondCopy(globalArr) : [];
      const finalfinal = finalList.length > 0 ? globalArrDetailThirdCopy(finalList) : [];
      const finalfinalfinal = finalfinal.flat(Infinity).length > 0 ? globalArrDetailFourthCopy(finalfinal.flat(Infinity)) : [];
      const finalfinalfinalfinal = finalfinalfinal.length > 0 ? globalArrDetailFifthCopy(finalfinalfinal) : [];
      const finalfinalfinalfinalfinal = finalfinalfinalfinal.length > 0 ? await globalArrDetailSixthCopy(finalfinalfinalfinal) : [];

      /* 2 NOT LISTED */
      const finalNotListed = listNotListed['rows'].length > 0 ? await globalArrDetailFifthNotListedCopy(listNotListed['rows']) : [];
      const finalNotListedlisted = finalNotListed.length > 0 ? await globalArrDetailSixthCopy(finalNotListed) : [];


      /* TOTALS */
      const finalfinalfinalfinalfinalfinal = finalfinalfinalfinalfinal
        .filter((a) => (!((Number.parseFloat(a['diff_inv_meli']) === 0) && (Number.parseFloat(a['iva_diff']) === 0) && (Number.parseFloat(a['fee_diff']) === 0) && (Number.parseFloat(a['income_tax_diff']) === 0))))
      const finalNotListedlistedfinal = finalNotListedlisted
        .filter((a) => (!((Number.parseFloat(a['diff_inv_meli']) === 0) && (Number.parseFloat(a['iva_diff']) === 0) && (Number.parseFloat(a['fee_diff']) === 0) && (Number.parseFloat(a['income_tax_diff']) === 0))))

      let diff_inv_meli_totals_posit = 0;
      let diff_inv_meli_totals_negat = 0;
      let incomeTaxDue = 0;
      let ivaItemDuePosit = 0;
      let ivaItemDueNegat = 0;
      let feeItemDuePosit = 0;
      let feeItemDueNegat = 0;
      finalfinalfinalfinalfinalfinal.forEach((item) => {
        if (Number.parseFloat(item['diff_inv_meli']) > 0) { diff_inv_meli_totals_posit += item['diff_inv_meli'] };
        if (Number.parseFloat(item['diff_inv_meli']) < 0) { diff_inv_meli_totals_negat += item['diff_inv_meli'] };
        if (Number.parseFloat(item['iva_diff']) > 0) { ivaItemDuePosit += Number.parseFloat(item['iva_diff']) };
        if (Number.parseFloat(item['iva_diff']) < 0) { ivaItemDueNegat += Number.parseFloat(item['iva_diff']) };
        if (Number.parseFloat(item['fee_diff']) > 0) { feeItemDuePosit += Number.parseFloat(item['fee_diff']) };
        if (Number.parseFloat(item['fee_diff']) < 0) { feeItemDueNegat += Number.parseFloat(item['fee_diff']) };
        if (Number.parseFloat(item['income_tax_diff']) < 0) { incomeTaxDue += Number.parseFloat(item['income_tax_diff']) };
      });
      /* ------------- */
      let diff_inv_meli_totals_positNotListed = 0;
      let diff_inv_meli_totals_negatNotListed = 0;
      let incomeTaxDueNotListed = 0;
      let ivaItemDuePositNotListed = 0;
      let ivaItemDueNegatNotListed = 0;
      let feeItemDuePositNotListed = 0;
      let feeItemDueNegatNotListed = 0;
      finalNotListedlistedfinal.forEach((item) => {
        if (Number.parseFloat(item['diff_inv_meli']) > 0) { diff_inv_meli_totals_positNotListed += item['diff_inv_meli'] };
        if (Number.parseFloat(item['diff_inv_meli']) < 0) { diff_inv_meli_totals_negatNotListed += item['diff_inv_meli'] };
        if (Number.parseFloat(item['iva_diff']) > 0) { ivaItemDuePositNotListed += Number.parseFloat(item['iva_diff']) };
        if (Number.parseFloat(item['iva_diff']) < 0) { ivaItemDueNegatNotListed += Number.parseFloat(item['iva_diff']) };
        if (Number.parseFloat(item['fee_diff']) > 0) { feeItemDuePositNotListed += Number.parseFloat(item['fee_diff']) };
        if (Number.parseFloat(item['fee_diff']) < 0) { feeItemDueNegatNotListed += Number.parseFloat(item['fee_diff']) };
        if (Number.parseFloat(item['income_tax_diff']) < 0) { incomeTaxDueNotListed += Number.parseFloat(item['income_tax_diff']) };
      });

      const diffInvMeliTotals = (diff_inv_meli_totals_posit + diff_inv_meli_totals_negat) + (diff_inv_meli_totals_positNotListed + diff_inv_meli_totals_negatNotListed);
      const itd = incomeTaxDue + incomeTaxDueNotListed;

      const incomeTaxDueTotal = Number.parseFloat(itd);
      const ivaItemDueTotal = (
        Number.parseFloat((ivaItemDueNegat + ivaItemDuePosit).toFixed(2)) +
        Number.parseFloat((ivaItemDueNegatNotListed + ivaItemDuePositNotListed).toFixed(2)));
      const feeItemDueTotal = (
        Number.parseFloat((feeItemDueNegat + feeItemDuePosit).toFixed(2)) +
        Number.parseFloat((feeItemDueNegatNotListed + feeItemDuePositNotListed).toFixed(2)));
      const totalTotalsTotal = (incomeTaxDueTotal + ivaItemDueTotal + feeItemDueTotal);
      const totals = {
        // diff_inv_meli_totals: Number.parseInt(diffInvMeliTotals),
        income_tax_due: incomeTaxDueTotal,
        iva_item_due: ivaItemDueTotal,
        fee_item_due: feeItemDueTotal,
        total_totals: totalTotalsTotal,
      };
      const listDefinitive = [...finalfinalfinalfinalfinalfinal, ...finalNotListedlistedfinal];

      await pool_pg.query(`DELETE FROM listed_invoice WHERE owner_id = '${ownerId}';`);

      listDefinitive.forEach(async (p) => {
        await pool_pg.query(`INSERT INTO listed_invoice 
          (
            is_listed,
            owner_id,
            seller_id,
            mlc_item,
            sku,
            meli_price,
            invoice_items_total,
            meli_item_entered,
            diff_inv_meli,
            data_sku,
            meli_inbound_total,
            meli_sale_confirmation,
            selling_value_total_item,
            iva_diff,
            fee_diff,
            income_tax_diff,
            meli_top_date,
            summary_items,
            btn_btn,
            summary_items_extended
          )
          VALUES
          (
            '${p['is_listed']}',
            '${p['owner_id']}',
            '${p['seller_id']}',
            '${p['mlc_item']}',
            '${p['sku']}',
            '${p['meli_price']}',
            '${p['invoice_items_total']}',
            '${p['meli_item_entered']}',
            '${p['diff_inv_meli']}',
            '${p['data_sku']}',
            '${p['meli_inbound_total']}',
            '${p['meli_sale_confirmation']}',
            '${p['selling_value_total_item']}',
            '${p['iva_diff']}',
            '${p['fee_diff']}',
            '${p['income_tax_diff']}',
            '${p['meli_top_date']}',
            '${p['summary_items']}',
            '${p['btn_btn']}',
            '${p['summary_items_extended']}'
          )
          ;`);
      });

      const listExcel = listDefinitive.map((q) => {
        return q['summary_items'].map((w) => {
          if (w['is_inbound'] !== 'not inb')
            return {
              is_listed: q['is_listed'],
              mlc_item: q['mlc_item'],
              sku: q['sku'],
              mark_super: w['mark_super'],
              invoice_num: w['invoice_num'],
              is_inbound: w['is_inbound'],
              difference_items: w['difference_items'],
              invoice_quantity_total: w['invoice_quantity_total'],
              invoice_price: w['invoice_price'],
              invoice_cif: w['invoice_cif'],
              meli_inbound_quantity: w['meli_inbound_quantity'],
              meli_price: w['meli_price'],
              meli_cif: w['meli_cif'],
              difference_cif: w['difference_cif'],
              income_tax_result: w['income_tax_result'],
              vat_tax_result: w['vat_tax_result'],
              fee_result: w['fee_result'],
            }
        }).filter((q) => q);
      }).flat(Infinity);

      res.status(200).send({
        list: listDefinitive.length > 0 ? listDefinitive : [],
        list_excel: listExcel,
        totals: totals,
      });

    }
    else { res.status(200).send({ list: [], listNL: [], invoicesNum: [], totals: [], }); }

    res.status(200).send({ list: [], listNL: [], invoicesNum: [], totals: [], });
  } catch (error) { console.log(`first_-----__`, error) }
}

/* update refresh token from auth page */
const codeRT = async (req, res) => {
  try {
    if (req.body.data) {
      const dataRT = JSON.stringify(req.body.data).replaceAll('"', '');
      await updateOrInsertRT(dataRT);
    }
    res.status(200).send({ message: 'received' });
  } catch (error) { console.log(`Error recepcion Ref Tok, REVISAR`, error); }
}

/* update and insert new refresh token */
const updateOrInsertRT = async (rt) => {
  try {
    /* here validates if the RT is capable to fetch an access token */
    const vrt = await vRT(rt).then((resp) => resp);
    if (vrt) {
      await pool_pg.query(`delete from refresh_tokens where refresh_token ilike '%${rt.split('-')[2]}'`);
      /* if responds with an access token uses the RT in that response because  */
      if (vrt['data']['refresh_token']) {
        await pool_pg.query(`insert into refresh_tokens (refresh_token) values ('${vrt['data']['refresh_token']}');`);
      }
    }
  } catch (error) { console.log(`ERORR LLSSLSSL`, error); }
}

/* returns the curent list of the   */
const getInvoiceErrorList = async (req, res) => {
  try {
    const invoiceDataError = await pool_pg.query(`select inbound, sku  from invoice_data_error order by inbound;`);
    const issDataInvNum = await pool_pg.query(`select issuance_data, invoice_num  from invoice_data_error limit 1;`);
    if (invoiceDataError['rows'] && issDataInvNum['rows']) {
      if (invoiceDataError['rows'].length > 0) {

        const invoiceData = await pool_pg.query(`select 
                        inbound,no_items,selling_value,sku,mlc_item,owner_id,seller_id
                        from invoice_data where invoice_num = '${issDataInvNum['rows'][0]['invoice_num']}' order by owner_id;`);
        if (invoiceData['rows']) {
          res.status(200).send({
            invoiceDataError: invoiceDataError['rows'],
            invoiceData: invoiceData['rows'],
            issuance_data: issDataInvNum['rows'][0]['issuance_data'],
            invoice_num: issDataInvNum['rows'][0]['invoice_num']
          });
        } else {
          res.status(200).send({
            invoiceDataError: invoiceDataError['rows'],
            invoiceData: [],
            issuance_data: issDataInvNum['rows'][0]['issuance_data'],
            invoice_num: issDataInvNum['rows'][0]['invoice_num']
          });
        }

      } else {
        res.status(200).send({
          invoiceDataError: [],
          invoiceData: [],
          issuance_data: '',
          invoice_num: ''
        });
      }
    }
  } catch (error) { console.log(`Error in invoice error list`, error) }
}

const getInvoiceOperations = async (req, res) => {
  try {
    const { invoiceNumber } = req.body.data
    getOperationsAfterGlobalInvoice(invoiceNumber);
    res.status(200).send('getInvoiceOperations, ok');
  } catch (error) { console.log(error) }
}

module.exports = {
  loginUser,
  mailcode,
  saveNewPasswordFirstEntrance,
  newreload,
  saveUser,
  listUsers,
  statistics,
  listGrantedUsers,
  listGrantedUsersAdmin,
  listGrantedActive,
  singleMkpl,
  getOperaciones,
  codeRT,
  getOperacionesItems,
  getInvoiceErrorList,
  getInvoiceOperations,
  sellerInvoiceDetails,
  sellersInvoiceList,
  getSellerInfo
};




