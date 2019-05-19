require('dotenv').config();
const crypto = require('crypto');
const Twit = require('twit')

const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
const twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

class Webhook {
  static challenge(req, res) {
    const { crc_token } = req.query;

    if (crc_token) {
      const hash = crypto.createHmac('sha256', twitterConsumerSecret).update(crc_token).digest('base64');
      return res.status(200).send({ response_token: 'sha256=' + hash })
    }
    return res.status(400).send({ error: 'Error: crc_token missing from request.' })
  }

  static register(req, res) {
    const webhookUrl = 'https://6fc692c8.ngrok.io/webhook';
    // if your webhook URL changes, you have to re-register it and add subscriptions

    const twitterClient = new Twit({
      consumer_key: twitterConsumerKey,
      consumer_secret: twitterConsumerSecret,
      access_token: twitterAccessToken,
      access_token_secret: twitterAccessTokenSecret
    });

    twitterClient.post(`account_activity/all/development/webhooks`, { url: webhookUrl }, (err, data, response) => {
      const { id } = data;

      if (id) {
        // add user subscription
        twitterClient.post('account_activity/all/development/subscriptions');
        return res.status(200).send({ message: "Webook successfully registered!" });
      }

      return res.status(400).send({ message: "Webhook registration failed" });
    });
  }

  static listen(req, res) {
    res.send("listening")
  }
}

module.exports = Webhook;

// { id: '1130150677232201728',
//   url: 'https://6fc692c8.ngrok.io/webhook',
//   valid: true,
//   created_timestamp: '2019-05-19 16:38:14 +0000' }