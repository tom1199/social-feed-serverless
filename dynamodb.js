'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

let options = {region: 'ap-southeast-1'};

// connect to local DB if running offline
if (process.env.AWS_SAM_LOCAL) {
  options.endpoint = 'http://dynamodb:8000';
}

const client = new AWS.DynamoDB.DocumentClient(options);

module.exports = client;