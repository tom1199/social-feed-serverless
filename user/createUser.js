'use strict';

const dynamodb = require("../dynamodb");
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

    const newUser = {
        id: uuid.v1(),
        userName: data.userName,
        userNameSearch: data.userName.toLowerCase(),
        imageUrl: 'default.jpg',
        email: data.email,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    const params = {
        TableName: process.env.USER_TABLE,
        Item: newUser,
    };

     dynamodb.put(params, (error) => {
        
        // handle potential errors
        if (error) {
            console.error(error);
            
            const body = {
                error: "Couldn\'t create new user.",
                message: "Couldn\'t create new user." 
            };
            
            const response = {
                statusCode: error.statusCode || 501,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(params),
                isBase64Encoded: false
            }
            
            callback(null, response);
            
            return;
        }
        
        const body = {
            message: "success",
            feed: newUser
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

