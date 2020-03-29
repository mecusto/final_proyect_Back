const connection = require("../config/db");
const jwt = require("jsonwebtoken");
const setId_user = require("../js/setId_user");
const tenantController = {};
const myprivatekey = "ñaslkdnfawkeltnlf45knagg";

// function to check if the id_user exists already on DB
function getIDbyIdRole(id_user) {
  connection.query(
    `SELECT * FROM login WHERE id_user = '${id_user}';`,
    (err, results) => {
      if (results.length == 0) {
        return false;
      } else {
        return true;
      }
    }
  );
}

tenantController.checkIn = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  const { id_property } = request.params;
  let id_user = "";
  // Create id_user by role with control if it already exists
  do {
    id_user = setId_user(2); //all the users using this route are gonna have id_role = 2
  } while (getIDbyIdRole(id_user) == true);
  const {
    name,
    lastname,
    email,
    phone_number,
    password,
    check_in,
    check_out
  } = request.body;

  connection.query(
    `INSERT INTO login (id_user, email, password, id_role)
  VALUES ('${id_user}','${email}', sha1('${password}'),'${2}');`,
    (err, results1) => {
      if (err) {
        response.sendStatus(400);
        console.log(err);
      } else if (results1.affectedRows !== 0) {
        console.log(results1);
        connection.query(
          `INSERT INTO user (id_user, name, lastname, phone_number) VALUES
            ('${id_user}','${name}', '${lastname}', ${phone_number});`,
          (err, results2) => {
            if (err) {
              response.sendStatus(400);
              console.log(err);
            } else if (results2.affectedRows !== 0) {
              console.log(results2);
              connection.query(
                `INSERT INTO property_tenant (id_user, id_property, check_in, check_out) VALUES
                ('${id_user}','${id_property}', STR_TO_DATE("01/01/2020", '%d/%m/%Y'), STR_TO_DATE("01/01/2021", '%d/%m/%Y'));`,
                (err,
                results3 => {
                  console.log(id_property, id_user, check_in, check_out);
                  if (err) {
                    response.sendStatus(400);
                    console.log(err);
                  } else {
                    console.log(results3);
                    response.send({ userInserted: true });
                  }
                })
              );
            }
          }
        );
      }
    }
  );
};

tenantController.listTenants = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  const { id_property } = request.params;
  // const currentTime = new Date();
  try {
    connection.query(
      `SELECT * FROM user
     LEFT JOIN property_tenant ON user.id_user = property_tenant.id_user
     WHERE ( CURRENT_DATE() BETWEEN check_in AND check_out);`,
      (err, results) => {
        if (err) console.log(err);
        else if (results) {
          console.log(results);
          response.send(results);
        }
      }
    );
  } catch {
    response.sendStatus(500);
  }
};

tenantController.getPropertyDetails = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  const { id_tenant } = request.params;

  connection.query(
    `SELECT property.* , property_tenant.check_in, 
      property_tenant.check_out 
      FROM property 
      LEFT JOIN property_tenant ON property.id_property = property_tenant.id_property
      WHERE property_tenant.id_user = '${id_tenant}';`,
    (err, results) => {
      if (err) console.log(err);
      else {
        console.log(results);
        response.send(results[0]);
      }
    }
  );
};

tenantController.getEmail = (request, response) => {
  const { id_property } = request.params;

  connection.query(
    `SELECT login.email, user.name
    FROM login
    LEFT JOIN user ON login.id_user = user.id_user
    LEFT JOIN property_tenant ON user.id_user = property_tenant.id_user
    WHERE property_tenant.id_property ='${id_property}' AND user.isDeleted='${0}';`,
    (err, results) => {
      if (err) {
        console.log(err);
        response.sendStatus(500);
      } else {
        if (results && results.length != 0) {
          response.send({ tenant: results[0] });
        } else {
          response.send({ tenant: { name: "Sin inquilino", email: "" } });
        }
      }
    }
  );
};

tenantController.getReportDetails = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  const { id_property } = request.params;
  connection.query(
    `SELECT * FROM form_report 
    WHERE id_property = '${id_property}' AND closeDate IS NULL AND isDeleted='${0}';`,
    (err, results) => {
      if (err) console.log(err);
      else {
        response.send(results);
      }
    }
  );
};

module.exports = tenantController;
