
'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");
const Promise = require("promise");

function isValidateRequest(event) {
    const body = JSON.parse(event.body || "{}")
    const userId = event.pathParameters.userId;
    const folowedUserId = body.folowedUserId;
    if (userId === undefined) {
        console.log("Missing User Id");
        return false;
    }
    if (folowedUserId === undefined) {
        console.log("Missing Follow User Id");
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
    
    const userId = event.pathParameters.userId;
    const body = JSON.parse(event.body || "{}")
    const folowedUserId = body.folowedUserId;
    const timestamp = new Date().getTime();
    
    function updateUserFollowTable() {
        return new Promise(function(resolve, reject) {
            console.log("Updating UserLikeFeedTable....");
            const newFollwUser = {
                userId: userId,
                followedUserId: folowedUserId,
                createdAt: timestamp
            };
            
            const params = {
                TableName: process.env.USER_FOLLOW_TABLE,
                Item: newFollwUser
            };
            
            dynamodb.put(params, (error) => {
                // handle potential errors
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(newFollwUser);
            });
        });
    }
   
    function isFollowUser() {
        return new Promise((resolve, reject) => {
            console.log("Checking Followed User Or Not....");
            const params = {
                TableName: process.env.USER_FOLLOW_TABLE,
                KeyConditionExpression: "userId = :userId and follwedUserId = :follwedUserId",
                ExpressionAttributeValues: {
                    ":userId":userId,
                    ":follwedUserId":followedUserId
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
    
    isFollowUser().then((exist) => {
        console.log("User already followed = " + exist)
        if (exist === false) {
            return Promise.all([updateUserFollowTable()]);
        }
    }).then((res) => {
        callback(null, resTemplate.successResponse(200));
    })
    .catch((error) => {
        console.error(error);
        callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t create new like."));
    })
};
