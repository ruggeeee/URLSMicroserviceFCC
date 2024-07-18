require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var dns = require('dns');
var urlparser = require('url');
var app = express();

// Enable CORS so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Middleware to handle form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Add this line to handle JSON data

// Serve static files
app.use(express.static('public'));

// Default route for the main page
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Temporary in-memory store
const urls = [];
let id = 0;

// Function to validate URLs
function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

// POST route to handle URL shortening
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  console.log(req.body); // Log the request body

  // Validate the URL using the URL constructor
  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Parse the URL to get the hostname
  const urlObj = urlparser.parse(url);
  dns.lookup(urlObj.hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    } else {
      id++;
      urls.push({ id, url });
      res.json({
        original_url: url,
        short_url: id
      });
    }
  });
});

// GET route to handle redirection
app.get('/api/shorturl/:id', (req, res) => {
  const shortUrl = parseInt(req.params.id, 10);
  const urlObj = urls.find(u => u.id === shortUrl);
  if (urlObj) {
    res.redirect(urlObj.url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Listen for requests
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
