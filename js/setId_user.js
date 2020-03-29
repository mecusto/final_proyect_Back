const { ROLE_OWNER, ROLE_PROFFESIONAL, ROLE_TENANT } = require("./constant_masterTables");

// Function that generates id_user for each type of user
// starting by 1 for owner, by 2 for professional and by 3 for tenant

function setId_user(id_role) {
    let id_user = id_role * 1000000 + getRndInteger(1, 1000000); //ROLE_OWNER   by default
    return id_user;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = setId_user;