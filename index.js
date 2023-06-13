const { CreateMMTable } = require("./CreateMMTable/CreateMMTable");
const { CreateMMFile } = require("./MMBooks/MMBooks");
const { CreateMetadata } = require("./Metadata/Metadata");
const { CreateREPFile } = require("./RepertoryBooks/RepertoryBooks");


async function CreateDatabase() {
    const REPBookIds = [210000014]
    const MMBookIds = [2003, 2030, 2020, 2001, 2031]

    await CreateREPFile(REPBookIds);

    await CreateMMTable();
    await CreateMMFile(MMBookIds);

    await CreateMetadata();

    process.exit(1);
}


CreateDatabase()