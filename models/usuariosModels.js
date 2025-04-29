const crypto = require("crypto");
const { pool, mssql, poolConnect, connectDB } = require("./bd");

console.log(typeof connectDB);

var md5 = require("md5");

async function getUserByUsernameAndPassword(user, password) {
  try {
    // Esperamos a que el pool esté conectado, usando el poolconnect de bd.js que ya lo espera
    //lo cambie por que me tira error y no me deja logear a un usuario que si se encuntra en la base de datos
    //await poolConnect;
    const pool = await connectDB();
    const hashedPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex"); //tengo que hacer esto para que compara por hashed
    const result = await pool //ya que si no lo pongo compara texto con hash
      .request()
      .input("usuario", mssql.VarChar, user)
      .input("password", mssql.VarChar, hashedPassword)
      .query(
        "SELECT * FROM USUARIOSTRANSX WHERE usuario = @usuario AND password = @password"
      );

    //console.log('Resultado de la consulta SQL Server:', result);

    if (result.recordset.length > 0) {
      return result.recordset[0]; //de esta manera me trae la primera posicion que cumpla por que en mi diseño hay repetidos.
    } else {
      return null;
    }
  } catch (error) {
    console.error(" Error en getUserByUsernameAndPassword:", error);
    throw error;
  }
}

module.exports = { getUserByUsernameAndPassword };
