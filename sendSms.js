require("dotenv").config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_TOKEN; // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);

const sendSms = body => {
  client.messages
    .create({
      body: body,
      to: process.env.RECIPIENT, // Text this number
      from: process.env.TWILIO_NUMBER // From a valid Twilio number
    })
    .then(message => console.log(message.sid));
};

module.exports = sendSms;
