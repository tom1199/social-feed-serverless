'use strict';

const dynamodb = require("../dynamodb");
const uuid = require("uuid");

function isValidateFeed(feed) {
    if (feed.imageUrl === undefined) {
        return false;
    }
    return true;
}

exports.handler = function(event, context, callback) {
    console.log("body = ", event.body);
    const data = JSON.parse(event.body || "{}");
    const timestamp = new Date().getTime();
    
    if (isValidateFeed(data) === false) {
        console.error('invalid data');
        const body = {
            error: "invalid data",
            message: "invalid feed input" 
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
    
    const params = {
        TableName: process.env.FEED_TABLE,
        Item: {
            id: uuid.v1(),
            title: data.title,
            imageUrl: data.imageUrl,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    // write the todo to the database
    dynamodb.put(params, (error, data) => {
        
        // handle potential errors
        if (error) {
            console.error(error);
            
            const body = {
                error: "Couldn\'t create new feed.",
                message: "Couldn\'t create new feed." 
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
            feed: data
        };
    
        const response = {
            statusCode: 201,
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
