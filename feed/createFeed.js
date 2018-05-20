'use strict';

exports.handler = function(event, context, callback) {

    const newFeed = {
        "title": "my new feed",
        "image_url": "http://www.google.com"
    };
    
    const response = {
        status: 201,
        feed: newFeed
    }; 
    
    callback(null, response);
};
