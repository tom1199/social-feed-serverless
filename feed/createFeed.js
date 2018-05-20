'use strict';

exports.handler = function(event, context, callback) {

    const newFeed = {
        "title": "my new feed",
        "image_url": "http://www.google.com"
    };
    
    const body = {
        message: "success",
        feed: newFeed
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
};
