const { MATERIA_MEDICA_PATH } = require("../config");
const { insertMMData } = require("../utils/indertData");
const { readJSONDataFromFile } = require("../utils/readJson");

async function CreateMMTable() {
    const materiaMedicaData = await readJSONDataFromFile(MATERIA_MEDICA_PATH);
    await insertMMData(pgPool, materiaMedicaData);
}


module.exports = { CreateMMTable }