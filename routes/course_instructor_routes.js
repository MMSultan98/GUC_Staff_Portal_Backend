require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const hrMemberModel = require("../models/hr_member_model");
const academicMemberModel = require("../models/academic_member_model");
const roomModel = require("../models/room_model");
const courseModel = require("../models/course_model");
const departmentModel = require("../models/department_model");
const facultyModel = require("../models/faculty_model");

const router = express.Router();

router.use((req, res, next) => {
    const token = jwt.decode(req.headers.token);
    if (token.role === "Course Instructor" || token.role === "Head of Department") {
        next();
    }
    else {
        res.status(403).send("Unauthorized access.");
    }
});

router.route("/view-all-staff")
.get(async (req,res) => {
    const token = jwt.decode(req.headers.token);
    let user = await academicMemberModel.findOne({id:token.id});
    let output= await academicMemberModel.find({department:user.department},{name:1,_id:0,email:1,role:1,faculty:1,department:1,office:1,salary:1})
    try{
        res.send(output)
        }
        catch(error){
            res.send("error")
        }
})



router.route("/view-all-staff-per-course")
.post(async (req,res) => {
    const token = jwt.decode(req.headers.token);
    let user = await academicMemberModel.findOne({id:token.id});
    let course= await courseModel.findOne({department:user.department,name:req.body.course})
    let output=[]
    let instructors= await course.instructors;
    let tas= await course.TAs;
    for(let i=0;i<instructors.length;i++){
        let user = await academicMemberModel.findOne({id:instructors[i]});
        output.push(user)
    }
    for(let i=0;i<tas.length;i++){
        let user = await academicMemberModel.findOne({id:tas[i]});
        output.push(user)
    }
    try{
        res.send(output)
        }
        catch(error){
            res.send("error")
        }
})


router.route("/assign-course-coordinator")
.post(async (req,res) => {
    const token = jwt.decode(req.headers.token);
    let user = await academicMemberModel.findOne({id:token.id});
    let course=await courseModel.findOne({name:req.body.course})
    let instructors=course.instructors
    let ta=req.body.id
    if(user.department===course.department){
        let course=await courseModel.findOneAndUpdate({name:req.body.course}, { courseCoordinator: ta })
    }
    try{
        res.send("Course coordinator assigned to course")
        }
        catch(error){
            res.send("Cannot assign course coordinator")
        }
})

router.route("/delete-academic-member")
.post(async (req,res) => {
    const token = jwt.decode(req.headers.token);
    let user = await academicMemberModel.findOne({id:token.id});
    let course=await courseModel.findOne({name:req.body.course})
    if(ta){
        try{
        if(user.department===course.department){
            let course=await courseModel.findOneAndUpdate({name:req.body.course},{"$pull": { teachingAssistants: req.body.id }})
            res.send("Academic member deleted")
        }
        else{
            res.send("Cannot delete academic member from a course not in your department")
        }
            }
            catch(error){
               res.send("Cannot delete academic member")
            }
        }
        else{
            res.send("TA does not exist")
        }
})


router.route("/add-academic-member")
.post(async (req,res) => {
    const token = jwt.decode(req.headers.token);
    let user = await academicMemberModel.findOne({id:token.id});
    let course=await courseModel.findOne({name:req.body.course})
    let ta=await academicMemberModel.findOne({id:req.body.id});
    if(ta.role==="Teaching Assistant"){
    if(ta){
        if(user.department===course.department){
            if(user.department===ta.department){
            let course=await courseModel.findOneAndUpdate({name:req.body.course},{"$push": { teachingAssistants: req.body.ta }})
            try{
                res.send("Academic member added")
                }
                catch(error){
                    res.send("Cannot delete academic member")
                 }
            }
            else{
                res.send("Can not add academic member not in your department")
            }}
            else{
                res.send("Can not add academic member to course not in your department")
            } 
        }
        else{
            res.send("TA does not exist")
        }
    }
    else{
        res.send("ID is not an ID of a TA")
    }

})

module.exports = router;