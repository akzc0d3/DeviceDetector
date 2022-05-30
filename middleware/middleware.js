const { UserProvider } = require("../db");
module.exports = {
  ifLoggedIn: (request, response, next) => {
    if (request.user) {
      next();
    } else {
      response.status(502);
      response.end();
    }
  },
  ifNotLoggedIn: (request, response, next) => {
    if (!request.user) {
      next();
    } else {
      response.redirect("/");
    }
  },
};
