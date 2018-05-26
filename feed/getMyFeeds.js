'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");

function isValidateRequest(event) {
    if (event.queryStringParameters.ownerId === undefined) {
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    
    //console.log("Environment Variables = ", JSON.stringify(process.env));
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        callback(null, resTemplate.errorResponse(400, "Bad Request", "Missing owner id."));
        return;
    }
    
    const ownerId = event.queryStringParameters.ownerId;

    var params = {
        TableName : process.env.FEED_TABLE,
        KeyConditionExpression: "ownerId = :id",
        ExpressionAttributeValues: {
            ":id":ownerId
        }
    };

    // fetch all feeds created by given user id from the database
    dynamodb.query(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t get feeds."));
            return;
        }
        callback(null, resTemplate.successResponse(200, {feeds: result.Items}));
    });

};
