module.exports = function (json) {
  let jsonString = undefined;
  if (typeof json === 'string') {
    jsonString = json;
  } else {
    jsonString = JSON.stringify(json);
  }

  return JSON.stringify(JSON.parse(jsonString), null, 2);
}