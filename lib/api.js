var message = require("./api_message");
var database = require("./api_database");
var sender = require("./api_sender");

var API = {};

API.message = message;
API.database = database;
API.sender = sender;

module.exports = API;
