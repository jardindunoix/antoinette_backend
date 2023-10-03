const { pool_pg } = require('../database');

module.exports.getOperationsItem = async (owner) => {
    return await pool_pg.query(`
SELECT 
date_created,
hhh_results_type,
results_external_references_type,
eee_results_detail_available_quantity,
fff_results_result_total,
ggg_results_external_references_value 
FROM
-- analisis_operaciones_invoice -- table comes from the automatic process
analisis_operaciones_temp  -- table comes from the previous process and is temporal
WHERE aaa_user_id = '${owner['ownerId']}'
-- AND item_mkpl_id = '${owner['mlcItem']}'
AND results_inventory_id = '${owner['sku']}'
ORDER BY fecha_orden DESC
;
`);
}


