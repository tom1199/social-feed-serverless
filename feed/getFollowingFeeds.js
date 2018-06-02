'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");
const Promise = require("promise");

function isValidateRequest(event) {
    if (event.queryStringParameters.userId === undefined) {
        return false;
    }
    return true;
}

function getFollowingUser(userId) {
    return new Promise((resolve, reject) => {
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
                reject(error);
                return;
            }
    
            const followedUserIds = result.Items.map((item) => {
                return item.followedUserId
            })
            
            console.log("my following user = " + followedUserIds);
    
            resolve(followedUserIds);
        });
    });
}

function getFollowingFeeds(userId) {
    
    return getFollowingUser(userId).then((followedUserIds) => {
        
        return new Promise((resolve, reject) => {
            
            if (followedUserIds.length == 0) {
                resolve(null, []);
                return
            }
            
            const attributeValues = followedUserIds.reduce((total, currentValue) => {
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
                    reject(error);
                    return;
                }
                resolve(result.Items);
            });    
        });
        
    })
}

function getLikedFeeds(userId) {
    return new Promise((resolve, reject) => {
        console.log("table name = " + process.env.USER_LIKE_FEED_TABLE);
        const params = {
            TableName: process.env.USER_LIKE_FEED_TABLE,
            FilterExpression: "userId = :id",
            ExpressionAttributeValues: {
                ":id": userId
            }
        };
        
        console.log("Get user liked feeds for " + userId);
        
        // fetch all feeds created by given user id from the database
        dynamodb.scan(params, (error, result) => {
            console.log("My liked feed = " + JSON.stringify(result));
            // handle potential errors
            if (error) {
                console.error(error);
                reject(error);
                return;
            }
    
            const feedIds = result.Items.map((item) => {
                return item.feedId
            })
            
            console.log("my liked feeds = " + feedIds);
    
            resolve(feedIds);
        });
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
    
    Promise.all([getFollowingFeeds(userId), getLikedFeeds(userId)])
    .then((values) =>{
        const followingFeeds = values[0];
        const likedFeedIds = values[1];
        console.log("my following feeds = " + JSON.stringify(followingFeeds))
        console.log("i liked feeds = " + JSON.stringify(likedFeedIds));
        
        if (followingFeeds.length == 0) {
            callback(null, resTemplate.successResponse(200, {feeds: []}));
            return
        }
        
        if (likedFeedIds.length == 0) {
            callback(null, resTemplate.successResponse(200, {feeds: followingFeeds.map((feed) => { 
                feed.iLike = false
                return feed
            })}));
        }
        
        const modFollowingFeeds = followingFeeds.map((feed) => {
            
            if (likedFeedIds.indexOf(feed.id) > -1) {
                console.log("found feed i liked before");
                feed.iLike = true
                return feed
            }
            return feed
        })
        callback(null, resTemplate.successResponse(200, {feeds: modFollowingFeeds}));
    }).catch((error) => {
        callback(null, resTemplate.errorResponse(500, "Internal Server Error"));
    })
    
};
