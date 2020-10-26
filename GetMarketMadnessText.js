console.log('Start Material Market spreadsheet conversion to text');
var spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1Js67Vnv6klQyvfznCcIlu_joQZvRe4At47KJ-dTK3dQ/gviz/tq?tqx=out:json&gid=513281805';
const https = require('https');
const fs = require('fs') ;
var matFormattedTextStart = '```md';
var matFormattedTextEnd = '```';
var valIndent = 18;

function getSpaceString(len)
{
    var spaceString = '';

    for (var idx = 0; idx < len; idx++)
    {
        spaceString += '\xa0';
    }

    return spaceString;
}

function writeToFile(matFormattedText)
{
  // output to file
  fs.writeFile('MarketMadnessText.txt', matFormattedText, (err) => { 
      if (err) throw err; 
  });
}

function assignPriceValues(sheetJsonObj, matJson)
{
  var matJsonObjList = matJson.materials;

  for (var matObj of matJsonObjList)
  {
    for (var row of sheetJsonObj.table.rows)
    {
      var matName = row.c[0];
      var matValue = row.c[3];

      if ((matName && (matObj.name == matName.v)) && matValue)
      {
        matObj.price = matValue.v;
      }
    }
  }

  return matJsonObjList;
}

function printMatAndPrice(mat, indent)
{
  var matAndPriceText = "";

  if (mat.status == "priority")
  {
    matAndPriceText += "#";
    indent--;
  }

  matAndPriceText += mat.name;
  
  if (mat.price)
  {
    var price = 0;

    if (mat.name == "Tritanium")
      price = mat.price.toFixed(2);
    else
      price = Math.floor(mat.price);

    matAndPriceText += ':' + getSpaceString(indent - mat.name.length) + price;
  }

  matAndPriceText += '\n';

  return matAndPriceText;
}

function getFormattedText(sheetJsonObj)
{
  var fullMatJson = JSON.parse(fs.readFileSync('Materials.json'));
  var matFormattedText = '';
  var matJsonObjList = assignPriceValues(sheetJsonObj, fullMatJson);  
  var finalIndent = valIndent;
  //console.log(matJsonObjList);
  matFormattedText += matFormattedTextStart + '\n';

  var currentSubTypeCat = "";

  for (var cat of fullMatJson.typeCategories.sort(function(a,b){
    return a.sequence - b.sequence;
  }))
  {
    matFormattedText += "< " + cat.title + " >";
    matFormattedText += '\n';

    for (var mat of matJsonObjList)
    {
      if (mat.type == cat.type)
      {
        if (cat.subTypeCategories)
        {
          for (var subCat of cat.subTypeCategories.sort(function(a,b){
            return a.sequence - b.sequence;
          }))
          {            
            if (mat.subType == subCat.subType)
            {
              if (currentSubTypeCat != "" && currentSubTypeCat != subCat.subType)
                matFormattedText += '\n';
  
              currentSubTypeCat = subCat.subType;
              matFormattedText += printMatAndPrice(mat, finalIndent);
            }
          }
        }
        else
          matFormattedText += printMatAndPrice(mat, finalIndent);
      }
    }
      
    matFormattedText += '\n';
  }

  matFormattedText += matFormattedTextEnd;
  return matFormattedText;
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

    //var matFormattedText = getFormattedText(sheetJsonObj);
    var matFormattedText = getFormattedText(sheetJsonObj);

    writeToFile(matFormattedText);

    console.log('End Material Market spreadsheet conversion to text');
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});