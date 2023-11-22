
const { result_fake } = require('../services/charger/pools')

/* call excel */
const emailExists = async (req, res) => {
  try {
    const { email } = req.params
    // console.log(req.params)
    const email_ = email.toLowerCase()
    // console.log(`${email_ === "rgarrido@dhemax.com"} - ${email_} --`)
    const statusValue = email_ === "rgarrido@dhemax.com" ? 200 : 400
    // res.status(200).json({ "resp": (email_ === "rgarrido@dhemax.com") })
    res.status(statusValue).json({ "resp": (email_ === "rgarrido@dhemax.com") })
  } catch (error) {
    console.log('error', error)
    res.status(400).json({ "resp": (email_ === false) })
  }
}

const getPools = (req, res) => {
  try {
    // console.log(" -- POOLS -- ")
    res.status(200).json(result_fake)
  } catch (error) {
    console.log('error', error)
    res.status(200).json([])
  }
}

const authLogin = (req, res) => {
  try {
    const { email, password, companyId } = req.body
    console.log(email, password, "body")
    const email_ = email.toLowerCase()
    console.log(" -- POOLS -- ", email_, password, companyId)
    const statusValue = email_ === "rgarrido@dhemax.com" && password === "Gigio.321" && companyId === "" ? 200 : 400
    const resultlist = statusValue ? result_fake : []
    const token = statusValue ? "acb123" : ""
    res.status(statusValue).json({ "message": resultlist, "token": token })
  } catch (error) {
    console.log('error', error)
    res.status(400).json([])
  }
}




module.exports = {
  emailExists,
  getPools,
  authLogin,
};


