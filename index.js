const { CreateMMTable } = require("./CreateMMTable/CreateMMTable");
const { CreateMMFile } = require("./MMBooks/MMBooks");
const { CreateMetadata } = require("./Metadata/Metadata");
const { CreateREPFile } = require("./RepertoryBooks/RepertoryBooks");


async function CreateDatabase() {
  const REPBookIds = [210000081, 210000025, 210000015, 210000016, 210000014];
    const MMBookIds = [
      2030, 2039, 2073, 2094, 2013, 2075, 2003, 2053, 2055, 2034, 2014, 2061,
      2067, 2054, 2056, 2062, 2020, 2012, 2071, 2057, 2084, 2068, 2059, 2063,
      2074, 2047, 2060, 2015, 2050, 2004, 2064, 2070, 2048, 2058, 2051, 2052,
      2010, 2093, 2045, 2019, 2036, 2042, 2011, 2044, 2046, 2033, 2031, 2088,
      2081, 2083, 2035, 2072, 2069, 2001, 2021, 2049,
    ];

    await CreateREPFile(REPBookIds);

    await CreateMMTable();
    await CreateMMFile(MMBookIds);

    await CreateMetadata(REPBookIds,MMBookIds);

    process.exit(1);
}


CreateDatabase()