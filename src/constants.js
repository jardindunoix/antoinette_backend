require('dotenv').config();
const url_base = process.env.URL_BASE;
const url_base2 = process.env.URL_BASE2;
const url_server = process.env.URL_SERVER;
const url_client = process.env.URL_CLIENT;

const fethcDDBBOperations = `SELECT 
* FROM
analisis_operaciones_invoice
WHERE 
aaa_user_id = '%s'
;
`;
const fetchSellersDDBB = `SELECT * FROM sellers_menu ORDER BY nickname DESC;`;
const fetchSellersActive = `
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
-- WHERE nickname <> 'MAMA6075595'
-- AND nickname <> 'TESTYNQN2K5C'
-- AND nickname <> 'USBLTRADING'
-- AND nickname <> 'TESTQZ6KDYZG' -- USEFULL TESTER
-- AND nickname <> 'TETE2018224' -- USEFULL TESTER
-- AND nickname <> 'USBLTRAIDING' -- USBLTRAIDING
ORDER BY status_granted DESC, nickname ASC
;
`;


/* 
SELECT 
-- cast(fecha as DATE) AS registration_date
-- to_char(fecha, 'DD/MM/YYYY') AS registration_date
fecha AS registration_date
FROM sellers_active
;


Mon Oct 24 2022 00:00:00 GMT+0000 (Coordinated Universal Time)
*/

const fetchSellersActiveAgent = `
SELECT 
id, nickname, 
-- registration_date, 
seller_id, status_granted, 
fecha AS registration_date
FROM sellers_active
WHERE nickname <> 'TESTQZ6KDYZG'
AND nickname <> 'USBLTRADING'
AND nickname <> 'USBLTRAIDING' -- *****
AND nickname <> 'TETE2018224'
AND nickname <> 'TESTYNQN2K5C'
AND nickname <> 'MAMA6075595'
ORDER BY status_granted DESC, nickname ASC
;
`;

const URL_BASE = `https://api.mercadolibre.com`

const callOperaciones = `${URL_BASE}/marketplace/stock/fulfillment/operations/search?seller_id=%s&inventory_id=%s&date_from=`

const getListFromInvoiceTable = `select owner_id, mlc_item, sku, seller_id from invoice_data where invoice_num = '%s';`
const getOwnerIds = `select owner_id from invoice_data group by owner_id order by owner_id;`

// const getAccounts = `
// select 
// sellers_active.nickname as nickname,
// invoice_data.owner_id as owner_id,
// sum(cast(invoice_data.no_items as int)) as total_items,
// TRUNC(sum(cast(invoice_data.selling_value as decimal)), 2) as selling_value,
// TRUNC((sum(cast(invoice_data.selling_value as decimal))/1.19), 2) as unit_value,
// TRUNC((sum(cast(invoice_data.no_items as int)) * (sum(cast(invoice_data.selling_value as decimal))/1.19)), 2) as total_value,
// TRUNC(((TRUNC((sum(cast(invoice_data.no_items as int)) * (sum(cast(invoice_data.selling_value as decimal))/1.19)), 2)) * 0.19), 2) as iva
// from sellers_active, invoice_data
// where cast(sellers_active.id as text) = cast(invoice_data.owner_id as text)
// group by 
// sellers_active.nickname,
// sellers_active.id,
// invoice_data.owner_id
// order by nickname asc
// ;
// `;


const getAccounts = `SELECT id_seller, nickname FROM sellers_menu ORDER BY nickname ASC;`;


// const getListOperAccounts = `
// SELECT 
// invoice_num,
// issuance_data,
// sum(cast(no_items AS int)) AS items,
// TRUNC((sum(cast(selling_value AS decimal)) / 1.19) * sum(cast(no_items AS int)), 2) AS total_value
// FROM invoice_data
// WHERE owner_id= '%s'
// GROUP BY invoice_num, issuance_data
// ORDER BY invoice_num
// ;
// `;
const getListOperAccounts = `
SELECT * FROM invoice_data
WHERE owner_id = '%s'
ORDER BY sku
;
`;

const queryListAccountAnalisis = `
SELECT 
owner_id,
seller_id,
mlc_item,
sku,
invoice_num,
invoice_inbound,
invoice_price,
invoice_quantity,
invoice_date,
meli_price,
meli_item_entered,
meli_item_sold,
meli_sold_value,
meli_top_date,
order_invoice_num,
iva_tax,
income_tax,
fee_tax, 
total_tax,
last_update 
FROM account_analisis  
WHERE owner_id = '%s' ORDER BY sku, invoice_num;
`;

const queryListAccountAnalisisNotListed = `
SELECT 
owner_id,
seller_id,
mlc_item,
sku,
meli_price,
meli_item_entered,
meli_item_sold,
meli_sold_value,
meli_top_date,
iva_tax,
income_tax,
fee_tax,
total_tax,
last_update 
FROM account_analisis_not_listed  
WHERE owner_id = '%s' ORDER BY sku;
`;

// const getListOperAccounts = `
// SELECT 
// invoice_num,
// issuance_data,
// sum(cast(no_items AS int)) AS items,
// TRUNC((sum(cast(selling_value AS decimal)) / 1.19) * sum(cast(no_items AS int)), 2) AS total_value
// FROM invoice_data
// WHERE owner_id= '%s'
// GROUP BY invoice_num, issuance_data
// ORDER BY invoice_num
// ;
// `;
const getListOperAccountsCopy = `
SELECT * FROM invoice_data
WHERE owner_id = '%s'
ORDER BY sku
;
`;

const QUERY_LIST_ACCOUNT_ANALISIS = `
SELECT
owner_id,
seller_id,
mlc_item,
sku,
invoice_num,
invoice_inbound,
invoice_price,
invoice_quantity,
invoice_date,
meli_price,
meli_item_entered,
meli_item_sold,
meli_sold_value,
meli_top_date,
order_invoice_num,
iva_tax,
income_tax,
fee_tax, 
total_tax,
last_update 
FROM account_analisis  
WHERE owner_id = '%s' 
AND order_invoice_num > 2022000
ORDER BY sku, invoice_num, invoice_inbound;
`;

const QUERY_LIST_ACCOUNT_ANALISIS_NOT_LISTED = `
SELECT 
owner_id,
seller_id,
mlc_item,
sku,
meli_price,
meli_item_entered,
meli_item_sold,
meli_sold_value,
meli_top_date,
iva_tax,
income_tax,
fee_tax,
total_tax,
last_update 
FROM account_analisis_not_listed  
WHERE owner_id = '%s' 
ORDER BY sku;
`;

module.exports = {
  url_base, url_base2, url_client, url_server, callOperaciones, fethcDDBBOperations, fetchSellersDDBB, getListFromInvoiceTable, getOwnerIds, fetchSellersActive, fetchSellersActiveAgent, getAccounts,
  getListOperAccounts,
  queryListAccountAnalisis,
  queryListAccountAnalisisNotListed,
  getListOperAccountsCopy,
  QUERY_LIST_ACCOUNT_ANALISIS,
  QUERY_LIST_ACCOUNT_ANALISIS_NOT_LISTED,
}
