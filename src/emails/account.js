const sgMail =  require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.send({
    to: 'a624ali@gmail.com',
    from: 'j624ali@gmail.com',
    subject: 'this is a test email',
    text: 'This is the first email send from nodejs!'
})



const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'j624ali@gmail.com',
        subject: `Welcome to the task manager application ${name}`,
        text: `This is a welcome email ${name}`
    })
}

const sendAccountClosureEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'j624ali@gmail.com',
        text: `Hello ${name},\n is email is to confirm you have deleted your account, please let us know if you did not make this request.`,
        subject: `Account Closure`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendAccountClosureEmail
    
}