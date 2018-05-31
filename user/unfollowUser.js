
'use strict';

const dynamodb = require("../dynamodb");
const resTemplate = require("../response");
const Promise = require("promise");

function isValidateRequest(event) {
    const body = JSON.parse(event.body || "{}")
    const userId = event.pathParameters.userId + '';
    const followedUserId = body.followedUserId + '';
    if (userId === undefined) {
        console.log("Missing User Id");
        return false;
    }
    if (followedUserId === undefined) {
        console.log("Missing Follow User Id");
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        callback(null, resTemplate.errorResponse(400, "Bad Request", "invalid Unfollow User input"));
        return;
    }
    
    const userId = event.pathParameters.userId + '';
    const body = JSON.parse(event.body || "{}");
    const followedUserId = body.followedUserId + '';
    const timestamp = new Date().getTime();
    
    function updateUserFollowTable() {
        return new Promise(function(resolve, reject) {
            console.log("Updating UserLikeFeedTable....");
            
            const params = {
                TableName: process.env.USER_FOLLOW_TABLE,
                Key: {
                    "userId": userId,
                    "followedUserId": followedUserId
                }
            };
            
            dynamodb.delete(params, (error) => {
                // handle potential errors
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(true);
            });
        });
    }
   
    function isFollowUser() {
        return new Promise((resolve, reject) => {
            console.log("Checking Followed User Or Not....");
            const params = {
                TableName: process.env.USER_FOLLOW_TABLE,
                KeyConditionExpression: "userId = :userId and followedUserId = :followedUserId",
                ExpressionAttributeValues: {
                    ":userId":userId,
                    ":followedUserId":followedUserId
                }
            };
            
            // fetch all follwers by give user Id
            dynamodb.query(params, (error, result) => {
                // handle potential errors
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                const exist = result.Count > 0 ? true : false;
                resolve(exist);
            });
        });
    }
    
    isFollowUser().then((exist) => {
        console.log("User already followed = " + exist)
        if (exist === true) {
            console.log("Update user followed = " + exist)
            return Promise.all([updateUserFollowTable()]);
        }
    }).then((res) => {
        callback(null, resTemplate.successResponse(200));
    })
    .catch((error) => {
        console.error(error);
        callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t unfollow user."));
    })
};
