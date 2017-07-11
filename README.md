# Accelerated Mobile Page Node JS App For Shuvayatra
To accelerate mobile page loading on mobile phone, we build the AMP app for Shuavayatra to show post page only in AMP format. This build with NodeJS.

### Overview
The AMP app build using simple NodeJS without any framework. It's using Handlebar as templeting engine to render the view. The app working behind Nginx under amp.shuvayatra.org sub domain. So the request will not hit directly the app but it goes through NGINX. 

### Deployment
1. Clone the code from Github `https://github.com/Shuvayatra/amp-site.git shuvayatra-amp`
2. Switch to code directory and run `npm install` to install all packages needed by this app
3. We use [PM2 process manager](http://pm2.keymetrics.io/) for Node App. Install pm2 NPM package globally to run node js app as a service `sudo npm install pm2 -g`
4. Run the Shuvayatra AMP app by call `pm2 start index.js --name amp`
5. You can check if the app already running by call `pm2 list`
6. Make sure your pm2 will run when the server start by running `sudo env PATH=$PATH:/usr/local/bin pm2 startup -u www-data`. 
