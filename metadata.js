let connectionString =
  "postgresql://synergy_user:cAnGESON@127.0.0.1:5440/synergy_app";
const pg = require("pg");

const pgPool = new pg.Pool({
  connectionString: connectionString,
});
const fs = require("fs");
const Realm = require("realm");
const { realmMMFile } = require("./realmMM/realmMM");
const { realmREPFile } = require("./realmREP/realmREP");

let realm;
const SchemaVersion = 23;
const FolderPath = `/home/ubuntu/homeopathy_server/RealmData/`;
const metadataPath = `${FolderPath}Metadata/${SchemaVersion}`;
const MMFilePath = `${FolderPath}MMBooks/${SchemaVersion}`;
const REPFilePath = `${FolderPath}Books/${SchemaVersion}`;

const schema = [
  {
    name: "Remedy",
    primaryKey: "remedy_id",
    properties: {
      remedy_id: "int",
      name: "string",
      abbreviation: "string",
      frequency: "int",
      color: "string?",
      family_id: "int?",
    },
  },
  {
    name: "Family_Remedy_Mapping",
    primaryKey: "id",
    properties: {
      id: "int",
      remedy_id: "int",
      family_id: "int?",
    },
  },
  {
    name: "Author",
    primaryKey: "author_number",
    properties: {
      author_number: "int",
      name: "string?",
      abbreviation: "string?",
    },
  },
  {
    name: "MmJson",
    primaryKey: "_id",
    properties: {
      _id: "string",
      book_id: "int",
      remedy_id: "int",
      section_id: "int",
      start_pos: "int",
      end_pos: "int",
      no_of_lines_sections_has: "int",
      remedy_name: "string",
      book_name: "string",
      remedy_abbr: "string",
      section_name: "string",
    },
  },
  {
    name: "MmRemedy",
    primaryKey: "remedy_id",
    properties: {
      remedy_id: "int",
      remedy_name: "string",
      remedy_abbr: "string",
      section_id_arr: "string",
    },
  },
  {
    name: "RefBook",
    primaryKey: "book_id",
    properties: {
      book_name: "string",
      remedy_id_arr: "string",
      section_id_arr: "string",
      book_id: "int",
      size: "int?",
    },
  },
  {
    name: "Section",
    primaryKey: "_id",
    properties: {
      _id: "string",
      section_id: "int",
      name: "string",
      book_id: "int",
      rubric_id: "int",
    },
  },
  {
    name: "MmSection",
    primaryKey: "section_id",
    properties: {
      section_id: "string",
      name: "string",
    },
  },
  {
    name: "Word",
    primaryKey: "word_id",
    properties: {
      word_id: "int",
      word_text: "string",
      language: "string",
    },
  },
  {
    name: "Book",
    primaryKey: "book_id",
    properties: {
      book_id: "int",
      book_name: "string",
      author: "string?",
      abbreviation: "string?",
      language: "string?",
      size: "int?",
    },
  },
  {
    name: "Family",
    primaryKey: "family_id",
    properties: {
      family_id: "int",
      parent_id: "int?",
      level_id: "int?",
      is_leaf: "int?",
      name: "string?",
      super_parent_id: "int?",
      family_hierarchy: "string?",
      family_order: "int?",
      family_color: "string?",
      top_parent_id: "int?",
    },
  },
];
const config = (version, path) => {
  return {
    path: `${path}/db.realm`,
    schema,
    schemaVersion: version,
    migration: () => {},
  };
};

class MMJson {
  constructor(mmData) {
    this._id = `${mmData[0]};${mmData[1]};${mmData[2]}`;
    this.book_id = Number(mmData[0]);
    this.remedy_id = Number(mmData[1]);
    this.section_id = Number(mmData[2]);
    this.start_pos = Number(mmData[3]);
    this.end_pos = Number(mmData[4]);
    this.no_of_lines_sections_has = Number(mmData[5]);
    this.book_name = mmData[6] ? mmData[6] : null;
    this.remedy_name = mmData[7] ? mmData[7] : null;
    this.remedy_abbr = mmData[8] ? mmData[8] : null;
    this.section_name = mmData[9] ? mmData[9] : null;
  }
}
class Word {
  constructor(Word) {
    this.word_id = Word[0];
    this.word_text = Word[1];
    this.language = Word[2];
  }
}

class MMSection {
  constructor(section) {
    this.section_id = section[0].join(",");
    this.name = section[1];
  }
}
class RefBook {
  constructor(book) {
    this.book_id = Number(book[0]);
    this.book_name = book[1];
    this.section_id_arr = book[2].join(",");
    this.remedy_id_arr = book[3].join(",");
    this.size = book[4] ? Number(book[4]) : null;
  }
}
class Remedy {
  constructor(remedy) {
    this.remedy_id = Number(remedy[0]);
    this.name = remedy[1];
    this.abbreviation = remedy[2];
    this.frequency = remedy[3] ? Number(remedy[3]) : 0;
    this.family_id = remedy[4] ? Number(remedy[4]) : null;
    this.color = remedy[5];
  }
}
class Section {
  constructor(section) {
    this._id = `${section[2]};${section[0]}`;
    this.section_id = Number(section[0]);
    this.name = section[1];
    this.book_id = Number(section[2]);
    this.rubric_id = Number(section[3]);
  }
}
class MMRemedy {
  constructor(remedy) {
    console.lo;
    this.remedy_id = Number(remedy[0]);
    this.remedy_name = remedy[1] ? remedy[1] : null;
    this.remedy_abbr = remedy[2] ? remedy[2] : null;
    this.section_id_arr = remedy[3].join(",");
  }
}
class Book {
  constructor(book) {
    this.book_name = book[0];
    this.book_id = Number(book[1]);
    this.author = book[2];
    this.abbreviation = book[3];
    this.language = book[4];
    this.size = book[5] ? Number(book[5]) : 0;
  }
}

class Family {
  constructor(family) {
    this.family_id = Number(family[0]);
    this.parent_id = family[1] ? Number(family[1]) : null;
    this.level_id = family[2] ? Number(family[2]) : null;
    this.is_leaf = Number(family[3]);
    this.name = family[4];
    this.super_parent_id = family[5] ? Number(family[5]) : null;
    this.family_hierarchy = family[6];
    this.family_order = family[7] ? Number(family[7]) : null;
    this.family_color = family[8];
    this.top_parent_id = family[9] ? Number(family[9]) : null;
  }
}
class Author {
  constructor(author) {
    this.author_number = Number(author[0]);
    this.name = author[1];
    this.abbreviation = author[2];
  }
}
class FamilyRemedyMapping {
  constructor(familyRemedy) {
    this.id = Number(familyRemedy[0]);
    this.family_id = familyRemedy[1] ? Number(familyRemedy[1]) : null;
    this.remedy_id = familyRemedy[2] ? Number(familyRemedy[2]) : null;
  }
}

const upsert = async ({ data, objectType, objectClass }) => {
  return await new Promise((resolve, reject) => {
    try {
      let _data;
      realm.write(() => {
        const arr = [];
        for (let i = 0; i < data.length; i++) {
          const modifiedData = realm.create(
            objectType,
            new objectClass(data[i]),
            "modified"
          );
          arr.push(JSON.parse(JSON.stringify(modifiedData)));
        }
        _data = arr;
      });
      resolve(_data);
    } catch (err) {
      reject(err);
    }
  });
};

const writeFile = async ({ query, objectType, objectClass }) => {
  try {
    console.log("started", objectType);
    const chunksize = 2000;
    const result = await pgPool.query(query);
    const totalCount = result.rowCount;
    console.log({ totalCount, objectType });
    for (let size = 0; size < totalCount; size = size + chunksize) {
      let data;
      if (objectType === "Book") {
        data = result.rows.slice(size, size + chunksize).map((r) => {
          try {
            return Object.values({
              ...r,
              size: Math.ceil(
                fs.statSync(
                  `/home/ubuntu/homeopathy_server/RealmData/Books/${SchemaVersion}/${r.book_id}-REP.realm`
                ).size /
                  (1024 * 1024)
              ),
            });
          } catch (err) {
            try {
              return Object.values({
                ...r,
                size: Math.ceil(
                  fs.statSync(
                    `/home/ubuntu/homeopathy_server/RealmData/Books/${r.book_id}-REP.realm`
                  ).size /
                    (1024 * 1024)
                ),
              });
            } catch (err) {
              return Object.values({ ...r, size: 0 });
            }
          }
        });
      } else if (objectType === "RefBook") {
        data = result.rows.slice(size, size + chunksize).map((r) => {
          return Object.values({
            ...r,
            size: Math.ceil(
              fs.statSync(
                `/home/ubuntu/homeopathy_server/RealmData/MMBooks/${SchemaVersion}/${r.book_id}-MM.realm`
              ).size /
                (1024 * 1024)
            ),
          });
        });
      } else {
        data = result.rows
          .slice(size, size + chunksize)
          .map((e) => Object.values(e));
      }
      await upsert({ data, objectType, objectClass });
      console.log({ size, totalCount });
    }
  } catch (Err) {
    console.log("writefile =======>", Err);
  }
};

module.exports = { writeFile };

const metadata = async () => {
  // const mmjson = fs.readFileSync(
  //   "../homeopathy_app/public/Backend/HomeoData/MateriaMedicaData.json"
  // );
  // const JsonMMData = JSON.parse(mmjson);
  // console.log('materia medica update started');
  // await pgPool.query(`truncate materica_medica;`);
  // for (let i = 0; i < JsonMMData.length; i++) {
  //   const {
  //     book_id,
  //     remedy_id,
  //     section_id,
  //     startPos,
  //     endPos,
  //     noOfLinesSectionsHas,
  //   } = JsonMMData[i];
  //   await pgPool.query(
  //     `INSERT INTO public.materica_medica
  //   (book_id, remedy_id, section_id, start_pos, end_pos, no_of_lines_sections_has)
  //   VALUES($1, $2, $3, $4, $5, $6);`,
  //     [
  //       book_id,
  //       remedy_id,
  //       section_id,
  //       startPos,
  //     endPos,
  //       noOfLinesSectionsHas,
  //     ]
  //   );
  // }

  // console.log('materia medica update completed');

  // await realmREPFile(SchemaVersion, REPFilePath);
  // await realmMMFile(SchemaVersion, MMFilePath);
  console.log("started metadata");
  realm = await Realm.open(config(SchemaVersion, metadataPath));
  let data;
  data = await writeFile({
    query: `select mm2.book_id , mm2.remedy_id , mm2.section_id , mm2.start_pos , mm2.end_pos , 
        mm2.no_of_lines_sections_has, LOWER(onm2.book_name) as book_name, LOWER(r."name" )as remedy_name , LOWER(r.abbreviation) as remedy_abbr, LOWER(sm.name)
         as section_name  from materica_medica mm2 inner join  oldbookid_newbookid_mapping onm2  
        on mm2.book_id = onm2.old_book_id inner join remedy r on r.remedy_id = mm2.remedy_id + 1  inner join section_mm sm on sm.section_id = mm2.section_id  
        where book_id  = any(select old_book_id from 
            oldbookid_newbookid_mapping onm where new_book_id = any(select book_id from customer_books cb)) `,
    objectClass: MMJson,
    objectType: "MmJson",
  });
  console.log("MMJSON");
  data = await pgPool.query(
    "select book_id from book_info where book_id in (select book_id from book);"
  );
  data = await writeFile({
    query: ` select LOWER(b.book_name) as book_name , b.book_id, bi.author, bi.abbreviation, bi."language"  from 
    book b left join book_info bi on  bi.book_id = b.book_id 
    where b.book_id = any('{${data.rows
      .map((item) => item.book_id)
      .join(",")}}');`,
    objectClass: Book,
    objectType: "Book",
  });
  console.log("Book");

  data = await writeFile({
    query: `select  mm.remedy_id, LOWER(r."name") as remedy_name , LOWER(r.abbreviation) as remedy_abbr, array_agg(mm.section_id) as section_id_arr
        from materica_medica mm inner join remedy r on r.remedy_id = mm.remedy_id + 1 
         where book_id = any(select old_book_id from oldbookid_newbookid_mapping onm where new_book_id =
            any(select book_id from customer_books cb)) group by mm.remedy_id , r.name, r.abbreviation`,
    objectClass: MMRemedy,
    objectType: "MmRemedy",
  });
  console.log("MMRemedy");
  data = await writeFile({
    query: `select section_id , LOWER(name) as name, book_id, rubric_id from rubric r  where level_id = 0 order by book_id,  rubric_order;`,
    objectClass: Section,
    objectType: "Section",
  });
  console.log("Section");
  data = await writeFile({
    query: `select author_number ,LOWER(name) as name ,LOWER(abbreviation) as abbreviation  from author a where author_type = 'MacRepID'`,
    objectClass: Author,
    objectType: "Author",
  });
  console.log("Author");
  data = await writeFile({
    query: `select  r.remedy_id ,LOWER(r.name) as name, LOWER(r.abbreviation) as abbreviation, r.frequency, r.family_id , 
        concat('rgb(',f.color_red,',',f.color_green,',', f.color_blue,')') as color
                      from remedy r left join family f on f.family_id = r.family_id;`,
    objectClass: Remedy,
    objectType: "Remedy",
  });
  console.log("Remedy");
  data = await writeFile({
    query: `select family_remedy_mapping_id as id ,family_id , remedy_id from 
        family_remedy_mapping frm;`,
    objectClass: FamilyRemedyMapping,
    objectType: "Family_Remedy_Mapping",
  });
  console.log("Family_Remedy_mapping");
  data = await writeFile({
    query: `select family_id, parent_id, level_id, is_leaf, LOWER(name) as name, super_parent_id , 
                family_hierarchy , family_order ,concat('rgb(',color_red,',',color_green,',', color_blue,')') 
                as family_color, top_parent_id from family`,
    objectClass: Family,
    objectType: "Family",
  });
  console.log("family");

  data = await writeFile({
    query: `select   mm.book_id ,LOWER(onm.book_name) as book_name, array_agg(distinct mm.section_id) as section_id_arr, array_agg(distinct mm.remedy_id) as remedy_id_arr
            from materica_medica mm inner join oldbookid_newbookid_mapping onm on mm.book_id = onm.old_book_id 
            where onm.new_book_id = any(select book_id from customer_books cb) group by mm.book_id, onm.book_name`,
    objectClass: RefBook,
    objectType: "RefBook",
  });
  console.log("Refbook");
  data = await writeFile({
    query: `select array_agg(section_id) as section_id, LOWER(name) as name 
            from "section_mm" group by LOWER(name) order by LOWER(name);`,
    objectClass: MMSection,
    objectType: "MmSection",
  });
  console.log("MMSection");
  data = await writeFile({
    query: `select word_id, word_text, "language"  from word ;`,
    objectClass: Word,
    objectType: "Word",
  });
  console.log("word");
  console.log("metadata file created");
  fs.rmdir(metadataPath + "/db.realm.management", (err) => {
    if (err) console.log(err);
    else {
      console.log("db.realm.management ");
    }
  });
  fs.unlink(metadataPath + "/db.realm.lock", (err) => {
    if (err) console.log(err);
    else {
      console.log("db.realm.lock ");
    }
  });
  fs.unlink(metadataPath + "/db.realm.note", (err) => {
    if (err) console.log(err);
    else {
      console.log("db.realm.note ");
    }
  });
  process.exit(1);
};

metadata();
