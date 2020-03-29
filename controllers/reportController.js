const mysql = require("mysql");
const connection = require("../config/db");
const jwt = require("jsonwebtoken");
const reportController = {};
const myprivatekey = "ñaslkdnfawkeltnlf45knagg";

reportController.listReports = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  const { id_property } = request.params;
  try {
    connection.query(
      `SELECT id_property, id_report, title, description, openDate, closeDate, id_report_state, id_priority 
            FROM form_report
            WHERE id_property = '${id_property}' and isDeleted ='${0}';`,
      (err, results) => {
        if (err) throw (err, console.log(err));
        if (results && results.length) {
          response.send({ reports: results });
        } else if (results.length === 0) {
          response.send({ reports: {} });
        }
      }
    );
  } catch {
    response.sendStatus(500);
  }
};

reportController.listAllReports = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);

  try {
    connection.query(
      `SELECT id_property, id_report, title, description, openDate, closeDate, id_report_state, id_priority 
            FROM form_report
            WHERE isDeleted ='${0}';`,
      (err, results) => {
        if (err) throw (err, console.log(err));
        if (results && results.length) {
          response.send({ reports: results });
        } else if (results.length === 0) {
          response.send({ reports: {} });
        }
      }
    );
  } catch {
    response.sendStatus(500);
  }
};

reportController.addNewReport = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  console.log(request.files);
  console.log(id_user);
  const {
    id_property,
    title,
    description,
    openDate,
    id_report_state,
    id_priority
  } = request.body;
  connection.query(
    `INSERT INTO form_report (id_property, title, description, openDate,
                id_report_state, id_priority, isDeleted) VALUES ('${id_property}', '${title}',
                   '${description}', '${openDate}','${id_report_state}', '${id_priority}', '${0}');`,
    (err, results) => {
      console.log(results);
      if (err) {
        console.log(err);
        response.sendStatus(400);
      } else {
        console.log(request.files.length);
        if (request.files.length >= 1) {
          for (let i = 0; i < request.files.length; i++) {
            connection.query(
              `INSERT INTO photo_report (id_report, photo_report)
                        VALUES ('${results.insertId}','${request.files[i].filename}');`,
              (err, res) => {
                if (err) {
                  console.log(err);
                  response.sendStatus(400);
                }
              }
            );
          }
        }
        response.send({ id_report: results.insertId });
      }
    }
  );
};

reportController.updateReport = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);

  const { id_report } = request.params;

  const {
    id_property,
    title,
    description,
    openDate,
    id_report_state,
    id_priority
  } = request.body;

  connection.query(
    `UPDATE form_report SET id_property = '${id_property}', title = '${title}', 
        description = '${description}', openDate = '${openDate}', 
        id_report_state = '${id_report_state}', id_priority = '${id_priority}' WHERE id_report='${id_report}';`,
    (err, results) => {
      if (err) {
        console.log(err);
        response.sendStatus(400);
      } else {
        if (request.files.length > 0) {
          for (let i = 0; i < request.files.length; i++) {
            connection.query(
              `INSERT INTO photo_report (id_report, photo_report)
                        VALUES ('${id_report}','${request.files[i].filename}');`,
              (err, res) => {
                if (err) {
                  console.log(err);
                  response.sendStatus(400);
                }
              }
            );
          }
        }
        response.send({ reportUpdated: true });
      }
    }
  );
};

reportController.getReportwithProperty = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  const { id_report } = request.params;

  connection.query(
    `SELECT * FROM form_report
        LEFT JOIN property ON form_report.id_property = property.id_property
        WHERE form_report.id_report = '${id_report}' AND form_report.isDeleted='${0}';`,
    (err, results) => {
      if (err) {
        console.log(err);
        response.sendStatus(400);
      } else if (results && results.length) {
        connection.query(
          `SELECT * FROM photo_report WHERE id_report = '${id_report}' AND isDeleted='${0}';`,
          (err, res) => {
            if (err) {
              console.log(err);
              res.sendStatus(400);
            } else {
              response.send({ report: { results: results[0], photos: res } });
            }
          }
        );
      }
    }
  );
};

reportController.deletePhoto = (request, response) => {
  const { photo } = request.params;
  console.log(photo);
  connection.query(
    `UPDATE photo_report SET isDeleted = 1 WHERE photo_report='${photo}';`,
    (err, results) => {
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else {
        response.send({ photoDeleted: true });
      }
    }
  );
};

reportController.deleteReport = (request, response) => {
  const { id_report } = request.params;
  console.log("id_report " + id_report);
  connection.query(
    `UPDATE form_report SET isDeleted = 1 WHERE id_report = '${id_report}';`,
    (err, results) => {
      console.log(results);
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else if (results.affectedRows === 1) {
        response.send({ reportDeleted: true });
      }
    }
  );
};

reportController.updateStatus = (request, response) => {
  const { id_report } = request.params;
  const { id_report_state } = request.body;

  connection.query(
    `UPDATE form_report SET id_report_state = '${id_report_state}' 
    WHERE id_report = '${id_report}';`,
    (err, results) => {
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else if (results.affectedRows !== 0) {
        response.send({ statusUdated: true });
      }
    }
  );
};

module.exports = reportController;
