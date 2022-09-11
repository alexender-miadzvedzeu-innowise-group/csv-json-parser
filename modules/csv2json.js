const fs = require('fs');
const readline = require('readline');

const csv2jsonConverter = (fullSourceFile, fullResultFile, separator = ',') => {
  console.log('Processing.......');
  console.time('csv2json');

  let i = 0;
  let tableHead;
  const readFileStream = fs.createReadStream(fullSourceFile);
  const writeStream = fs.createWriteStream(fullResultFile);

  const rl = readline.createInterface({
    input: readFileStream,
    crlfDelay: Infinity
  });

  rl.on('line', line => {
    let dataObj = {};
    const values = line.split(separator);

    switch (i) {
      case 0:
        tableHead = line.split(separator);
        writeStream.write('[\r\n');
        break;
      case 1:
        tableHead.forEach((el, index) => {
          dataObj[el] = values[index];
        })
        writeStream.write(JSON.stringify(dataObj, null, 2));
      default:
        tableHead.forEach((el, index) => {
          dataObj[el] = values[index];
        })
        writeStream.write(',\r\n')
        writeStream.write(JSON.stringify(dataObj, null, 2));
        break;
    }
    i++;
  })

  rl.on('close', () => {
    writeStream.write('\r\n]');
    console.log('Done!');
    console.timeEnd('csv2json');
  })
}

exports.converter = csv2jsonConverter;