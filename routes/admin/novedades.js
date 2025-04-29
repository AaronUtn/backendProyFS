var express = require("express");
var router = express.Router();
var novedadesModel = require("./../../models/novedadesModels"); //me traigo las funciones del archivo novedades
var util = require("util");
var cloudinary = require("cloudinary").v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

router.get("/", async function (req, res, next) {
  var novedades = await novedadesModel.getNovedades(); //creo la variable que pueden usar las funciones de novedades
  console.log("Sesión en /admin/novedades desde novedades:", req.session);
  if (!req.session.nombre) {
    console.log("Sesión no encontrada, redirigiendo a login");
    return res.redirect("/admin/login");
  }
  novedades = novedades.map((novedad) => {
    if (novedad.img_id) {
      const imagen = cloudinary.image(novedad.img_id, {
        width: 100,
        heigth: 100,
        crop: "fill",
      });
      return {
        ...novedad,
        imagen,
      };
    } else {
      return {
        ...novedad,
        imagen: "",
      };
    }
  });

  res.render("admin/novedades", {
    layout: "admin/layout",
    usuario: req.session.nombre,
    novedades, //muestro las novedades
  });
});
//campos de prueba
//console.log('Entrando a novedades con sesión:', req.session);
//console.log("tipo de datos de novedades", typeof novedades); //verifico que no tenga problemas al levantar los datos de la tabla
//console.log("contenido", novedades); //para ver que propiedades tiene el objeto

/*para mostrar el formulario o el diseño de agregar las novedades */
router.get("/agregar", (req, res, netx) => {
  //console.log("agregar cargando!");
  res.render("admin/agregar", {
    //agregar.hbs
    layout: "admin/layout",
  });
});

router.post("/agregar", async (req, res) => {
  try {
    /*
    console.log("dentro del metodo post");
    console.log("antes de convertir e tipo del body por que es un objetc:null prototype");
    console.log(req.body); //deberia ver lo que se envie*/
    //console.log("se convirtio el body a un objeto plano para que sea compatible ",datos);
    var img_id = "";
    if (req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      const resultadoSubida = await uploader(imagen.tempFilePath);
      console.log("Resultado cloudinary", resultadoSubida);
      img_id = (await uploader(imagen.tempFilePath)).public_id;
    }
    var datos = Object.assign({}, req.body);
    if (datos.titulo != "" && datos.subtitulo != "" && datos.cuerpo != "") {
      await novedadesModel.insertNovedad({
        ...datos,
        img_id,
      });
      res.redirect("/admin/novedades");
    } else {
      res.render("admin/agregar", {
        layout: "admin/layout",
        error: true,
        message: "Todos los campos son requeridos",
      });
    }
  } catch (error) {
    console.log("hay un error en la captura de nuevo", error);
    res.render("admin/agregar", {
      layout: "admin/layout",
      error: true,
      message: "No se cargo la novedad",
    });
  }
});

router.get("/eliminar/:id", async (req, res, next) => {
  try {
    var id = req.params.id; //para tomar el id desde la url no hy que convertirlo ya es un objeto plano compatible
    let novedad = await novedadesModel.getNovedadById(id);
    if (novedad.img_id) {
      await destroy(novedad.img_id);
    }
    await novedadesModel.deleteNovedadById(id);
    res.redirect("/admin/novedades");
  } catch (error) {
    console.log("hay un error al intentar eliminar una novedad", error);
  }
});

router.get("/modificar/:id", async (req, res, next) => {
  try {
    var id = req.params.id;
    var novedad = await novedadesModel.getNovedadById(id);
    //console.log("novedad recuperada:",novedad); //para ver que llega del formulario
    res.render("admin/modificar", {
      layout: "admin/layout",
      novedad,
    });
  } catch (error) {
    console.log("hay un erro al intentar modificar una novedad", error);
  }
});
/*
router.post('/modificar', async(req,res,next)=>{
  try{
    //console.log("ID recibido del formulario:", req.body.id);
    //console.log("Título:", req.body.titulo);
    var obj ={
      titulo: req.body.titulo,
      subtitulo: req.body.subtitulo,
      cuerpo: req.body.cuerpo
    }
    
    await novedadesModel.modificarNovedadById(obj,req.body.id);
    res.redirect('/admin/novedades');
  }
  catch(error){
    console.log(error)
    res.render('admin/modificar',{
      layout: 'admin/layout',
      error: true, message:'Nose modifico la novedad'
    });
  }
});*/

router.post("/modificar", async (req, res, next) => {
  try {
    const { id, titulo, subtitulo, cuerpo } = req.body;
    let img_id = req.body.img_original;
    let borrar_img_vieja = false;

    // Caso 1: Si subió una nueva imagen
    if (req.files && Object.keys(req.files).length > 0) {
      const imagen = req.files.imagen;
      const uploadResult = await uploader(imagen.tempFilePath);
      img_id = uploadResult.public_id;
      borrar_img_vieja = true; // Hay que borrar la anterior
    }

    // Caso 2: Si pidió eliminar la imagen
    if (req.body.img_delete === "1") {
      img_id = null;
      borrar_img_vieja = true; // Hay que borrar la anterior
    }

    if (borrar_img_vieja && req.body.img_original) {
      await destroy(req.body.img_original);
    }
    // Validación simple de campos vacíos
    if (!titulo || !subtitulo || !cuerpo) {
      return res.render("admin/modificar", {
        layout: "admin/layout",
        error: true,
        message: "Todos los campos son obligatorios.",
        novedad: {
          id,
          titulo,
          subtitulo,
          cuerpo,
        },
      });
    }

    // Si todo está ok, actualiza
    const obj = { titulo, subtitulo, cuerpo, img_id };
    await novedadesModel.modificarNovedadById(obj, id);
    res.redirect("/admin/novedades");
  } catch (error) {
    console.log(error);
    res.render("admin/modificar", {
      layout: "admin/layout",
      error: true,
      message: "No se modificó la novedad",
      novedad: {
        id: req.body.id,
        titulo: req.body.titulo,
        subtitulo: req.body.subtitulo,
        cuerpo: req.body.cuerpo,
        img_id,
      },
    });
  }
});

module.exports = router;
