const fs = require("fs");


const readJSONDataFromFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      }
    });
  });
};

module.exports = {
  readJSONDataFromFile,
};
