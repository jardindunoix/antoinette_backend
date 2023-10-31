
/* call excel */
const emailExists = async (req, res) => {
  try {
    const { email } = req.params
    console.log(req.params)
    const email_ = email.toLowerCase()
    console.log(`${email_ === "rgarrido@dhemax.com"} - ${email_} --`)
    const statusValue = email_ === "rgarrido@dhemax.com" ? 200 : 400

    // res.status(200).json({ "resp": (email_ === "rgarrido@dhemax.com") })
    res.status(statusValue).json({ "resp": (email_ === "rgarrido@dhemax.com") })
  } catch (error) {
    console.log('error', error)
  }
}

module.exports = {
  emailExists,
};


