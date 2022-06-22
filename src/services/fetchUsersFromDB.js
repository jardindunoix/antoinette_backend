const pool = require('../database-mysql.js')

exports.fetchUsersFromDB = async () => {
    try {
        return await pool.query(`
      select 
            first_.user_id,  first_.refresh_token, first_.refresh_token_2, first_.fecha_ingreso 
            from blcorpor_boarder.users_mercado_libre as first_ 
            where first_.id in (
                  select max(id) as last_id from blcorpor_boarder.users_mercado_libre where user_id <> '' 
                  group by user_id order by last_id desc)
            and first_.user_id <> '' 
           -- and first_.user_id <> '829950255' -- TETE2018224
           -- and first_.user_id <> '828391103' -- TESTYNQN2K5C
            -- and first_.user_id <> '396251691' -- MAMA6075595
            -- and first_.user_id <> '764560202' -- TESTQZ6KDYZG
            -- and first_.user_id <> '731199549' -- USBLTRAIDING
            group by first_.id 
            order by first_.id desc
      ;`)
    } catch (error) { console.log(`error call get`, error) }
}
