const fs = require('fs');
const readline = require('readline');

const json2csvConverter = (fullSourceFile, fullResultFile, separator = ',') => {
  console.log('Processing.......');
  console.time('json2Csv');

  let matchedObjectHeadStart = false;
  let matchedObjectHeadEnd = false;
  let headerWritten = false;
  let objectString = '';
  const readFileStream = fs.createReadStream(fullSourceFile);
  const writeStream = fs.createWriteStream(fullResultFile);

  const rl = readline.createInterface({
    input: readFileStream,
    crlfDelay: Infinity
  });

  rl.on('line', line => {
    if (!matchedObjectHeadStart && line.indexOf('{') !== -1) {
      objectString += `${line}`;
      matchedObjectHeadStart = true;
    };
    if (!matchedObjectHeadEnd && line.indexOf('}') !== -1) { 
      objectString += `${line.replace(',', '')}`;
      matchedObjectHeadEnd = true;
    };
    if (matchedObjectHeadStart && !matchedObjectHeadEnd && line.indexOf('{') === -1) {
      objectString += `${line}`;
    }
    if (matchedObjectHeadStart && matchedObjectHeadEnd && objectString.length) {
      const firstObjectInJson = JSON.parse(objectString);
      const tableHeadString = Object.keys(firstObjectInJson).join(separator);
      const valuesString = Object.values(firstObjectInJson).join(separator);
      if (!headerWritten) {
        writeStream.write(`${tableHeadString}\r\n`);
        headerWritten = true;
      }
      writeStream.write(`${valuesString}\r\n`);
      matchedObjectHeadStart = false;
      matchedObjectHeadEnd = false;
      objectString = '';
    }
  })

  rl.on('close', () => {
    console.log('Done!');
    console.timeEnd('json2Csv');
  })
}

exports.converter = json2csvConverter;