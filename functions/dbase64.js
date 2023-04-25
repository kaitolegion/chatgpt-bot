module.exports = async (api, event) => {
  try {
    if (event.body === "") {

      api.sendMessage("Enter string to decode\n/dbase64 <string here>",
        event.threadID);
      return;
    }
    else {

      const encodetext = atob(event.body);
      api.sendMessage(
        `${encodetext}`,
        event.threadID
      );
      return;
    }
  } catch (error) {

  }
};
