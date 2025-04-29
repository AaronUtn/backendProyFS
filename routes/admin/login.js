var express = require("express");
var router = express.Router();

var usuariosModel = require("./../../models/usuariosModels");

/* GET /admin/login. esto genera una vista de login a traves de render  */
router.get("/", function (req, res, next) {
  res.render("admin/login", {
    layout: "admin/layout",
  });
});

router.get("/logout", function (req, res, next) {
  req.session.destroy(); //destruime las variables de sesion id y usuario
  res.render("admin/login", {
    layout: "admin/layout",
  });
});

router.post("/", async (req, res, next) => {
  console.log("Usuario autenticado:", req.session); //para ver si guarda los datos
  try {
    const usuario = req.body.usuario;
    const password = req.body.password;

    const data = await usuariosModel.getUserByUsernameAndPassword(
      usuario,
      password
    );
    //console.log("DATA COMPLETA DE SQL SERVER:", data);
    // SQL Server devuelve un objeto
    if (data != undefined) {
      req.session.nombre = data.usuario;
      //console.log("Sesión guardada:", req.session);
      console.log("login exitoso. redirigiendo a novedades....");
      req.session.id = data.id;

      res.redirect("/admin/novedades"); //para ver si hace conexion
    } else {
      console.log("No se encontró usuario o clave incorrecta");
      res.render("admin/login", {
        layout: "admin/layout",
        error: true,
      });
    }
  } catch (error) {
    console.log("Error al procesar login:", error);
    res.render("admin/login", {
      layout: "admin/layout",
      error: true,
    });
  }
});

module.exports = router;
