const path = require('path');
const converters = require('./modules');

const [ moduleFile, sourceFile, resultFile, separator ] = process.argv.slice(2);

const func = converters[moduleFile].converter;

const pathExtractor = source => path.join(__dirname, source);

const fullSourceFile = pathExtractor(sourceFile); 
const fullResultFile = pathExtractor(resultFile);

func(fullSourceFile, fullResultFile, separator);