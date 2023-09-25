const fetch = require('axios');
const { returnAccessTokenForItemId } = require('./accessToken.js');

const getSingleMkpl = async (rToken, mlc) => {
  try {
    const accessToken = await returnAccessTokenForItemId(rToken)
    if (accessToken)
      if (accessToken['data'])
        if (accessToken['data']['access_token']) {
          const aToken = accessToken['data']['access_token'];
          const mlcArr = returnText(mlc);
          const arrMkplItem = []
          await mlcArr.forEach(el => {
            arrMkplItem.push(fetchSingleItems(el, aToken)
              .then(res => res).catch(err => console.log(`errrrrrrrrr`, err)))
          })
          return arrMkplItem
        }
    return []
  } catch (error) {
    console.log(`error  -----0000=-`, error)
  }
}

const finalResultArray = function (arrayPre) {
  const arrSalida = []
  arrayPre.forEach((el, index) => {
    if (el) {
      if (el['variations']) {
        if (el['variations'].length > 0) {
          el['variations'].forEach((val, ind) => {
            arrSalida.push({
              ippal: index,
              aaa_isec: ind,
              bbb_id: el['id'],
              ccc_cbt_item_id: el['cbt_item_id'],
              ddd_inventory_id: '-',
              eee_variations_inventory_id: val['inventory_id'],

              fff_available_quantity: el['available_quantity'],
              ggg_variations_available_quantity: val['available_quantity'],
              hhh_sold_quantity: el['sold_quantity'],
              iii_variations_sold_quantity: val['sold_quantity'],

              jjj_price: el['price'],
              kkk_variations_price: val['price'],
              lll_original_price: el['original_price'],

              mmm_owner_id: el['owner_id'],
              status: el['status'],
              currency_id: el['currency_id'],
              official_store_id: el['official_store_id'],
              variations_currency_id: val['currency_id'],
              last_updated: el['last_updated'],
              base_exchange_rate: el['base_exchange_rate'],
              catalog_product_id: el['catalog_product_id'],
              category_id: el['category_id'],
              date_created: el['date_created'],
              descriptions: el['descriptions'],
              domain_id: el['domain_id'],
              international_delivery_mode: el['international_delivery_mode'],
              item_relations: el['item_relations'],
              listing_type_id: el['listing_type_id'],
              permalink: el['permalink'],
              seller_id: el['seller_id'],
              shipping: el['shipping'],
              site_id: el['site_id'],
              sub_status: el['sub_status'],
              tags: el['tags'],
              title: el['title'],
              user_logistic_type: el['user_logistic_type'],
              warranty: el['warranty'],
              variations_attribute_combinations: val['attribute_combinations'],
              variations_catalog_product_id: val['catalog_product_id'],
              variations_id: val['id'],
              variations_item_relations: val['item_relations'],
              variations_picture_ids: val['picture_ids'],
              variations_sale_terms: val['sale_terms'],
              variations_seller_custom_field: val['seller_custom_field'],
            })
          })
        } else {
          arrSalida.push({
            ippal: index,
            aaa_isec: '-',
            bbb_id: el['id'],
            ccc_cbt_item_id: el['cbt_item_id'],
            ddd_inventory_id: el['inventory_id'],
            eee_variations_inventory_id: '-',

            fff_available_quantity: el['available_quantity'],
            ggg_variations_available_quantity: '-',
            hhh_sold_quantity: el['sold_quantity'],
            iii_variations_sold_quantity: '-',

            jjj_price: el['price'],
            kkk_variations_price: '-',
            lll_original_price: el['original_price'],

            mmm_owner_id: el['owner_id'],
            status: el['status'],
            currency_id: el['currency_id'],
            official_store_id: el['official_store_id'],
            variations_currency_id: '-',
            last_updated: el['last_updated'],
            base_exchange_rate: el['base_exchange_rate'],
            catalog_product_id: el['catalog_product_id'],
            category_id: el['category_id'],
            date_created: el['date_created'],
            descriptions: el['descriptions'],
            domain_id: el['domain_id'],
            international_delivery_mode: el['international_delivery_mode'],
            item_relations: el['item_relations'],
            listing_type_id: el['listing_type_id'],
            permalink: el['permalink'],
            seller_id: el['seller_id'],
            shipping: el['shipping'],
            site_id: el['site_id'],
            sub_status: el['sub_status'],
            tags: el['tags'],
            title: el['title'],
            user_logistic_type: el['user_logistic_type'],
            warranty: el['warranty'],
            variations_attribute_combinations: '-',
            variations_catalog_product_id: '-',
            variations_id: '-',
            variations_item_relations: '-',
            variations_picture_ids: '-',
            variations_sale_terms: '-',
            variations_seller_custom_field: '-',
          })
        }
      }
    }
  })
  return arrSalida
}

const returnText = (mlc) => {
  const text = mlc
    .replace(/ /g, "")
    .replace(/;/g, "")
    .replace(/:/g, "")
    .replace(/,/g, "")
    .replace(/\./g, "")
    .replace(/\\/g, "")
    .replace(/'/g, "")
    .replace(/"/g, "")
    .replace(/a/g, "")
    .replace(/b/g, "")
    .replace(/c/g, "")
    .replace(/d/g, "")
    .replace(/e/g, "")
    .replace(/f/g, "")
    .replace(/g/g, "")
    .replace(/h/g, "")
    .replace(/i/g, "")
    .replace(/j/g, "")
    .replace(/k/g, "")
    .replace(/l/g, "")
    .replace(/m/g, "")
    .replace(/n/g, "")
    .replace(/o/g, "")
    .replace(/p/g, "")
    .replace(/q/g, "")
    .replace(/r/g, "")
    .replace(/s/g, "")
    .replace(/t/g, "")
    .replace(/u/g, "")
    .replace(/v/g, "")
    .replace(/w/g, "")
    .replace(/x/g, "")
    .replace(/y/g, "")
    .replace(/z/g, "")
  const arrText = text.trim().split('M')
  const arrText_ = []
  arrText.forEach((el, index) => index !== 0 ? arrText_.push(`M${el}`.trim()) : console.log(''))
  return [...new Set(arrText_)];
}

const fetchSingleItems = async (item, accessToken) => {
  try {
    const salida = await fetch.get(`https://api.mercadolibre.com/marketplace/items/${item.trim()}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        if (res)
          if (res['data']) return res['data']
      })
      .catch((err) => {
        console.log(`error - fetchSingleItems`, err.response.data.message, err.response.data.status)
      })
    return salida
  } catch (error) {
    console.log(`Error en el fetch single itmes`, error)
  }
}

module.exports = { getSingleMkpl, finalResultArray };