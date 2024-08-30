const Parser = require('./parser'); 
const fs = require('fs');
const path = require('path');
const generateSpec = require("har-to-openapi");

class HARFile {
    constructor(file_path) {
        this.version = "1.2";
        this.creator = {
            name: "Portway.ai",
            version: "1.0"
        };
        this.entries = [];
        this.parser = new Parser();
        this.file_path = file_path;
        this.store = {};
        this.prevName = null;
    }

    recordRequest(req, reqBody, reqUrl) {
      const request = this.parser.parseRequest(req, reqBody);
      this.store[reqUrl] = request;
    }

    recordResponse(res, resBody, reqUrl) {
      if (!this.store[reqUrl]) {
        return;
      }
      const request = this.store[reqUrl];
      delete this.store[reqUrl];
      const response = this.parser.parseResponse(res, resBody);
      const entry = {
        startedDateTime: new Date().toISOString(),
        time: 121
      }; 
      entry.request = request;
      entry.response = response;
      this.entries.push(entry);
    }

    async writeHARFile() {
       const harfile = this.generateHARFormat();
        const openapi = await generateSpec.generateSpec(harfile, { relaxedMethods: true });
        const { spec, yamlSpec } = openapi;
        spec.info.title = "Autospec";
        spec.info.description = "OpenAPI spec generated by Allybind";
        // delete previous file if it existed and create new identifier
        if (!this.prevName) {
          const { dir, name, ext } = path.parse(this.file_path);
          const newFilename = `${name}_${new Date().getTime()}${ext}`;
          this.prevName = path.join(dir, newFilename);
        } 
        fs.writeFile(this.prevName, JSON.stringify(spec, null, 2), err => {
            if (err) {
              console.log("Error detected while writing file");
            }
        });
    }

    generateHARFormat() {
        const harfile = {
            log: {
                version: this.version,
                creator: this.creator,
                entries: this.entries
            }
        };
        return harfile;
    }
}

module.exports = HARFile; 