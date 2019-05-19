require("dotenv").config();
const crypto = require("crypto");
const Twit = require("twit");
const sendSms = require("./sendSms");

const twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
const twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
const twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const twitterHandle = process.env.TWITTER_HANDLE;

class Webhook {
  static challenge(req, res) {
    const { crc_token } = req.query;

    if (crc_token) {
      const hash = crypto
        .createHmac("sha256", twitterConsumerSecret)
        .update(crc_token)
        .digest("base64");
      return res.status(200).send({ response_token: "sha256=" + hash });
    }
    return res
      .status(400)
      .send({ error: "Error: crc_token missing from request." });
  }

  static async register(req, res) {
    const webhookUrl = "https://6fc692c8.ngrok.io/webhook";
    // if your webhook URL changes, you have to re-register it and add subscriptions

    const twitterClient = new Twit({
      consumer_key: twitterConsumerKey,
      consumer_secret: twitterConsumerSecret,
      access_token: twitterAccessToken,
      access_token_secret: twitterAccessTokenSecret
    });

    // delete any existing webhook so as to avoid the error below:
    // 'Too many resources already created.'
    const { data: existingWebhooks } = await twitterClient.get(
      "account_activity/all/development/webhooks"
    );

    existingWebhooks.forEach(webhook => {
      twitterClient.delete(
        `account_activity/all/development/webhooks/${webhook.id}`
      );
    });

    const {
      data: { id }
    } = await twitterClient.post("account_activity/all/development/webhooks", {
      url: webhookUrl
    });

    if (id) {
      // add user subscription
      twitterClient.post("account_activity/all/development/subscriptions");
      return res
        .status(200)
        .send({ message: "Webhook successfully registered!" });
    } else {
      return res.status(400).send({ message: "Webhook registration failed" });
    }
  }

  static listen(req, res) {
    const { body } = req;

    if (body["tweet_create_events"]) {
      const eventDetails = body["tweet_create_events"][0];
      const eventCreator = eventDetails["user"]["screen_name"];
      const tweet = eventDetails["text"];

      if (eventDetails["in_reply_to_status_id"]) {
        const reply = tweet.replace(`@${twitterHandle}`, "");
        const message = `@${eventCreator} replied your tweet with: ${reply}`;
        sendSms(message);
      } else if (tweet.includes(`RT @${twitterHandle}`)) {
        const message = `@${eventCreator} retweeted: ${tweet}`;
        sendSms(message);
      } else if (tweet.includes(`@${twitterHandle}`)) {
        const message = `@${eventCreator} mentioned you in their tweet: ${tweet}`;
        sendSms(message);
      }
    }

    res.status(200).send("listening");
  }
}

module.exports = Webhook;
