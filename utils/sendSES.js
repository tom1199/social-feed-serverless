'use strict';

var aws = require('aws-sdk');
var ses = new aws.SES({
   region: 'us-west-2'
});

exports.handler = function(event, context) {
    console.log("Incoming: ", event);

    var eParams = {
        Destination: {
            ToAddresses: [event.email]
        },
        Message: {
            Body: {
                Text: {
                    Data: event.content
                }
            },
            Subject: {
                Data: event.subject
            }
        },
        Source: event.email
    };

    console.log('===SENDING EMAIL===');
    var email = ses.sendEmail(eParams, function(err, data){
        if(err) console.log(err);
        else {
            console.log("===EMAIL SENT===");
            context.succeed(event);

        }
    });

};