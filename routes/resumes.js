
const config = require('config');
const auth = require("../middleware/Authenticate");
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
let multer = require('multer');
var cloudinary = require("cloudinary");

var storage = multer.diskStorage({
  filename: function(req, file, callback){
      callback(null, Date.now() + file.originalname);
  }
});

var pdfFile = function(req, file, callback){
  if(!file.originalname.match(/\.(pdf)$/i)){
      return callback(new Error("Only PDFS allowed."), false);
  }
  callback(null, true);
};

var upload = multer({storage: storage, fileFilter: pdfFile});


cloudinary.config({
    cloud_name: "trending-trades",
    api_key: "232591527462751",
    api_secret: "2Cxo217x3sbg8Vsj3IV-6nSbK5M"//maybe add this to an environment variable or use config package
});


const resumeTypesEnum = [//array of categories
  'Software',
  'Engineering',
  'Finance',
  'Computer',
  'Arts',
  'Accounting',
  'Math',
  'Economics',
  'Architecture',
  'Science',
  'Kinesiology',
  'Others'
];

const resumeSchema = new mongoose.Schema({
  name: {type: String, required: true},
  type: {type: String, enum: resumeTypesEnum, required: true},
  owner: {type: String, required: true},
  resumePDF: {type: String},
  desc: {type: String},
  date: { type: Date, default: Date.now},
  commentAuthorArray: [String],
  commentContentArray: [String]
});

const Resumes = mongoose.model('resumes', resumeSchema);//database w model

//for Home Page
router.get('/', async (req, res) => {
  const numberOfResumes = await Resumes.count();
  var resumesArray = new Array(numberOfResumes); 
  const resumes = await Resumes.find((err, temp) => {
    for(var i = 0; i < temp.length; i++){
      resumesArray[i] = temp[i];
    }
    res.render("home/home", {resumes: resumesArray});
  }).sort('name');
});

//New Resume
router.get('/new', auth, async (req, res) => {
  res.render("home/temp");
});

//for user's trades
router.get('/MyResumes/:name', async (req, res) => {
  const numberOfResumes = await Resumes.count();
  var resumesArray = new Array(numberOfResumes); 
  var x = 0;
  const resumes = await Resumes.find((err, temp) => {
    for(var i = 0; i < temp.length; i++){
      if (temp[i].owner == req.params.name) {
        resumesArray[x] = temp[i];
        x++;
      }
    }
    res.render("users/profile", {resumes: resumesArray});
  }).sort('name');
});
router.get('/delete/:id', async (req, res) => {
   const resume = await Resumes.findByIdAndRemove(req.params.id);
   if (!resume) return res.status(404).send('The Resume with the given ID was not found.');
   res.redirect("../");
   
 });
 
router.get('/:id', auth, async (req, res) => {
  const resume = await Resumes.findById(req.params.id);//PARAMS NOT PARAM
  console.log(resume);
  if (!resume) {
    return res.status(404).send('The Resume with the given id was not found... Please Try again');
  }
  res.render("item-page/item", {resume: resume});
});
  
router.post('/', upload.single("image"), async (req, res) => {
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false
    });
  } else {
    
    console.log(req.file);
    cloudinary.uploader.upload(req.file.path, async (result) => { 
      var temp = result.secure_url;
      const host = req.host;
      const filePath = req.protocol + "://" + host + '/' + req.file.path;
      console.log(filePath);
      let resume = new Resumes({
        name: req.body.name,
         type: req.body.type,
         owner: req.user.username,
         desc: req.body.desc,
         resumePDF: temp
      });
      console.log(resume);
      resume = await resume.save();
      res.render("item-page/item", {resume: resume});
    }, {public_id: 'single_page_pdf'});
  }
});

//new comment
router.post('/NewComment/:id', async (req, res) => {
  const resumeTemp = await Resumes.findById(req.params.id);//PARAMS NOT PARAM
  console.log(resumeTemp.commentAuthorArray);
  resumeTemp.commentAuthorArray.push(req.user.username);
  resumeTemp.commentAuthorArray.push(req.body.comment);
  const commentAuthorArrayTemp = resumeTemp.commentAuthorArray
  const commentContentArrayTemp = resumeTemp.commentContentArray
  console.log(commentAuthorArrayTemp);
  console.log(req.body.comment);
  const resume = await Resumes.findByIdAndUpdate(req.params.id, {commentAuthorArray: commentAuthorArrayTemp, commentContentArray: commentContentArrayTemp}, {new: true});
  res.render("item-page/item", {resume: resume});
});

router.put('/:id', async (req, res) => {
  const { error } = validateResume(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  const resume = await Resumes.findByIdAndUpdate(req.params.id, {name: req.body.name, type: req.body.type, owner: req.body.trader}, {new: true});
   
  if (!resume) {
    return res.status(404).send("The Resume with the given ID was not found.");
  }
  res.send(resume);
});
  
router.delete('/:id', async (req, res) => {
  const resume = await Trade.findByIdAndRemove(req.params.id);
  if (!resume) return res.status(404).send('The Resume with the given ID was not found.');
  res.redirect("api/resumes");
});
    
function validateResume(resume) {
  const schema = {
    name: Joi.string().min(3).required(),
    type: Joi.string().min(3).required(),
    owner: Joi.string().min(3).required()
  };
  return Joi.validate(resume, schema);
}

module.exports = router;