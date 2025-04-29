var mssql = require("mssql");
var util = require("util");
//configuracion de conexion con limite  10 conexiones simultaneas
const poolConfig = {
  user: process.env.MSSQL_USER_NAME,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_HOST, // dirección del servidor
  database: process.env.MSSQL_SERVER_NAME,
  options: {
    encrypt: false, // Usualmente para Azure; cámbialo según tus necesidades
    trustServerCertificate: true, // Si no tienes un certificado SSL
  },
  pool: {
    max: 10, // Límite máximo de conexiones en el pool
    min: 0,
    idleTimeoutMillis: 30000, // Tiempo en ms antes de cerrar una conexión inactiva
  },
};
//crear un pool
const pool = new mssql.ConnectionPool(poolConfig);
const poolConnect = pool.connect();

//manejo de errores
pool.on("error", (err) => {
  console.error("error en la conexion con la base de datos", err);
});
//Funcion de prueba de conexion a la base de datos
async function connectDB() {
  try {
    await poolConnect;
    console.log("conexion exitosa a la base de datos archivo bd. ");
    return pool;
  } catch (err) {
    console.error("Error de conexión:", err);
  }
}
//Pototoypitu25#
//Se exprotan los objetos para ser utilizados en otro lado
module.exports = { pool, mssql, poolConnect, connectDB };
