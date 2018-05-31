const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const dynamodb = require("../dynamodb");

function isValidateRequest(event) {
    const body = JSON.parse(event.body || "{}")
    const userId = event.pathParameters.userId;
    
    if (userId === undefined) {
        console.log("Missing user id");
        return false;
    }
    
    return true;
}

exports.handler = (event, context, callback) => {
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        
        callback(null, resTemplate.errorResponse(400, "Bad Request", "Missing User Id"));
        return;
    }
    
    const userId = event.pathParameters.userId;

    const paramsFollwUser = {
        TableName: process.env.USER_FOLLOW_TABLE,
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };
   
    dynamodb.scan(paramsFollwUser, (error, result) => {
        if (error) {
            console.error(error);
            
            const body = {
                error: "Internal Server Error" + error,
                message: "Couldn\'t get feeds." 
            };
            const response = {
                statusCode: error.statusCode || 501,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(body),
                isBase64Encoded: false
            }
            
            callback(null, response);
            return;
        }

        var followUserList = [];

        console.log("Follow User List => " + result.Items)

        result.Items.forEach(followUser => {
            console.log("User Id =>" + followUser.userId);
            console.log("Followed User Id =>" + followUser.followedUserId);
            const paramsUser = {
                TableName: process.env.USER_TABLE,
                FilterExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": followUser.userId
                }
            };

            dynamodb.scan(paramsUser, (error, userResult) => {
                if (error) {
                    console.error(error);
                }
                console.log("User Result =>" + userResult.Items);
                console.log("User Result JSON => " + JSON.stringify(userResult.Items));
                followUserList.push(userResult.Items[0]);
                if(followUserList.length === result.Items.length){
                    const body = {
                        message: "success",
                        users: followUserList
                    };
                    
                    console.log("User Result JSON => " + JSON.stringify(userResult.Items));
                    const response = {
                        statusCode: 200,
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        isBase64Encoded: false
                    };
                    callback(null, response);
                }
            });
        });
    });
};