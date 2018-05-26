'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

exports.handler = (event, context, callback) => {
    var params = {
      Message: event.content,
      Subject: event.subject,
      TopicArn: 'arn:aws:sns:ap-southeast-1:560522575826:notifyPicturePost'
    };
    SNS.publish(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
};
