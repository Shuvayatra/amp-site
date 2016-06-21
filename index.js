var Handlebars=require('handlebars');
var HandlebarsIntl = require('handlebars-intl');
HandlebarsIntl.registerWith(Handlebars);
const PORT=443;;
const fs = require('fs');
const http2 = require('http2');
var req = require('request');
var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/amp.shuvayatra.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/amp.shuvayatra.org/fullchain.pem')
};

var view=fs.readFileSync('views/index.handlebar','utf8');
const articleView=fs.readFileSync('views/article.handlebar','utf8');
Handlebars.registerPartial('article',articleView);
const audioView=fs.readFileSync('views/audio.handlebar','utf8');
Handlebars.registerPartial('audio',audioView);
const videoView=fs.readFileSync('views/video.handlebar','utf8');
Handlebars.registerPartial('video',videoView);
var template = Handlebars.compile(view);

http2.createServer(options, function(request, response) {
    console.log(request.url);
    if(request.url.match(/^\/post/)){
      console.log('handling post request');
      var params=request.url.split('/');
      console.log(params);
        req({
            url:'http://api.shuvayatra.org/api/post/'+params[2],
            headers:{
              token:'e9005151e1cb26445120f14e46ef07bbf5e6df93'
            }
          },(error, resp, body) =>{
	    if(!error){
            var data=JSON.parse(body);

            switch (data.type) {
                case 'article':
                  data.is_article=true;
                  break;
                case 'audio':
                  data.is_audio=true;
                  break;
                case 'video':
                  data.is_video=true;
                  data.data.video_id=YouTubeGetID(data.data.media_url);
                  break;

            }
            data.published=new Date(data.created_at * 1000);
            response.end(template(data));
		}
		else{
			console.log(error);
		}
          });

    }

}).listen(PORT);
console.log('listening on '+PORT);

function YouTubeGetID(url){
  var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
    return ID;
}
