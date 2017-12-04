var Handlebars=require('handlebars');
var HandlebarsIntl = require('handlebars-intl');
HandlebarsIntl.registerWith(Handlebars);
const PORT=9090;
const fs = require('fs');
const http = require('http');
var url = require('url');
var req = require('request');
var striptags = require('striptags');
var sanitizeHtml = require('sanitize-html');
var requestImageSize = require('request-image-size');
//var options = {
  //key: fs.readFileSync('/etc/letsencrypt/live/amp.shuvayatra.org/privkey.pem'),
  //cert: fs.readFileSync('/etc/letsencrypt/live/amp.shuvayatra.org/fullchain.pem')
//};

var view=fs.readFileSync('views/index.handlebar','utf8');
const articleView=fs.readFileSync('views/article.handlebar','utf8');
Handlebars.registerPartial('article',articleView);
const audioView=fs.readFileSync('views/audio.handlebar','utf8');
Handlebars.registerPartial('audio',audioView);
const videoView=fs.readFileSync('views/video.handlebar','utf8');
Handlebars.registerPartial('video',videoView);
var template = Handlebars.compile(view);

http.createServer( function(request, response) {

    if(request.url.match(/^\/post/)){
        var params=request.url.split('/');

        req({

            // url:'https://raw.githubusercontent.com/aregmee/smart_test/master/index.html',
            url:'https://api.shuvayatra.org/v1/api/posts/' + params[2],
        },(error, resp, body) =>{

            if(!error){

                var data;

                try{

                    data = JSON.parse(body);
                    switch (data.type) {
                        case 'text':
                            data.is_article=true;
                            data.schemaType="NewsArticle";
                            break;
                        case 'audio':
                            data.is_audio=true;
                            data.schemaType="AudioObject";
                            break;
                        case 'video':
                            data.is_video=true;
                            data.schemaType="VideoObject";
                            data.data.video_id=YouTubeGetID(data.data.media_url);
                            break;
                    }

                    req({

                        url:'http://api.shuvayatra.org/v1/api/screens'
                    },(error, resp, body) =>{

                        if(!error){

                            if(data.type!=='video' && data.featured_image!==null && data.featured_image!==''){
                                requestImageSize(data.featured_image, function(err, size, downloaded) {

                      if (err) {
                        return console.error('An error has ocurred:', error);
                      }

                      if (!size) {
                        return console.error('Could not get image size');
                      }
                      data.featured_image_info=size;
                      data=formatData(data,body);
                      response.end(template(data));
                      });
                  } else {
                      data=formatData(data,body);
                      response.end(template(data));
                  }

                } else{
                  console.log(error);
                }

          });

                }catch(e){

                    data = JSON.parse('{}');
                    data.created_at = new Date();
                    data.updated_at = new Date();
                    data.id = params[2];
                    data = formatData(data, '{}');
                    data.is_article=true;
                    data.schemaType="NewsArticle";
                    data.description = "Server has encountered an error";
                    response.end(template(data));
                    console.error('params[2] is : ' + params[2]);
                    return console.error('An error has occurred:', e);
                }
            };
        });
    }

}).listen(PORT);
console.log('listening on '+PORT);

function formatData(data,body){
  data.description=sanitizeHtml(data.description);
  data.menu=JSON.parse(body);
  data.published=new Date(data.created_at * 1000);
  data.published_iso=data.published.toISOString();
  data.modified=new Date(data.updated_at * 1000);
  data.modified_iso=data.modified.toISOString();
  data.canonical_url="https://app.shuvayatra.org/post/"+data.id;
  data.amp_url="https://amp.shuvayatra.org/post/"+data.id;
  data.excerpt=striptags(data.description).substring(0,150);
  return data;
}

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
