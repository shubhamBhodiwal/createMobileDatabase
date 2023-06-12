const DATABASE_CONNECTION_STRING =
  "postgresql://synergy_user:cAnGESON@localhost:5440/synergy_app";
const SCHEMA_VERSION = 26;
const HOMEO_DATA_PATH =
  "/home/ubuntu/projects/homeopathy_app/public/Backend/HomeoData_12_june/Books-Text/";
const MATERIA_MEDICA_PATH =
  "/home/ubuntu/projects/homeopathy_app/public/Backend/HomeoData_12_june/MateriaMedicaData.json";
const EXPORT_FOLDER_PATH =
  "/home/ubuntu/projects/homeopathy_server/RealmData/";
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
