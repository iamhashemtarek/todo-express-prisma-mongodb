const nodemailer = require("nodemailer");

async function sendEmail(options) {
  //define transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // mail options
  const mailOptions = {
    from: "hashem <hashem@email.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send email
  await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
