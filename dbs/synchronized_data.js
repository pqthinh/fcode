const dbs = require("./connect.js");
const fs = require("fs");
const path = require("path");

const synchronizedData = {
  sync: async () => {
    let conn;
    try {
      conn = await dbs.getConnection();
      await conn.beginTransaction();
      const keyboard_log = fs.readFileSync(
        path.join(__dirname, "../log/keyboard_log.txt"),
        "utf8"
      );
      const mouse_log = fs.readFileSync(
        path.join(__dirname, "../log/mouse_log.txt"),
        "utf8"
      );

      let sql, result;
      sql = `insert into logger(keyboard_log, mouse_log) value(?,?)`;
      result = await conn.query(sql, [keyboard_log, mouse_log]);
      console.log(result, "result");
      await conn.commit();
      // remove file
      fs.unlinkSync(path.join(__dirname, "../log/keyboard_log.txt"));
      fs.unlinkSync(path.join(__dirname, "../log/mouse_log.txt"));
    } catch (err) {
      console.log(err);
    } finally {
      await conn.release();
    }
  },
};

module.exports = synchronizedData;
