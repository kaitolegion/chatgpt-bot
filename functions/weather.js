const OpenWeatherMapHelper = require("openweathermap-node");

const helper = new OpenWeatherMapHelper({
  APPID: "32e26e1ae3c4959707a318514ca68f03",
  units: "imperial",
  lang: "en",
});

module.exports = async (api, event) => {
  try {
    if (event.body === "") {
      api.sendMessage("Please enter city name. Example: davao", event.threadID);
      return;
    } else {
      helper.getCurrentWeatherByCityName(
        `${event.body}`,
        (err, currentWeather) => {
          if (err) {
            if (err.status == "404") {
              api.sendMessage(
                "City not found please enter a valid city name.",
                event.threadID
              );
            } else if (err.status == "401") {
              api.sendMessage("Invalid API key.", event.threadID);
            } else if (err.status == "429") {
              api.sendMessage("Too many requests.", event.threadID);
            } else if (err.status == "500") {
              api.sendMessage("Server error.", event.threadID);
            } else if (err.status == "400") {
              api.sendMessage("Please enter city name.", event.threadID);
            }
          } else {
            const coordinates = currentWeather.coord;

            const main = currentWeather.weather[0].main;
            const description = currentWeather.weather[0].description;

            api.sendMessage(
              `Current Weather in: ` +
              currentWeather.name +
              `\nCoordinates: ` +
              `Longitude: ` + coordinates.lon +
              ",Latitude: " + coordinates.lat +
              `\nMain: ` + main +
              `\nDescription: ` + description,
              event.threadID
            );
            return;
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
};
