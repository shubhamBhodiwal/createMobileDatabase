const DATABASE_CONNECTION_STRING =
  "postgresql://synergy_user:cAnGESON@localhost:5432/synergy_app_server_de";
const SCHEMA_VERSION = 24;
const HOMEO_DATA_PATH =
  "/Users/mac166/Desktop/Projects/homeopathy_german_server/HomeoData/Books-Text/";
const MATERIA_MEDICA_PATH =
  "/Users/mac166/Desktop/Projects/homeopathy_german_server/HomeoData/MateriaMedicaData.json";
const EXPORT_FOLDER_PATH =
  "/Users/mac166/Desktop/Projects/homeopathy_german_server/RealmData/";
const METADATA_FILE_PATH = `${EXPORT_FOLDER_PATH}Metadata/${SCHEMA_VERSION}`;
const MM_FILE_PATH = `${EXPORT_FOLDER_PATH}MMBooks/${SCHEMA_VERSION}`;
const REP_FILE_PATH = `${EXPORT_FOLDER_PATH}Books/${SCHEMA_VERSION}`;

module.exports = {
  DATABASE_CONNECTION_STRING,
  SCHEMA_VERSION,
  HOMEO_DATA_PATH,
  EXPORT_FOLDER_PATH,
  METADATA_FILE_PATH,
  MM_FILE_PATH,
  REP_FILE_PATH,
  MATERIA_MEDICA_PATH
};
