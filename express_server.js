
const express = require('express');
const app = express();
const PORT = 8080; //default port

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//adding route to your express server
app.get("/hello", (req, res) => {
  res.json(urlDatabase);

  //adding HTML tags
  res.send('<html><body>Hello<b>Justin!"</body></html>\n');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});