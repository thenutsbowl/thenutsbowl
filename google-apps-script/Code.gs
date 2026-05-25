// ═══════════════════════════════════════════════════════════════
//  The Nuts Bowl — Google Sheets → JSONP API
//  Deploy: Extensions > Apps Script > Deploy > New Deployment
//          Type: Web App | Execute as: Me | Who has access: Anyone
//  Sheet stays PRIVATE — JSONP bypasses CORS entirely.
// ═══════════════════════════════════════════════════════════════

// Paste your Spreadsheet ID here (from the sheet URL):
// https://docs.google.com/spreadsheets/d/SHEET_ID/edit
var SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Finds a sheet by name, trimming whitespace so leading/trailing
// spaces in tab names don't break lookups.
function getSheet(ss, name) {
  return ss.getSheets().find(function(s) {
    return s.getName().trim() === name;
  }) || null;
}

function doGet(e) {
  var sheet    = (e.parameter.sheet    || 'prices').toLowerCase().trim();
  var callback = e.parameter.callback || '';

  var data;
  try {
    var ss = (SHEET_ID && SHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE')
      ? SpreadsheetApp.openById(SHEET_ID)
      : SpreadsheetApp.getActiveSpreadsheet();

    if      (sheet === 'prices')   data = getPrices(ss);
    else if (sheet === 'products') data = getProducts(ss);
    else if (sheet === 'combos')   data = getCombos(ss);
    else if (sheet === 'all')      data = { products: getProducts(ss), prices: getPrices(ss), combos: getCombos(ss) };
    else data = { error: 'Unknown sheet. Use ?sheet=prices|products|combos|all' };
  } catch (err) {
    data = { error: err.message };
  }

  var json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Prices ──────────────────────────────────────────────────────
// Tab "Prices" columns: name | pricePerKg | mrpPerKg
function getPrices(ss) {
  var sheet = getSheet(ss, 'Prices');
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  return rows.slice(1)
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return { name: String(r[0]), pricePerKg: Number(r[1]), mrpPerKg: Number(r[2]) };
    });
}

// ── Products ─────────────────────────────────────────────────────
// Tab "Products" columns:
//   name | badge | badgeClass | emoji | tag | description | weights
//   weights: comma-separated e.g. "200,500,1000"
function getProducts(ss) {
  var sheet = getSheet(ss, 'Products');
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  return rows.slice(1)
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return {
        name:        String(r[0]),
        badge:       String(r[1]),
        badgeClass:  String(r[2]),
        emoji:       String(r[3]),
        tag:         String(r[4]),
        description: String(r[5]),
        weights:     String(r[6]).split(',').map(function(w) { return Number(w.trim()); }).filter(Boolean)
      };
    });
}

// ── Combos ──────────────────────────────────────────────────────
// Tab "Combos"      columns: id | name | tag | badge | badgeClass | emoji | desc | totalWeight | mrp | price
// Tab "Ingredients" columns: comboId | emoji | name | weight
function getCombos(ss) {
  var combosSheet      = getSheet(ss, 'Combos');
  var ingredientsSheet = getSheet(ss, 'Ingredients');

  if (!combosSheet || !ingredientsSheet) {
    var found = ss.getSheets().map(function(s) { return '"' + s.getName() + '"'; }).join(', ');
    return { error: 'Missing tabs. Tabs in this spreadsheet: [' + found + ']' };
  }

  // Build ingredients map: { comboId → [{emoji, name, weight}] }
  var ingMap = {};
  ingredientsSheet.getDataRange().getValues().slice(1)
    .filter(function(r) { return r[0] !== ''; })
    .forEach(function(r) {
      var id = String(r[0]);
      if (!ingMap[id]) ingMap[id] = [];
      ingMap[id].push({ emoji: String(r[1]), name: String(r[2]), weight: String(r[3]) });
    });

  return combosSheet.getDataRange().getValues().slice(1)
    .filter(function(r) { return r[0] !== ''; })
    .map(function(r) {
      return {
        name:        String(r[1]),
        tag:         String(r[2]),
        badge:       String(r[3]),
        badgeClass:  String(r[4]),
        emoji:       String(r[5]),
        desc:        String(r[6]),
        totalWeight: String(r[7]),
        mrp:         Number(r[8]),
        price:       Number(r[9]),
        ingredients: ingMap[String(r[0])] || []
      };
    });
}
