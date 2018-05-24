'use strict';

// const dynamodb = require("../dynamodb");

const uuid = require("uuid");

function isValidUser(user) {
    return true;
}

exports.handler = (event, context, callback) => {
    console.log("body = ", event.body);
    const data = JSON.parse(event.body || "{}");
    const timestamp = new Date().getTime();

    if (isValidUser(data) === false) {
        console.error('invalid data');
        const body = {
            error: "Bad Request",
            message: "invalid user input" 
        };
            
        const response = {
            statusCode: 400,
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

    //const userId = data.userId;

    const params = {
        TableName: process.env.USER_TABLE,
        Key: {
            "userId": event.body.userId
        },
        UpdateExpression: "set imageUrl = :imageUrl",
        ExpressionAttributeValues: {
            ":imageUrl": event.body.imageUrl
        },
        ReturnValues:"UPDATED_NEW"
    };

    dynamodb.update(params, (error) => {
        
        // handle potential errors
        if (error) {
            console.error(error);
            
            const body = {
                error: "Unable to update user." + error + params.Key.userId + data,
                message: "Couldn\'t update user." 
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
            message: "Successfully Updated",
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

