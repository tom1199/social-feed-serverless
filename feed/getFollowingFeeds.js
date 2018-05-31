'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");

function isValidateRequest(event) {
    if (event.queryStringParameters.userId === undefined) {
        return false;
    }
    return true;
}

function getFollowingUser(userId, callback) {
    const params = {
        TableName: process.env.USER_FOLLOW_TABLE,
        FilterExpression: "userId = :id",
        ExpressionAttributeValues: {
            ":id": userId
        }
    };
    
    console.log("Get following user for " + userId);
    
    // fetch all feeds created by given user id from the database
    dynamodb.scan(params, (error, result) => {
        console.log("my following user = " + JSON.stringify(result));
        // handle potential errors
        if (error) {
            console.error(error);
            callback(error);
            return;
        }

        const followedUserIds = result.Items.map((item) => {
            return item.followedUserId
        })
        
        console.log("my following user = " + followedUserIds);

        callback(null, followedUserIds);
    });    
}

exports.handler = function(event, context, callback) {
    
    // console.log("Environment Variables = ", JSON.stringify(process.env));
    
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        callback(null, resTemplate.errorResponse(400, "Bad Request", "Missing owner id."));
        return;
    }
    
    const userId = event.queryStringParameters.userId;
    
    getFollowingUser(userId, (error, userIds) => {
        const attributeValues = userIds.reduce((total, currentValue) => {
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
        
    });
};
