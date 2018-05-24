const _ = require("lodash");

exports.errorResponse = function(code, error, messsage) {
    return {
        statusCode: code,
        headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            error: error,
            message: messsage
        }),
        isBase64Encoded: false
    }
}

exports.successResponse = function(code, payload) {
    var body = {message: "success"};
    body = _.assign({}, body, payload || {});
    return {
        statusCode: code,
        headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(body),
        isBase64Encoded: false
    }    
}