const pg = require("pg");

const { MATERIA_MEDICA_PATH, DATABASE_CONNECTION_STRING } = require("../config");
const { insertMMData } = require("../utils/indertData");
const { readJSONDataFromFile } = require("../utils/readJson");


const pgPool = new pg.Pool({
    connectionString: DATABASE_CONNECTION_STRING,
  });

async function CreateMMTable() {
    const materiaMedicaData = await readJSONDataFromFile(MATERIA_MEDICA_PATH);
    await insertMMData(pgPool, materiaMedicaData);

}


module.exports = { CreateMMTable }