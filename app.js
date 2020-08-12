const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const methodOverride = require('method-override')
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

//load config file
dotenv.config({ path: "./config/config.env" });

//passport config
require("./config/passport")(passport);

//connected to database 
connectDB();

//initialize app
const app = express();

//determin if it is production or development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//methodOverride
app.use(methodOverride(function(req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        //look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

//Handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select } = require("./helpers/hbs");

//handlebars
app.engine(".hbs", exphbs({ helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
}, defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

//sessions
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//Set Global variable
app.use(function(req, res, next) {
    res.locals.user = req.user || null
    next()
})
//Static folder
app.use(express.static(path.join(__dirname, "public")));

//<------------------Routes----------------------->
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/dashboard", require("./routes/index"));
app.use("/stories", require("./routes/stories"));

const port = process.env.PORT || 5000;

app.listen(
  port,
  console.log(`Server running on ${process.env.NODE_ENV} mode on ${port}`)
);
