const mysql = require("mysql");
const connection = require("../config/db");
const jwt = require("jsonwebtoken");
const setId_user = require("../js/setId_user");
const userController = {};
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
// ------------------------ CHECK IF EMAIL EXISTS ON DB FOR REGISTER PORPOUSE---------------
userController.emailExist = (request, response) => {
  const { email } = request.params;
  try {
    connection.query(
      `SELECT * FROM login WHERE email = '${email}';`,
      (err, results) => {
        if (err) {
          console.log(err);
          response.sendStatus(400);
        }
        let aux = false;
        if (results && results.length != 0) {
          aux = true;
        }
        console.log(aux);
        response.send(aux);
      }
    );
  } catch {
    response.sendStatus(500);
  }
};
// ---------------------- GET EMAIL AND NAME -----------------------------------------
userController.getEmail = (request, response) => {
  const { id_property } = request.params;
  try {
    connection.query(
      `SELECT login.email, user.name
        FROM login
        LEFT JOIN user ON login.id_user = user.id_user
        LEFT JOIN property ON property.id_user = login.id_user
        LEFT JOIN form_report ON form_report.id_property = property.id_property 
        WHERE form_report.id_property = '${id_property}'
        GROUP BY login.email;`,
      (err, results) => {
        if (err) {
          console.log(err);
          response.sendStatus(400);
        }
        if (results && results.length != 0) {
          response.send(results[0]);
        }
      }
    );
  } catch {
    response.sendStatus(500);
  }
};
// ---------------------- REGISTER NEW USER -------------------------------
userController.register = (request, response) => {
  const {
    email,
    password,
    name,
    lastname,
    phone_number,
    id_role,
    img
  } = request.body;
  let id_user = "";
  // Create id_user by role with control if it already exists
  do {
    id_user = setId_user(1);
  } while (getIDbyIdRole(id_user) == true);
  try {
    connection.query(
      `INSERT INTO login (id_user, email, password, id_role, isDeleted)
            VALUES ('${id_user}','${email}', sha1('${password}'),'${1}', false);`,
      (error, res) => {
        if (error) {
          console.log(error);
          response.sendStatus(400);
        } else {
          connection.query(
            `INSERT INTO user (id_user, name, 
                             lastname, phone_number,  photo_profile, isDeleted)
                             VALUES('${id_user}', '${name}','${lastname}',
                             '${phone_number}','${img}', false);`,
            (err, res) => {
              if (err) {
                console.log(err);
                response.sendStatus(400);
              } else {
                response.send({ isRegistered: true });
              }
            }
          );
        }
      }
    );
  } catch {
    response.sendStatus(500);
  }
};

// ------------------------ LOGIN -----------------------------------------
userController.auth = (req, res) => {
  const { email, password } = req.body;
  try {
    connection.query(
      `SELECT * FROM login 
            LEFT JOIN user ON login.id_user = user.id_user
            WHERE login.email = '${email}' AND login.password = sha1('${password}');`,
      (err, results) => {
        if (err) return err;
        if (results && results.length) {
          //si existe usuario en la db
          const [
            {
              name,
              lastname,
              phone_number,
              photo_profile,
              email,
              id_role,
              id_user,
              isDeleted
            }
          ] = results;
          if (!isDeleted) {
            const payload = {
              id_user,
              email,
              id_role,
              isDeleted,
              name,
              lastname,
              phone_number,
              photo_profile
            };
            const token = jwt.sign(payload, myprivatekey);
            res.send({ token });
          } else {
            res.send("El usuario no existe");
          }
        } else {
          res.sendStatus(401);
        }
      }
    );
  } catch {
    res.sendStatus(500);
  }
};
// ------------------------- UPDATE USER PROFILE -------------------------------------
userController.updateProfile = (request, response) => {
  const { email, name, lastname, phone_number, photo_profile } = request.body;
  const { id_user } = request.params;
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  connection.query(
    `UPDATE user SET name ='${name}', lastname ='${lastname}',
            phone_number ='${phone_number}' WHERE id_user = '${id_user}';`,
    (err, res) => {
      if (err) {
        console.log(err);
        response.sendStatus(400);
      } else {
        connection.query(
          `SELECT * FROM login 
                    LEFT JOIN user ON login.id_user = user.id_user
                    WHERE login.email = '${email}';`,
          (err, results) => {
            if (err) return err;
            if (results && results.length) {
              //si existe usuario en la db
              const [
                {
                  name,
                  lastname,
                  phone_number,
                  photo_profile,
                  email,
                  id_role,
                  id_user,
                  isDeleted
                }
              ] = results;
              const payload = {
                id_user,
                email,
                id_role,
                isDeleted,
                name,
                lastname,
                phone_number,
                photo_profile
              };
              const token = jwt.sign(payload, myprivatekey);
              response.send({ token });
            } else {
              response.sendStatus(401);
            }
          }
        );
      }
    }
  );
};
// -------------------------- LOGICAL DELETED USER ---------------------------------------
userController.delete = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  connection.query(
    `UPDATE login, user SET login.isDeleted = 1, user.isDeleted = 1 
            WHERE login.id_user = '${id_user}' AND user.id_user = '${id_user}';`,
    (error, results) => {
      if (error) {
        console.log(error);
        response.sendStatus(400);
      } else {
        response.send({ isDeleted: true });
      }
    }
  );
};
userController.deleteTenant = (request, response) => {
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  const { id_property } = request.params; // tenant array
  console.log("estoy en delete tenant");
  connection.query(
    `UPDATE login, user 
        LEFT JOIN property_tenant ON user.id_user = property_tenant.id_user
        SET login.isDeleted = 1, user.isDeleted = 1
        WHERE property_tenant.id_property = '${id_property}';`,
    (err, res) => {
      if (err) {
        console.log(err);
        response.sendStatus(400);
      } else {
        response.send({ isDeleted: true });
      }
    }
  );
};
// ------------------------- UPLOAD PHOTO PROFILE ------------------------------
userController.uploadPhotoProfile = (request, response) => {
  // guardar nombre de foto en base de datos
  const token = request.headers.authorization.replace("Bearer ", "");
  const { id_user } = jwt.verify(token, myprivatekey);
  const photo_profile = request.file.filename;
  try {
    connection.query(
      `UPDATE user SET photo_profile = '${photo_profile}' WHERE id_user = '${id_user}';`,
      (err, results) => {
        if (err) console.log(err);
        else {
          // generate new token with photo_profile info
          connection.query(
            `SELECT * FROM login 
                        LEFT JOIN user ON login.id_user = user.id_user
                        WHERE login.id_user = '${id_user}';`,
            (err, results) => {
              if (err) return err;
              if (results && results.length) {
                //si existe usuario en la db
                const [
                  {
                    name,
                    lastname,
                    phone_number,
                    photo_profile,
                    email,
                    id_role,
                    id_user,
                    isDeleted
                  }
                ] = results;
                const payload = {
                  id_user,
                  email,
                  id_role,
                  isDeleted,
                  name,
                  lastname,
                  phone_number,
                  photo_profile
                };
                const token = jwt.sign(payload, myprivatekey);
                response.send({ token });
              }
            }
          );
          // response.send(Object(request.file.filename));
        }
      }
    );
  } catch {
    response.sendStatus(401);
  }
};
// -------------------------- UPDATE PASSWORD ----------------------------------------
userController.updatePassword = (request, response) => {
  const { password } = request.body;
  const { id_user } = request.params;
  const token = request.headers.authorization.replace("Bearer ", "");
  jwt.verify(token, myprivatekey);
  connection.query(
    `UPDATE login SET password = sha1('${password}')
                  WHERE id_user = '${id_user}';`,
    (error, res) => {
      if (error) {
        console.log(error);
        response.sendStatus(400);
      } else {
        response.send({ newPasswordOk: true });
      }
    }
  );
};
module.exports = userController;
