const express = require("express");

const app = express();

// view

app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.render('index');
});

const PORT = 4000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));