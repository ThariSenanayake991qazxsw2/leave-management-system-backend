const express = require("express");
const router = express.Router();

const leaveApplyManagementApi = require("../api/leave-apply-management/leave-apply-management-api");

router.use("/", leaveApplyManagementApi);

module.exports = router;
