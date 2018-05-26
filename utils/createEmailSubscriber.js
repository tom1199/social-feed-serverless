'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

exports.handler = (event, context, callback) => {
    console.log('Received event:', event);
var params = {
  Protocol: 'email',
  TopicArn: 'arn:aws:sns:ap-southeast-1:560522575826:notifyPicturePost',
  Endpoint: event.email
};
SNS.subscribe(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
};