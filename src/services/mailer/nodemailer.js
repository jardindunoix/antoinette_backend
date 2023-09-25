const nodemailer = require('nodemailer');
const { pool_pg } = require('../../database');

async function mailer(mail, code, owner_id) {

  await pool_pg.query(`UPDATE users SET contact_mail='${mail}' WHERE owner_id='${owner_id}';`);
  const mailToSend = mail;
  const CODE = code;
  const mailBoss = 'blcorpor.clientes@gmail.com';
  const pass = 'gnwhflgowqazqwtj';
  const finalHtml = `<h4>YOUR ACCESS CODE IS:</h4>
  <h2 style="color:dodgerblue"><b>${CODE}</b></h2>
  <h5><i>Copy it into the form and validate it.</i></h5>`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: mailBoss, pass: pass, }
  });

  const mailOptions = {
    from: [{ name: `Please, no reply `, address: mailBoss }],
    to: mailToSend,
    subject: `*.'***** CODE ACCESS ******`,
    html: finalHtml,
  };

  await transporter.sendMail(mailOptions, (err, data) => {
    if (err) { console.log('ERROR', Object.keys(err)); }
    else { console.log(`mail sent`); }
  });

}


module.exports = { mailer };