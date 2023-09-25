// /api/documentation/loginDocs
const loginDocs = async (req, res) => {
  try {
    const { user, pass } = JSON.parse(req.body.body);

    if (user === '123' && pass === '123') {
      console.log('documentation');
      res.status(200).send({ msg: 'documentation' });
    } else {
      console.log('wrong answer');
      res.status(200).send({ msg: 'wrong answer' });
    }

  } catch (error) { console.log(`ERROR DOCUS`, error) }
}

module.exports = {
  loginDocs,
};
