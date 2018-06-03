
let AWS = require("aws-sdk");
let s3 = new AWS.S3();

let rekognition = new AWS.Rekognition({
  region: 'us-west-2'
});

var lambda = new AWS.Lambda({
  region: 'us-west-2'
});

var utils = {
  decodeKey: function(key) {
    return decodeURIComponent(key).replace(/\+/g, ' ');
  }
};

exports.handler = function(event, context) {
  // get S3 bucket
  var bucket = event.Records[0].s3.bucket.name;
  console.log("bucket " + bucket);
  var targetKey = utils.decodeKey(event.Records[0].s3.object.key);
  console.log("targetKey " + targetKey);
  
  // get all profile images
  var path_to_folder = 'public/profile/';
  var parameters= {Bucket: bucket, Delimiter: path_to_folder };
  s3.listObjects(parameters, function (err, data) {
  if (err) {
    console.log('Could not load objects from S3', err);
  } else {
      console.log('Loaded ' + data.Contents.length + ' items from S3');
      var bucketContents = data.Contents;
      for (var i = 0; i < bucketContents.length; i++){
        var sourceKey = bucketContents[i].Key;
        // console.log("sourceKey " + sourceKey);
        
        // compare input image to all existing profile images.
        processRekognition(bucket, sourceKey, targetKey);
        
      }
    }
  });
  
};

function processRekognition(bucket, sourceKey, targetKey) {
   let params = {
    SourceImage: {
      S3Object: {
        Bucket: bucket,
        Name: sourceKey
      }
    },
    TargetImage: {
      S3Object: {
        Bucket: bucket,
        Name: targetKey
      }
    }
  };

    rekognition.compareFaces(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
   
    if(data != null && data.FaceMatches.length>0) {
     console.log("Hoyayyy face match!!" + data.FaceMatches.length);
     
      const msg = {
        subject: "Alert from Social app",
        content: "Psss! The picture uploaded by someone. It might be you in that photo!!!",
        email: "trezabawmwin@gmail.com" // TODO : change to face detected profile picture's owner email
      };
      var params = {
        FunctionName: 'awscodestar-social-feed-ser-lambda-SendSES-EI4FFKRECN5V',
        Payload: JSON.stringify(msg)
      };
      console.log("Going to alert! ");
      lambda.invoke(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log("successfully send email."); // successful response
      });
   }
 });
};
