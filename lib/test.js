
let seoParse = require('./index.js');
const path = require('path');
const INPUT_FILE_PATH = path.join(__dirname, '..', 'sample', 'test.html');
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'sample', 'report.txt');

/* User is free to chain any rules by themselves*/  /* 5 pre-defined SEO rules */

seoParse.setPath(INPUT_FILE_PATH)                 // User is able to config the input path
    .rule(['img','alt'],'=',0)                  // 1. <img> tag without 
    .rule(['a','rel'],'=',0)                    // 2. <a> tag without attribute rel
    .rule(['meta','name','description'],'=',0)  // 3. <meta> tag without attribute descriptions
    .rule(['meta','name','keywords'],'=',0)     // 3. <meta> tag without attribute keywords
    .rule(['title'],'=',0)                      // 3. without <title> tag
    .rule(['strong'],'>',15)                    // 4. more than 15 <strong> tag
    .rule(['h1'],'>',1)                         // 5. more than 1 <h1> tag
//.rule(['meta','name','robots'],'=',0)     // flexible for implement additional rules for <meta> tag 
    .parse()
    .setConsole(true)                           // The output can be console ture || false
    .setOutput(OUTPUT_FILE_PATH);                    // able to config the output destination
