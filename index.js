#!/usr/bin/env node
const { program } = require('commander');
const startServer = require("./src/proxy");

program
  .option('-p0, --portTo <portTo>', 'Specify the port number')
  .option('-p1, --portFrom <portFrom>', 'Specify the port number')
  .option('-f, --filePath <filePath>', 'Specify the file path')
  .option('-h, --targetHost <targetHost>', 'Specify the host')
  .parse(process.argv);

const options = program.opts();
startServer(options.targetHost, options.portFrom, options.portTo, options.filePath);

