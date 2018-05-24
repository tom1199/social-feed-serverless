const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const dynamodb = require("../dynamodb");
//const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    // if (!event.requestContext.authorizer) {
    //     errorResponse('Authorization not configured', context.awsRequestId, callback);
    //     return;
    // }
    
    var filterExpression = "";
    var searchFilter = "";
    var expressionAttribValues = "";

    if (event.queryStringParameters.searchFilter !== undefined) {
        searchFilter = event.queryStringParameters.searchFilter;
        filterExpression = "userId = :searchFilter or userName CONTAINS :searchFilter or email CONTAINS :searchFilter"
        
    } else {
        searchFilter = "1=1"
    }

    if (requestBody.searchFilter !== undefined) {
        searchFilter = requestBody.searchFilter;
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
        }
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


        const body = {
            message: "success",
            users: result.Items
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
    });
};


