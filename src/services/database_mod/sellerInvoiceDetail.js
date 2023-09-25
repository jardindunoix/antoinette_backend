const sprintf = require('sprintf');
const { pool_pg } = require('../../database');

/* hash the main list */
function globalArrDetail(goF) {
  const auxArr = [];
  const globalArr = [];
  for (let i = 0; i <= goF.length; i++) {
    if (i < goF.length) {
      if (i === 0) { auxArr.push(goF[i]); }
      else if (goF[i]['sku'] !== goF[i - 1]['sku']) {
        globalArr.push(auxArr.map((a) => a))
        auxArr.splice(0, auxArr.length);
        auxArr.push(goF[i]);
      } else if (goF[i]['sku'] === goF[i - 1]['sku']) { auxArr.push(goF[i]); }
    } else if (i === goF.length) { globalArr.push(auxArr.map((a) => a)) }
  }
  return globalArr;
}

function globalArrDetailSecond(goF) {
  return goF.map((go) => {
    const auxArr = [];
    const globalArr = [];
    for (let i = 0; i <= go.length; i++) {
      if (i < go.length) {
        if (i === 0) { auxArr.push(go[i]); }
        else if (go[i]['invoice_num'] !== go[i - 1]['invoice_num']) {
          globalArr.push(auxArr.map((a) => a))
          auxArr.splice(0, auxArr.length);
          auxArr.push(go[i]);
        }
        else if (go[i]['invoice_num'] === go[i - 1]['invoice_num']) { auxArr.push(go[i]); }
      } else if (i === go.length) { globalArr.push(auxArr.map((a) => a)) }
    }
    return globalArr;
  }).filter((e) => e);
}

function globalArrDetailThird(finalList) {
  return finalList.map((e) => {
    return e.map((d) => {
      let sum_invoice_quantity_total = 0;
      d.forEach((s) => sum_invoice_quantity_total += parseFloat(s['invoice_quantity']));
      const lastUp = String(d[0]['last_update']).split(' GMT')[0].split(' ');
      const lastUpdate = `${lastUp[2]}-${lastUp[1]}-${lastUp[3]}`;
      return {
        owner_id: d[0]['owner_id'],
        seller_id: d[0]['seller_id'],
        mlc_item: d[0]['mlc_item'],
        sku: d[0]['sku'],
        invoice_num: d[0]['invoice_num'],
        invoice_date: d[0]['invoice_date'],
        invoice_quantity_total: String(sum_invoice_quantity_total),
        invoice_price: d[0]['invoice_price'],
        meli_price: d[0]['meli_price'],
        meli_item_entered: d[0]['meli_item_entered'],
        meli_item_sold: d[0]['meli_item_sold'],
        meli_sold_value: d[0]['meli_sold_value'],
        meli_top_date: d[0]['meli_top_date'],
        iva_tax: d[0]['iva_tax'],
        income_tax: d[0]['income_tax'],
        fee_tax: d[0]['fee_tax'],
        total_tax: d[0]['total_tax'],
        last_update: lastUpdate,
        invoice_inbound_total: d.map((a) => a['invoice_inbound']).join('--'),
      };
    });
  });
}

function globalArrDetailFourth(goF) {
  const auxArr = [];
  const globalArr = [];
  for (let i = 0; i <= goF.length; i++) {
    if (i < goF.length) {
      if (i === 0) { auxArr.push(goF[i]); }
      else if (goF[i]['sku'] !== goF[i - 1]['sku']) {
        globalArr.push(auxArr.map((a) => a))
        auxArr.splice(0, auxArr.length);
        auxArr.push(goF[i]);
      }
      else if (goF[i]['sku'] === goF[i - 1]['sku']) { auxArr.push(goF[i]); }
    } else if (i === goF.length) { globalArr.push(auxArr.map((a) => a)) }
  }
  return globalArr;
}

function globalArrDetailFifth(finalfinal) {
  try {
    return finalfinal.map(async (a) => {
      let invoiceQuantityTotal = 0;
      a.forEach((w) => invoiceQuantityTotal += parseFloat(w['invoice_quantity_total']));
      const meliInbounds = await pool_pg.query(`
SELECT
ggg_results_external_references_value AS meli_inbound_num
,eee_results_detail_available_quantity AS meli_inbound_quantity
,date_created
FROM
analisis_operaciones_invoice
WHERE results_inventory_id = '${a[0]['sku']}'
AND aaa_user_id = '${a[0]['owner_id']}'
AND item_mkpl_id = '${a[0]['mlc_item']}'
AND hhh_results_type = 'INBOUND_RECEPTION'
AND results_external_references_type = 'inbound_id'
ORDER BY 
fecha_orden DESC
;
    `);

      const meliSaleConfirmation = await pool_pg.query(`
SELECT 
-- fff_results_result_total AS result_total,
-- results_result_available_quantity AS result_available_quantity, 
hhh_results_type AS type,
eee_results_detail_available_quantity AS detail_available_quantity,
results_result_not_available_quantity AS result_not_available_quantity,
date_created AS date
FROM analisis_operaciones_invoice
WHERE results_inventory_id = '${a[0]['sku']}'
AND hhh_results_type in ('SALE_CONFIRMATION','SALE_RETURN', 'SALE_CANCELATION') 
-- OR results_external_references_type = 'shipment_id'
ORDER BY fecha_orden DESC
;
    `);

      const meliSaleConfitmationPrice = meliSaleConfirmation ? meliSaleConfirmation['rows'].map((e) => {

        const getOrderDate = (date) => {
          const splited = date.split('-');
          const medio = getMothNum(splited[1]);
          const resul = Number.parseInt(`${splited[2]}${medio}${splited[0]}`);
          return resul;
        }

        const getMothNum = (spl) => {
          if (spl === 'ene') return '01';
          if (spl === 'feb') return '02';
          if (spl === 'mar') return '03';
          if (spl === 'abr') return '04';
          if (spl === 'may') return '05';
          if (spl === 'jun') return '06';
          if (spl === 'jul') return '07';
          if (spl === 'ago') return '08';
          if (spl === 'sep') return '09';
          if (spl === 'oct') return '10';
          if (spl === 'nov') return '11';
          if (spl === 'dic') return '12';
          else return '00';
        }

        const priceObj = Number.parseFloat(a[0]['meli_price']);
        const detailAvailableQuantity = Number.parseInt(e['detail_available_quantity']);
        const resultNotAvailableQuantity = Number.parseInt(e['result_not_available_quantity']);
        const itemSoldReturned = e['type'] === 'SALE_RETURN' ? resultNotAvailableQuantity : detailAvailableQuantity;
        const totalSold = ((priceObj) * (-1 * itemSoldReturned));
        const Iva = (((totalSold) * 0.19).toFixed(2)) + '/' + '19%';
        const orderDate = getOrderDate(e['date']);
        const Fee = orderDate > 20220601
          ? (((totalSold) * 0.04).toFixed(2)) + '/' + '4%'
          : (((totalSold) * 0.08).toFixed(2)) + '/' + '8%';

        const Iva_ = Number.parseFloat(((totalSold) * 0.19).toFixed(2));
        const Fee_ = orderDate > 20220601
          ? Number.parseFloat(((totalSold) * 0.04).toFixed(2))
          : Number.parseFloat(((totalSold) * 0.08).toFixed(2));

        return {
          type: e['type'],
          detail_available_quantity: detailAvailableQuantity,
          result_not_available_quantity: resultNotAvailableQuantity,
          date: e['date'],
          price: priceObj,
          total_sold_price: totalSold.toFixed(2),
          total_sold_price_: totalSold,
          tax_iva: Iva,
          tax_iva_: Iva_,
          fee: Fee,
          fee_: Fee_,
          order_date: orderDate,
        };
      }) : [];


      let sellingValueTotalItem = 0;
      let ivaTotalItem = 0;
      let feeTotalItem = 0;
      meliSaleConfitmationPrice.forEach((e, index) => {
        if (e['total_sold_price_'] > 0) sellingValueTotalItem += e['total_sold_price_'];
        if (e['tax_iva_'] > 0) ivaTotalItem += e['tax_iva_'];;
        if (e['fee_'] > 0) feeTotalItem += e['fee_'];;
      });


      return {
        owner_id: a[0]['owner_id'],
        seller_id: a[0]['seller_id'],
        mlc_item: a[0]['mlc_item'],
        sku: a[0]['sku'],
        meli_price: a[0]['meli_price'],
        invoice_items_total: String(invoiceQuantityTotal),
        meli_item_entered: a[0]['meli_item_entered'],
        diff_inv_meli: (invoiceQuantityTotal - parseInt(a[0]['meli_item_entered'])),
        meli_item_sold: a[0]['meli_item_sold'],
        meli_top_date: a[0]['meli_top_date'],
        /* ************************ */
        iva_tax: a[0]['iva_tax'],
        income_tax: a[0]['income_tax'],
        fee_tax: a[0]['fee_tax'],
        total_tax: a[0]['total_tax'],
        /* ************************ */
        last_update: a[0]['last_update'],
        data_sku: a.map((f) => ({
          invoice_num: f['invoice_num'],
          invoice_date: f['invoice_date'],
          invoice_quantity_total: f['invoice_quantity_total'],
          invoice_price: f['invoice_price'],
          invoice_inbound_total: f['invoice_inbound_total'],
        })),
        meli_inbound_total: meliInbounds ? meliInbounds['rows'] : [],
        meli_sale_confirmation: meliSaleConfitmationPrice, // type | detail_available_quantity | result_not_available_quantity | date 
        // selling_value_total_item: Number.parseFloat((meliSaleConfitmationPrice.reduce((acc, item) => acc += item['total_sold_price_'], 0)).toFixed(2)),
        // iva_total_item: Number.parseFloat((meliSaleConfitmationPrice.reduce((acc, item) => acc += item['tax_iva_'], 0)).toFixed(2)),
        // fee_total_item: Number.parseFloat((meliSaleConfitmationPrice.reduce((acc, item) => acc += item['fee_'], 0)).toFixed(2)),
        selling_value_total_item: Number.parseFloat(sellingValueTotalItem.toFixed(2)),
        iva_total_item: Number.parseFloat(ivaTotalItem.toFixed(2)),
        fee_total_item: Number.parseFloat(feeTotalItem.toFixed(2)),
      }
    });
  } catch (error) { console.log(`ERR`, error) }
}

function globalArrDetailFifthNotListed(finalfinal) {
  try {
    return finalfinal.map(async (a) => {
      const lastUp = String(a['last_update']).split(' GMT')[0].split(' ');
      const lastUpdate = `${lastUp[2]}-${lastUp[1]}-${lastUp[3]}`;

      const meliInbounds = await pool_pg.query(`
SELECT
ggg_results_external_references_value AS meli_inbound_num
,eee_results_detail_available_quantity AS meli_inbound_quantity
,date_created
FROM
analisis_operaciones_invoice
WHERE results_inventory_id = '${a['sku']}'
AND aaa_user_id = '${a['owner_id']}'
AND item_mkpl_id = '${a['mlc_item']}'
AND hhh_results_type = 'INBOUND_RECEPTION'
AND results_external_references_type = 'inbound_id'
ORDER BY 
fecha_orden DESC
;
        `);

      const meliSaleConfirmation = await pool_pg.query(`
SELECT 
-- fff_results_result_total AS result_total,
-- results_result_available_quantity AS result_available_quantity, 
hhh_results_type AS type,
eee_results_detail_available_quantity AS detail_available_quantity,
results_result_not_available_quantity AS result_not_available_quantity,
date_created AS date
FROM analisis_operaciones_invoice
WHERE results_inventory_id = '${a['sku']}'
AND hhh_results_type in ('SALE_CONFIRMATION','SALE_RETURN', 'SALE_CANCELATION') 
-- OR results_external_references_type = 'shipment_id'
ORDER BY fecha_orden DESC
;
    `);

      const meliSaleConfitmationPrice = meliSaleConfirmation ? meliSaleConfirmation['rows'].map((e) => {

        const getOrderDate = (date) => {
          const splited = date.split('-');
          const medio = getMothNum(splited[1]);
          const resul = Number.parseInt(`${splited[2]}${medio}${splited[0]}`);
          return resul;
        }

        const getMothNum = (spl) => {
          if (spl === 'ene') return '01';
          if (spl === 'feb') return '02';
          if (spl === 'mar') return '03';
          if (spl === 'abr') return '04';
          if (spl === 'may') return '05';
          if (spl === 'jun') return '06';
          if (spl === 'jul') return '07';
          if (spl === 'ago') return '08';
          if (spl === 'sep') return '09';
          if (spl === 'oct') return '10';
          if (spl === 'nov') return '11';
          if (spl === 'dic') return '12';
          else return '00';
        }

        const priceObj = Number.parseFloat(a['meli_price']);
        const detailAvailableQuantity = Number.parseInt(e['detail_available_quantity']);
        const resultNotAvailableQuantity = Number.parseInt(e['result_not_available_quantity']);
        const itemSoldReturned = e['type'] === 'SALE_RETURN' ? resultNotAvailableQuantity : detailAvailableQuantity;
        const totalSold = ((priceObj) * (-1 * itemSoldReturned));
        const Iva = (((totalSold) * 0.19).toFixed(2)) + '/' + '19%';
        const orderDate = getOrderDate(e['date']);
        const Fee = orderDate > 20220601
          ? (((totalSold) * 0.04).toFixed(2)) + '/' + '4%'
          : (((totalSold) * 0.08).toFixed(2)) + '/' + '8%';

        const Iva_ = Number.parseFloat(((totalSold) * 0.19).toFixed(2));
        const Fee_ = orderDate > 20220601
          ? Number.parseFloat(((totalSold) * 0.04).toFixed(2))
          : Number.parseFloat(((totalSold) * 0.08).toFixed(2));

        return {
          type: e['type'],
          detail_available_quantity: detailAvailableQuantity,
          result_not_available_quantity: resultNotAvailableQuantity,
          date: e['date'],
          price: priceObj,
          total_sold_price: totalSold.toFixed(2),
          total_sold_price_: totalSold,
          tax_iva: Iva,
          tax_iva_: Iva_,
          fee: Fee,
          fee_: Fee_,
          order_date: orderDate,
        };
      }) : [];

      let sellingValueTotalItem = 0;
      let ivaTotalItem = 0;
      let feeTotalItem = 0;
      meliSaleConfitmationPrice.forEach((e) => {
        if (e['total_sold_price_'] > 0) sellingValueTotalItem += e['total_sold_price_'];
        if (e['tax_iva_'] > 0) ivaTotalItem += e['tax_iva_'];;
        if (e['fee_'] > 0) feeTotalItem += e['fee_'];;
      });

      return {
        owner_id: a['owner_id'],
        seller_id: a['seller_id'],
        mlc_item: a['mlc_item'],
        sku: a['sku'],
        meli_price: a['meli_price'],
        meli_item_entered: a['meli_item_entered'],
        meli_item_sold: a['meli_item_sold'],
        meli_top_date: a['meli_top_date'],
        /* ************************ */
        iva_tax: a['iva_tax'],
        income_tax: a['income_tax'],
        fee_tax: a['fee_tax'],
        total_tax: a['total_tax'],
        /* ************************ */
        last_update: lastUpdate,
        meli_inbound_total: meliInbounds ? meliInbounds['rows'] : [],
        meli_sale_confirmation: meliSaleConfitmationPrice, // type | detail_available_quantity | result_not_available_quantity | date 
        // selling_value_total_item: Number.parseFloat((meliSaleConfitmationPrice.reduce((acc, item) => acc += item['total_sold_price_'], 0)).toFixed(2)),
        // iva_total_item: Number.parseFloat((meliSaleConfitmationPrice.reduce((acc, item) => acc += item['tax_iva_'], 0)).toFixed(2)),
        // fee_total_item: Number.parseFloat((meliSaleConfitmationPrice.reduce((acc, item) => acc += item['fee_'], 0)).toFixed(2)),
        selling_value_total_item: Number.parseFloat(sellingValueTotalItem.toFixed(2)),
        iva_total_item: Number.parseFloat(ivaTotalItem.toFixed(2)),
        fee_total_item: Number.parseFloat(feeTotalItem.toFixed(2)),
      }
    });
  } catch (error) { console.log(`FIRST`, error) }
}

async function globalArrDetailSixth(list) {

  return await Promise.all(list).then((el) => (el)).catch((err) => err);
}

/* SERVICES */
/* 1 */
async function poolQuery(query, data) {
  return await pool_pg.query(sprintf(query, data));
}

function finalfinalDetail(globalArr) {
  return globalArr.flat(Infinity).length > 0
    ?
    globalArr.map((row) => {
      const globalArraux = hashIt(row);
      return globalArraux.map((q) => reduceFinalList(q)).filter((i) => i);
    }).filter((i) => i)
    :
    []
}

/* finalfinalDetail */
const hashIt = (row) => {
  const auxArraux = [];
  const globalArraux = [];
  for (let i = 0; i <= row.length; i++) {
    if (i < row.length) {
      if (i === 0) { auxArraux.push(row[i]); }
      else if (row[i]['invoice_num'] !== row[i - 1]['invoice_num']) {
        globalArraux.push(auxArraux.map((a) => a));
        auxArraux.splice(0, auxArraux.length);
        auxArraux.push(row[i]);
      }
      else if (row[i]['invoice_num'] === row[i - 1]['invoice_num']) { auxArraux.push(row[i]); }
    } else if (i === row.length) { globalArraux.push(auxArraux.map((a) => a)) }
  }
  return globalArraux;
}

const reduceFinalList = (q) => {
  return q.map((w) => {
    const itemSold_ = w['itemSold'] ? parseInt(w['itemSold']) : 0
    const totalSoldValue = parseFloat((itemSold_ * parseFloat(w['priceApi'])).toFixed(2));
    const ivaTax_ = (totalSoldValue * 0.19);
    const incomeTax_ = (totalSoldValue * 0.4);
    const feeTax_ = (totalSoldValue * 0.04);
    return {
      owner_id: w['owner_id'],
      seller_id: w['seller_id'],
      order_invoice_num: w['order_invoice_num'],
      sku: w['sku'],
      mlc_item: w['mlc_item'],
      /* ***** */
      invoice_num: w['invoice_num'],
      invoice_inbound: w['inbound'],
      invoice_price: parseFloat(w['priceInvoice']),
      invoice_quantity: parseInt(w['quantityInvoice']),
      invoice_date: w['issuanceDate'],
      meli_price: parseFloat(w['priceApi']),
      meli_item_entered: parseInt(w['itemEntered']),
      meli_item_sold: itemSold_,
      meli_sold_value: totalSoldValue,
      meli_top_date: w['topDate'],
      /* ***** */
      iva_tax: parseFloat(ivaTax_.toFixed(2)),
      income_tax: parseFloat(incomeTax_.toFixed(2)),
      fee_tax: parseFloat(feeTax_.toFixed(2)),
      total_tax: parseFloat((ivaTax_ + incomeTax_ + feeTax_).toFixed(2)),
      /* ***** */
    }
  });
}


module.exports = {
  poolQuery,
  finalfinalDetail,
  globalArrDetail,
  globalArrDetailSecond,
  globalArrDetailThird,
  globalArrDetailFourth,
  globalArrDetailFifth,
  globalArrDetailSixth,
  globalArrDetailFifthNotListed,
};
