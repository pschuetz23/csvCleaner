/**
 * csvCleaner - script to clean CSV files by normalizing all non-latin characters
 *  and stripping special characters.
 *
 * Receives a CSV file and outputs a cleaned version with a new name.
 */

import { parse, stringify } from "@vanillaes/csv";
import { argv } from "node:process";
import * as fs from "fs";

//filter inputs

if (process.argv.length != 3) {
  console.error("Invalid arguments! You only need your CSV file as input.");
  process.exit(1);
}

console.warn(
  "Remember to match headers to form after file is cleaned to ensure it uploads correctly."
);

console.info("Cleaning will take ~30 sec.");

//receive and parse CSV file

const inputTable = parse(fs.readFileSync(process.argv[2]));

//if acceptable includes table[i] {append table[i] to write}

let myArray = [];
const regexEmail = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi;
const regexPhone = /[+]+[\d]/g;

function cleanString(inputString) {
  //remove all accented characters and replace other oddities with nothing
  let noSpecial = inputString.normalize("NFD").replace(/[\u007b-\u036f]/g, "");

  if (regexEmail.test(noSpecial)) return noSpecial;
  if (regexPhone.test(noSpecial)) return noSpecial;

  //cleaning improper formatting e.g. surc\work -> surc/work
  noSpecial = noSpecial.replace(/[\\]/g, "/");

  //remove all non-accepted special characters (accept "'-&,/")
  noSpecial = noSpecial.replace(/[^A-Za-z0-9 '\-,&/]/g, "");

  //remove any special that precedes blank space, attempt to remove extra specials
  noSpecial.replace(/[^A-Za-z0-9]+[" "]/g, "");

  //remove repeating special characters (if any)
  noSpecial = noSpecial.replace(/[^A-Za-z0-9 ]{2,}/g, "");

  //remove any double spaces
  noSpecial = noSpecial.replace(/[" "]+[" "]/g, " ");

  return noSpecial;
}

//function to increment through input table, clean strings, then output to 2d array
function evalArray() {
  inputTable.forEach((item) => {
    const arr = [];

    item.forEach((it) => arr.push(cleanString(it)));
    myArray.push(arr);
  });
}

evalArray();

//converting filtered array back into CSV format
const out = stringify(myArray);

fs.writeFile("cleanedCSV.csv", out, (err) => {
  if (err) throw err;
  console.log("File created successfully!");
});
