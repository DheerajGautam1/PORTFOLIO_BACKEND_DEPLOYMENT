import nodemailer from "nodemailer";
export const sendEmail = async (Options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: Options.email,
        subject: Options.subject,
        text: Options.message,
    };
    await transporter.sendMail(mailOptions);
};
