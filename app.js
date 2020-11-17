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

const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false });

// init gfs

let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

  // Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.render('index');
});

// GET /files

app.get('/files', (req,res) => {
  gfs.files.find().toArray((err, files) => {
    // check if files
    if(!files || files.length === 0) {
      return res.status(404).json({
        err: 'No file(s) in database'
      })
    }
    return res.json(files);
  });
});
const PORT = 4000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));