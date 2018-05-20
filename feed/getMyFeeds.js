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
    
    const response = {
        status: 200,
        feeds: myFeeds
    }; 
    
    callback(null, response);
};
