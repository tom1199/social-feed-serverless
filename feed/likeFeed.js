'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");
const Promise = require("promise");

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
    
    const updateUserLikeFeedTable = new Promise((resolve, reject) => {
        const newLike = {
            feedId: feedId,
            userId: likedBy,
            createdAt: timestamp
        };
        
        const params = {
            TableName: process.env.USER_LIKE_FEED_TABLE,
            Item: newLike,
        };
    
        // write the todo to the database
        dynamodb.put(params, (error) => {
            // handle potential errors
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(newLike);
        });
    });
    
    const updateFeedLikedByUserTable = new Promise((resolve, reject) => {
        const newLike = {
            feedId: feedId,
            userId: likedBy,
            createdAt: timestamp
        };
        
        const params = {
            TableName: process.env.FEED_LIKED_BY_USER_TABLE,
            Item: newLike,
        };
    
        // write the todo to the database
        dynamodb.put(params, (error) => {
            // handle potential errors
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(newLike);
        });
    });
    
    Promise.all([updateUserLikeFeedTable, updateFeedLikedByUserTable])
    .then((res) => {
        callback(null, resTemplate.successResponse(200));
    })
    .catch((error) => {
        console.error(error);
        callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t create new like."));
    })
};
