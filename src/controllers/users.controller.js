const { pool_pg } = require('../database.js');
// const { fetchUsersFromDB } = require('../services/fetchUsersFromDB.js');
const { setGrnedUsers, setGrnedUsersDB } = require('../services/setGrnedUsers.js');
const config = require('../config');
const jwt = require('jsonwebtoken');

const signUp = async (req, res) => {
    const token = jwt.sign({ id: savedUser._id }, config.SECRET, { expiresIn: 86400 });
    res.status(200).json({ token })
}

const signIn = async (req, res) => {
    const token = jwt.sign({ id: userFound._id }, config.SECRET, { expiresIn: 86400 });
    res.json({ token });
}
/* login */
const loginUser = async (req, res) => {
    const list = await pool_pg.query(`select * from users;`);
    const response = list['rows'].map((el) => {
        if (el['username'] === req.body.user && el['password'] === req.body.pwd)
            return { name: el['name'], user_type: el['user_type'], refresh_token: el['refresh_token'] }
    }).filter((el) => el)[0];
    if (response) { res.status(200).send({ name: response.name, user_type: response.user_type, refresh_token: response.refresh_token }); }
    else { res.status(200).send({ name: '?', user_type: -1, refresh_token: '0' }); }
}

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

/* list granted users */
const listGrantedUsers = async (req, res) => {
    try {
        const usersGranted_ = await setGrnedUsersDB();
        const usersGranted = await setGrnedUsers()
        const grantedAPI = []

        await usersGranted.forEach((el) => Promise
            .resolve(el)
            .then(r => {
                if (
                    !r['nickname'].includes('TESTQZ6KDYZG')
                    && !r['nickname'].includes('USBLTRADING')
                    && !r['nickname'].includes('USBLTRAIDING')
                    && !r['nickname'].includes('MAMA6075595')
                    && !r['nickname'].includes('TETE2018224') // TESTER
                    && !r['nickname'].includes('TESTYNQN2K5C')
                )
                    return grantedAPI.push(r)
            }).catch(err => console.log(err)))

        setTimeout(() => {
            grantedAPI.forEach((el) => {
                if ((el['nickname'][0] === 'C' && el['nickname'][1] === 'N')) {
                    const ele = el['nickname'].split('');
                    ele[0] = '';
                    ele[1] = '';
                    el['nickname'] = ele.join('');
                }
            });
            const finalArr = [];
            grantedAPI.forEach((elapi) => {
                usersGranted_['rows'].forEach((eldb) => {
                    const id = eldb['refresh_token'].split('-')[2];
                    if ( parseInt(id) === elapi['id']) {
                        finalArr.push({
                            id: elapi['id'],
                            nickname: elapi['nickname'],
                            registration_date: elapi['registration_date'],
                            refresh_token: '-------',
                        });
                        elapi.mark = 'yes';
                    }
                })
            });

            grantedAPI.forEach((elapi)=>{
                if(!elapi['mark']){
                    finalArr.push({
                        id: elapi['id'],
                        nickname: elapi['nickname'],
                        registration_date: elapi['registration_date'],
                        refresh_token: '',
                    });
                }
            });

            //    console.log(`DB granted`, usersGranted_['rows'].length, `API granted`, grantedAPI.length);

            res.status(200).send(finalArr);
        }, 5000)

    } catch (error) { console.log(`ERRorror`, error); }

}

/* lista para admin con refresh token  */
const listGrantedUsersAdmin = async (req, res) => {
    try {
        const usersGranted_ = await setGrnedUsersDB();
        const usersGranted = await setGrnedUsers()

        const grantedAPI = []

        await usersGranted.forEach((el) => Promise
            .resolve(el)
            .then(r => grantedAPI.push(r) ).catch(err => console.log(err)))

        setTimeout(() => {
            grantedAPI.forEach((el) => {
                if ((el['nickname'][0] === 'C' && el['nickname'][1] === 'N')) {
                    const ele = el['nickname'].split('');
                    ele[0] = '';
                    ele[1] = '';
                    el['nickname'] = ele.join('');
                }
            });
            const finalArr = [];
            grantedAPI.forEach((elapi) => {
                usersGranted_['rows'].forEach((eldb) => {
                    const id = eldb['refresh_token'].split('-')[2];
                    if ( parseInt(id) === elapi['id']) {
                        finalArr.push({
                            id: elapi['id'],
                            nickname: elapi['nickname'],
                            registration_date: elapi['registration_date'],
                            refresh_token: eldb['refresh_token'],
                        });
                        elapi.mark = 'yes';
                    }
                })
            });

            grantedAPI.forEach((elapi)=>{
                if(!elapi['mark']){
                    finalArr.push({
                        id: elapi['id'],
                        nickname: elapi['nickname'],
                        registration_date: elapi['registration_date'],
                        refresh_token: '',
                    });
                }
            });

            //    console.log(`DB granted`, usersGranted_['rows'].length, `API granted`, grantedAPI.length);

            res.status(200).send(finalArr);
        }, 5000)

    } catch (error) { console.log(`ERRorror`, error); }

}

let rtokensaved = ''
let mlcsaved = ''
let counter = 0

const singleMkpl =async (req, res)=>{
    try {
        const { rToken, mlc } = await req.body;
        const singleData = await getSingleMkpl(rToken, mlc)
            .then(resp => resp, fail => console.log(`fail`))
            .catch(err => console.log(`err`))
        const arrRest = []
        await singleData.forEach(el => Promise.resolve(el).then(r => arrRest.push(r)).catch(err => console.log    (`err`)));
        setTimeout(async () => {
            const arrFinal = await finalResultArray(arrRest)
            //  console.log(arrFinal.length, `arrFinal`)
            res.status(200).send({ items: arrFinal })
        }, 2000)
    } catch (error) {
        console.log(`error en el get single mkpl`, error)
    } 
}


const getSingleMkpl = async (rToken, mlc, nameUser) => {                                                    
    try {
        let rtokensavedincome = rToken
        let mlcsavedincome = mlc
        counter++
        rtokensaved = rtokensavedincome
        mlcsaved = mlcsavedincome 
        const accessToken = await returnAccessTokenForItemId(rToken)
        if (accessToken)
            if (accessToken['data'])
                if (accessToken['data']['access_token']) {
                    const aToken = accessToken['data']['access_token']
                    const mlcArr = returnText(mlc)
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



const returnAccessTokenForItemId = async (urlAcTok) => {
    try {
        const accessToken = await fetch.post(`https://api.mercadolibre.com/oauth/token?grant_type=refresh_toke    n&client_id=3698739416306050&client_secret=LwgOJm33WigcfXp8AL2OyKZN6FS4YoME&refresh_token=${urlAcTok}`, {
            headers: { "Content-Type": "application/json" }
        })
            .then(async data => await data).catch(err => console.log(`Error en el catch del return access toekn`))
        return accessToken
    } catch (error) {
        console.log(`Error en el return acces toekene`)
    }
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
    } catch (error) {
        console.log(`Error en el fetch single itmes`, error)
    }
}
const finalResultArray = async function (arrayPre) {                                                           const arrSalida = []
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


module.exports = { loginUser, saveUser, listUsers, listGrantedUsers, listGrantedUsersAdmin };
