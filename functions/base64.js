module.exports = async (api, event) => {
  try {
    if (event.body === "") {

      api.sendMessage("Enter string to encode\n/base64 <string here>",
        event.threadID);
      return;
    }
    else {

      const encodetext = btoa(event.body);
      api.sendMessage(
        `${encodetext}`,
        event.threadID
      );
      return;
    }
  } catch (error) {

  }
};
