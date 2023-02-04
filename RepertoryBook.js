let connectionString =
    "postgresql://synergy_user:cAnGESON@127.0.0.1:5440/synergy_app";
// "postgresql://synergy_user:cAnGESON@127.0.0.1:5440/synergy_app";
//create connection pool using cnfig setting
// const pgPool = new pg.Pool(config);
const pg = require("pg");

const pgPool = new pg.Pool({
    connectionString: connectionString,
});
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto-js");
const { Buffer } = require('buffer');

const writeFile = async () => {
    try {
        const books = await pgPool.query(`select book_id from book;`);
        for (let i = 0; i < books.rowCount; i++) {
            console.log({book_id : books.rows[i].book_id})
            const rubrics =
                await pgPool.query(`select  distinct rubric_id, book_id, section_id, name, level_id, parent_id, rubric_hierarchy, 
                    rubric_order, has_child, super_parent_id, rubric_hierarchy_id, remedy_id_arr from rubric where book_id = ${books.rows[i].book_id}`);

            const totalCount = rubrics.rowCount;
            for (let size = 0; size < totalCount; size = size + 1000) {
                const rubricIds = [];
                const rubric = rubrics.rows.slice(size, size + 1000).map((r) => {
                    rubricIds.push(Number(r.rubric_id));
                    return Object.values(r);
                });
                let rubricRemedyMapping;
                if (rubricIds.length) {
                    rubricRemedyMapping = await pgPool.query(
                        `select distinct rubric_id , remedy_id ,author_number ,strength from rubric_remedy_mapping rrm  where rubric_id = Any('{${rubricIds.join(
                            ","
                        )}}')`
                    );
                }
                rubricRemedyMapping = rubricRemedyMapping.rows.map((remedy) =>
                    Object.values(remedy)
                );
                const compressed = zlib
                    .deflateSync(
                        JSON.stringify({
                            rubric,
                            rubricRemedyMapping,
                            totalCount,
                        })
                    )
                    .toString('base64');

                fs.appendFileSync(
                    `./${books.rows[i].book_id}.dat`,
                    `${crypto.AES.encrypt(compressed, "nap").toString()}@@@@@`,
                    "utf8"
                );
            }
            console.log('completed', totalCount)
        }
    } catch (Err) {
        console.log("writefile =======>", Err);
    }
};

writeFile();
