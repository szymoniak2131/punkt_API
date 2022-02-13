const Notification = require("../schemas/notificationSchema");
const Window = require("../schemas/windowSchema");
let nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const EMAIL = require(".././routes/config.json")["EMAIL"];

let transporter = nodemailer.createTransport({
  host: EMAIL.host,
  port: EMAIL.port,
  secure: EMAIL.secure,
  auth: {
    user: EMAIL.auth.user,
    pass: EMAIL.auth.pass,
  },
  tls: {
    rejectUnauthorized: EMAIL.tls.rejectUnauthorized,
  },
});
async function updateState(state, window) {
  Window.updateOne({ id: window.id }, { $set: { state: state } })
    .then(() => {
      return true;
    })
    .catch((err) => {
      throw new Error(err);
    });
}

async function sendEmail(type, email, html) {
  var emailSubject;
  console.log(type);
  switch (type) {
    case "notification":
      emailSubject = `[POWIADOMIENIE] Awizacja `;
      break;
    case "invitation":
      emailSubject = `[ZAPROSZENIE] Awizacja `;
      break;
    case "accountInvitation":
      emailSubject = `[ZAPROSZENIE DO REJESTRACJI] Awizacja `;
      break;
    default:
      break;
  }
  console.log(emailSubject);
  try {
    const emailSent = await transporter.sendMail({
      from: '" Awizacja" <szymonsikorski5@wp.pl>',
      to: email,
      subject: emailSubject,
      html: html,
    });
    return emailSent;
  } catch (error) {
    throw new Error(error);
  }
}

async function template(type, { window, client, content, token }) {
  const date = new Date();
  const timeOpts = { hour: "2-digit", minute: "2-digit" };
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let today = new Date();
  today = today.toLocaleDateString(undefined, options);
  let reqPath = path.join(__dirname, "../");
  switch (type) {
    case "notification":
      let startDate = new Date(window.start);
      startDate = startDate.toLocaleTimeString([], timeOpts);
      let endDate = new Date(window.end);
      endDate = endDate.toLocaleTimeString([], timeOpts);
      let table = `
            <tr class="fin_product_list">
                <th style="font-weight: 600;border: 0px; text-align: left; padding: 8px;padding-bottom:0px;">Kontrahent:</th>
            </tr>
            <tr class="fin_product_list">
                <th style="font-weight: 400;border: 0px; text-align: left; padding: 8px; padding-top:0px;">${
                  window.client.name
                }</th>
            </tr>
            <tr class="fin_product_list">
                <th style="font-weight: 600;border: 0px; text-align: left; padding: 8px; padding-bottom:0px;">Data:</th>
                <th style="font-weight: 600;border: 0px; text-align: left; padding: 8px; padding-bottom:0px;">Początek:</th>
                <th style="font-weight: 600;border: 0px; text-align: left; padding: 8px; padding-bottom:0px;">Koniec:</th>
            </tr>
            <tr class="fin_product_list">
                <th style="font-weight: 400;border: 0px; text-align: left; padding: 8px; padding-top:0px;">${date.toLocaleDateString(
                  "pl-PL",
                  options
                )}</th>
                <th style="font-weight: 400;border: 0px; text-align: left; padding: 8px; padding-top:0px;">${startDate}</th>
                <th style="font-weight: 400;border: 0px; text-align: left; padding: 8px; padding-top:0px;">${endDate}</th>
            </tr>
            <tr class="fin_product_list">
                <th style="font-weight: 600;border: 0px; text-align: left; padding: 8px; padding-bottom:0px;">Lokalizacja:</th>
            </tr>
            <tr class="fin_product_list">
                <th style="font-weight: 400;border: 0px; text-align: left; padding: 8px; padding-top:0px;">${
                  window.resourceId
                }</th>
            </tr>
            `;
      try {
        const html = await ejs.renderFile(reqPath + "views\\notification.ejs", {
          name: window.client.name,
          table: table,
          ownContent: content,
          date: date.toLocaleDateString("pl-PL", options),
        });
        return html;
      } catch (error) {
        return {
          msg: "EJS error",
          err: error,
        };
      }
    case "invitation":
      try {
        const html = await ejs.renderFile(
          reqPath + "views\\invitationWindow.ejs",
          {
            name: client.name,
            token: token,
            ownContent: content,
            date: today,
          }
        );
        return html;
      } catch (error) {
        return {
          msg: "EJS error",
          err: error,
        };
      }
    case "accountInvitation":
      try {
        const html = await ejs.renderFile(
          reqPath + "views\\accountInvitation.ejs",
          {
            name: client.name,
            token: token,
            ownContent: content,
            date: today,
          }
        );
        return html;
      } catch (error) {
        return {
          msg: "EJS error",
          err: error,
        };
      }
    default:
      let error = {
        msg: "Wrong template",
      };
      return error;
  }
}
exports.htmlTemplate = template;
exports.sendEmail = sendEmail;
