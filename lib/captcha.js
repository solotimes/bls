var Canvas = require('canvas');

function randomString()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = function(params){
    if(typeof params == 'string')
        params = { url: params };
    params.color = params.color || '#fff';
    params.background = params.background || 'rgb(102,102,102)';

  return function(req, res, next){
    if(req.url != params.url)
      return next();

    var canvas = new Canvas(86, 22);
    var ctx = canvas.getContext('2d');
    ctx.antialias = 'gray';
    ctx.fillStyle = params.background;
    ctx.fillRect(0, 0, 86, 22);
    ctx.fillStyle = params.color;
    ctx.lineWidth = 1;
    ctx.strokeStyle = params.color;
    ctx.font = '16px sans';

    // for (var i = 0; i < 2; i++) {
    //   ctx.moveTo(5, Math.random() * 86);
    //   ctx.bezierCurveTo(5, Math.random() * 20, 70, Math.random() * 20, 90, Math.random() * 20);
    //   ctx.stroke();
    // }

    var text = randomString();
    for (i = 0; i < text.length; i++) {
      ctx.setTransform(Math.random() * 0.5 + 1, Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.5 + 1, 16 * i, 18);
      ctx.fillText(text.charAt(i), 0 , 0);
    }
    canvas.toBuffer(function(err, buf) {
      if(req.session){
        req.session.captcha = text.toLowerCase();
      }
      res.end(buf);
    });
  };
};