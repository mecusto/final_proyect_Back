CREATE DATABASE jammer;

USE jammer;

/* tabla maestra */
CREATE TABLE IF NOT EXISTS role (
	id_role INT PRIMARY KEY,
    role_type VARCHAR(30)
);
INSERT INTO role (id_role, role_type) VALUES (1, "OWNER");
INSERT INTO role (id_role, role_type) VALUES (2, "PROFESSIONAL");
INSERT INTO role (id_role, role_type) VALUES (3, "TENANT");

/* restringir en el front el role del usuario: 0 owner, 1 tenent or 2 professional o ENUM?*/
CREATE TABLE IF NOT EXISTS login (
	id_user INT NOT NULL PRIMARY KEY, 	/*generada 1 para owner, 2 professional, 3 tenant*/
	email VARCHAR(60) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
	isDeleted BOOLEAN DEFAULT FALSE, 			/* borrado lógico */
    id_role INT NOT NULL,					/* ENUM('owner', 'tenant', 'professional') */
	CONSTRAINT login_fk_1 
		FOREIGN KEY (id_role) REFERENCES role(id_role)
);


CREATE TABLE IF NOT EXISTS user (
	id_user INT NOT NULL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	lastname VARCHAR(100) NOT NULL,
    photo_profile VARCHAR(50),
    phone_number VARCHAR(20),
    isDeleted BOOLEAN DEFAULT FALSE, 			/* borrado lógico */
    CONSTRAINT user_fk_1 
		FOREIGN KEY (id_user) REFERENCES login(id_user)
        ON UPDATE CASCADE    
);

/* category NOT controlled from frontend */
CREATE TABLE professional (
	id_user INT NOT NULL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    company VARCHAR(50),
    photo_profile VARCHAR(50),
	isDeleted BOOLEAN DEFAULT FALSE, 			/* borrado lógico */
    CONSTRAINT user_fk_1 
		FOREIGN KEY (id_user) REFERENCES login(id_user)
        ON UPDATE CASCADE 
);

CREATE TABLE IF NOT EXISTS tenant (
	id_user INT NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    photo_profile VARCHAR(50),
    isDeleted BOOLEAN DEFAULT FALSE, 			/* borrado lógico */
    CONSTRAINT tenant_fk_1 
		FOREIGN KEY (id_user) REFERENCES login(id_user)
        ON UPDATE CASCADE 
);

DROP TABLE property;

CREATE TABLE IF NOT EXISTS property (
	id_property INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    address_line1 VARCHAR(80) NOT NULL,
    address_line2 VARCHAR(80),
    locality VARCHAR(80) NOT NULL,
    region VARCHAR(80),
    postcode INT NOT NULL,
    photo_property VARCHAR(50),
	isDeleted BOOLEAN DEFAULT FALSE,			/* borrado lógico */

	CONSTRAINT property_fk_1 
		FOREIGN KEY (id_user) REFERENCES login(id_user)
        ON UPDATE CASCADE
/* photos set on folder en server: ./id_property/id_report/ */
);			

INSERT INTO property (id_user, address_line1, address_line2, locality, region, postcode)
    VALUES (1899347, 'asdf', 'adsf', 'asdf', 'asdf','12345');
DROP TABLE property_tenant;



CREATE TABLE IF NOT EXISTS property_tenant (
	id_rent INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	id_property INT NOT NULL,
    id_user INT NOT NULL, 		/* id_tenant from login and user table*/
    check_in DATE,
    check_out DATE,
	isDeleted BOOLEAN DEFAULT FALSE,			/* borrado lógico */
    CONSTRAINT rent_fk1 FOREIGN KEY (id_user) REFERENCES user(id_user) ON UPDATE CASCADE,
	CONSTRAINT rent_fk2 FOREIGN KEY (id_property) REFERENCES property(id_property) ON UPDATE CASCADE
);

SELECT *
FROM property_tenant
WHERE CURRENT_DATE() BETWEEN check_in AND check_out;



CREATE TABLE IF NOT EXISTS report_state (
	id_report_state INT PRIMARY KEY,
    state VARCHAR(20)
);
INSERT INTO report_state (id_report_state, state) VALUES (1, "NEW");
INSERT INTO report_state (id_report_state, state) VALUES (2, "OPEN");
INSERT INTO report_state (id_report_state, state) VALUES (3, "RESOLVED");

CREATE TABLE IF NOT EXISTS priority (
	id_priority INT PRIMARY KEY,
    priority VARCHAR(20)
);
INSERT INTO priority (id_priority, priority) VALUES (1, "URGENT");
INSERT INTO priority (id_priority, priority) VALUES (2, "MEDIUM");
INSERT INTO priority (id_priority, priority) VALUES (3, "LOW");

DROP TABLE form_report;
CREATE TABLE IF NOT EXISTS form_report (
	id_report INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_property INT NOT NULL,
    title VARCHAR(256) NOT NULL,
    description TEXT,
	openDate VARCHAR(50) NOT NULL,
    closeDate VARCHAR(50),
    id_report_state INT NOT NULL, 		/* ENUM ('new', 'open', 'resolved') */
    id_priority INT NOT NULL,  			/* ENUM ('urgent', 'medium', 'low') */
	isDeleted BOOLEAN DEFAULT FALSE, 		/* borrado lógico */

    CONSTRAINT form_report_fk_1 
		FOREIGN KEY (id_property) REFERENCES property(id_property)
        ON UPDATE CASCADE,
	CONSTRAINT form_report_fk_2
		FOREIGN KEY (id_report_state) REFERENCES report_state(id_report_state),
	CONSTRAINT form_report_fk_3
		FOREIGN KEY (id_priority) REFERENCES priority(id_priority)
);

DROP TABLE photo_report;
CREATE TABLE IF NOT EXISTS photo_report (
	id_photo_report INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	id_report INT NOT NULL,
    photo_report VARCHAR(40) NOT NULL,
    isDeleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT photo_report_fk_1 
		FOREIGN KEY (id_report) REFERENCES form_report(id_report)
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS budget_state (
	id_budget_state INT PRIMARY KEY,
    state VARCHAR(20)
);
INSERT INTO budget_state (id_budget_state, state) VALUES (1, "NEW");
INSERT INTO budget_state (id_budget_state, state) VALUES (2, "PENDING");
INSERT INTO budget_state (id_budget_state, state) VALUES (3, "ACCEPTED");
INSERT INTO budget_state (id_budget_state, state) VALUES (4, "REJECTED");



/*all invoices requested and sent
id_owner may be removed, and checked from property*/
CREATE TABLE IF NOT EXISTS budget(
	id_budget INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    id_report INT NOT NULL,
    id_professional INT NOT NULL,
    amount INT, 
    invoiceDetails BLOB,		  /* si subimos archivo con detalle de presupuesto */
	date VARCHAR(50),
    budget_state INT,  			/* ENUM('new', 'pending', 'accepted', 'rejected') */
    isDeleted BOOLEAN DEFAULT FALSE,
	CONSTRAINT budget_fk_1 
		FOREIGN KEY (id_report) REFERENCES form_report(id_report)
		ON UPDATE CASCADE,
	CONSTRAINT budget_fk_2 
		FOREIGN KEY (id_professional) REFERENCES professional(id_professional)
		ON UPDATE CASCADE,
	CONSTRAINT budget_state_fk_2 
		FOREIGN KEY (budget_state) REFERENCES budget_state(id_budget_state)
);

SELECT title, description, openDate 
FROM form_report
WHERE id_property = 118 AND closeDate IS NOT NULL;


SELECT login.email, user.name
    FROM login
    LEFT JOIN user ON login.id_user = user.id_user
    LEFT JOIN property_tenant ON user.id_user = property_tenant.id_user
    WHERE property_tenant.id_property =3;

SELECT login.email, user.name
FROM login
LEFT JOIN user ON login.id_user = user.id_user
LEFT JOIN property_tenant ON user.id_user = property_tenant.id_user
WHERE property_tenant.id_property = 1;

SELECT property.id_property, property.address_line1, property.photo_property, property_tenant.check_in, 
    property_tenant.check_out FROM property 
    LEFT JOIN property_tenant ON property.id_property = property_tenant.id_property
    WHERE property_tenant.id_user =2219102;

SELECT property.id_property, property.address_line1, property.photo_property, property_tenant.check_in, 
    property_tenant.check_out, form_report.title, form_report.description
    FROM property 
    LEFT JOIN property_tenant ON property.id_property = property_tenant.id_property
    LEFT JOIN form_report ON property_tenant.id_property = form_report.id_property
    WHERE property_tenant.id_user = 1
    GROUP BY property.id_property;

SELECT * FROM login WHERE id_user = 1982969;

SELECT * FROM user WHERE id_user = 123456123 AND isDeleted = 1;

UPDATE login, user SET login.isDeleted = 1, user.isDeleted = 1 
            WHERE login.id_user = 1862893 AND user.id_user = 1862893;

SELECT * FROM user WHERE id_user=123456123 AND isDeleted = 1;



SELECT id_property, id_report, title, description, openDate, closeDate, id_report_state, id_priority 
FROM form_report WHERE isDeleted = 0;

SELECT * FROM login 
LEFT JOIN user ON login.id_user = user.id_user
WHERE login.email = 'ssafenb@gmail.com' AND login.password = sha1(2020);


SELECT id_report, title, description, openDate, closeDate, id_report_state, id_priority 
FROM form_report
LEFT JOIN property ON form_report.id_property = property.id_property
LEFT JOIN user ON property.id_user = user.id_user 
WHERE user.id_user = 1899347 and user.isDeleted = 0;

SELECT form_report.id_property, id_report, title, description, openDate, closeDate, id_report_state, id_priority 
FROM form_report
LEFT JOIN property ON form_report.id_property = property.id_property
WHERE property.id_property = 1 and property.isDeleted = 0;

INSERT INTO login (id_user, email, password, id_role, isDeleted)
SELECT * FROM (SELECT 444, "email" , sha1(2020),1 , false) AS tmp 
WHERE NOT EXISTS (SELECT email FROM login 
WHERE email = "email" AND password = sha1(2020));

INSERT INTO form_report (id_property, id_user, title, description, openDate, reportState, priority, isDeleted)
VALUES ('${id_property}','${id_user}','${title}', '${description}','${openDate}','${reportState}', '${priority}', false);

UPDATE login, user SET login.isDeleted = 1, user.isDeleted = 1 WHERE login.id_user = 1982968 AND user.id_user = 1982968;
UPDATE login SET email = "email", password = sha1(2020), id_role = 1 WHERE id_user = 1118595;


SELECT email 
FROM login
LEFT JOIN property ON property.id_user = login.id_user
LEFT JOIN form_report ON form_report.id_property = property.id_property 
WHERE form_report.id_property = 1
GROUP BY login.email;

SELECT id_property, id_report, title, description, openDate, closeDate, id_report_state, id_priority 
FROM form_report
WHERE id_property = 1 and isDeleted =0;

 SELECT * FROM form_report
        LEFT JOIN photo_report ON photo_report.id_report = form_report.id_report
        WHERE form_report.id_report = '${id_report}' AND isDeleted='${0}';
        
SELECT email, user.name
        FROM login
        LEFT JOIN user ON login.id_user = user.id_user
        LEFT JOIN property ON property.id_user = login.id_user
        LEFT JOIN form_report ON form_report.id_property = property.id_property 
        WHERE form_report.id_property = 1
        GROUP BY login.email;
        
UPDATE form_report SET id_property = 1, title = "nuevo titulo", 
description = "esta casa sigue siendo una ruina", openDate = "03/02/2020", 
id_report_state = 1, id_priority = 1 WHERE id_report= 1;