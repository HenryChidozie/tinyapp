/* eslint-disable camelcase */
//REQUESTING DEPENDENCIES
const express = require('express');
const app = express();
const PORT = 8080; //default port
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

// Helper functions
const {
  generateCookieKey,
  generateRandomString,
  authenticator,
  getUserByEmail,
  urlsForUser
} = require('./helpers');

//bcrypt salts
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

//Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
//middleware for logging HTTP requests and errors
app.use(morgan('dev'));
//this tells the express app to use EJS as its templating engine
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: [generateCookieKey(), generateCookieKey(), generateCookieKey()]
}));

//DATABASE
const urlDatabase = {
  b6UTxQ: { longURL: "http://www.lighthouselabs.ca", userID: "mark" },
  b2xVn2: { longURL: "https://www.google.ca", userID: "lucky" },
  ty663d: { longURL: "https://www.amazon.ca", userID: "lucky" },
  d7TvTl: { longURL: "https://www.play.com", userID: "mark" }
};

const users = {
  "mark": {
    id: "mark",
    email: "mark@example.com",
    password: bcrypt.hashSync("gtuies", salt)
  },
  "lucky": {
    id: "lucky",
    email: "lucky@example.com",
    password: bcrypt.hashSync("kieyga", salt)
  }
};

//POST REQUESTS

//New user registration
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Missing email or password");
    return;
  }
  
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send("This email already exists in our database. Please choose another email");
    res.redirect('/register?');
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
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
    res.redirect('/login');
  } else {
    let user_id = getUserByEmail(req.body.email, users);
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

//user logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send('Cannot find this tiny url to delete');
  }
});

//HOME PAGE OF TINY URL
app.post('/urls/:id', (req, res) => {
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

//GET REQUESTS

//redirect to long URL from shortURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      user: users[req.session.user_id]
    };
    res.render('urls_notiny', templateVars);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
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
app.get('/urls/:shortURL', (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else if (!urlDatabase[req.params.shortURL] || users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    let templateVars = {
      shortURL: req.params.shortURL,
      user: users[req.session.user_id]
    };
    res.render('urls_notiny', templateVars);
  } else {
    let templateVars = { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render('urls_show', templateVars);
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
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

//route to registration form
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.render('/urls');
    return;
  }
  let templateVars = {
    user: req.session.user_id
  };
  res.render('urls_register', templateVars);
});

//redirect back to root page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//url database as JSON
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//displays the port on the console
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});



