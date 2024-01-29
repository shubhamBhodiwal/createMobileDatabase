const { CreateMMTable } = require("./CreateMMTable/CreateMMTable");
const { CreateMMFile } = require("./MMBooks/MMBooks");
const { CreateMetadata } = require("./Metadata/Metadata");
const { CreateREPFile } = require("./RepertoryBooks/RepertoryBooks");

async function CreateDatabase() {
  const REPBookIds = [
    110000037, 110000007, 110000054, 110000002, 110000005, 110000004, 110000006,
    110000087, 110000050, 110000009, 110000008, 110000038,
  ];
  const MMBookIds = [
    716, 717, 718, 800, 358, 719, 720, 7, 9, 11, 30, 58, 79, 77, 81, 83, 85,
    147, 156, 168, 185, 205, 220, 241, 304, 307, 308, 310, 336, 359, 489, 520,
    518, 519, 516, 517, 532, 564, 566, 661, 699, 703, 734, 1063, 665, 744,
    965,
  ];

  await CreateREPFile(REPBookIds);

  await CreateMMTable();
  await CreateMMFile(MMBookIds);

  // await CreateMetadata(REPBookIds, MMBookIds);

  process.exit(1);
}

CreateDatabase();
