const pg = require("pg");
const Realm = require("realm");
const {
  SCHEMA_VERSION,
  REP_FILE_PATH,
  DATABASE_CONNECTION_STRING,
} = require("../config");

const pgPool = new pg.Pool({
  connectionString: DATABASE_CONNECTION_STRING,
});

const schema = [
  {
    name: "Rubric",
    primaryKey: "rubric_id",
    properties: {
      rubric_id: "int",
      book_id: "int",
      section_id: "int",
      level_id: "int",
      parent_id: "int?",
      name: "string?",
      rubric_hierarchy: "string?",
      rubric_order: "int?",
      has_child: "bool",
      super_parent_id: "int?",
      rubric_hierarchy_id: "string?",
      remedy_id_arr: "string?",
    },
  },
  {
    name: "Rubric_Remedy_Mapping",
    primaryKey: "_id",
    properties: {
      _id: "string",
      rubric_id: "int",
      remedy_id: "int",
      author_number: "int[]",
      strength: "int?",
    },
  },
  {
    name: "Rubric_Cross_Reference_Mapping",
    primaryKey: "cross_reference_id",
    properties: {
      cross_reference_id: "string",
      rubric_id: "string",
      cross_reference_rubric_id: "string",
      cross_ref_hierarchy: "string",
      book_id: "int",
      section_id: "int",
      rubric_hierarchy_id: "string",
      book_name: "string",
      bracket_details: "string?",
    },
  },
];

const config = (book_id, version, path) => {
  console.log(book_id, version, path)
  return {
    path: `${path}/${book_id}-REP.realm`,
    schema,
    schemaVersion: version,
    migration: () => {},
  };
};

let realm;

class Rubric {
  constructor({
    name,
    rubric_id,
    book_id,
    section_id,
    level_id,
    parent_id,
    rubric_hierarchy,
    rubric_order,
    has_child,
    super_parent_id,
    rubric_hierarchy_id,
    remedy_id_arr,
  }) {
    // this._id = new BSON.ObjectID();
    this.rubric_id = Number(rubric_id);
    this.name = name;
    this.book_id = Number(book_id);
    this.section_id = Number(section_id);
    this.level_id = Number(level_id);
    this.parent_id = parent_id ? Number(parent_id) : null;
    this.rubric_hierarchy = rubric_hierarchy;
    this.rubric_order = rubric_order ? Number(rubric_order) : null;
    this.has_child = has_child ? true : false;
    this.super_parent_id = super_parent_id ? Number(super_parent_id) : null;
    this.rubric_hierarchy_id = rubric_hierarchy_id;
    this.remedy_id_arr = remedy_id_arr;
  }
}

class RubricRemedyMapping {
  constructor({ rubric_id, remedy_id, author_number, strength }) {
    this._id = `${rubric_id};${remedy_id}`;
    this.rubric_id = Number(rubric_id);
    this.remedy_id = Number(remedy_id);
    this.author_number = author_number.length ? author_number : [];
    this.strength = strength ? Number(strength) : strength;
  }
}

class CrossReferenceMapping {
  constructor({
    cross_reference_id,
    rubric_id,
    cross_reference_rubric_id,
    cross_ref_hierarchy,
    book_id,
    section_id,
    bracket_details,
    book_name,
    rubric_hierarchy_id,
  }) {
    this.cross_reference_id = cross_reference_id;
    this.rubric_id = rubric_id;
    this.cross_reference_rubric_id = cross_reference_rubric_id;
    this.cross_ref_hierarchy = cross_ref_hierarchy;
    this.book_id = book_id;
    this.section_id = section_id;
    this.rubric_hierarchy_id = rubric_hierarchy_id;
    this.book_name = book_name;
    this.bracket_details = bracket_details ? bracket_details : "";
  }
}

const upsert = async ({ data, book_id, objectType, objectClass }) => {
  if (!realm) {
    realm = await Realm.open(config(book_id, SCHEMA_VERSION, REP_FILE_PATH));
  }
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

const realmREPFile = async () => {
  try {
    const books = await pgPool.query(
      `select book_id from book_info where book_id in (select book_id from book) and book_id in (select distinct book_id from rubric r );`
    );
    console.log(books.rowCount, books.rows);
    const bookList = books.rows;
    for (let i = 0; i < bookList.length; i++) {
      realm = await Realm.open(
        config(bookList[i].book_id, SCHEMA_VERSION, REP_FILE_PATH)
      );

      console.log(i, { book_id: bookList[i].book_id });
      const rubrics =
        await pgPool.query(`select  distinct rubric_id, book_id, section_id, name, level_id, parent_id, rubric_hierarchy, 
                    rubric_order, has_child, super_parent_id, rubric_hierarchy_id, remedy_id_arr from rubric where book_id = ${bookList[i].book_id}`);

      const totalCount = rubrics.rowCount;
      for (let size = 0; size < totalCount; size = size + 1000) {
        console.log(size, totalCount)
        const rubricIds = [];
        const rubric = rubrics.rows.slice(size, size + 1000);
        rubric.forEach((r) => {
          rubricIds.push(Number(r.rubric_id));
        });
        let rubricRemedyMapping, crossReferenceMapping;
        if (rubricIds.length) {
          rubricRemedyMapping = await pgPool.query(
            `select rubric_id , remedy_id ,array_agg(distinct author_number) as author_number ,max(strength) as strength from 
             rubric_remedy_mapping rrm where rubric_id = Any('{${rubricIds.join(
               ","
             )}}') group by rubric_id , remedy_id`
          );
          crossReferenceMapping = await pgPool.query(
            `select cr.cross_reference_id, cr.rubric_id, cr.cross_reference_rubric_id, cr.cross_ref_hierarchy, r.book_id, r.section_id, r.rubric_hierarchy_id,
      cr.bracket_details , b.book_name from cross_reference cr left join rubric r on r.rubric_id = cr.cross_reference_rubric_id left join book b on
      b.book_id = r.book_id where cr.cross_reference_rubric_id NOTNULL and cr.rubric_id = Any('{${rubricIds.join(
        ","
      )}}')`
          );
        }
        await upsert({
          objectClass: Rubric,
          objectType: "Rubric",
          data: rubric,
          book_id: bookList[i].book_id,
        });
        await upsert({
          objectClass: RubricRemedyMapping,
          objectType: "Rubric_Remedy_Mapping",
          data: rubricRemedyMapping.rows,
          book_id: bookList[i].book_id,
        });
        await upsert({
          objectClass: CrossReferenceMapping,
          objectType: "Rubric_Cross_Reference_Mapping",
          data: crossReferenceMapping.rows,
          book_id: bookList[i].book_id,
        });
      }
      console.log("completed", { book_id: bookList[i].book_id, totalCount });
    }
  } catch (Err) {
    console.log("writefile =======>", Err);
  }
};

module.exports = { realmREPFile };
