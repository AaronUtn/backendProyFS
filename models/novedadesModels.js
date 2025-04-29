const { request } = require("express");
const router = require("../routes/admin/novedades");
var { pool, mssql, connectDB } = require("./bd");

/*para listar las novedades */
async function getNovedades() {
  try {
    var pool = await connectDB(); //aseguro que se este conectando
    var result = await pool
      .request()
      .query("SELECT * FROM novedades ORDER BY id ASC");
    return result.recordset; //creo que devuelve un objeto o el array con los los id,titulo,subtitulo y cuerpo.
  } catch (error) {
    console.error("Error al obtener las novedades ", error);
    return [];
  }
}

async function insertNovedad(obj) {
  try {
    //convertir objeto con null prototype a objeto pleno
    //const datos = JSON.parse(JSON.stringify(novedad));
    var pool = await connectDB();
    var request = pool.request();
    /*
    console.log("titulo:", obj.titulo); prueba de que se reciben el registro
    console.log("subtitulo:", obj.subtitulo);
    console.log("cuerpo:", obj.cuerpo);*/

    request.input("valor2", mssql.VarChar, obj.titulo);
    request.input("valor3", mssql.VarChar, obj.subtitulo);
    request.input("valor4", mssql.Text, obj.cuerpo);
    request.input("img_id", mssql.VarChar,obj.img_id || null);
    var query = `INSERT novedades (titulo,subtitulo,cuerpo, img_id) VALUES (@valor2,@valor3,@valor4,@img_id)`;

    var result = await request.query(query);
    //console.log("metodo insertNovedad resultado del insert", result);//verifico que se envie
    return result;
  } catch (error) {
    console.log("error al insertar", error);
    throw error;
  }
}

async function deleteNovedadById(id) {
  try {
    var pool = await connectDB();
    var request = pool.request();
    var query = `DELETE FROM novedades WHERE id = @id`;
    request.input("id", mssql.Int, id);
    var result = await request.query(query);
    return result;
  } catch (error) {
    console.error("error al eliminar novedad:", error);
    throw error;
  }
}

async function getNovedadById(id){
  try{
    var pool = await connectDB();
    var request = pool.request();
    var query = `SELECT * FROM novedades WHERE id =@id `;
    request.input('id',mssql.Int,id);
    var result = await request.query(query);
    return result.recordset[0];
  }catch(error){
    console.log("error al hacer getNovedadById",error);
  }
}
async function modificarNovedadById(obj,id){
  console.log('Datos que se envían para modificar:', obj);
  try{
      var pool = await connectDB();
      var request = pool.request();
      request.input("valor2", mssql.VarChar, obj.titulo);
      request.input("valor3", mssql.VarChar, obj.subtitulo);
      request.input("valor4", mssql.Text, obj.cuerpo);
      request.input("id", mssql.Int, id);
      request.input("img_id",mssql.VarChar, obj.img_id );
      var query = `UPDATE novedades SET titulo = @valor2, subtitulo=@valor3, cuerpo=@valor4,img_id=@img_id WHERE id = @id`;
      var rows = await request.query(query);
      //console.log("resultados de modificacion:", rows);
      return rows;
    }catch(error){
    console.log("error al hacer modificarNovedadById")
    throw error;
    }
  }


module.exports = {
  getNovedades,
  insertNovedad,
  deleteNovedadById,
  getNovedadById,
  modificarNovedadById,
};
