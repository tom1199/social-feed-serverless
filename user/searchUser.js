const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    // if (!event.requestContext.authorizer) {
    //     errorResponse('Authorization not configured', context.awsRequestId, callback);
    //     return;
    // }
   // const requestBody = JSON.parse(event.body);

    //var users = searchUser(requestBody);
    const users = [
        {
            "userId": 1,
            "name": "Win",
            "email": "win@gmail.com",
            "follow": true,
            "image_url": "www.google.com"
        },
        {
            "userId": 2,
            "name": "Treza",
            "email": "treza@gmail.com",
            "follow": true,
            "image_url": "www.google.com"
        }
    ];
    
    

    const response = {
        statusCode: 200,
        body: JSON.stringify(users),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        isBase64Encoded: false
    }
   
    callback(null, response);
}

function searchUser(requestBody) {
    const users = [
        {
            "userId": 1,
            "name": "Win",
            "email": "win@gmail.com",
            "follow": true,
            "image_url": "www.google.com"
        },
        {
            "userId": 2,
            "name": "Treza",
            "email": "treza@gmail.com",
            "follow": true,
            "image_url": "www.google.com"
        }
    ];
    return users;
}