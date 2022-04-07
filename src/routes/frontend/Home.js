module.exports = {
  path: "/",
  mathcer: "get",
  run: async (request, response) => {
    try {
      response.sendFile(__dirname + "/home/Home.html");
    } catch (err) {
      console.log(err);
      response.status(500).json({ error: err });
    }
  },
};
