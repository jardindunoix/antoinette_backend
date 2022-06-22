const { pool_pg } = require('../database.js');
const  fetch = require('axios');
const { vRT, returnAccessTokenForItemId, getRefreshToken } = require('../services/accessToken.js')
const { url_server } = require('../constants.js');
const iioClient = require('socket.io-client');
const socketClient = iioClient.connect(`${url_server}`);


const receipOneNotification = async (req, res) => {
  try{

    const { topic, resource, user_id, application_id, sent, attempts, received } = req.body;
    const urlBase = 'https://api.mercadolibre.com';
    // marketplace_items topic.includes('marketplace_items') 


    //if( user_id ===  828391103 &&  resource.includes('MLC') && attempts === 1 && topic.includes('marketplace_items')){
    if( resource.includes('MLC') && attempts === 1 && topic.includes('marketplace_items')){
      //      console.log(resource, topic);

      const refToken = await getRefreshToken(user_id);

      if(refToken['rows'][0]){

        if(refToken['rows'][0]['refresh_token']){

          const rtoken = refToken['rows'][0]['refresh_token'] ;
          const accTok = await returnAccessTokenForItemId(rtoken);
          const aTok = accTok['data']['access_token'];
          const headers = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${aTok}` } }; 

          const jsonResp = await fetch.get(`${urlBase}${resource}`, headers )
            .then(data => data)
            .catch(err => console.log(`Error en el catch del return access toekn`, Object.keys(err)));


          const dbResp = await pool_pg.query(`select 
                       price,
                       variations_price, 
                       available_quantity, 
                       status_ 
                       from mlc_variations 
                       where owner_id = ${user_id}
                       and id_mlc ilike '%${jsonResp['data']['id']}%' limit 1 ;`);

          if(dbResp['rows'])
            if(dbResp['rows'][0]){
              if(parseFloat(dbResp['rows'][0]['price']) < jsonResp['data']['price']){

                socketClient.emit('join', `This price of the item ${jsonResp['data']['id']} has been changed from ${dbResp['rows'][0]['price']} to ${jsonResp['data']['price']} from the seller ${jsonResp['data']['owner_id']} `);

                console.log(jsonResp['data']['status'], 'status from JSON');
                console.log(dbResp['rows'][0]['status_'], 'status from DDBB');

                console.log(jsonResp['data']['available_quantity'], 'available_quantity from JSON');
                console.log(dbResp['rows'][0]['available_quantity'], 'available_quantity from DDBB');

                await pool_pg.query(`insert into price_change_alert 
                ( user_id, 
                  id_mlc, 
                  id_cbt, 
                  first_price, 
                  last_price)
                       values
                ( '${jsonResp['data']['owner_id']}', 
                  '${jsonResp['data']['id']}', 
                  '${jsonResp['data']['cbt_item_id']}', 
                  '${dbResp['rows'][0]['price']}', 
                  '${jsonResp['data']['price']}');`);

              }else if(parseFloat(dbResp['rows'][0]['price']) > jsonResp['data']['price']){
                console.log('DDBB >',dbResp['rows'][0]['price'], 'JSON >', jsonResp['data']['price'], jsonResp['data']['owner_id'], rtoken); 
              }
            }else{
              // traer el mlc de la api con id_mlc y user_id

              console.log(rtoken , topic, resource, user_id, 'el item no esta en la base de datos');

//              const singleData = await getSingleMkpl(rtoken, jsonResp['data']['id'])
  //              .then(resp => resp, fail => console.log(`fail`))
    //            .catch(err => console.log(`err`))
      //        const arrRest = []
        //      await singleData.forEach(el => Promise.resolve(el).then(r => arrRest.push(r)).catch(err => console.log(`err`)));
          //    setTimeout(() => {
            //    const arrFinal = finalResultArray(arrRest)
              //  console.log(arrFinal, `arrFinal`)
//                res.status(200).send({ items: arrFinal })
  //            }, 3000);
            }
        }
      }
    }








    //    await pool_pg.query(`insert into notifications ( topic, resource, user_id, application_id, sent, attempts, received ) values ( '${topic}', '${resource}', '${user_id}', '${application_id}', '${sent}',  ${attempts}, '${received}' );`);

    res.status(200).send({ message: 'received' })
  }catch(error){console.log(`error in notification`, error)}
}



const finalResultArray =  function (arrayPre) {
  const arrSalida = []
  arrayPre.forEach((el, index) => {
    if (el) {
      if (el['variations']) {
        if (el['variations'].length > 0) {
          el['variations'].forEach((val, ind) => {
            arrSalida.push({
              ippal: index,
              isec: ind,
              id_mlc: el['id'],
              item_id: el['cbt_item_id'],
              inventory_id: '-',
              variations_inventory_id: val['inventory_id'],

              available_quantity: el['available_quantity'],
              variations_available_quantity: val['available_quantity'],
              sold_quantity: el['sold_quantity'],
              variations_sold_quantity: val['sold_quantity'],

              price: el['price'],
              variations_price: val['price'],
              original_price: el['original_price'],

              owner_id: el['owner_id'],
              status_: el['status'],
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
            isec: '-',
            id_mlc: el['id'],
            cbt_item_id: el['cbt_item_id'],
            inventory_id: el['inventory_id'],
            variations_inventory_id: '-',

            available_quantity: el['available_quantity'],
            variations_available_quantity: '-',
            sold_quantity: el['sold_quantity'],
            variations_sold_quantity: '-',

            price: el['price'],
            variations_price: '-',
            original_price: el['original_price'],

            owner_id: el['owner_id'],
            status_: el['status'],
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


const getSingleMkpl =async (rToken, mlc)=>{
  try{

    const accessToken = await returnAccessTokenForItemId(rToken)
    if (accessToken)
      if (accessToken['data'])
        if (accessToken['data']['access_token']) {
          const aToken = accessToken['data']['access_token'];
          const mlcArr = returnText(mlc);
          const arrMkplItem = [];
          await mlcArr.forEach(async el => {

            const singleItems = arrMkplItem.push( await fetchSingleItems(el, aToken)
              .then(res => res).catch(err => console.log(`errrrrrrrrr`, err)))
          })
          return arrMkplItem
        }
    return []
  }catch(error){console.log('Error en el get single mkpl', error)}

}


const fetchSingleItems = async (item, accessToken) => {
  try {
    const salida = await fetch.get(`https://api.mercadolibre.com/marketplace/items/${item}`, {
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
  } catch (error) { console.log(`Error en el fetch single itmes`, error) }
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
  return arrText_
}


const codeRT = async (req, res) => {
  try{
    if(req.body.data){
      const dataRT  = JSON.stringify(req.body.data).replaceAll('"', '') ;

      await updateOrInsertRT(dataRT);

    }

    res.status(200).send({message:'received'});

  }catch (error){ console.log(`Error recepcion Ref Tok, REVISAR`,error); }
}


const updateOrInsertRT= async (rt)=> {
  try{
    const vrt = await vRT(rt).then((resp)=> resp) ;
    if(vrt){
      await pool_pg.query(`delete from refresh_tokens where refresh_token ilike '%${rt.split('-')[2]}'`);
      if(vrt['data']['refresh_token']){
        await pool_pg.query(`insert into refresh_tokens (refresh_token) values ('${vrt['data']['refresh_token']}');`);
      }

    }
  }catch(error){console.log(`ERORR LLSSLSSL`, error);}
}


module.exports = { receipOneNotification , codeRT};
