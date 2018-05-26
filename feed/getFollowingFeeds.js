'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");

function isValidateRequest(event) {
    if (event.queryStringParameters.userId === undefined) {
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    
    // console.log("Environment Variables = ", JSON.stringify(process.env));
    
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        callback(null, resTemplate.errorResponse(400, "Bad Request", "Missing owner id."));
        return;
    }
    
    const userId = event.queryStringParameters.userId;
    
    const myFollowingUsers = ["tom1199"];
    
    const attributeValues = myFollowingUsers.reduce((total, currentValue) => {
        total[":" + currentValue] = currentValue
       return total; 
    }, {});
    console.log(attributeValues);
    const filterExpression = Object.keys(attributeValues).join(",");
    console.log(filterExpression);
    var params = {
        TableName: process.env.FEED_TABLE,
        // ProjectionExpression: "#yr, title, info.rating",
        FilterExpression: "ownerId in (" + filterExpression + ")",
        ExpressionAttributeValues: attributeValues
    };

    dynamodb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t get feeds."));
            return;
        }
        callback(null, resTemplate.successResponse(200, {feeds: result.Items}));
    });
};
