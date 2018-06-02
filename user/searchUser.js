const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const dynamodb = require("../dynamodb");

exports.handler = (event, context, callback) => {
    // if (!event.requestContext.authorizer) {
    //     errorResponse('Authorization not configured', context.awsRequestId, callback);
    //     return;
    // }

    console.log("Event Request Authorizer => " +event.requestContext.authorizer);

    const userId = event.pathParameters.userId + '';
    
    var filterExpression = "";
    var searchFilter = "";
  
    if (event.queryStringParameters.searchFilter !== undefined &&
        event.queryStringParameters.searchFilter !== "") {
        searchFilter = event.queryStringParameters.searchFilter;
        filterExpression = "contains(userName, :searchFilter) or contains(email, :searchFilter) or contains(userNameSearch, :searchFilter)";
        // filterExpression = "contains(userName, :searchFilter)"; 
    }

    var params = "";
    
    if (searchFilter !== "") {
        params = {
            TableName: process.env.USER_TABLE,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: {
                ":searchFilter": searchFilter
            }
    
        };
    } else {
        params = {
            TableName: process.env.USER_TABLE
        };
    }
  
    dynamodb.scan(params, (error, result) => {
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

        var userList = [];
    
        if (result.Items.length === 0) {
            console.log("No User for this search String => " + searchFilter);
            const body = {
                message: "success",
                users: userList
            };
            
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

        console.log("No User for this search String => " + searchFilter);
        result.Items.forEach(user => {
            console.log("User Id =>" + userId);
            console.log("Followed User Id =>" + user.userId);
            const paramsUser = {
                TableName: process.env.USER_FOLLOW_TABLE,
                FilterExpression: "userId = :userId and followedUserId = :followedUserId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                    ":followedUserId": user.userId
                }
            };

            dynamodb.scan(paramsUser, (error, userResult) => {
                if (error) {
                    console.error(error);
                }
                console.log("User Result =>" + userResult.Items);
                console.log("User Result JSON => " + JSON.stringify(userResult.Items));

                if (userResult.Items.length === 1) {
                    user.follow = true;
                } else {
                    user.follow = false;
                }
                userList.push(user);
                
                if(userList.length === result.Items.length){
                    const body = {
                        message: "success",
                        users: userList
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


