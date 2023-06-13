const pg = require("pg");
const Realm = require("realm");
const fs = require("fs");
const util = require("util");
const iconv = require("iconv-lite");
const path = require("path");

const {
  DATABASE_CONNECTION_STRING,
  SCHEMA_VERSION,
  MM_FILE_PATH,
  HOMEO_DATA_PATH,
  MATERIA_MEDICA_PATH,
} = require("../config");
const { readJSONDataFromFile } = require("../utils/readJson");
const { insertMMData } = require("../utils/indertData");

const pgPool = new pg.Pool({
  connectionString: DATABASE_CONNECTION_STRING,
});

const schema = [
  {
    name: "MmBook",
    primaryKey: "_id",
    properties: {
      _id: "string",
      book_id: "int",
      end_pos: "int",
      no_of_lines_sections_has: "int",
      remedy_id: "int",
      remedy_name: "string",
      section_id: "int",
      section_name: "string",
      start_pos: "int",
      text_data: "string?",
    },
  },
];

const config = (book_id, version, path) => {
  console.log(`${path}/${book_id}-MM.realm`);
  return {
    path: `${path}/${book_id}-MM.realm`,
    schema,
    schemaVersion: version,
    migration: () => { },
  };
};

let realm;

class MMBook {
  constructor({
    book_id,
    end_pos,
    no_of_lines_sections_has,
    remedy_id,
    remedy_name,
    section_id,
    section_name,
    start_pos,
    text_data,
  }) {
    this._id = `${book_id};${remedy_id};${section_id}`;
    this.book_id = Number(book_id);
    this.end_pos = Number(end_pos);
    this.no_of_lines_sections_has = Number(no_of_lines_sections_has);
    this.remedy_id = Number(remedy_id);
    this.remedy_name = remedy_name;
    this.section_id = Number(section_id);
    this.section_name = section_name;
    this.start_pos = Number(start_pos);
    this.text_data = text_data && text_data.length ? text_data : "";
  }
}

const upsert = async ({ data, book_id }) => {
  if (!realm) {
    realm = await Realm.open(config(book_id, SCHEMA_VERSION, MM_FILE_PATH));
  }
  return await new Promise((resolve, reject) => {
    try {
      let _data;
      realm.write(() => {
        const modifiedData = realm.create(
          "MmBook",
          new MMBook(data),
          "modified"
        );
        _data = JSON.parse(JSON.stringify(modifiedData));
      });
      resolve(_data);
    } catch (err) {
      reject(err);
    }
  });
};

const insertBook = async (book_id, MMData = []) => {
  if (fs.existsSync(HOMEO_DATA_PATH + `${book_id}.data`)) {
    realm = await Realm.open(config(book_id, SCHEMA_VERSION, MM_FILE_PATH));

    const result =
      await pgPool.query(`select book_id , mm2.remedy_id , mm2.section_id , start_pos , end_pos , 
    no_of_lines_sections_has, r.name as remedy_name, sm.name as section_name  from materica_medica mm2 
   inner join remedy r on r.remedy_id = mm2.remedy_id + 1
  inner join section_mm sm  on sm.section_id = mm2.section_id  where book_id = ${book_id} order by start_pos;`);
    const MMData = result.rows;
    const indexlen = result.rowCount;
    console.log(`info - ${indexlen}`)
    const fs_read = util.promisify(fs.read);
    const fs_open = util.promisify(fs.open);
    const bookFD = await fs_open(
      path.join(HOMEO_DATA_PATH, `${book_id}.data`),
      "r"
    );
    const book = bookFD;

    for (let i = 0; i < indexlen; i++) {
      const item = MMData[i];
      const buffer = Buffer.alloc(
        Number(item.end_pos) - Number(item.start_pos)
      );
      let lineBufferObj = await fs_read(
        book,
        buffer,
        0,
        Number(item.end_pos) - Number(item.start_pos),
        Number(item.start_pos) + 1
      );
      const Y = 10,
        X = 5;
      lineBufferObj = lineBufferObj.buffer
        .map((val) => (val + 256 - Y * 16 - X) % 256)
        .map((val) => (val === 13 ? 10 : val));
      const line_text = iconv.decode(lineBufferObj, "macroman");
      await upsert({ data: { ...item, text_data: line_text }, book_id });
    }
    console.log("completed", { book_id });
  } else {
    console.log("Error => .data file not found for book " + book_id);
  }
};
const CreateMMFile = async (SpecificBookIds) => {

  const result = await pgPool.query(
    "select distinct book_id from materica_medica mm2 order by book_id ;"
  );
  const MMBookList = SpecificBookIds?.length ? SpecificBookIds?.map(item => ({ book_id: item })) : result.rows

  for (let i = 0; i < MMBookList.length; i++) {
    await insertBook(MMBookList[i].book_id);
  }
  console.log("all book completed");
};

module.exports = { CreateMMFile };
