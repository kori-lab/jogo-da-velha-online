const { Router } = require("express");
const fs = require("fs");

const routes = Router();
const dirs = fs
  .readdirSync("./src/routes")
  .filter((dir) => !dir.endsWith(".js"));

for (const dir of dirs) {
  const routesFiles = fs
    .readdirSync(`./src/routes/${dir}`)
    .filter((file) => file.endsWith(".js"));

  for (const file of routesFiles) {
    const { path, run, mathcer } = require(`./routes/${dir}/${file}`);
    routes[mathcer || "get"](path, (...args) => run(...args));
  }
}

module.exports = routes;
