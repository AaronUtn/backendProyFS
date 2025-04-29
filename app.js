var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var loginRouter = require("./routes/admin/login");
var adminRouter = require("./routes/admin/novedades");
var apiRouter = require("./routes/api");//m6u3consumoDeApi
var session = require("express-session");

var app = express();
var fileUpload = require("express-fileupload");
var cors = require('cors');//m6u3consumoDeApi

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));//se cambia de false a true porque no puedo parsear automaticamnte por express
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configurar sesión
app.use(
  session({
    secret: "clave_super_secreta",
    cookie: { maxAge: null }, // cambiá esto por algo único
    resave: false,
    saveUninitialized: true,
  })
);

secured = async (req, res, next) => {
  try {
    console.log(req.session.id);
    if (req.session.id) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error);
  }
}


//modulo 6 unidad 3//
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp'
}));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin/login", loginRouter);
app.use("/admin/novedades",secured, adminRouter);
app.use('/api',cors(),apiRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
