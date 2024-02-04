const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");

// Define Leave Schema
const leaveSchema = new mongoose.Schema({
    employeeId: String,
    leaveType: String,
    actType: String,
    startDate: Date,
    numberOfDays: Number,
    reason: String,
    status: String, // pending, approved, rejected
  });
  
  const Leave = mongoose.model('Leave', leaveSchema);
  
  // API Endpoints
  
  // Post API for create new leave application entry
  Router.post('/', async (req, res) => {
    try {
      const { employeeId, leaveType, actType, startDate, numberOfDays, reason } = req.body;
  
      // Get leave details for the specified employee
      const leaveDetails = await Leave.find({ employeeId: employeeId, status: { $ne: "rejected" } });
  
      if(leaveDetails.length>0 ){
        if(actType !==  leaveDetails[0].actType){
          throw new Error("Invalid Act type!");
        }
      }
  
      // Define entitled values based on act type
      const entitledValues = {
        WagesBoardAct: { Annual: 10, Casual: 10, Medical: 10 },
        ShopOffice: { Annual: 14, Casual: 7, Medical: 21 },
      };

      // Initialize count for the specific leave type
      let countAnnual = 0;
      let countCasual = 0;
      let countMedical = 0;
  
      if (leaveType === "Annual" && countAnnual<= entitledValues[actType].Annual) {
        countAnnual = parseInt(numberOfDays, 10);
        countCasual = 0;
        countMedical = 0;
      } else if (leaveType === "Casual" && countCasual <= entitledValues[actType].Casual) {
        countAnnual=0;
        countCasual = parseInt(numberOfDays, 10);
        countMedical=0;
      } else if(leaveType === "Medical" && countMedical <= entitledValues[actType].Medical){
        countAnnual=0;
        countCasual=0;
        countMedical = parseInt(numberOfDays, 10);
      }
        
      // Iterate through leave details to find the count of the specified leave type
      for (const emp of leaveDetails) {
        if (emp.leaveType === "Annual" ) {
          countAnnual += parseInt(emp.numberOfDays, 10);
        } else if (emp.leaveType === "Casual" ) {
          countCasual += parseInt(emp.numberOfDays, 10);
        } else if(emp.leaveType === "Medical" ) {
          countMedical += parseInt(emp.numberOfDays, 10);
        }
      }
      
      // Save the leave application entry if the conditions are satisfied
      if (
        countAnnual <= entitledValues[actType].Annual &&
        countCasual <= entitledValues[actType].Casual &&
        countMedical <= entitledValues[actType].Medical
      ) {
        const newLeave = new Leave({
          employeeId,
          leaveType,
          actType,
          startDate,
          numberOfDays,
          reason,
          status: 'pending',
        });

        await newLeave.save();
        
        res.status(201).json({ message: 'Successfully sent' });
      }
      else {
        // Display an alert message if entitlement is exceeded
        console.log(`${leaveType} Leave entitlement exceeded`);
        res.status(400).json({ message: 'Leave entitlement exceeded' });
      }
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Not sent' });
    }
  });
    
  async function getEmployeeById(employeeId){
    const leaves = await Leave.find({employeeId: employeeId});
  }
  
  // GET API for get leave application details
  Router.get('/', async (req, res) => {
    try {
      const leaves = await Leave.find();
      res.json(leaves);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // PUT API for update the status of leave application details
  Router.put('/:id', async (req, res) => {
      const { id } = req.params;
      const { action } = req.body;
    
      try {
        let updatedLeave;
        if (action === 'approve') {
          updatedLeave = await Leave.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
        } else if (action === 'reject') {
          updatedLeave = await Leave.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
        } else {
          return res.status(400).json({ error: 'Invalid action' });
        }
    
        res.json(updatedLeave);
        
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    module.exports = Router;