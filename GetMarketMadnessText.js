/* 
author: Sanakan
release date: 10/5/2020
description: build out a list of EO materials for H2O Discord
dependencies: Node JS
*/

console.log('Start Material Market spreadsheet conversion to text');
var spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1Js67Vnv6klQyvfznCcIlu_joQZvRe4At47KJ-dTK3dQ/gviz/tq?tqx=out:json&gid=513281805';
const https = require('https');
const fs = require('fs') 
var matFormattedText = '';
var matFormattedTextStart = '```md';
var matFormattedTextEnd = '```';
var valIndent = 18;
var finalIndent = 18;

var includedTitles = [
  "Planetary Mats",
	"Ores",
	"Minerals",
]
var includedMaterials = [
	"Lustering Alloy",
	"Gleaming Alloy",
	"Condensed Alloy",
	"Precious Alloy",
	"Sheen Compound",
	"Motley Compound",
	"Fiber Composite",
	"Lucent Compound",
	"Opulent Compound",
	"Glossy Compound",
	"Crystal Compound",
	"Dark Compound",
	"Base Metals",
	"Heavy Metals",
	"Noble Metals",
	"Reactive Metals",
	"Toxic Metals",
	"Veldspar",
	"Scordite",
	"Pyroxeres",
	"Plagioclase",
	"Omber",
	"Kernite",
	"Jaspet",
	"Hemorphite",
	"Hedbergite",
	"Spodumain",
	"Dark Ochre",
	"Gneiss",
	"Crokite",
	"Bistot",
	"Arkonor",
	"Mercoxit",
	"Tritanium",
	"Pyerite",
	"Mexallon",
	"Isogen",
	"Nocxium",
	"Zydrine",
	"Megacyte"
];
var selectedMaterials = [
  "Gleaming Alloy",
	"Base Metals",
	"Heavy Metals",
	"Noble Metals",
	"Jaspet",
	"Spodumain",
	"Gneiss",
	"Crokite"
];

function getSpaceString(len)
{
    var spaceString = '';

    for (var idx = 0; idx < len; idx++)
    {
        spaceString += '\xa0';
    }

    return spaceString;
}

https.get(spreadsheetUrl, (resp) => {
  let sheetJson = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    sheetJson += chunk;
  });

  var startDelim = 'google.visualization.Query.setResponse(';
  var endDelim = ');';

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    sheetJson = sheetJson.substring(sheetJson.indexOf(startDelim) + startDelim.length, sheetJson.lastIndexOf(endDelim));
    var sheetJsonObj = JSON.parse(sheetJson);
    matFormattedText += matFormattedTextStart + '\n';

    for (var row of sheetJsonObj.table.rows)
    {
        var matName = row.c[0];
        var matValue = row.c[3];
        finalIndent = valIndent;

        if (matName && (includedTitles.indexOf(matName.v) >= 0 || includedMaterials.indexOf(matName.v) >= 0))
        {
            if (matName.v == 'Minerals' || matName.v == 'Ores')
                matFormattedText += '\n';

            if (selectedMaterials.indexOf(matName.v) >= 0)
            {
              matFormattedText += '#';
              finalIndent--;
            }

            if (includedTitles.indexOf(matName.v) >= 0)
              matFormattedText += '< ';

            matFormattedText += matName.v;
            
            if (includedTitles.indexOf(matName.v) >= 0)
              matFormattedText += ' >';

            if (matValue)
            {
                matFormattedText += ':' + getSpaceString(finalIndent - matName.v.length) + matValue.v;
            }

            matFormattedText += '\n';
        }
    }
    matFormattedText += matFormattedTextEnd;

    // output to file
    fs.writeFile('MarketMadnessText.txt', matFormattedText, (err) => { 
        if (err) throw err; 
    });

    console.log('End Material Market spreadsheet conversion to text');
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});