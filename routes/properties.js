const { Router } = require("express");
const router = Router();
const multer = require("multer");
const propertiesController = require("../controllers/propertiesController");

router.get("/", propertiesController.listProperties);
router.get("/property/:id_property", propertiesController.oneProperty);
router.post("/delete/:id_property", propertiesController.delete); //TODO cambiar put por post si no funciona
router.get("/propertyTenant", propertiesController.onePropertyTenant);

const storage = multer.diskStorage({
    destination: "public/properties",
    filename: (_req, file, cb) => {
        const ext = file.originalname.slice(file.originalname.lastIndexOf("."));
        cb(null, new Date().valueOf() + ext); // cb stands for call back
    }
});

const upload = multer({ storage }).single("photo_property"); //TODO mirar como subir varias fotos

router.post("/register", upload, propertiesController.register);
router.post("/edit/:id_property", upload, propertiesController.edit);

module.exports = router;