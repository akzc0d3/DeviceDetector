require('dotenv').config();
require('./db').connect();
const express = require("express");
const expresshbs = require("express-handlebars");
const app = express();
const session = require('express-session');
const passport = require('./passport/authentication');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')
const requestIp = require('request-ip');
const { ifAdminRegistered } = require('./middleware/middleware');

app.use(session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({mongoUrl:process.env.DB_URI+'/'+process.env.DB_NAME})
}
));

app.use(express.static('public'))
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(requestIp.mw())







app.engine('handlebars', expresshbs());
app.set('view engine', 'handlebars');

app.use(require("./routes/admin"));
app.use(require("./routes/client"));




const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server started on PORT: ",PORT);
})