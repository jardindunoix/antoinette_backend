
const sprintf = require('sprintf');
const { pool_pg } = require('../../database');

/* hash the main list */
function globalArrDetailCopy(goF) {
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

function globalArrDetailSecondCopy(goF) {
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

function globalArrDetailThirdCopy(finalList) {
  return finalList.map((e) => {
    return e.map((d) => {
      let sum_invoice_quantity_total = 0;
      d.forEach((s) => sum_invoice_quantity_total += parseFloat(s['invoice_quantity']));
      const lastUp = String(d[0]['last_update']).split(' GMT')[0].split(' ');
      const lastUpdate = `${lastUp[2]}-${lastUp[1]}-${lastUp[3]}`;

      return d.map((a) => {
        return {
          owner_id: d[0]['owner_id'],
          seller_id: d[0]['seller_id'],
          mlc_item: d[0]['mlc_item'],
          sku: d[0]['sku'],
          invoice_num: d[0]['invoice_num'],
          invoice_date: d[0]['invoice_date'],
          // invoice_quantity_total: String(sum_invoice_quantity_total),
          invoice_quantity_total: a['invoice_quantity'],
          invoice_price: d[0]['invoice_price'],
          meli_price: a['meli_price'],
          meli_item_entered: d[0]['meli_item_entered'],
          meli_item_sold: d[0]['meli_item_sold'],
          meli_sold_value: d[0]['meli_sold_value'],
          meli_top_date: d[0]['meli_top_date'],
          iva_tax: d[0]['iva_tax'],
          income_tax: d[0]['income_tax'],
          fee_tax: d[0]['fee_tax'],
          total_tax: d[0]['total_tax'],
          last_update: lastUpdate,
          invoice_inbound_total: a['invoice_inbound'],
        };
      })
    });
  });
}

function globalArrDetailFourthCopy(goF) {
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

function globalArrDetailFifthCopy(finalfinal) {
  try {
    return finalfinal.map(async (a) => {
      let invoiceQuantityTotal = 0;
      a.forEach((w) => invoiceQuantityTotal += parseFloat(w['invoice_quantity_total']));

      const meliInbounds = await pool_pg.query(`
SELECT
ggg_results_external_references_value AS meli_inbound_num
,eee_results_detail_available_quantity AS meli_inbound_quantity
,date_created
,fecha_orden
FROM
analisis_operaciones_invoice
WHERE results_inventory_id = '${a[0]['sku']}'
AND aaa_user_id = '${a[0]['owner_id']}'
AND item_mkpl_id = '${a[0]['mlc_item']}'
AND hhh_results_type = 'INBOUND_RECEPTION'
AND results_external_references_type = 'inbound_id'
AND fecha_orden > 202200000000
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

        const orderDate = getOrderDate(e['date']);

        if (orderDate > 20211231) {
          const priceObj = Number.parseFloat(a[0]['meli_price']);
          const detailAvailableQuantity = Number.parseInt(e['detail_available_quantity']);
          const resultNotAvailableQuantity = Number.parseInt(e['result_not_available_quantity']);
          const itemSoldReturned = e['type'] === 'SALE_RETURN' ? resultNotAvailableQuantity : detailAvailableQuantity;
          const totalSold = ((priceObj) * (-1 * itemSoldReturned));


          const Iva = (((totalSold) - (totalSold / 1.19)).toFixed(2)) + '/' + '19%';
          const incomeTax = (((totalSold / 1.19) * 0.4).toFixed(2)) + '/' + '40%';
          const Fee = orderDate > 20220601
            ? (((totalSold) * 0.06).toFixed(2)) + '/' + '6%'
            : (((totalSold) * 0.08).toFixed(2)) + '/' + '8%';


          const Iva_ = Number.parseFloat(((totalSold) - (totalSold / 1.19)).toFixed(2));
          const incomeTax_ = Number.parseFloat(((totalSold / 1.19) * 0.4).toFixed(2));
          const Fee_ = orderDate > 20220601
            ? Number.parseFloat(((totalSold) * 0.06).toFixed(2))
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
            income_tax: incomeTax,
            income_tax_: incomeTax_,
            order_date: orderDate,
          };
        }
      }).filter((e) => e) : [];

      let sellingValueTotalItem = 0;
      let ivaTotalItem = 0;
      let feeTotalItem = 0;
      let incomeTotalItem = 0;
      let invoiceItemsTotal = 0;
      meliSaleConfitmationPrice.forEach((e, index) => {
        if (e['total_sold_price_'] > 0) sellingValueTotalItem += e['total_sold_price_'];
        if (e['tax_iva_'] > 0) ivaTotalItem += e['tax_iva_'];;
        if (e['fee_'] > 0) feeTotalItem += e['fee_'];
        if (e['income_tax_'] > 0) incomeTotalItem += e['income_tax_'];;
        if (e['detail_available_quantity'] < 0) invoiceItemsTotal += (e['detail_available_quantity'] * -1);
      });

      const meliItemEntered = meliInbounds ? meliInbounds['rows'].reduce((acc, item) => acc += Number.parseInt(item['meli_inbound_quantity']), 0) : 0;

      const diffInvMeli = (invoiceQuantityTotal - meliItemEntered);
      const diffIncome = (invoiceItemsTotal > 0) && (diffInvMeli < 0) ? (incomeTotalItem / invoiceItemsTotal) * ((diffInvMeli * -1)) : 0;
      const diffIva = (invoiceItemsTotal > 0) && (diffInvMeli !== 0) ? (Number.parseFloat(ivaTotalItem.toFixed(2)) / invoiceItemsTotal) * ((diffInvMeli * -1)) : 0;
      const diffFee = (invoiceItemsTotal > 0) && (diffInvMeli !== 0) ? (Number.parseFloat(feeTotalItem.toFixed(2)) / invoiceItemsTotal) * ((diffInvMeli * -1)) : 0;

      const meliInboundsTable = meliInbounds ? meliInbounds['rows'].map((m) => {
        const meliCif = (Number.parseFloat(a[0]['meli_price'])) * Number.parseInt(m['meli_inbound_quantity']);
        const meliVat = ((meliCif) - (meliCif / 1.19));
        const meliFee = meliCif * 0.06;

        return {
          date_created: m['date_created'],
          fecha_orden: m['fecha_orden'],
          meli_inbound_num: m['meli_inbound_num'],
          meli_inbound_quantity: m['meli_inbound_quantity'],
          meli_price: a[0]['meli_price'],
          meli_cif: meliCif.toFixed(2),
          meli_vat: meliVat.toFixed(2),
          meli_fee: meliFee.toFixed(2),
        }
      }).filter((e) => e['meli_price']) : [];

      /* invoiceGOF */
      const invoiceGOF = a.map((f) => {
        const invoiceCif = (Number.parseFloat(f['invoice_price'])) * Number.parseInt(f['invoice_quantity_total']);
        const invoiceVat = ((invoiceCif) - (invoiceCif / 1.19));
        const invoiceFee = invoiceCif * 0.06;

        return {
          invoice_num: f['invoice_num'],
          invoice_date: f['invoice_date'],
          invoice_inbound_total: f['invoice_inbound_total'],
          invoice_quantity_total: f['invoice_quantity_total'],
          invoice_price: f['invoice_price'],
          invoice_cif: invoiceCif.toFixed(2),
          invoice_vat: invoiceVat.toFixed(2),
          invoice_fee: invoiceFee.toFixed(2),
        }
      });
      const invoiceGOFGOFGOF = invoiceGOFGOF(invoiceGOF);
      const invoiceGOFGOFGOFGOF = invoiceGOFGOFGOF.map((e) => {
        return e.map((q) => {
          return {
            invoice_num: q['invoice_num'],
            invoice_date: q['invoice_date'],
            invoice_inbound_total: q['invoice_inbound_total'],
            invoice_quantity_total: e.reduce((acc, item) => acc += Number.parseInt(item['invoice_quantity_total']), 0),
            invoice_price: q['invoice_price'],
            invoice_cif: Number.parseFloat(e.reduce((acc, item) => acc += Number.parseFloat(item['invoice_cif']), 0).toFixed(2)),
          }
        })
      });

      const invoiceGOFGOFGOFGOFGOF = invoiceGOFGOFGOFGOF.map((b) => {
        const date = Number.parseInt(b[0]['invoice_date'].split('/').join(''));
        return {
          sku: a[0]['sku'],
          invoice_num: b[0]['invoice_num'],
          invoice_date: b[0]['invoice_date'],
          invoice_inbound_total: b.length > 0 ? b[0]['invoice_inbound_total'] : 'not inb',
          invoice_quantity_total: b.length > 0 ? b[0]['invoice_quantity_total'] : 0,
          invoice_price: b.length > 0 ? Number.parseFloat(b[0]['invoice_price']) : 0,
          invoice_cif: b.length > 0 ? b[0]['invoice_cif'] : 0,
          invoice_date_order: date,
        }
      });

      /* meliInboundsTable */
      const meliInboundsTableGOFGOF = meliInboundsTableGOF(meliInboundsTable);
      const meliInboundsTableGOFGOFGOF = meliInboundsTableGOFGOF.map((e) => {
        return e.map((q) => {
          return {
            meli_inbound_num: q['meli_inbound_num'],
            meli_inbound_quantity: e.reduce((acc, item) => acc += Number.parseInt(item['meli_inbound_quantity']), 0),
            meli_price: q['meli_price'],
            meli_cif: Number.parseFloat(e.reduce((acc, item) => acc += Number.parseFloat(item['meli_cif']), 0).toFixed(2)),
          }
        })
      });
      const meliInboundsTableGOFGOFGOFGOF = meliInboundsTableGOFGOFGOF.map((b) => {
        return {
          sku: a[0]['sku'],
          meli_inbound_num: b.length > 0 ? b[0]['meli_inbound_num'] : 'not inb',
          meli_inbound_quantity: b.length > 0 ? b[0]['meli_inbound_quantity'] : 0,
          meli_price: b.length > 0 ? Number.parseFloat(b[0]['meli_price']) : 0,
          meli_cif: b.length > 0 ? b[0]['meli_cif'] : 0,
        }
      });

      const mixedInboundIn = invoiceGOFGOFGOFGOFGOF.map((d) => {
        return meliInboundsTableGOFGOFGOFGOF.map((e) => {
          if (d['invoice_inbound_total'].includes(e['meli_inbound_num'])) {
            d.marked_one = 'ok';
            e.marked_two = 'ok'
            return {
              sku: d['sku'],
              mark: 'ok',
              mark_super: 'ok',
              invoice_num: d['invoice_num'],
              invoice_date: d['invoice_date'],
              invoice_inbound_total: d['invoice_inbound_total'],
              invoice_quantity_total: d['invoice_quantity_total'],
              invoice_price: d['invoice_price'],
              invoice_cif: d['invoice_cif'],
              meli_inbound_num: e['meli_inbound_num'],
              meli_inbound_quantity: e['meli_inbound_quantity'],
              meli_price: e['meli_price'],
              meli_cif: e['meli_cif'],
            }
          }
        }).filter((e) => e);
      }).filter((e) => e);

      const mixedInboundNotIn = invoiceGOFGOFGOFGOFGOF.map((d) => {
        return meliInboundsTableGOFGOFGOFGOF.map((e) => {
          if (!(d['invoice_inbound_total'].includes(e['meli_inbound_num'])) && !d['marked_one']) {
            d.marked_one = 'not';
            // e.marked_two = 'ok';
            return {
              sku: d['sku'],
              mark: 'not',
              invoice_num: d['invoice_num'],
              invoice_date: d['invoice_date'],
              invoice_inbound_total: d['invoice_inbound_total'],
              invoice_quantity_total: d['invoice_quantity_total'],
              invoice_price: d['invoice_price'],
              invoice_cif: d['invoice_cif'],
              meli_inbound_num: '-',
              meli_inbound_quantity: 0,
              meli_price: 0,
              meli_cif: 0,
            }
          }
        }).filter((e) => e);
      }).filter((e) => e);

      const mixedInboundNotInInverse = meliInboundsTableGOFGOFGOFGOF.map((d) => {
        if (!d.marked_two) {
          return {
            sku: d['sku'],
            mark: 'not',
            invoice_num: '-',
            invoice_date: '-',
            invoice_inbound_total: '-',
            invoice_quantity_total: 0,
            invoice_price: 0,
            invoice_cif: 0,
            meli_inbound_num: d['meli_inbound_num'],
            meli_inbound_quantity: d['meli_inbound_quantity'],
            meli_price: d['meli_price'],
            meli_cif: d['meli_cif'],
          }
        }
      }).filter((e) => e);

      const resulfinal = [...tabletableTableGOF(mixedInboundIn.flat(Infinity)), ...tabletableTableGOF(mixedInboundNotIn.flat(Infinity)), ...tabletableTableGOF(mixedInboundNotInInverse.flat(Infinity))]
      const resulfinalfinal = resulfinal.flat(Infinity).map((w) => {
        const differenceCif = w['invoice_cif'] - w['meli_cif'];
        const differenceItems = w['invoice_quantity_total'] - w['meli_inbound_quantity'];
        return {
          mark_super: w['mark_super'] ? w['mark_super'] : '',
          invoice_num: w['invoice_num'],
          is_inbound: w['meli_inbound_num'] !== '-' ? w['meli_inbound_num'] : w['invoice_inbound_total'],
          difference_items: Number.parseFloat(differenceItems.toFixed(2)),
          invoice_quantity_total: w['invoice_quantity_total'],
          invoice_price: w['invoice_price'],
          invoice_cif: w['invoice_cif'],
          meli_inbound_quantity: w['meli_inbound_quantity'],
          meli_price: w['meli_price'],
          meli_cif: w['meli_cif'],
          difference_cif: Number.parseFloat(differenceCif.toFixed(2)),
          income_tax_result: differenceCif < 0 ? Number.parseFloat(((differenceCif / 1.19) * 0.4).toFixed(2)) : 0,
          vat_tax_result: Number.parseFloat(((differenceCif) - (differenceCif / 1.19)).toFixed(2)),
          fee_result: Number.parseFloat(((differenceCif) * 0.06).toFixed(2)),
        }
      });

      const diffInvMeli__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['difference_items'], 0).toFixed(2));
      const diffIva__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['vat_tax_result'], 0).toFixed(2));
      const diffFee__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['fee_result'], 0).toFixed(2));
      const diffIncome__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['income_tax_result'], 0).toFixed(2));

      return {
        is_listed: '--',
        owner_id: a[0]['owner_id'],
        seller_id: a[0]['seller_id'],
        mlc_item: a[0]['mlc_item'],
        sku: a[0]['sku'],
        meli_price: a[0]['meli_price'],
        invoice_items_total: String(invoiceQuantityTotal),
        meli_item_entered: meliItemEntered,
        diff_inv_meli: diffInvMeli__,
        data_sku: invoiceGOF,
        meli_inbound_total: meliInboundsTable,
        meli_sale_confirmation: meliSaleConfitmationPrice,
        selling_value_total_item: Number.parseFloat(sellingValueTotalItem.toFixed(2)),
        iva_diff: Number.parseFloat(diffIva__.toFixed(2)),
        fee_diff: Number.parseFloat(diffFee__.toFixed(2)),
        income_tax_diff: Number.parseFloat(diffIncome__.toFixed(2)),
        meli_top_date: a[0]['meli_top_date'],
        summary_items: resulfinalfinal,
        btn_btn: '',
        summary_items_extended: [],
      }

    });
  } catch (error) { console.log(`ERR`, error) }
}

function globalArrDetailFifthNotListedCopy(finalfinal) {
  try {
    return finalfinal.map(async (a) => {
      const lastUp = String(a['last_update']).split(' GMT')[0].split(' ');
      const lastUpdate = `${lastUp[2]}-${lastUp[1]}-${lastUp[3]}`;

      const meliInbounds = await pool_pg.query(`
SELECT
ggg_results_external_references_value AS meli_inbound_num
,eee_results_detail_available_quantity AS meli_inbound_quantity
,date_created
,fecha_orden
FROM
analisis_operaciones_invoice
WHERE results_inventory_id = '${a['sku']}'
AND aaa_user_id = '${a['owner_id']}'
AND item_mkpl_id = '${a['mlc_item']}'
AND hhh_results_type = 'INBOUND_RECEPTION'
AND results_external_references_type = 'inbound_id'
AND fecha_orden > 202200000000
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
        const orderDate = getOrderDate(e['date']);

        if (orderDate > 20211231) {
          const priceObj = Number.parseFloat(a['meli_price']);
          const detailAvailableQuantity = Number.parseInt(e['detail_available_quantity']);
          const resultNotAvailableQuantity = Number.parseInt(e['result_not_available_quantity']);
          const itemSoldReturned = e['type'] === 'SALE_RETURN' ? resultNotAvailableQuantity : detailAvailableQuantity;
          const totalSold = ((priceObj) * (-1 * itemSoldReturned));
          const Iva = (((totalSold) - (totalSold / 1.19)).toFixed(2)) + '/' + '19%';
          const Fee = orderDate > 20220601
            ? (((totalSold) * 0.06).toFixed(2)) + '/' + '6%'
            : (((totalSold) * 0.08).toFixed(2)) + '/' + '8%';

          const Iva_ = Number.parseFloat(((totalSold) - (totalSold / 1.19)).toFixed(2));
          const Fee_ = orderDate > 20220601
            ? Number.parseFloat(((totalSold) * 0.06).toFixed(2))
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
        }
      }).filter((e) => e) : [];

      let sellingValueTotalItem = 0;
      let ivaTotalItem = 0;
      let feeTotalItem = 0;
      meliSaleConfitmationPrice.forEach((e) => {
        if (e['total_sold_price_'] > 0) sellingValueTotalItem += e['total_sold_price_'];
        if (e['tax_iva_'] > 0) ivaTotalItem += e['tax_iva_'];;
        if (e['fee_'] > 0) feeTotalItem += e['fee_'];;
      });

      const meliItemEntered = meliInbounds ? meliInbounds['rows'].reduce((acc, item) => acc += Number.parseInt(item['meli_inbound_quantity']), 0) : 0;

      const meliInboundsTable = meliInbounds ? meliInbounds['rows'].map((m) => {
        const meliCif = (Number.parseFloat(a['meli_price'])) * Number.parseInt(m['meli_inbound_quantity']);
        const meliVat = (meliCif) - (meliCif / 1.19);
        const meliFee = meliCif * 0.06;

        return {
          date_created: m['date_created'],
          fecha_orden: m['fecha_orden'],
          meli_inbound_num: m['meli_inbound_num'],
          meli_inbound_quantity: m['meli_inbound_quantity'],
          meli_price: a['meli_price'],
          meli_cif: meliCif.toFixed(2),
          meli_vat: meliVat.toFixed(2),
          meli_fee: meliFee.toFixed(2),
        }
      }).filter((e) => e['meli_price']) : [];


      /* inner tables */
      const meliInboundsTableGOFGOF = meliInboundsTableGOF(meliInboundsTable);

      const meliInboundsTableGOFGOFGOF = meliInboundsTableGOFGOF.map((e) => {
        return e.map((q) => {
          return {
            meli_inbound_num: q['meli_inbound_num'],
            meli_inbound_quantity: e.reduce((acc, item) => acc += Number.parseInt(item['meli_inbound_quantity']), 0),
            meli_price: q['meli_price'],
            meli_cif: Number.parseFloat(e.reduce((acc, item) => acc += Number.parseFloat(item['meli_cif']), 0).toFixed(2)),
          }
        })
      });

      const meliInboundsTableGOFGOFGOFGOF = meliInboundsTableGOFGOFGOF.map((b) => {
        return {
          sku: a['sku'],
          meli_inbound_num: b.length > 0 ? b[0]['meli_inbound_num'] : 'not inb',
          meli_inbound_quantity: b.length > 0 ? b[0]['meli_inbound_quantity'] : 0,
          meli_price: b.length > 0 ? Number.parseFloat(b[0]['meli_price']) : 0,
          meli_cif: b.length > 0 ? b[0]['meli_cif'] : 0,
        }
      });

      const mixedInboundNotInInverse = meliInboundsTableGOFGOFGOFGOF.map((d) => {
        return {
          sku: d['sku'],
          mark: 'not',
          invoice_num: '-',
          invoice_date: '-',
          invoice_inbound_total: '-',
          invoice_quantity_total: 0,
          invoice_price: 0,
          invoice_cif: 0,
          meli_inbound_num: d['meli_inbound_num'],
          meli_inbound_quantity: d['meli_inbound_quantity'],
          meli_price: d['meli_price'],
          meli_cif: d['meli_cif'],
        }
      }).filter((e) => e);

      const resulfinal = tabletableTableGOF(mixedInboundNotInInverse.flat(Infinity));

      const resulfinalfinal = resulfinal.flat(Infinity).map((w) => {
        const differenceCif = 0 - w['meli_cif'];
        const differenceItems = 0 - w['meli_inbound_quantity'];
        return {
          mark_super: w['mark_super'] ? w['mark_super'] : '',
          invoice_num: '--',
          is_inbound: w['meli_inbound_num'],
          difference_items: Number.parseFloat(differenceItems.toFixed(2)),
          invoice_quantity_total: 0,
          invoice_price: 0,
          invoice_cif: 0,
          meli_inbound_quantity: w['meli_inbound_quantity'],
          meli_price: w['meli_price'],
          meli_cif: w['meli_cif'],
          difference_cif: Number.parseFloat(differenceCif.toFixed(2)),
          income_tax_result: differenceCif < 0 ? Number.parseFloat(((differenceCif / 1.19) * 0.4).toFixed(2)) : 0,
            vat_tax_result: Number.parseFloat(((differenceCif) - (differenceCif / 1.19)).toFixed(2)),
              fee_result: Number.parseFloat(((differenceCif) * 0.06).toFixed(2)),
        }
      });

  const diffInvMeli__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['difference_items'], 0).toFixed(2));
  const diffIva__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['vat_tax_result'], 0).toFixed(2));
  const diffFee__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['fee_result'], 0).toFixed(2));
  const diffIncome__ = Number.parseFloat(resulfinalfinal.reduce((acc, item) => acc += item['income_tax_result'], 0).toFixed(2));

  return {
    is_listed: '',
    owner_id: a['owner_id'],
    seller_id: a['seller_id'],
    mlc_item: a['mlc_item'],
    sku: a['sku'],
    meli_price: a['meli_price'],
    invoice_items_total: '0',
    meli_item_entered: meliItemEntered,
    diff_inv_meli: diffInvMeli__,
    data_sku: [],
    meli_inbound_total: meliInboundsTable,
    meli_sale_confirmation: meliSaleConfitmationPrice,
    selling_value_total_item: Number.parseFloat(sellingValueTotalItem.toFixed(2)),
    iva_diff: Number.parseFloat(diffIva__.toFixed(2)),
    fee_diff: Number.parseFloat(diffFee__.toFixed(2)),
    income_tax_diff: Number.parseFloat(diffIncome__.toFixed(2)),
    meli_top_date: a['meli_top_date'],
    summary_items: resulfinalfinal,
    btn_btn: '',
    summary_items_extended: [],
  }
});
  } catch (error) { console.log(`FIRST`, error) }
}

function tabletableTableGOF(goF) {
  const auxArr = [];
  const globalArr = [];
  for (let i = 0; i <= goF.length; i++) {
    if (i < goF.length) {
      if (i === 0) { auxArr.push(goF[i]); }
      else if (goF[i]['meli_inbound_num'] !== goF[i - 1]['meli_inbound_num']) {
        globalArr.push(auxArr.map((a) => a))
        auxArr.splice(0, auxArr.length);
        auxArr.push(goF[i]);
      } else if (goF[i]['meli_inbound_num'] === goF[i - 1]['meli_inbound_num']) { auxArr.push(goF[i]); }
    } else if (i === goF.length) { globalArr.push(auxArr.map((a) => a)) }
  }
  return globalArr;
}

function meliInboundsTableGOF(goF) {
  const auxArr = [];
  const globalArr = [];
  for (let i = 0; i <= goF.length; i++) {
    if (i < goF.length) {
      if (i === 0) { auxArr.push(goF[i]); }
      else if (goF[i]['meli_inbound_num'] !== goF[i - 1]['meli_inbound_num']) {
        globalArr.push(auxArr.map((a) => a))
        auxArr.splice(0, auxArr.length);
        auxArr.push(goF[i]);
      } else if (goF[i]['meli_inbound_num'] === goF[i - 1]['meli_inbound_num']) { auxArr.push(goF[i]); }
    } else if (i === goF.length) { globalArr.push(auxArr.map((a) => a)) }
  }
  return globalArr;
}

function invoiceGOFGOF(goF) {
  const auxArr = [];
  const globalArr = [];
  for (let i = 0; i <= goF.length; i++) {
    if (i < goF.length) {
      if (i === 0) { auxArr.push(goF[i]); }
      else if (goF[i]['invoice_inbound_total'].split('/')[0] !== goF[i - 1]['invoice_inbound_total'].split('/')[0]) {
        globalArr.push(auxArr.map((a) => a))
        auxArr.splice(0, auxArr.length);
        auxArr.push(goF[i]);
      } else if (goF[i]['invoice_inbound_total'].split('/')[0] === goF[i - 1]['invoice_inbound_total'].split('/')[0]) { auxArr.push(goF[i]); }
    } else if (i === goF.length) { globalArr.push(auxArr.map((a) => a)) }
  }

  return globalArr;
}

function meliInboundsTableGOFOK(goF) {
  const auxArr = [];
  const globalArr = [];
  for (let i = 0; i <= goF.length; i++) {
    if (i < goF.length) {
      if (i === 0) { auxArr.push(goF[i]); }
      else if (goF[i]['mark_super'] !== goF[i - 1]['mark_super']) {
        globalArr.push(auxArr.map((a) => a))
        auxArr.splice(0, auxArr.length);
        auxArr.push(goF[i]);
      } else if (goF[i]['mark_super'] === goF[i - 1]['mark_super']) { auxArr.push(goF[i]); }
    } else if (i === goF.length) { globalArr.push(auxArr.map((a) => a)) }
  }
  return globalArr;
}

async function globalArrDetailSixthCopy(list) {
  return await Promise.all(list).then((el) => (el)).catch((err) => err);
}

/* SERVICES */
/* 1 */
async function poolQueryCopy(query, data) {
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
  poolQueryCopy,
  globalArrDetailCopy,
  globalArrDetailSecondCopy,
  globalArrDetailThirdCopy,
  globalArrDetailFourthCopy,
  globalArrDetailFifthCopy,
  globalArrDetailSixthCopy,
  globalArrDetailFifthNotListedCopy,
};



