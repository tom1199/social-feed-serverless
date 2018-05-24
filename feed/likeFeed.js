'use strict';

const dynamodb = require("../dynamodb");
const uuid = require("uuid");
const resTemplate = require("../response");

function isValidateRequest(event) {
    //console.log("event = ", event);
    const body = JSON.parse(event.body || "{}")
    const feedId = event.pathParameters.feedId;
    const likedBy = body.likedBy;
    if (feedId === undefined) {
        console.log("Missing feed id");
        return false;
    }
    if (likedBy === undefined) {
        console.log("Missing likedby");
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        callback(null, resTemplate.errorResponse(400, "Bad Request", "invalid like input"))
        return;
    }
    
    const feedId = event.pathParameters.feedId;
    const body = JSON.parse(event.body || "{}")
    const likedBy = body.likedBy;
    const timestamp = new Date().getTime();

    // Check if like exist
    const query = {
        TableName: process.env.LIKE_TABLE,
        FilterExpression: "feedId = :feedId and likedBy = :likedBy",
        ExpressionAttributeValues: {
            ":feedId": feedId,
            ":likedBy": likedBy
        }
        // KeyConditionExpression: "feedId = :feedId and likedBy = :likedBy",
        // ExpressionAttributeValues: {
        //     ":feedId": feedId,
        //     ":likedBy": likedBy
        // }
    }
    dynamodb.scan(query, (error, data) => {
       // handle potential errors
        if (error) {
            console.error(error);
            callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error.", "Error when query like info."));
            return;
        }
        
        // like found
        if (data.Items.length > 0) {
            console.log("Found a like exist!");
            callback(null, resTemplate.successResponse(200, {like: data.Items[0]}));
            return;
        }
        
        
        // Otherwise create new record
        const newLike = {
            id: uuid.v1(),
            feedId: feedId,
            likedBy: likedBy,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
    
        const params = {
            TableName: process.env.LIKE_TABLE,
            Item: newLike,
        };

        // write to the database
        dynamodb.put(params, (error) => {
            // handle potential errors
            if (error) {
                console.error(error);
                callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t create new like."));
                return;
            }
            
            callback(null, resTemplate.successResponse(200, {like: newLike}));
        });
    });
};
