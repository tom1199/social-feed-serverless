'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
exports.handler = (event, context, callback) => {
    console.log('Received event:', event);

    // publish message
    const params = {
        Message: event.message,
        PhoneNumber: event.phoneNumber
    };
    SNS.publish(params, callback);
};
