// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  clientKey: 'musts16-ceps', 
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  push: {
    android: {
      senderId: '787525490129', // The Sender ID of GCM
      apiKey: 'AIzaSyCd0nTCBYEUYYXflqAtxTp2u0uefuvS7O4' // The Server API Key of GCM
    },
    ios: [{
      pfx: 'certs/lazy_prod_push.p12', // the path and filename to the .p12 file you exported earlier. 
      cert: '', // If not using the .p12 format, the path to the certificate PEM to load from disk
      bundleId: 'com.lazy.customer', // The bundle identifier associated with your app
      key: '', // If not using the .p12 format, the path to the private key PEM to load from disk
      production: true // Specifies which environment to connect to: Production (if true) or Sandbox
    },
    {
      pfx: 'certs/lazy_prod_push.p12', // the path and filename to the .p12 file you exported earlier. 
      cert: '', // If not using the .p12 format, the path to the certificate PEM to load from disk
      bundleId: 'com.lazy.cleaner', // The bundle identifier associated with your app
      key: '', // If not using the .p12 format, the path to the private key PEM to load from disk
      production: true // Specifies which environment to connect to: Production (if true) or Sandbox
    }]
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
