const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const dynamodb = require("../dynamodb");
//const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    // if (!event.requestContext.authorizer) {
    //     errorResponse('Authorization not configured', context.awsRequestId, callback);
    //     return;
    // }
    const requestBody = JSON.parse(event.body || "{}");

    // var users = searchUser(requestBody);

    
    const params = {
        TableName: process.env.USER_TABLE
    };

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



function searchUser(requestBody) {
    // var userId = requestBody.userId ? undefined : "";
    // var userName = requestBody.userName ? undefined : "";
    // var email = requestBody.email ? undefined : "";

    // const params = {
    //     TableName: process.env.UserTable,
    //     FilterExpression: "userId = :id or userName CONTAINS :name or email CONTAINS :email",
    //     ExpressionAttributeValues: {
    //         ":id": userId,
    //         ":userName": userName,
    //         ":email": email
    //     }
    // };

    const params = {
        TableName: process.env.USER_TABLE
    };

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

        return result.Items;


    });
    // const users = [
    //     {
    //         "userId": 1,
    //         "name": "Win",
    //         "email": "win@gmail.com",
    //         "follow": true,
    //         "image_url": "www.google.com"
    //     },
    //     {
    //         "userId": 2,
    //         "name": "Treza",
    //         "email": "treza@gmail.com",
    //         "follow": true,
    //         "image_url": "www.google.com"
    //     },
    //     {
    //         "userId": 3,
    //         "name": "Tom",
    //         "email": "tom@gmail.com",
    //         "follow": true,
    //         "image_url": "www.google.com"
    //     }
    // ];
    // return users;
    
}