var txtgen = require("txtgen");
var fs = require("fs");
var path = require("path");
var randomTitle = require("random-title");
var { randomBytes } = require("crypto");
var { randomPosition } = require("@turf/random");
var { getRandomDateInRange } = require("random-date-generator");

var bbox = [-77.838579, -0.130954, -77.221467, 0.386403];
var fuzz = 15 * 86400000; // 15 days

var existingObs = require("../src/frontend/test_observations.json");
var existingPresets = require("../src/frontend/test_presets.json");

var randomizedObs = existingObs.map(randomizeObs);
var randomizedPresets = Object.assign(existingPresets, {
  presets: randomizePresets(existingPresets.presets)
});

fs.writeFileSync(
  path.join(__dirname, "../src/frontend/test_observations.json"),
  JSON.stringify(randomizedObs, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, "../src/frontend/test_presets.json"),
  JSON.stringify(randomizedPresets, null, 2)
);

function randomizeObs(o) {
  var r = JSON.parse(JSON.stringify(o));
  r.id = randomBytes(8).toString("hex");
  r.version = randomBytes(32).toString("hex");
  r.created_at = addDateFuzz(o.created_at);
  r.timestamp = addDateFuzz(o.timestamp, r.created_at);
  var pos = randomPosition(bbox);
  r.value.lon = pos[0];
  r.value.lat = pos[1];
  r.value.tags = {
    notes: txtgen.sentence(),
    categoryId: o.value.tags.categoryId
  };
  return r;
}

function randomizePresets(presets) {
  var r = {};
  Object.keys(presets).forEach(key => {
    r[key] = randomizePreset(presets[key]);
  });
  return r;
}

function randomizePreset(p) {
  var r = JSON.parse(JSON.stringify(p));
  r.name = randomTitle({ min: 3, max: 10 }).replace(".", "");
  return r;
}

function addDateFuzz(date, start) {
  date = new Date(date || new Date(2019, 0, 15));
  start = new Date(start || date - fuzz);
  var end = new Date(date + fuzz);
  var newDate = getRandomDateInRange(start, end);
  return newDate.toISOString();
}
