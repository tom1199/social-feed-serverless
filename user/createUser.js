'use strict';

var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'ap-southeast-1'
});
const dynamodb = require("../dynamodb");
const uuid = require("uuid");

function isValidUser(user) {
    return true;
}

exports.handler = (event, context, callback) => {
    console.log(event);
    console.log(event.userName);
    // const data = JSON.parse(event || "{}");
    // console.log(data);
    const timestamp = new Date().getTime();

    if (isValidUser(event) === false) {
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

    // const newUser = {
    //     userId: uuid.v1(),
    //     userName: data.userName,
    //     userNameSearch: data.userName.toLowerCase(),
    //     imageUrl: 'default.jpg',
    //     email: data.email,
    //     createdAt: timestamp,
    //     updatedAt: timestamp,
    // };

    const newUser = {
        userId: event.userName,
        userName: event.userName,
        userNameSearch: event.userName.toLowerCase(),
        imageUrl: 'profile/default.jpeg',
        email: event.request.userAttributes.email,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    const params = {
        TableName: process.env.USER_TABLE,
        Item: newUser
    };

    dynamodb.put(params, (error) => {
        
        // handle potential errors
        if (error) {
            console.error(error);
            
            const body = {
                error: "Couldn\'t create new user." + error,
                message: "Couldn\'t create new user." 
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
            console.log("error");
            
            callback(null, response);
            
            return;
        }
        
        const body = {
            message: "success",
            feed: newUser
        };
    
        console.log("Before Response");
        const response = {
            statusCode: 201,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            isBase64Encoded: false
        };
    
        console.log(event);
        console.log("After Response");

        // var params = {
        //     FunctionName: 'awscodestar-social-feed-ser-CreateEmailSubscriber-19A93LXXT4QI0',
        //     Payload: JSON.stringify(newUser)
        //   };
        //   lambda.invoke(params, function(err, data) {
        //     if (err) console.log(err, err.stack); // an error occurred
        //     else     console.log("successfully register email.");   // successful response
        //   });

        callback(null, event);
    
    });
};

