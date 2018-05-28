'use strict';

const dynamodb = require("../dynamodb");

function isValidateRequest(event) {
    if (event.queryStringParameters.ownerId === undefined) {
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    
    if (isValidateRequest(event) === false) {
        console.error('invalid data');
        const body = {
            error: "Bad Request",
            message: "Missing owner id." 
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
    
    const ownerId = event.queryStringParameters.ownerId;
    
    const params = {
        TableName: process.env.FEED_TABLE,
        FilterExpression: "ownerId = :id",
        ExpressionAttributeValues: {
            ":id": ownerId
        }
    };

    // fetch all feeds created by given user id from the database
    dynamodb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            
            const body = {
                error: "Internal Server Error",
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
            feeds: result.Item
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
