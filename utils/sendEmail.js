const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //define transporter
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: "fbc679708f1bb2",
      pass: "eb5ad5ff675ce2",
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
};

module.exports = sendEmail;
