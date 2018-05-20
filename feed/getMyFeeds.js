'use strict';

exports.handler = function(event, context, callback) {

    const myFeeds = [
        {
            "title": "my new feed 1",
            "image_url": "http://www.google.com"
        },
        {
            "title": "my new feed 2",
            "image_url": "http://www.google.com"
        },
    ];
    
    const body = {
        message: "success",
        feeds: myFeeds
    };
    
    const response = {
        statusCode: 200,
        body: body,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }; 
    
    callback(null, response);
};
