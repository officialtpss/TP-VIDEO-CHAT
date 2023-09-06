
import nodemailer from 'nodemailer';
import { SMTP_MAIL_HOST, SMTP_MAIL_PORT, SMTP_MAIL_USERNAME, SMTP_MAIL_PASSWORD } from "../constant";

/**
 * Helper Function used to send mails
 */
const mailSend = async (subject, html, email) => {

    let transporter = nodemailer.createTransport({
        pool: true, 
        port: SMTP_MAIL_PORT, 
        host: SMTP_MAIL_HOST,
        auth: {
            user: SMTP_MAIL_USERNAME,
            pass: SMTP_MAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = { subject, html, from: email, to: 'rajangoyal877@gmail.com' };
    const data = await transporter.sendMail(mailOptions);

    return data;
};

export {
    mailSend
}