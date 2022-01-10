
const bcrypt = require('bcryptjs');

// Generate a random string for the user ID
const generateRandomString = () => {
  return Math.random()
    .toString(36)
    .substring(2,8);
};
// Generate a random cookie key
const generateCookieKey = () => {
  return Math.random()
    .toString(36)
    .substring(2,10);
};

// confirms that email and password matches as on database
const authenticator = (email, password, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email && bcrypt.compareSync(password, database[user]['password'])) {
        return false;
      }
    }
  }
  return true;
};
// confirm if an email is in the database
const emailLookup = (email, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email) {
        return false;
      }
    }
  }
  return true;
};

// Builds an object with user specific tiny url
const urlsForUser = (id, database) => {
  let urls = {};
  for (let tiny in database) {
    if (database[tiny].userID === id) {
      urls[tiny] = database[tiny];
    }
  }
  return urls;
};

// Return userID corresponding to the email
const getUserByEmail = (email, database) => {
  for (let user of Object.keys(database)) {
    for (let item in database[user]) {
      if (database[user]['email'] === email) {
        return database[user]['id'];
      }
    }
  }
  return undefined;
};

// Exports the functions
module.exports = {
  generateCookieKey,
  generateRandomString,
  emailLookup,
  authenticator,
  getUserByEmail,
  urlsForUser
};