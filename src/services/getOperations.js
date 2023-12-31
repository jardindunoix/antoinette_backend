const fetch = require('axios');
const moment = require('moment');
const { pool_pg } = require('../database')
const { callOperaciones } = require('../constants.js');
const { returnAccessTokenForItemId } = require('../services/accessToken');
const sprintf = require('sprintf');


let marker = true
module.exports.getOperationsAfterGlobal = (a) => {
    (async function (data) {
        try {
            await pool_pg.query('truncate analisis_operaciones_temp;');
            await pool_pg.query('truncate analisis_previo_operaciones_temp;');
            await callOperations(data)
        } catch (error) { console.log(`ERROR en el getOperationsAfterGlobal -- `, error); }
    })(a);
}

module.exports.getOperationsAfterGlobalDDBB = async (a) => {
    try {
        return await pool_pg.query(`
        SELECT 
        item_mkpl_id,
        aaa_user_id,
		results_seller_id,
		results_inventory_id,
		sku,
		ddd_results_date_created,
		date_created,
		hhh_results_type,
		eee_results_detail_available_quantity,
		results_detail_not_available_quantity,
		results_detail_not_available_detail,
		fff_results_result_total,
		results_result_available_quantity,
		results_result_not_available_quantity,
		results_result_not_available_detail,
		results_external_references_type,
		ggg_results_external_references_value,
		filters,
		available_filters,
		sort,
		available_sorts,
		fecha_orden,
		cur_date
-- FROM analisis_operaciones_invoice
FROM operations
where aaa_user_id = '${a.usr_id}'
and item_mkpl_id = '${a.mkpl_id}'
or sku = '${a.inventID}'
order by fecha_orden DESC
;
        `)


    } catch (error) { console.log(`ERROR en el getOperationsAfterGlobal -- `, error); }
}

const callOperations = (a) => {
    (async function (data_) {
        try {
            const { inventory_id, seller_id, refToken, usrId, mlcItem } = data_;
            const aToken_ = await returnAccessTokenForItemId(refToken);
            const aToken = aToken_['data']['access_token'] ? aToken_['data']['access_token'] : '';
            const urlBase = sprintf(callOperaciones, seller_id, inventory_id);
            let fecha2 = getFechaHoy();
            let fecha1 = returnDate(fecha2, -60);
            const ciclesBack = 8; // 12
            const timeDelay = 15500; // 250
            (function recorreCiclos(n) {
                if (n < ciclesBack && marker) {
                    returnOperation(urlBase, fecha1, fecha2, aToken, usrId, mlcItem, inventory_id);
                    fecha2 = fecha1;
                    fecha1 = returnDate(fecha2, -60);
                    console.log((n + 1), "");
                    setTimeout(recorreCiclos, timeDelay, (n + 1));
                }
            }(0));
        } catch (error) { console.log(`error en retorna operaciones ++_+_+_+_+-=-=-=-`, error) }
    })(a);
}

function returnOperation(a, b, c, d, e, f, g,) {
    (async function (urlBase, fecha1, fecha2, accTok, usrId, mlcItem, inventory_id) {
        try {
            const URL_ = `${urlBase}${fecha1.replaceAll(' ', '')}&date_to=${fecha2.replaceAll(' ', '')}`
            const sugarboo = await fetch.get(URL_, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accTok}` }
            }).then(async respo => {
                if (respo)
                    if (respo['data']) return respo['data']
            }).catch(async err => {
                if (err.response) {
                    /* analisis_operaciones */
                    // await insertData(err.response.statusText, fecha1, fecha2, usrId, mlcItem, inventory_id);
                    console.log(`err - dato en el catch:: `, err.response.statusText);
                } else { console.log(`errreeredfdfdfdfd`, err.data); }
            });

            if (sugarboo) {
                /* analisis_previo_operaciones */
                console.log('sugarboo', sugarboo.paging.total,)
                await insertTransitorio(`${sugarboo['paging']['total']} `, fecha1, fecha2, usrId, mlcItem, inventory_id);
                if (sugarboo['paging']['total'] > 0)
                    /* analisis_operaciones */
                    await insertData(sugarboo, fecha1, fecha2, usrId, mlcItem, inventory_id);
            } else {
                /* analisis_previo_operaciones */
                console.log('sugarboo null ?', sugarboo)
                await insertTransitorio(`valor llega null`, fecha1, fecha2, usrId, mlcItem, inventory_id);
            }
        } catch (error) { console.log(`Error return operation`, error) }
    })(a, b, c, d, e, f, g);
}

async function insertData(el, fecha1, fecha2, usrId, mlcItem, inventory_id) {
    try {
        if (el) {
            el['results'].forEach(async elem => {
                try {
                    const fecha = elem['date_created'].split('Z')[0].replace('T', '-').replace(':', '-').replace(':', '-').split('-');
                    const fecha_ = returnFecha(fecha);
                    const fechaOrden = returnFechaOrden(fecha);
                    const columnsVar = `
            aaa_user_id,
                item_mkpl_id,
                fecha1,
                fecha2,
                ccc_paging_total,
                paging_scroll,
                bbb_results_id,
                results_seller_id,
                results_inventory_id,
                ddd_results_date_created,
                date_created,
                fecha_orden,
                hhh_results_type,
                eee_results_detail_available_quantity,
                results_detail_not_available_quantity,
                results_detail_not_available_detail,
                fff_results_result_total,
                results_result_available_quantity,
                results_result_not_available_quantity,
                results_result_not_available_detail,
                results_external_references_type,
                ggg_results_external_references_value,
                filters,
                available_filters,
                sort,
                available_sorts,
                sku`;

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

                    await pool_pg.query(
                        `insert into analisis_operaciones_temp(${columnsVar})
            values
                (
                    '${usrId}',
                    '${mlcItem}',
                    '${fecha1}',
                    '${fecha2}',
                    '${el['paging']['total']}',
                    '${el['paging']['scroll']}',
                    '${elem['id']}',
                    '${elem['seller_id']}',
                    '${elem['inventory_id']}',
                    '${elem['date_created'].split('Z')[0].replace('T', '').replace(': ', '').replace(': ', '').replace(' - ', '').replace(' - ', '')}',
                    '${fecha_}',
                    ${fechaOrden},
                    '${elem['type']}',
                    '${elem['detail']['available_quantity']}',
                    '${elem['detail']['not_available_quantity']}',
                    '${detailNotAvailableDetail}',
                    '${elem['result']['total']}',
                    '${elem['result']['available_quantity']}',
                    '${elem['result']['not_available_quantity']}',
                    '${resultNotAvailableDetail}',
                    '${exterRef[0]}',
                    '${exterRef[1]}',
                    '${filtersData}',
                    '${availableFiltersData}',
                    '${sortData}',
                    '${availableSorts}',
                    '${inventory_id}'); `);

                } catch (error) { console.log(`shout loud`, error) }
            })
        } else {
            console.log('else data null', el)
        }
        // } catch (error) { console.log(`Error en e catch de la no se que`, error) }
    } catch (error) { console.log(`Error en la insercion - ddbb`) }
}

async function insertTransitorio(a, b, c, d, e, f) {
    (async function (mensaje, fecha1, fecha2, usrId, mlcItem, inventory_id) {
        await pool_pg.query(`insert into analisis_previo_operaciones_temp
                (mensaje, fecha1, fecha2, user_id, item, sku)
            values
                ('${mensaje}', '${fecha1}', '${fecha2}', '${usrId}', '${mlcItem}', '${inventory_id}'); `)
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
    return `${f[2]} -${mes} -${f[0]} `
}

function returnFechaOrden(f) {
    return Number.parseInt(`${f[0]}${f[1]}${f[2]}${f[3]}${f[4]} `);
}

function returnDate(fecha, suma) {
    const fecha_ = fecha.split('-').join('')
    const date = moment(fecha_).add(suma, 'days').format("YYYY-MM-DD")
    return date
}

function getFechaHoy() {
    const f = new Date();
    let month = String(f.getMonth() + 1);
    let days = String(f.getDate());
    if (month.length <= 1) { month = `0${month} ` }
    if (days.length <= 1) { days = `0${days} ` }
    const today = `${f.getFullYear()} -${month} -${days} `;
    return String(today);
}
