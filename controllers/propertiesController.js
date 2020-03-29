const connection = require("../config/db");
const jwt = require("jsonwebtoken");
const propertiesController = {};
const myprivatekey = "ñaslkdnfawkeltnlf45knagg";

//------------GET A LIST FROM AN USER PROPERTIES--------
propertiesController.listProperties = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  try {
    connection.query(
      `SELECT * FROM property WHERE id_user='${id_user}' AND isDeleted ='${0}';`,
      (err, results) => {
        if (err) throw (err, console.log(err));
        if (results && results.length) {
          response.send(results); // ojo sin llaves que da error
        } else {
          response.sendStatus(401);
        }
      }
    );
  } catch {
    response.sendStatus(500);
  }
};
//----------------GET ONE PROPERTY DETAILS---------

propertiesController.oneProperty = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_property } = request.params;
  const { id_user, id_role } = jwt.verify(token, myprivatekey);
  try {
    if (id_role === 1) {
      connection.query(
        `SELECT * FROM property WHERE id_user='${id_user}' AND id_property ='${id_property}';`,
        (err, results) => {
          if (err) throw (err, console.log(err));
          if (results && results.length) {
            console.log(results);
            response.send(results[0]);
          } else {
            response.sendStatus(401);
          }
        }
      );
    } else {
      connection.query(
        `SELECT property.* FROM property
      LEFT JOIN property_tenant ON property.id_property = property_tenant.id_property 
      WHERE property_tenant.id_user='${id_user}';`,
        (err, results) => {
          if (err) throw (err, console.log(err));
          if (results && results.length) {
            console.log(results);
            response.send(results[0]);
          } else {
            response.sendStatus(401);
          }
        }
      );
    }
  } catch {
    response.sendStatus(500);
  }
};

propertiesController.onePropertyTenant = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  connection.query(
    `SELECT property.* FROM property
  LEFT JOIN property_tenant ON property.id_property = property_tenant.id_property 
  WHERE property_tenant.id_user='${id_user}';`,
    (err, results) => {
      if (err) throw (err, console.log(err));
      if (results && results.length) {
        response.send(results[0]);
      } else {
        response.sendStatus(401);
      }
    }
  );
};

//----------ADD A NEW PROPERTY----------
propertiesController.register = (request, response) => {
  let photo_property;
  if (request.file) {
    photo_property = request.file.filename;
  } else {
    photo_property = null;
  }
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  // const photo_property = request.file.filename;
  const {
    address_line1,
    address_line2,
    locality,
    region,
    postcode
  } = request.body;
  connection.query(
    `INSERT INTO property (id_user, address_line1, address_line2, locality, region, postcode, photo_property)
  VALUES ('${id_user}', '${address_line1}', '${address_line2}', '${locality}', '${region}','${postcode}', '${photo_property}'); `,
    (err, results) => {
      if (err) {
        response.sendStatus(400);
        console.log(err);
      } else {
        connection.query(
          `SELECT * FROM property WHERE id_property = ${results.insertId}`,
          (err, results2) => {
            if (err) {
              response.sendStatus(400);
              console.log(err);
            }
            response.send(results2[0]);
          }
        );
      }
    }
  );
};

//------------DELETE A PROPERTY FROM PARAMS------
propertiesController.delete = (request, response) => {
  const deleted = 1;
  const { id_property } = request.params;
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  try {
    connection.query(
      `UPDATE property SET isDeleted = '${deleted}'  WHERE id_property = ${id_property}`,
      (err, results) => {
        if (err) console.log(err);
        connection.query(
          `SELECT * FROM property WHERE id_property = ${id_property}`,
          (err, results2) => {
            response.send(results2[0]);
          }
        );
      }
    );
  } catch {
    response.sendStatus(401);
  }
};

//----------------UPDATE PROPERTY----------
propertiesController.edit = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  const { id_property } = request.params;
  const {
    address_line1,
    address_line2,
    locality,
    region,
    postcode
  } = request.body;

  connection.query(
    `UPDATE property SET address_line1 ='${address_line1}', address_line2='${address_line2}', locality='${locality}',
   region='${region}', postcode='${postcode}' WHERE id_property=${id_property}`,
    (err, results) => {
      if (err) {
        console.log(err);
        response.sendStatus(400);
      } else {
        if (request.file !== undefined) {
          connection.query(
            `UPDATE property SET photo_property='${request.file.filename}'  WHERE id_property=${id_property}`,
            (err, results) => {
              if (err) {
                console.log(err);
                response.sendStatus(400);
              }
            }
          );
        }
        connection.query(
          `SELECT * FROM property WHERE id_property=${id_property};`,
          (err, results) => {
            if (err) console.log(err);
            else {
              response.send(results[0]);
            }
          }
        );
      }
    }
  );
};
module.exports = propertiesController;
