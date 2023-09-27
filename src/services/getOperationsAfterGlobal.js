const fetch = require('axios');
const moment = require('moment');
const { pool_pg } = require('../database')
const { getListFromInvoiceTable, callOperaciones, getOwnerIds } = require('../constants');
const sprintf = require('sprintf');
const { returnAccessTokenForItemId } = require('../services/accessToken');

module.exports.getOperationsAfterGlobalInvoice = (a) => {
    (async function (invoiceNumber) {
        try {
 
            const list = await pool_pg.query(sprintf(getListFromInvoiceTable, invoiceNumber));
            const ownerIds = await pool_pg.query(getOwnerIds);

            if (list['rows'] && ownerIds['rows']) {
                const accessTokens = await getAccessTokens(ownerIds['rows']).then((el) => el).catch((err) => err);
                const aT = [];
                (accessTokens.map((el) => Promise.resolve(el).then((a) => aT.push(a))));

                setTimeout(() => {
                    const cicl = list['rows'].length;
                    if (cicl > 0) {



                        // (function recorreCiclos(n) {
                        //     callOperations({ list: list['rows'][n], aT });
                        //     n++;
                        //     console.log(n, '/', cicl);
                        //     if (n < cicl) {
                        //         if (n % 40 === 0) { setTimeout(recorreCiclos, 10000, n); }
                        //         else { setTimeout(recorreCiclos, 3200, n); }
                        //     } else { setTimeout(() => console.log('STAGE OPERATIONS ENDS'), 4000); }
                        // }(0));

                    } else { console.log('FIN del PROCESO TOTAL, REINICIAR PARA ACTUALIZAR SI CORRESPONDE...'); }
                }, 1000);
            }
        } catch (error) { console.log(`ERROR en el getOperationsAfterGlobalInvoice -- `, error); }
    })(a);
}

async function getAccessTokens(ownerIds) {
    return await ownerIds.map(async (el) => {
        const refreshToken = await pool_pg.query(`select refresh_token from refresh_tokens where refresh_token ilike '%${el['owner_id']}%'`)
        const accessToken = await returnAccessTokenForItemId(refreshToken['rows'][0]['refresh_token'])
        if (refreshToken['rows'] && accessToken['data']) { return { ownerId: el['owner_id'], accessToken: accessToken['data']['access_token'] } }
        else { return { refreshToken: '', accessToken: '' } }
    });
}

const callOperations = (a) => {
    (function (data) {
        try {
            // const { inventory_id, seller_id, aToken, usrId, mlcItem } = data;
            const { list, aT } = data;
            const usrId = list['owner_id']
            const mlcItem = list['mlc_item']
            const inventory_id = list['sku']
            const seller_id = list['seller_id']
            const ownerId = aT.map((el) => { if (el['ownerId'] === usrId) { return el['ownerId'] } }).filter((resp) => resp)[0];
            const aToken = aT.map((el) => { if (el['ownerId'] === usrId) { return el['accessToken'] } }).filter((resp) => resp)[0];

            console.log(usrId)
            console.log(mlcItem)
            console.log(inventory_id)
            console.log(seller_id)
            console.log(ownerId)
            console.log(aToken)

            // const urlBase = sprintf(callOperaciones, seller_id, inventory_id);
            // let fecha2 = getFechaHoy();
            // let fecha1 = returnDate(fecha2, -60);

            // (function recorreCiclos(n) {
            //     returnOperation(urlBase, fecha1, fecha2, aToken, usrId, mlcItem, inventory_id);
            //     fecha2 = fecha1;
            //     fecha1 = returnDate(fecha2, -60);
            //     n++;
            //     if (n < 12) setTimeout(recorreCiclos, 250, n);
            // }(0));
        } catch (error) { console.log(`error en retorna operaciones ++_+_+_+_+-=-=-=-`, error) }
    })(a);
}

function returnOperation(a, b, c, d, e, f, h) {
    (async function (urlBase, fecha1, fecha2, accTok, usrId, mlcItem, inventory_id) {
        try {
            const sugarboo = await fetch.get(`${urlBase}${fecha1}&date_to=${fecha2}`, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accTok}` }
            }).then(async respo => {
                if (respo)
                    if (respo['data']) return respo['data']
            }).catch(async err => {
                if (err.response) {
                    await insertData(err.response.statusText, fecha1, fecha2, usrId, mlcItem, inventory_id);
                    console.log(`err - insertado como dato`, err.response.statusText);
                } else { console.log(`errreeredfdfdfdfd`, err.data); }
            });

            if (sugarboo) {
                await insertTransitorio(`${sugarboo['paging']['total']}`, fecha1, fecha2, usrId, mlcItem, inventory_id);
                if (sugarboo['paging']['total'] > 0) await insertData(sugarboo, fecha1, fecha2, usrId, mlcItem, inventory_id);
            } else { await insertTransitorio(`valor llega null`, fecha1, fecha2, usrId, mlcItem, inventory_id); }
        } catch (error) { console.log(`Error return operation`, error) }
    })(a, b, c, d, e, f, h);
}

async function insertData(el, fecha1, fecha2, usrId, mlcItem, inventory_id) {
    try {
        el['results'].forEach(async elem => {
            try {
                const fecha = elem['date_created'].split('Z')[0].replace('T', '-').replace(':', '-').replace(':', '-').split('-');
                const fecha_ = returnFecha(fecha);
                const fechaOrden = returnFechaOrden(fecha);
                const columnsVar = `aaa_user_id,
             item_mkpl_id, fecha1, fecha2, ccc_paging_total,
             paging_scroll, bbb_results_id, results_seller_id,
             results_inventory_id, ddd_results_date_created,
             date_created, fecha_orden, hhh_results_type,
             eee_results_detail_available_quantity,
             results_detail_not_available_quantity,
             results_detail_not_available_detail,
             fff_results_result_total,
             results_result_available_quantity,
             results_result_not_available_quantity,
             results_result_not_available_detail,
             results_external_references_type,
             ggg_results_external_references_value,
             filters, available_filters, sort, available_sorts, sku`;

                const exterRef = ['sin ext ref', 'sin ext ref'];

                if (elem['external_references'].length === 1) {
                    exterRef[0] = elem['external_references'][0]['type'];
                    exterRef[1] = elem['external_references'][0]['value'];
                } else if (elem['external_references'].length > 1) {
                    exterRef[0] = 'mayor a 1 LEN??';
                    exterRef[1] = 'mayor a 1 LEN??';
                }

                let detailNotAvailableDetail = 'sin detNotAvail';
                let resultNotAvailableDetail = 'sin resNotAvail';

                if (elem['detail']['not_available_detail'].length > 0) {
                    detailNotAvailableDetail = '';
                    elem['detail']['not_available_detail'].forEach((el) => detailNotAvailableDetail += Object.entries(el).join('::'));
                }

                if (elem['result']['not_available_detail'].length > 0) {
                    resultNotAvailableDetail = '';
                    elem['result']['not_available_detail'].forEach((el) => resultNotAvailableDetail += Object.entries(el).join('::'));
                }

                let filtersData = '';
                let availableFiltersData = '';
                let sortData = '';
                let availableSorts = '';

                el['filters'].forEach(el => {
                    if (el['id']) filtersData += `${el['id']} - `;
                    if (el['name']) filtersData += `${el['name']} - `;
                });

                el['available_filters'].forEach(el => {
                    if (el['id']) availableFiltersData += `${el['id']} - `;
                    if (el['name']) availableFiltersData += `${el['name']} - `;
                });

                sortData = Object.entries(el['sort']).map(el => {
                    if (el[0] === 'id') sortData += `${el[1]} - `;
                    if (el[0] === 'name') sortData += `${el[1]} - `;
                    return sortData;
                });

                el['available_filters'].forEach(el => {
                    if (el['id']) availableFiltersData += `${el['id']} - `;
                    if (el['name']) availableFiltersData += `${el['name']} - `;
                });

                await pool_pg.query(`insert into analisis_operaciones_invoice (${columnsVar}) 
                     values
               ('${usrId}', '${mlcItem}', '${fecha1}', '${fecha2}',
                '${el['paging']['total']}', '${el['paging']['scroll']}',
                '${elem['id']}', '${elem['seller_id']}', '${elem['inventory_id']}', 
                 ${elem['date_created'].split('Z')[0].replace('T', '').replace(':', '').replace(':', '').replace('-', '').replace('-', '')},
                '${fecha_}', '${fechaOrden}',
                '${elem['type']}', '${elem['detail']['available_quantity']}',
                '${elem['detail']['not_available_quantity']}',
                '${detailNotAvailableDetail}',
                '${elem['result']['total']}', '${elem['result']['available_quantity']}', '${elem['result']['not_available_quantity']}',
                '${resultNotAvailableDetail}',
                '${exterRef[0]}', '${exterRef[1]}', '${filtersData}', '${availableFiltersData}', 
                '${sortData}', '${availableSorts}', '${inventory_id}');`);

            } catch (error) { console.log(`shout loud`, error) }
        })
    } catch (error) { console.log(`Error en e catch de la no se que`, error) }
}

async function insertTransitorio(a, b, c, d, e, f) {
    (async function (mensaje, fecha1, fecha2, usrId, mlcItem, inventory_id) {
        await pool_pg.query(`insert into analisis_previo_operaciones_invoice 
      (mensaje,fecha1,fecha2,user_id,item, sku)
      values
      ('${mensaje}', '${fecha1}', '${fecha2}', '${usrId}', '${mlcItem}', '${inventory_id}');`)
    })(a, b, c, d, e, f);
}

function returnFecha(f) {
    let mes = ''
    if (f[1] === '01') mes = 'ene'
    if (f[1] === '02') mes = 'feb'
    if (f[1] === '03') mes = 'mar'
    if (f[1] === '04') mes = 'abr'
    if (f[1] === '05') mes = 'may'
    if (f[1] === '06') mes = 'jun'
    if (f[1] === '07') mes = 'jul'
    if (f[1] === '08') mes = 'ago'
    if (f[1] === '09') mes = 'sep'
    if (f[1] === '10') mes = 'oct'
    if (f[1] === '11') mes = 'nov'
    if (f[1] === '12') mes = 'dic'
    return `${f[2]}-${mes}-${f[0]}`
}

function returnFechaOrden(f) {
    return `${f[0]}-${f[1]}-${f[2]} ${f[3]}:${f[4]}`
}

function returnDate(fecha, suma) {
    const fecha_ = fecha.split('-').join('')
    const date = moment(fecha_).add(suma, 'days').format("YYYY-MM-DD")
    return date
}

function getFechaHoy() {
    const f = new Date()
    let month = String(f.getMonth() + 1)
    let days = String(f.getDate())
    if (month.length <= 1) {
        month = `0${month}`
    }
    if (days.length <= 1) {
        days = `0${days}`
    }
    const today = `${f.getFullYear()}-${month}-${days}`
    return String(today)
}

