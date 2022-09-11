const fs = require('fs');
const path = require('path');

const sourceFile = __dirname.replace('/helpers');

const maxSize = 10000000000; //kb - 10GB

const makeHeavyFile = (data) => {
  const file = data.toString();
  const arrData = file.split('\r\n').filter(Boolean);
  const newLine = `${arrData.splice(arrData.length - 1, 1).join()}\r\n`;
  const arrayLines = Array.from({ length: 1500 }, () => newLine);
  const heavyString = arrayLines.join();
  const interval = setInterval(() => {
    const stats = fs.statSync('../assets/testCopy.csv').size;
    console.log(stats)
    if (stats > maxSize) {
      return clearInterval(interval)
    }
    fs.appendFileSync('../assets/testCopy.csv', heavyString)
  })
}


const fileEnlarger = () => {
  fs.readFile('../assets/testCopy.csv', (err, data) => {
    if (err) {
      console.log("doesn't exists");
      fs.copyFile('../assets/test.csv', '../assets/testCopy.csv', err => {
        if (err) {
          console.log(err)
        }
        fs.readFile('../assets/testCopy.csv', (err, data) => {
          makeHeavyFile(data)
        })
      })
    } else {
      console.log("exists");
      fs.readFile('../assets/testCopy.csv', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          makeHeavyFile(data)
        }
      })
    }
  })
}

fileEnlarger()