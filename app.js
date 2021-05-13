var cron = require("node-cron");
var axios = require("axios");
var twilio = require("twilio");
var moment = require('moment');
var accountSid = "EXAMPLE"; // Your Account SID from www.twilio.com/console
var authToken = "EXAMPLE"; // Your Auth Token from www.twilio.com/console

var client = new twilio(accountSid, authToken);

cron.schedule("*/30 * * * * *", () => {
  axios
    .get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=711227&date=${moment.tz('Asia/Kolkata').format('DD-MM-YYYY')}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
        },
      }
    )
    .then((response) => {
      console.log(JSON.stringify(response.data));
      let available = [];
      response.data.centers.map((centre) => {
        centre.sessions.map((session) => {
          if (session.available_capacity != 0) {
            available.push(`${centre.name}-${session.available_capacity}`);
          }
        });
      });
      if (available.length !== 0) {
        console.log("send sms");
        console.log(available.join());
        client.messages
          .create({
            body: `Vaccine slots available at ${available.join()}`,
            to: "mobile_number", // Text this number
            from: "mobile_number", // From a valid Twilio number
          })
          .then((message) => console.log(message.sid));
      }
    })
    .catch((error) => {
        console.log(error);
    });
  console.log("running a task every 30 seconds");
});
