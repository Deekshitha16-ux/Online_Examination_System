const nodemailer = require("nodemailer");
const dns = require("dns");
const { getEnv } = require("./env");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mailUser = getEnv('MAIL_USER');
const mailPassword = getEnv('MAIL_PASSWORD');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: mailUser,
        pass: mailPassword
    }
});

let sendmail = (toid,sub,text,html)=>{
    return transporter.sendMail({
        from: `"Online Examination Portal"<${mailUser}>`,
        to: toid,
        subject: sub,
        text: text,
        html: html || null
    });
}

module.exports = {sendmail}
