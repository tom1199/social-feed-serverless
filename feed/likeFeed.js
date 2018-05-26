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
    
    function updateUserLikeFeedTable() {
        return new Promise(function(resolve, reject) {
            console.log("Updating UserLikeFeedTable....");
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
    }
    
    function updateFeedLikedByUserTable() {
        return new Promise(function(resolve, reject) {
            console.log("Updating FeedLikedByUserTable....");
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
    }
    
    function aggregateFeedCount() {
        return new Promise(function(resolve, reject) {
        
            console.log("Aggregate like count....");
            var params = {
                TableName: process.env.FEED_TABLE,
                // ProjectionExpression: "#yr, title, info.rating",
                FilterExpression: "id = :id",
                ExpressionAttributeValues: {
                    ":id": feedId
                }
            };
            
            dynamodb.scan(params, (error, result) => {
                // handle potential errors
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                
                if (result.Items.count == 0) {
                    console.error("feed not exist");
                    reject("feed not exist");
                }
                
                var feed = result.Items[0];
                var params = {
                    TableName: process.env.FEED_TABLE,
                    Key:{
                        "ownerId": feed.ownerId,
                        "createdAt": feed.createdAt
                    },
                    UpdateExpression: "SET likeCount = likeCount + :p",
                    ExpressionAttributeValues:{
                        ":p":1
                    },
                    ReturnValues:"UPDATED_NEW"
                };
                
                console.log("Attempting a like count update...");
                dynamodb.update(params, function(error, data) {
                     // handle potential errors
                    if (error) {
                        console.error(error);
                        reject(data);
                        return;
                    }
                    resolve(data);
                });
            });
            
        });
    }
    
    function isLikeExist() {
        return new Promise((resolve, reject) => {
            console.log("Checking like existence....");
            const params = {
                TableName: process.env.FEED_LIKED_BY_USER_TABLE,
                KeyConditionExpression: "feedId = :feedId and userId = :userId",
                ExpressionAttributeValues: {
                    ":feedId":feedId,
                    ":userId":likedBy
                }
            };
            
            // fetch all feeds created by given user id from the database
            dynamodb.query(params, (error, result) => {
                // handle potential errors
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                const exist = result.Count > 0 ? true : false;
                resolve(exist)
            });
        });
    }
    
    isLikeExist().then((exist) => {
        console.log("like existence = " + exist)
        if (exist === false) {
            console.log("Incrementing like count....");
            return Promise.all([updateUserLikeFeedTable(), updateFeedLikedByUserTable(), aggregateFeedCount()])
        }
    }).then((res) => {
        callback(null, resTemplate.successResponse(200));
    })
    .catch((error) => {
        console.error(error);
        callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t create new like."));
    })
};
