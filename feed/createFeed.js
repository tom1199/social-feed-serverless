'use strict';

const dynamodb = require("../dynamodb");
const uuid = require("uuid");
const resTemplate = require("../response");

function isValidateFeed(feed) {
    if (feed.imageUrl === undefined) {
        return false;
    }
    if (feed.ownerId === undefined) {
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    console.log("body = ", event.body);
    const data = JSON.parse(event.body || "{}");
    const timestamp = new Date().getTime();
    
    if (isValidateFeed(data) === false) {
        console.error('invalid data');
        callback(null, resTemplate.errorResponse(400, "Bad Request", "invalid feed input"));
        return;
    }
    
    var newFeed = {
        title: data.title,
        imageUrl: data.imageUrl,
        ownerId: data.ownerId,
        likeCount: 0,
        id: uuid.v1(),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    
    if (data.ownerName) { newFeed.ownerName = data.ownerName; }
    
    const params = {
        TableName: process.env.FEED_TABLE,
        Item: newFeed,
    };

    // write the todo to the database
    dynamodb.put(params, (error) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t create new feed."));
            return;
        }
        callback(null, resTemplate.successResponse(201, {feed: newFeed}));
    });
 
};
