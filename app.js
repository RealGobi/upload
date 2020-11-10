const express = require("express");
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const moongose = require('mongoose');
const multer = require('multer');
const gridFsStorage = require('multer-gridfs-storage');
const grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();
// Middle

app.use(bodyParser.json());

app.use(methodOverride('_method'))

// view

app.set("view engine", "ejs");

// Mongo URI

const mongoURI = 'mongodb+srv://dbUser:dbUser@cluster0.ascei.mongodb.net/test?retryWrites=true&w=majority';

// Mongo connection

const connect = moongose.createConnection(mongoURI);

// init gft

let gfs;

app.get('/', (req, res) => {
  res.render('index');
});

const PORT = 4000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));