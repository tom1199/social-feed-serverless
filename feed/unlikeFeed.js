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

    const updateUserLikeFeedTable = new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.USER_LIKE_FEED_TABLE,
            Key:{
                "userId": likedBy,
                "feedId": feedId
            }
        };

        console.log("Attempting a conditional delete...");
        dynamodb.delete(params, function(error, data) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(data);
        });
    });
    
    const updateFeedLikedByUserTable = new Promise((resolve, reject) => {
        var params = {
            TableName: process.env.FEED_LIKED_BY_USER_TABLE,
            Key:{
                "userId": likedBy,
                "feedId": feedId
            }
        };

        console.log("Attempting a conditional delete...");
        dynamodb.delete(params, function(error, data) {
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
            resolve(data);
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
