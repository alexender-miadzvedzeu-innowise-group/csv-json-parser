const fs = require('fs');
const { Transform } = require('stream');

const json2csvConverter = (fullSourceFile, fullResultFile, separator = ',') => {
  const readFileStream = fs.createReadStream(fullSourceFile);
  const writeStream = fs.createWriteStream(fullResultFile);

  const bracketsRemover = el => el.replace(/[\])}[{(]/g, '').trim().split(',\n');
  
  const createTransformStream = () => {
    let i = 0;
    let isFirstChunk = true;
    let table = '';
    let tableColumnsNum;
    let prevJsonPart;
    return new Transform({
      final(callback) {
        const lastStr = prevJsonPart[0].split(',').reduce((acc, val) => {
          const [value] = val.match(/\:.*/g)
          const cleanValue = value.replace(':', '').replace('"', '').replace('"', '')
          return acc + `${cleanValue},`
        }, '');
        table += lastStr;
        this.push(table)
        callback();
      },
      transform(chunk, encoding, callback) {
        const data = chunk.toString();
        const arrData = data.split('},').map(bracketsRemover);
        const addValidData = () => {
          arrData.forEach(([str]) => {
            const objectPairs = str.split(',');
            if (objectPairs.length === tableColumnsNum) {
              objectPairs.forEach(pair => {
                const [value] = pair.match(/\:.*/g)
                const cleanValue = value.replace(':', '').replace('"', '').replace('"', '')
                table += `${cleanValue},`
              });
              table += '\r\n'
            }
          })
        }
        
        if (!table) {
          const firstObj = arrData[0][0].split(',');
          tableColumnsNum = firstObj.length;
          firstObj.forEach(str => {
            const [tableRowKey] = str.split(':');
            table += `${tableRowKey.replace('"', '').replace('"', '')},`
          })
          table += '\r\n'
        }

        if (isFirstChunk) {
          prevJsonPart = arrData.splice(arrData.length - 1, 1)[0]
          addValidData();
        } else {
          const firstJsonPart = arrData.splice(0 ,1)[0];
          const res = prevJsonPart;
          res[res.length - 1] += firstJsonPart.splice(0, 1)[0]
          res.concat(firstJsonPart);
          const objectPairs = res[0].split(',');
          objectPairs.forEach(pair => {
            const [value] = pair.match(/\:.*/g)
            const cleanValue = value.replace(':', '').replace('"', '').replace('"', '')
            table += `${cleanValue},`
          });
          table += '\r\n';
          prevJsonPart = arrData.splice(arrData.length - 1, 1)[0];
          addValidData();
        }
        if (isFirstChunk) {
          isFirstChunk = false;
        }
        callback()
        i++;
      }
    });
  }

  const transformStream = createTransformStream();


  readFileStream.pipe(transformStream).pipe(writeStream)

}

exports.converter = json2csvConverter;