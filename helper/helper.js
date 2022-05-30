const nodemailer = require("nodemailer");

const nodemail = ({ email, username }, { data, name }) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "shadowtecher@gmail.com",
      pass: "Techers@321",
    },
  });

  var format = `
  <!DOCTYPE html>
  <html>
  <body>
  Dear ${username},<br/><br/>

  ${name} has opend the link: <a href="${data[0].link}">${data[0].link}</a>,and his device info is recorded.<br/>
  Please login on the website to view the information of his device.<br/><br/>

  Thanks and Regards <br/>
  Team DVMD<br/>
  
  </body>
  </html>
  
  `;

  var mailOptions = {
    from: "shadowtecher@gmail.com",
    to: email,
    subject: "DVMD : Target Caught.",
    html: format,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  nodemail,
};
