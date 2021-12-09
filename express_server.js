/* eslint-disable camelcase */
//REQUESTING DEPENDENCIES
const express = require('express');
const app = express();
const PORT = 8080; //default port
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');



app.use(bodyParser.urlencoded({ extended: true }));
//this tells the express app to use EJS as its templating engine
//app.use(morgan('dev'));
app.set("view engine", "ejs");





//DATABASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "james": {
    id: "james",
    email: "james@example.com",
    password: "dishwasher_herd"
  }
};


////////////////////////////////////////////////////////////////////////


//GET REQUESTS


//redirect to long URL from shortURL
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    user: users[req.session.user_id]
  };
  res.render('urls_notiny', templateVars);
});


//get route to create new url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

//shortURL route
app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else if (!urlDatabase[req.params.shortURL] || users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    let templateVars = {
      shortURL: req.params.shortURL,
      //user: users[req.session.user_id]
    };
    res.render("urls_notiny", templateVars);
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      //user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});


//users URL home page
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let urlDatabaseUser = urlsForUser(req.session.user_id, urlDatabase);
    console.log(urlDatabaseUser);
    let templateVars = {
      urls: urlDatabaseUser,
      user: users[req.session.user_id]};
    res.render('urls_index', templateVars);
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});


//route to Login page
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

//route to registration form
app.get('/register', (req, res) => {
  let templateVars = {
    user: req.session.user_id
  };
  res.render('urls_register', templateVars);
});

//redirect back to main page
app.get("/", (req, res) => {
  res.send('/urls');
});

//url database as JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//displays the port on the console
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});



////////////////////////////////////////////////////////////////


//POST REQUESTS


//New user registration
app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(404).send("Please fill out all required fields");
  } else if (!emailLookup(req.body.email, users)) {
    res.status(404).send("This email address already exists in our database. Please choose another email");
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: "baggyjeans78"
    };
    let user_id  = newUser;
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});


//Post route for user login

app.post('/login', (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please fill out all the required fields");
  } else if (authenticator(req.body.email, req.body.password, users)) {
    res.status(403).send("Password or email is incorrect");
  } else {
    let user_id = getUserByEmail(req.body.email, users);
    res.cookie("user_id", user_id);
    res.session.user_id = user_id;
    res.redirect('/urls');
  }
});


//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('urls');
  } else {
    res.send('Cannot find this tiny url to delete');
  }
});

//HOME PAGE OF TINY URL
app.post('urls/:id', (req, res) => {
  if (req.session.user_id) {
    const id = req.params.id;
    res.redirect(`/urls/${id}`);
  }
});

//add new url to database
app.post("/urls", (req, res) => {
  const newTinyUrl = generateRandomString();
  urlDatabase[newTinyUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect('/urls');
});

//EDIT TINY URL
app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

const generateRandomString = () => {
  
};



