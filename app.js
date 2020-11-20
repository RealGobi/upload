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

// GET

app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // check if files
    if(!files || files.length === 0) {
      res.render('index', { files: false })
      } else {
        files.map(file => {
          if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
        });
        res.render('index', { files: files });
      }
  });
});

// POST 

app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({file: req.file}) 
  res.redirect('/'); // stay on page
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

// GET /files/:filename

app.get('/files/:filename', (req,res) => {
  gfs.files.findOne({filename: req.params.filename}, (err, file) => {
      // check if file
      if(!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file found'
        })
      }
      return res.json(file);
    })
});

// GET /image/:filename

app.get('/image/:filename', (req,res) => {
  gfs.files.findOne({filename: req.params.filename}, (err, file) => {
      // check if file
      if(!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file found'
        })
      }
      // check if image

    if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
      }
    })
});

const PORT = 4000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));