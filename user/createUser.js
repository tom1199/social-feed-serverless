'use strict';

const dynamodb = require("../dynamodb");
const uuid = require("uuid");

function isValidUser(user) {
    return true;
}

exports.handler = (event, context, callback) => {
    console.log("body = ", event.body);
    const data = JSON.parse(event.body || "{}");
    const timestamp = new Date().getTime();
};

