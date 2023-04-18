let connectionString =
  "postgresql://synergy_user:cAnGESON@127.0.0.1:5440/synergy_app";
const pg = require("pg");
const Realm = require("realm");
const fs = require("fs");

const pgPool = new pg.Pool({
  connectionString: connectionString,
});

const constants = {
  REALM_TABLE_MMBOOK: "MmBook",
};

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
  return {
    path: `${path}/${book_id}-MM.realm`,
    schema,
    schemaVersion: version,
    migration: () => {},
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

const upsert = async ({ data, book_id, SchemaVersion, FileCreationPath }) => {
  if (!realm) {
    realm = await Realm.open(config(book_id, SchemaVersion, FileCreationPath));
  }
  return await new Promise((resolve, reject) => {
    try {
      let _data;
      // console.log(data);
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

const insertBook = async (book_id, SchemaVersion, FileCreationPath) => {
  realm = await Realm.open(config(book_id, SchemaVersion, FileCreationPath));

  const result =
    await pgPool.query(`select book_id , mm2.remedy_id , mm2.section_id , start_pos , end_pos , 
    no_of_lines_sections_has, r.name as remedy_name, sm.name as section_name  from materica_medica mm2 
   inner join remedy r on r.remedy_id = mm2.remedy_id + 1
  inner join section_mm sm  on sm.section_id = mm2.section_id  where book_id = ${book_id} order by start_pos;`);
  const MMData = result.rows;
  const indexlen = result.rowCount;
  const fs = require("fs");
  const util = require("util");
  const iconv = require("iconv-lite");
  const fs_read = util.promisify(fs.read);
  const fs_open = util.promisify(fs.open);
  const fs_readFile = util.promisify(fs.readFile);
  const fs_close = util.promisify(fs.close);
  const path = require("path");
  const bookFD = await fs_open(
    path.join(
      "/home/ubuntu/homeopathy_app/public/Backend/HomeoData/Books-Text",
      `${book_id}.data`
    ),
    "r"
  );
  const book = bookFD;

  // console.log({ indexlen })
  for (let i = 0; i < indexlen; i++) {
    const item = MMData[i];
    const buffer = Buffer.alloc(item.end_pos - item.start_pos);
    let lineBufferObj = await fs_read(
      book,
      buffer,
      0,
      item.end_pos - item.start_pos,
      item.start_pos + 1
    );
    // await fs_close(book);

    const Y = 10,
      X = 5;
    lineBufferObj = lineBufferObj.buffer
      .map((val) => (val + 256 - Y * 16 - X) % 256)
      .map((val) => (val === 13 ? 10 : val));
    const line_text = iconv.decode(lineBufferObj, "macroman");
    await upsert(
      { data: { ...item, text_data: line_text }, book_id },
      SchemaVersion,
      FileCreationPath
    );
    // console.log({ i, indexlen });
  }
  console.log("completed", {book_id});
};

const realmMMFile = async (SchemaVersion, FileCreationPath) => {
  const result = await pgPool.query(
    "select distinct book_id from materica_medica mm2 order by book_id ;"
  );
  // const result = {rows:[{book_id:134},{book_id: 137}],rowCount:2}
  // console.log(result.rows.map((e) => e.book_id));
  for (let i = 0; i < result.rowCount; i++) {
    await insertBook(result.rows[i].book_id, SchemaVersion, FileCreationPath);
    // console.log({ book_number: i });
  }
  console.log("all book completed");
  exit();
};

// const getdata = async (book_id) => {
//     if (!realm) {
//         realm = await Realm.open(config(book_id, SchemaVersion, FileCreationPath))
//     }
//     const data = await realm.objects('MmBook');
//     console.log({ data });
//     realm.close();

// }

module.exports = { realmMMFile };
