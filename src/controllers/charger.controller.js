
const { result_fake } = require('../services/charger/pools')

/* call excel */
const emailExists = async (req, res) => {
  try {
    const { email } = req.params
    const email_ = email.toLowerCase()
    const statusValue = email_ === "123@123.com" ? 200 : 400
    res.status(statusValue).json({ "resp": (email_ === "123@123.com") })
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
    const email_ = email.toLowerCase()
    console.log(" -- POOLS -- ", email_, password, companyId)
    const resultlist = statusValue ? result_fake : []
    const token = statusValue ? "acb123" : ""
    res.status(statusValue).json({ "message": "ok", "token": token })
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

