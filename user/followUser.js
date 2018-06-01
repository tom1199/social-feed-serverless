
'use strict';

var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'ap-southeast-1'
});
const dynamodb = require("../dynamodb");
const resTemplate = require("../response");
const Promise = require("promise");

function isValidateRequest(event) {
    const body = JSON.parse(event.body || "{}");
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
        callback(null, resTemplate.errorResponse(400, "Bad Request", "invalid like input"));
        return;
    }
    
    const userId = event.pathParameters.userId;
    const body = JSON.parse(event.body || "{}");
    const followedUserId = body.followedUserId + '';
    const timestamp = new Date().getTime();
    
    function updateUserFollowTable() {
        return new Promise(function(resolve, reject) {
            const newFollwUser = {
                userId: userId,
                followedUserId: followedUserId,
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
                KeyConditionExpression: "userId = :userId and followedUserId = :follwedUserId",
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
                resolve(exist);
            });
        });
    }

    function getUser(uId) {
        return new Promise((resolve, reject) => {
            var params = {
                TableName: process.env.USER_TABLE,
                Key:{
                    "userId": uId
                }
            };
            
            dynamodb.get(params, function(err, data) {
                if (err) {
                    console.error("Unable to get user. Error JSON:", JSON.stringify(err, null, 2));
                    reject(err);
                } else {
                    console.log("Get User  succeeded:", JSON.stringify(data, null, 2));
                    resolve(data.Item);
                }
            });
        });
    }
    
    isFollowUser().then((exist) => {
        console.log("User already followed = " + exist);
        if (exist === false) {
            return Promise.all([updateUserFollowTable()]);
        }
    }).then((res) => {
        getUser(followedUserId).then((followUser) => {
            var followeremail = followUser.email;
            console.log("Follow User Email " + followeremail)
            const msg = {
                content: "Hello " + followedUserId + ",\nUser " + userId + " has started to follow you in Photo Sharing App",
                subject: "CLING CLING! Message from Photo Sharing App",
                email: followeremail
            };
            var params = {
                FunctionName: 'awscodestar-social-feed-ser-lambda-SendSES-EI4FFKRECN5V',
                Payload: JSON.stringify(msg)
              };
              lambda.invoke(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log("successfully send email."); // successful response
              });
        });
        
        callback(null, resTemplate.successResponse(200));
    })
    .catch((error) => {
        console.error(error);
        callback(null, resTemplate.errorResponse(error.statusCode || 501, "Internal Server Error", "Couldn\'t create new follow." + error));
    });
};
