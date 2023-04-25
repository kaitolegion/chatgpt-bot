const fs = require("fs");
const login = require("fb-api");

const loginCred = {
  appState: JSON.parse(fs.readFileSync("session.json", "utf-8")),
};

let running = false;
let stopListener = null;

function startListener(api, event) {
  try {
    if (running) {
      api.sendMessage(`Already running!`, event.threadID);
      return;
    }

    running = true;
    const randMes = [
      "Hi I\'m a chatbot. kaito program me, You can ask me anything I will answer it directly by Using\nCommand: /ai <your question>\nto show commands\nCommand: /help",
      "Hey, How are you, How can I help you with? Show help\nCommand /help",
    ];
    const randomIndex = Math.floor(Math.random() * randMes.length);
    const randomMessage = randMes[randomIndex];
    api
      .sendMessage(randomMessage, event.threadID)
      .catch((err) => console.error(err));

    stopListener = api.listenMqtt((err, event) => {
      if (!running) {
        return;
      }

      if (err) {
        console.log("listenMqtt error", err);
        start();
        return;
      }

      api.markAsRead(event.threadID, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });

      api.sendTypingIndicator(event.threadID, (err) => {
        if (err) {
          console.log(err);
          return;
        }
      });

      if (event.type === "message") {
        try {
          if (event.body.includes("/forecast")) {
            event.body = event.body.replace("/forecast", "");
            require("./functions/forecast.js")(api, event);
          }
          if (event.body.includes("/weather")) {
            event.body = event.body.replace("/weather", "");
            require("./functions/weather.js")(api, event);
          }
          if (event.body === "/help") {
            api.sendMessage(
              "Hello @everyone I am CHATGPT AI\n\nCOMMANDS\n/forecast - show weather forecast\n/weather - show current weather\n/img - show generated images\n/ai - ask question CHATGPT \n/base64 - encode string\n/dbase64 - decode string\n/help - show commands\n/about - show about me\n\n",
              event.threadID
            );
          }
          if (event.body === "/about") {

            // reply message reaction love
            api.setMessageReaction(":love:", event.messageID, (err) => {
              if (err) {
                console.error(err);
                return;
              }
            });
            // end

            // Send a message
            api.sendMessage(
              "About me?\nHello, I am CHATGPT AI @kaito program me and I\'m connected to the real ChatGPT platform. My mission is to respond to the queries that have a simple goal is to answer your questions without accessing to chatgpt.\n\nTo know more about me you can reach @kaito by using the command /kaito <Your Message> ^^ Thank you",
              event.threadID
            );
          }
          // end

          // start MESSAGE KAITO

          if (event.body.includes("/kaito")) {

            api.sendMessage(
              "This feature is not available at the moment",
              event.threadID
            );

          }

          // end MESSAGE KAITO


          // start base64 encryption

          if (event.body.includes("/base64")) {
            event.body = event.body.replace("/base64", "");
            require("./functions/base64.js")(api, event);

          }
          // end base64 encryption

          // start decode base64 encryption

          if (event.body.includes("/dbase64")) {
            event.body = event.body.replace("/dbase64", "");
            require("./functions/dbase64.js")(api, event);

          }
          // end decode base64 encryption

          if (event.body.includes("/img")) {
            event.body = event.body.replace("img", "");
            require("./functions/imghandler")(api, event);
          } else if (event.body.includes("/ai")) {
            event.body = event.body.replace("/ai", "");
            if (
              event.body.includes("haha") || event.body.includes("yawa") ||
              event.body.includes("tanga") || event.body.includes("gago")
            ) {

              api.setMessageReaction(":laughing:", event.messageID, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
              });

            } else if (event.body.includes("ayie")) {
              api.setMessageReaction(":love:", event.messageID, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
              });
            }

            require("./functions/handler.js")(api, event, (err, data) => {
              console.log(err);
              console.log(data);
              if (err) {
                api.sendMessage(`Error: ${err}`, event.threadID);
                return;
              }
            });
          }
        } catch (error) {
          console.log(error);
          api.sendMessage("An error has been occured.", event.threadID);
        }
      }
    });
  } catch (error) {
    console.error(error);
    api.sendMessage("Error: " + error.message, event.threadID);
  }
}

function stopListenerFunc(api, event) {
  if (!running) {
    api.sendMessage(`Not running!`, event ? event.threadID : null);
    return;
  }
  running = false;
  api.sendMessage(`Closing chatgptBOT 😢`, event.threadID);
  let count = 3;
  const countdown = setInterval(() => {
    api.sendMessage(`Stopping in ${count} seconds...`, event.threadID);
    count--;
    if (count === 0) {
      clearInterval(countdown);
      stopListener();
    }
  }, 1000);
}
function start() {
  login(loginCred, (err, api) => {
    if (err) {
      console.error("login error", err);
      return;
    }

    api.listen((err, event) => {
      try {
        if (err) {
          console.error("listen error:", err);
          start();
          return;
        }
      } catch (err) {
        console.err(err);
      }

      const actions = {
        "/start": startListener,
        "/pause": () => {
          running = false;
          api.sendMessage(`Paused!`, event.threadID);
        },
        "/continue": () => {
          running = true;
          api.sendMessage(`Continuing!`, event.threadID);
        },
        "/stopprogram": stopListenerFunc,
      };

      const action = actions[event.body];
      if (action) {
        action(api, event);
      }
    });
  });
}
start();
module.exports = { stopListener };
