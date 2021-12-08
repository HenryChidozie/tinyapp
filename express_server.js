//REQUESTING DEPENDENCIES
const express = require('express');
const app = express();
const PORT = 8080; //default port
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
//this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs");


//HELPER FUNCTIONS
// const {
//   generateCookieKey,
//   generateRandomString,
//   emailLookup,
//   authenticator,
//   getUserByEmail,
//   urlsForUser
// } = require('./helpers');



//DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send('Hello!');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//get route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


//POST REQUESTS


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userI_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('urls');
  } else {
    res.send('Cannot find this tiny url to delete');
  }
});


//HOME Page
app.post('urls/:id', (req, res) => {
  if (req.session.user_id) {
    const id = req.params.id;
    res.redirect(`/urls/${id}`);
  }
});

//post route to handle the form submission to add new url to database
app.post("/urls", (req, res) => {
  const newTinyUrl = generateRandomString();
  urlDatabase[newTinyUrl] = {
    longURL: req.body.longURL,
    userID: req.session.userI_id
  };
  res.redirect('/urls');
});

const generateRandomString = () => {

};

