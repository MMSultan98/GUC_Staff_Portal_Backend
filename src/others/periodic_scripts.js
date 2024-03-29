require("dotenv").config();
const schedule = require("node-schedule");
const hrMemberModel = require("../models/hr_member_model");
const academicMemberModel = require("../models/academic_member_model");
const authRefreshTokenModel = require("../models/refresh_token_model");

schedule.scheduleJob("0 0 0 11 * *", async () => {
  await hrMemberModel.updateMany({}, { $inc: { annualLeaveBalance: 2.5 } });
  await academicMemberModel.updateMany({}, { $inc: { annualLeaveBalance: 2.5 } });
});

schedule.scheduleJob("0 */15 * * * *", async () => {
  await authRefreshTokenModel.deleteMany({ expiresAt: { $lt: new Date() } });
});
