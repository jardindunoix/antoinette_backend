const { pool_pg } = require('../../database');
const { readFile } = require('xlsx');
const fs = require('fs');


async function leerExcel(routeFile) {
  try {
    console.log(routeFile);
    const workBook = await readFile(routeFile);
    const sheetZeroExcell = workBook.Sheets[workBook.SheetNames[0]];

    /* ******************************  COLUMNS  ******************************************** */
    const arrImboundCol = [];
    const arrSkuCol = [];
    const arrNoItemsCol = [];
    const arrSellingValueCol = [];
    const invoiceNo = [];
    const issuanceDate = [];
    /* ****************************** COLUMNS *********************************************** */

    /* the whole process must have an invoice number */
    /* get invoiceNo and inssuanceDate */
    Object.entries(sheetZeroExcell).forEach((entry, index) => {
      const [key, value] = entry;
      const invoiceNumber = 'invoice no';
      const dateOfIssuance = 'date of issuance';
      if (letterVerification(key)) {
        if (typeof value.v === 'string') {
          if (value.v.toLowerCase().includes(invoiceNumber))
            invoiceNo.push({ value: Object.entries(sheetZeroExcell)[index + 1][1]['w'].trim() });
          if (value.v.toLowerCase().includes(dateOfIssuance))
            issuanceDate.push({ value: Object.entries(sheetZeroExcell)[index + 1][1]['w'].trim() });
        }
      }
    });

    /* the whole process must have an invoice number */
    if (invoiceNo[0]) {
      /* get the headers */
      Object.entries(sheetZeroExcell).forEach((entry) => {
        const [key, value] = entry;
        const inbound = 'inbound';
        const customer = 'customer';
        const fnsku = 'fnsku';
        const items = 'items';
        const selling = 'selling';

        if (letterVerification(key)) {
          if (typeof value.v === 'string') {
            if (value.v.toLowerCase().includes(inbound) || value.v.toLowerCase().includes(customer))
              arrImboundCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
            if (value.v.toLowerCase().includes(fnsku))
              arrSkuCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
            if (value.v.toLowerCase().includes(items))
              arrNoItemsCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
            if (value.v.toLowerCase().includes(selling))
              arrSellingValueCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
          }
        }

      });

      /* fill columns, get the number related to the column ei. A11   -> 11 and the value */
      Object.entries(sheetZeroExcell).forEach((entry) => {
        const [key, value] = entry;
        if (arrImboundCol[0]['key'].split('')[0] === key.split('')[0] && arrImboundCol[0]['key'] != key)
          arrImboundCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
        if (arrSkuCol[0]['key'].split('')[0] === key.split('')[0] && arrSkuCol[0]['key'] != key)
          arrSkuCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
        if (arrNoItemsCol[0]['key'].split('')[0] === key.split('')[0] && arrNoItemsCol[0]['key'] != key)
          arrNoItemsCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
        if (arrSellingValueCol[0]['key'].split('')[0] === key.split('')[0] && arrSellingValueCol[0]['key'] != key)
          arrSellingValueCol.push({ ind: parseInt(key.slice(1, (key.length))), key, value: typeof value.v === 'string' ? value.v.trim() : value.v });
      });

      /* filter rows below headers */
      /* complete numbers to have a columns excatly related */
      /* pay ATTENTION to CHANGES */
      /* Selling and Unit value always have to be  the same size */
      /* ******************************  START INTEGRATION OF COLUMNS  ******************************************** */
      const arrImboundColCorrect = arrImboundCol.filter((el) => el['ind'] > arrImboundCol[0]['ind']);
      const arrSellingValueColCorrect = arrSellingValueCol.filter((el) => el['ind'] > arrImboundCol[0]['ind']);
      const arrNoItemsColCorrect = arrNoItemsCol.filter((el) => el['ind'] > arrImboundCol[0]['ind']);
      const arrSkuColCorrect = arrSkuCol.filter((el) => el['ind'] > arrImboundCol[0]['ind']);
      // --------------------------------------
      const arrayImboundFinal = integrateInboundCol(arrImboundColCorrect);
      const arraySellingFinal = integrateSellingAndUnitCol(arrSellingValueColCorrect);
      const arrayNoItemsFinal = integrateSellingAndUnitCol(arrNoItemsColCorrect);
      const arraySkuFinal = integrateSkuCol(arrSkuColCorrect);
      /* ******************************  END INTEGRATION OF COLUMNS *********************************************** */


      const indCeiling = arraySellingFinal[arraySellingFinal.length - 1]['ind'];

      if (arraySellingFinal.length <= arrayImboundFinal.length && arraySellingFinal.length <= arrayNoItemsFinal.length) {
        if (arraySellingFinal.length <= arraySkuFinal.length) {
          await sellingEqSku(arraySellingFinal, arrayImboundFinal.filter((el) => el['ind'] <= indCeiling), arrayNoItemsFinal.filter((el) => el['ind'] <= indCeiling), arraySkuFinal.filter((el) => el['ind'] <= indCeiling), invoiceNo, issuanceDate);

          console.log('ok 1');

          return 'ok';
        }
        else {
          const iter = arraySellingFinal.length - arraySkuFinal.length;
          const indx = arraySkuFinal[arraySkuFinal.length - 1]['ind'];

          for (let i = 1; i <= iter; i++)
            arraySkuFinal.push({ ind: indx + i, key: arraySkuFinal[arraySkuFinal.length - 1]['key'], value: '-' });

          await sellingEqSku(arraySellingFinal, arrayImboundFinal.filter((el) => el['ind'] <= indCeiling), arrayNoItemsFinal.filter((el) => el['ind'] <= indCeiling), arraySkuFinal.filter((el) => el['ind'] <= indCeiling), invoiceNo, issuanceDate);

          console.log('ok 2');

          return 'ok';
        }
      }
      else {
        if (arraySellingFinal.length <= arraySkuFinal.length) {
          await sellingEqSku(arraySellingFinal, completeArrayImb(arrayImboundFinal, arraySellingFinal.length).filter((el) => el['ind'] <= indCeiling), arrayNoItemsFinal.filter((el) => el['ind'] <= indCeiling), arraySkuFinal.filter((el) => el['ind'] <= indCeiling), invoiceNo, issuanceDate);

          console.log('ok 3');

          return 'ok';
        }
        else {
          const iter = arraySellingFinal.length - arraySkuFinal.length;
          const indx = arraySkuFinal[arraySkuFinal.length - 1]['ind'];

          for (let i = 1; i <= iter; i++)
            arraySkuFinal.push({ ind: indx + i, key: arraySkuFinal[arraySkuFinal.length - 1]['key'], value: '-' });

          await sellingEqSku(arraySellingFinal, completeArrayImb(arrayImboundFinal, arraySellingFinal.length).filter((el) => el['ind'] <= indCeiling), arrayNoItemsFinal.filter((el) => el['ind'] <= indCeiling), arraySkuFinal.filter((el) => el['ind'] <= indCeiling), invoiceNo, issuanceDate);

          console.log('ok 4');

          return 'ok';
        }
      }
    }
    else {

      console.log('no_invoice_number 5');

      return 'no_invoice_number';
    }

    /* deletes the file, but never riches this so i commented*/
    // fs.unlinkSync(routeFile);
  } catch (error) { console.log(`error leer excel`, error); }
}

/* integrates array inbound */
function integrateInboundCol(arr) {
  const arrRet = [];
  arr.forEach((el, index) => {
    if (index < arr.length - 1) {
      for (let i = 0; i < ((arr[index + 1]['ind']) - el['ind']); i++) arrRet.push({ ind: (el['ind'] + i), key: el['key'], value: el['value'] })
    } else { arrRet.push({ ind: el['ind'], key: el['key'], value: el['value'] }) }
  });
  return arrRet;
}

/* integreates numbers */
function integrateSellingAndUnitCol(arr) {
  const arrRet = [];
  arr.forEach((el, index) => {
    if (index < arr.length - 1) {
      if (arr[index + 1]['ind'] - el['ind'] > 1) {
        for (let i = 0; i < ((arr[index + 1]['ind']) - el['ind']); i++) {
          if (i === 0) { arrRet.push({ ind: (el['ind'] + i), key: el['key'], value: el['value'] }) }
          else { arrRet.push({ ind: (el['ind'] + i), key: el['key'], value: 0 }) }
        }
      } else { arrRet.push({ ind: el['ind'], key: el['key'], value: el['value'] }) }
    } else { arrRet.push({ ind: el['ind'], key: el['key'], value: typeof el['value'] === 'string' ? 0 : el['value'] }) }
  });
  return arrRet;
}

/* integrates strings */
function integrateSkuCol(arr) {
  const arrRet = [];
  arr.forEach((el, index) => {
    if (index < arr.length - 1) {
      if (arr[index + 1]['ind'] - el['ind'] > 1) {
        for (let i = 0; i < ((arr[index + 1]['ind']) - el['ind']); i++) {
          if (i === 0) { arrRet.push({ ind: (el['ind'] + i), key: el['key'], value: el['value'] }) }
          else { arrRet.push({ ind: (el['ind'] + i), key: el['key'], value: '-' }) }
        }
      } else { arrRet.push({ ind: el['ind'], key: el['key'], value: el['value'] }) }
    } else { arrRet.push({ ind: el['ind'], key: el['key'], value: el['value'] }) }
  });
  return arrRet;
}

function completeArrayImb(arrayImbound, lengthSell) {
  const lengthLo = lengthSell - arrayImbound.length;
  for (let i = 0; i < lengthLo; i++)
    arrayImbound
      .push({ ind: (lengthSell + i), key: arrayImbound[arrayImbound.length - 1]['key'], value: arrayImbound[arrayImbound.length - 1]['value'] });
  return arrayImbound;
}

/* indicates if there are cells without content, dont delete it yet */
// function hasSpaces(arr) {
//   let option = false;
//   arr.forEach((el, index) => {
//     if (index < arr.length - 1) {
//       if (arr[index + 1]['ind'] - el['ind'] != 1) {
//         option = true;
//       }
//     }
//   });
//   return option;
// }

async function sellingEqSku(arraySellingFinal, arrayImboundFinal, arrayNoItemsFinal, arraySkuFinal, invoiceNo, issuanceDate) {
  await pool_pg.query(`delete from invoice_data where invoice_num = '${invoiceNo[0]['value']}';`);
  await pool_pg.query(`delete from invoice_data_error where invoice_num = '${invoiceNo[0]['value']}';`);
  // await pool_pg.query(`truncate invoice_data_error;`);
  const arrayConsolidate = [];

  consolidateArrays(arraySellingFinal, arrayImboundFinal, arrayNoItemsFinal, arraySkuFinal, invoiceNo, issuanceDate)
    .forEach(async (item) => {

      if (item) {
        const res = await pool_pg.query(`select id_mlc, owner_id, seller_id from mlc_variations where inventory_id = '${item['sku']}' or variations_inventory_id = '${item['sku']}'`);
        item['itemMlcFalla'] = res['rows'][0] ? res['rows'][0]['id_mlc'] : '';
        item['ownerId'] = res['rows'][0] ? res['rows'][0]['owner_id'] : '';
        item['sellerId'] = res['rows'][0] ? res['rows'][0]['seller_id'] : '';
        await insertData(item);
      }
      arrayConsolidate.push(item);
      // return item
    });
  return arrayConsolidate;
}

async function insertData(item) {
  if (
    item['itemMlcFalla'].length > 0 &&
    String(item['ownerId']).length > 0 &&
    String(item['sellerId']).length > 0
  ) {
    await pool_pg.query(`
                insert into invoice_data
                (issuance_data,invoice_num,inbound,no_items,selling_value,
                sku,mlc_item,owner_id,seller_id)
                values
                ('${item['issuanceDat']}','${item['invoiceNumber']}','${item['imbound']}','${item['noItem']}','${item['sellingVal']}',
                '${item['sku']}','${item['itemMlcFalla']}','${item['ownerId']}','${item['sellerId']}');`);
  }
  else {
    await pool_pg.query(`
            insert into invoice_data_error
            (issuance_data,invoice_num,inbound,no_items,selling_value,
            sku,mlc_item,owner_id,seller_id)
            values
            ('${item['issuanceDat']}','${item['invoiceNumber']}','${item['imbound']}','${item['noItem']}','${item['sellingVal']}',
            '${item['sku']}','${item['itemMlcFalla']}','${item['ownerId']}','${item['sellerId']}');`);
  }
}

function consolidateArrays(arraySelling, arrayImbound, arrayNoItems, arraySku, invoiceNo, issuanceDate) {
  const arraySellingReturn = arraySelling.map((sell, index) => {
    try {
      return {
        issuanceDat: issuanceDate[0] ? issuanceDate[0]['value'] : '-',
        invoiceNumber: invoiceNo[0] ? invoiceNo[0]['value'] : '-',
        imbound: arrayImbound[index]['value'],
        noItem: arrayNoItems[index]['value'],
        sellingVal: sell['value'],
        sku: arraySku[index]['value'],
      }
    } catch (error) { console.log('????????ERRORR', error); }
  });

  console.log(consolidateArrays);

  return arraySellingReturn;
}


function letterVerification(key) {
  return (
    key.startsWith('A') ||
    key.startsWith('B') ||
    key.startsWith('C') ||
    key.startsWith('D') ||
    key.startsWith('E') ||
    key.startsWith('F') ||
    key.startsWith('G') ||
    key.startsWith('H') ||
    key.startsWith('I') ||
    key.startsWith('J') ||
    key.startsWith('K') ||
    key.startsWith('L') ||
    key.startsWith('M') ||
    key.startsWith('N') ||
    key.startsWith('O') ||
    key.startsWith('P') ||
    key.startsWith('Q') ||
    key.startsWith('R') ||
    key.startsWith('S') ||
    key.startsWith('T') ||
    key.startsWith('U') ||
    key.startsWith('V') ||
    key.startsWith('W') ||
    key.startsWith('X') ||
    key.startsWith('Y') ||
    key.startsWith('Z')
  );
}

module.exports = {
  leerExcel,
};
