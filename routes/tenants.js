const { Router } = require("express");
const router = Router();
const tenantController = require("../controllers/tenantController");

router.post("/checkIn/:id_property", tenantController.checkIn);
router.get(
    "/getPropertydetails/:id_tenant",
    tenantController.getPropertyDetails
);
router.get("/", tenantController.listTenants);
router.get("/useremail/:id_property", tenantController.getEmail);
router.get("/getReportDetails/:id_property", tenantController.getReportDetails)

module.exports = router;