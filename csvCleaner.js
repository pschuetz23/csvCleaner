//import required modules

import { parse, stringify } from '@vanillaes/csv'
import { argv } from 'node:process';
import * as fs from 'fs';

//filter inputs

if (process.argv.length != 3) {
    console.error('Invalid arguments! You only need your CSV file as input.');
    process.exit(1);
  }

console.warn("Remember to match headers to form after file is cleaned to ensure it uploads correctly.");

console.info("Cleaning will take ~30 sec.");  

//recieve and parse CSV file

const inputTable = parse(fs.readFileSync(process.argv[2]));

// if acceptable includes table[i] {append table[i] to write}

let myarray = [];
const regex = /[^A-Za-z0-9]/g;

function evalArray() {

    inputTable.forEach(item => {

      //array to store filtered strings
      const arr = [];

      item.forEach(it => {

        //cleanup regexs

        //remove all accented characters and replace other oddities with nothing
        let noSpecial = it.normalize("NFD").replace(/[\u007b-\u036f]/g, "");

        //remove all non-accepted special characters (accept "+&@'.-_/\,")
        noSpecial = noSpecial.replace(/[^\w\s+&@\'.\-\/\\,]|[\_]/g, "");

        //remove any special that precedes blankspace, attempt to remove extra specials
        noSpecial.replace(/[^A-Za-z0-9]+[" "]/g, "");

        //if field is an email, do nothing
        if(/\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi.test(noSpecial)) {

          arr.push(noSpecial);

        }
        //more aggressive regex
        else {

          //regex to remove "+" sign, but ignore if it's in phone field

          if(/[+]+[\d]/g.test(noSpecial)) {

            arr.push(noSpecial);

          }

          else {

            //cleaning improper formatting e.g. surc\work -> surc/work
            noSpecial = noSpecial.replace(/[\\]/g, "/")
            
            //remove all non-accepted special characters (accept "'-&,/")
            noSpecial = noSpecial.replace(/[^A-Za-z0-9 '\-,&/]/g, "");
  
            //remove any double spaces
            noSpecial = noSpecial.replace(/[" "]+[" "]/g, " ");
  
            //append to filter array
            arr.push(noSpecial);

          }
        }

      })

      myarray.push(arr);

     })
}

//main method

evalArray();

//converting filtered array back into CSV format
const out = stringify(myarray);

// write to file and catch errors
fs.writeFile('cleanedCSV.csv', out, (err) => {
  if (err) throw err;
  else {
    console.log("File created sucessfully!")
  }
})

