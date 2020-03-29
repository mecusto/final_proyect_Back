const { Router } = require("express");
const router = Router();
const reportController = require("../controllers/reportController");
const multer = require("multer");

router.get("/propertyreports", reportController.listAllReports);
router.get("/:id_report", reportController.getReportwithProperty);


router.post('/photo/:photo', reportController.deletePhoto);
router.post('/delete/:id_report', reportController.deleteReport);
router.post('/updateState/:id_report', reportController.updateStatus);

const storage = multer.diskStorage({
    destination: "public/reports",
    filename: (_req, file, cb) => {
        const ext = file.originalname.slice(file.originalname.lastIndexOf("."));
        cb(null, new Date().valueOf() + ext); // cb stands for call back
    }
});

// upload multiple photos max 4 items on an array
const upload = multer({ storage }).array("photo_report", 4);
router.post("/", upload, reportController.addNewReport);
router.post("/update/:id_report", upload, reportController.updateReport);


module.exports = router;