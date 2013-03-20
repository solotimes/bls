/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-10
 * Time: 下午5:42
 */
var crypto = require('crypto'),
    moment = require('moment');

function encode(inputStr)
{
    return crypto.createHash('sha1').update(inputStr).digest('hex');
}

function getCurrentTime()
{
    var now = moment(new Date());
    return now.format("YYYY-MM-DD HH:mm:ss");
}

exports.encode = encode;
exports.getCurrentTime = getCurrentTime;