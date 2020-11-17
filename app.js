const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();
// Middle

app.use(bodyParser.json());

app.use(methodOverride('_method'))

// view

app.set("view engine", "ejs");

// Mongo URI

const mongoURI = 'mongodb+srv://dbUser:' + process.env.db_pass + '@cluster0.ascei.mongodb.net/test?retryWrites=true&w=majority';

// Mongo connection

const connect = mongoose.createConnection(mongoURI);

// init gft

let gfs;

connect.once('open', () => {
  gfs = Grid(connect.db, mongoose.mongo)});
  gfs.collection('upload')

app.get('/', (req, res) => {
  res.render('index');
});

const PORT = 4000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));