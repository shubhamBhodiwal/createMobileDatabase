let connectionString =
    "postgresql://synergy_user:cAnGESON@127.0.0.1:5440/synergy_app";
const pg = require("pg");

const pgPool = new pg.Pool({
    connectionString: connectionString,
});
const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto-js");
const { Buffer } = require("buffer");

const writeFile = async ({ query, fileName, dataType }) => {
    try {
        const chunksize = 2000;
        const result = await pgPool.query(query);
        const totalCount = result.rowCount;
        for (let size = 0; size < totalCount; size = size + chunksize) {
            let data;
            if (dataType === 'book') {
                data = result.rows
                    .slice(size, size + chunksize)
                    .map((r) => {
                        console.log(Math.ceil(fs.statSync(`./realmREP/${r.book_id}-REP.realm`).size / (1024 * 1024)),
                        );
                        const booksData = [
                            ...Object.values(r),
                            Math.ceil(fs.statSync(`./realmREP/${r.book_id}-REP.realm`).size / (1024 * 1024)),
                        ];
                        return booksData;
                    });
                console.log(data)
            }
            else {
                data = result.rows
                    .slice(size, size + chunksize)
                    .map((r) => Object.values(r));
            }
            const compressed = zlib
                .deflateSync(
                    JSON.stringify({
                        data,
                        dataType,
                        totalCount,
                    })
                )
                .toString("base64");

            fs.appendFileSync(
                `./${fileName}.dat`,
                `${crypto.AES.encrypt(compressed, "nap").toString()}@@@@@`,
                "utf8"
            );
            console.log({ size, totalCount });
        }
    } catch (Err) {
        console.log("writefile =======>", Err);
    }
};

module.exports = { writeFile };
