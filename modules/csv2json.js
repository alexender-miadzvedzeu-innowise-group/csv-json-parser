const fs = require('fs');
const { Transform } = require('stream');

const csv2jsonConverter = (fullSourceFile, fullResultFile, separator = ',') => {

  const createTransformStream = () => {
    let isFirstChunk = true;
    let headers;
    let firstString;
    let prevString;
    let jsonInArr = [];

    return new Transform({
      final(callback) {
        const lastJson = headers.reduce((acc, val, index) => {
          return {
            ...acc,
            [val]: prevString[index]
          }
        }, {})
        jsonInArr.push(lastJson)
        this.push(JSON.stringify(jsonInArr))
        callback();
      },
      transform(chunk, encoding, callback) {
        const lines = chunk.toString().split('\r\n');
        const updateJson = () => {
          prevString = lines.splice(lines.length - 1, 1)[0].split(separator);
          const jsonFromChunk = lines.map(line => {
            const lineDataInArr = line.split(separator);
            const json = headers.reduce((acc, val, index) => {
              return {
                ...acc,
                [val]: lineDataInArr[index]
              }
            }, {})
            return json
          })
          jsonInArr = [...jsonInArr, ...jsonFromChunk];
        }
        if (isFirstChunk && !headers) {
          headers = lines.splice(0, 1)[0].split(separator);
        }
        if (!isFirstChunk) {
          firstString = lines.splice(0, 1)[0].split(separator);
          if (
            firstString.length === headers.length &&
            prevString.length === headers.length
          ) {
            lines.unshift(firstString.join(separator));
            lines.unshift(prevString.join(separator));
            updateJson()
          }
          if (
            firstString.length !== headers.length || 
            prevString.length !== headers.length
          ) {
            prevString[prevString.length - 1] += firstString.splice(0, 1)[0]
            prevString = [...prevString, ...firstString]
            lines.unshift(prevString.join(separator));
            updateJson()
          }
        } else {
          updateJson()
          isFirstChunk = false;
        }
        callback()
      }
    });
  }

  const readFileStream = fs.createReadStream(fullSourceFile);
  const writeStream = fs.createWriteStream(fullResultFile);
  const transformStream = createTransformStream();

  readFileStream.pipe(transformStream).pipe(writeStream)
}

exports.converter = csv2jsonConverter;