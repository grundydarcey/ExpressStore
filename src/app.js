/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());
app.use(cors());

app.post('/', (req, res) => {
  console.log(req.body);
  res
    .send('POST request received.');
});

app.post('/user', (req, res) => {
  const { username, password, favoriteClub, newsLetter=false } = req.body;
  if (!username) {
    return res
      .status(400)
      .send('Username required');
  }

  if(!password) {
    return res
      .status(400)
      .send('Password required');
  }

  if (!favoriteClub) {
    return res
      .status(400)
      .send('favorite Club required');
  }

  
Introduction to Databases
Introduction to SQL
Databases with Node
Building services
Databases with Express
POST and DELETE with PostgreSQL
RESTful APIs
Relationships and schema design
Add relationships to Blogful
Deploying a database
POST and DELETE requests
Objective: By the end of this checkpoint, you can build an API with GET, POST and DELETE endpoints.

So far we have built Express servers with GET endpoints and have used HTTP to request data from the server. In response, the server constructs an HTTP response consisting of headers and data and sends it back to the client. We also saw that we can send query parameters to the server and in the endpoint handler function access those query parameters via the req.query object to modify the behavior of the endpoint.

In this checkpoint, we'll begin working on POST and DELETE endpoints.

Key Terms:

POST
DELETE
Request
Response
express.json()
POST
A POST request is typically used to send data that is then stored on the server in some way, most often in a database system. Some examples of functions that POST was designed to cover are:

posting messages to bulletin boards, or lists like Reddit, Facebook, Twitter and so on
adding a new user on a signup page
submitting blocks of data via a form
adding new data to a database
We have seen the HTTP request before, but we'll examine it a little more here. HTTP requests consist of some headers and a body. The data in a POST request is placed in the body of the request.

Traditionally, data was submitted to the server via form submissions on the client. This allowed data to be sent in one of the following formats:

application/x-www-form-urlencoded: key:value pairs separated by &
multipart/form-data: form binary data
text/plain
For example, a typical login form like this:

<!-- HTML code for a login form -->
<form method="post" action="/auth/login">
  <label for="username">Username: </label>
  <input type="text" name="user" id="username" />
  <label for="password">Password: </label>
  <input type="password" name="pw" id="password"/>
  <input type="submit" value="LOGIN" />
</form>
may result in an HTTP request like this:

POST /auth/login HTTP/1.1
Host: localhost:8000
Accept-Language: en-us
Content-Type: application/x-www-form-urlencoded
Accept-Encoding: gzip, deflate
User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)
Content-Length: 37
Connection: Keep-Alive
Cache-Control: no-cache

User=stan&pw=lee
More common in our React clients we send an HTTP request using the fetch API. In those cases, there is some more flexibility in the data. For instance, we may send JSON data. For example, a typical fetch call may look like this:

const data = {
  user: "stan",
  pw: "lee"
};
fetch('http://localhost:8000/auth/login', {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
})
.then(...)
Resulting in a HTTP request that looks like this:

POST /auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
    "user": "stan",
    "pw": "lee"
}
In the examples above the type of data in the request was controlled by the Content-Type header. The server will depend on this header to determine how to parse and use the data.

Handling POST requests in Express
Similar to the way we created a GET endpoint with Express's .get() method, we can use the .post() method to add handlers for HTTP POST requests on a particular path. For example:

app.post('/', (req, res) => {
  res.send('POST Request received');
});
Endpoints
A route path in combination with the request method defines an endpoint to which requests may be made. For instance, if we are building a server to manage cards (as in the Trello app) we would need an endpoint to get a list of existing cards and another for creating a new card. Both endpoints can be made on the same path and distinguished by the HTTP method.

app.get('/card', (req, res) => {
  // return a list of cards
});

app.post('/card', (req, res) => {
  // create a new card
});
Clone your express-boilerplate repo to start a new project called express_store and replace the "Hello, world!" endpoint with a simple POST endpoint like this:

app.post('/', (req, res) => {
  res
    .send('POST request received.');
});
Start the server and open Postman. First, try to make a GET request to http://localhost:8000/. Since the server does not have a GET / endpoint you get a 400 Not Found response. Now make a POST request to the same URL. This time the response from the endpoint returns as expected.

Add a GET endpoint handler to app.js.

app.get('/', (req, res) => {
  res
    .send('A GET Request');
});
Once again try a GET request to the same URL in Postman. This time the request is satisfied.

Parsing the Body
As we discussed above, the body may consist of a wide variety of data. For this example, we want to work with JSON because that format makes it easy to manipulate the data.

On the server-side, we need a way of knowing what format that data is in. Even if a client says it's sending data in JSON, how do we know that the JSON is properly formatted? Rather than implement all that logic ourselves, we can use one of the many pre-built middleware in the Express ecosystem. We will use the built-in express.json() middleware to parse the body and give us a properly formatted object to work with.

First, let's see what the body of the POST request looks like. Modify the POST endpoint to console.log() the req.body.

  app.post('/', (req, res) => {
+   console.log(req.body);
    res
      .send('A POST Request');
  });
Invoke this endpoint in Postman, then look at the terminal to see the output. The body is undefined. This is because Express, by default, does not parse the body of the request. In order to parse the body of the request, we must apply some middleware:

  const app = express();
  app.use(morgan('dev'));
+ app.use(express.json());
Invoke the POST endpoint again in Postman and look at the terminal. This time, the request body is {} - an empty object. The object is empty because we did not provide any data in the request. In Postman, click on the Body tab, select raw and select JSON (application/json) from the drop-down.

Add body to request

Then type some JSON similar to the example in the screenshot. You can see the raw HTTP request being sent to the server by clicking the Code button on the right-hand side of the Postman screen. It displays something like this:

POST / HTTP/1.1
Host: localhost:8000
Content-Type: application/json
cache-control: no-cache
{
  "name": "Samwise Gamgee",
  "status": "Hero",
  "role": "companion",
  "race": "Hobbit"
}------WebKitFormBoundary7MA4YWxkTrZu0gW--
The most important part to notice is the Content-Type header. It tells the server that the body contains JSON formatted data. Click send, then look at the terminal to see how Express parses the body. This time you see that the request body contains an object corresponding to the body data sent in the request.

{ name: 'Samwise Gamgee',
  status: 'Hero',
  role: 'companion',
  race: 'Hobbit' }
Just to illustrate the importance of the Content-Type header, select Text from the drop-down in Postman. Click on the Code button to view the request. Notice that the Content-Type header was removed. This simply indicates that the body is not formatted in any particular way. Now click Send and look at the terminal window to see what the request body contains. Again it only contains an empty object, {}. The Express json middleware only parses the body if the Content-Type is set to application/json.

This is an important example for understanding how the client and server must work together. If you're building a full stack app, it's important to make sure your client includes the appropriate headers in its requests. Or if you're building a server to support many different client apps (like the YouTube API, for example) you need to provide documentation on which headers a request needs to include.

At this point, we have the request body object and can access the data sent from the client. Now, let's discuss how that data is processed in the POST endpoint.

Processing the data
Now that we have the data, what do we do with it? It varies of course from application to application, but generally, the purpose of the POST method is to store new data on the server.

Storing data on the server to be retrieved later and processed further requires some sort of data storage facility, most commonly a database system. Later in this module, you will be introduced to one such database system. In the meantime, to explore how the POST method works we will simply store the data in memory. This is nowhere near adequate for real applications as the data in memory is lost every time the server is restarted. But it will work for now.

Validation
We do not trust data from the client. We may be expecting a username and password, but there's nothing to stop a client from sending us anything. We should always assume that the data we receive will not be valid.

In fact, we should go one step further and assume that the client is being malicious and write our code with that attitude. This defensive coding is necessary in the wild world of the Internet where our applications live. The first step is to validate the data that we get from the client.

We have already seen a few examples of validation in previous examples. Let's look at a simple user registration example that validates the details. We will build a POST /user endpoint for Curling enthusiasts in Utah to register themselves on a fan site. The endpoint will accept user details in this format:

{
  "username": "String between 6 and 20 characters",
  "password": "String between 8 and 36 characters, must contain at least one number",
  "favoriteClub": "One of 'Cache Valley Stone Society', 'Ogden Curling Club', 'Park City Curling Club', 'Salt City Curling Club' or 'Utah Olympic Oval Curling Club'",
  "newsLetter": "True - receive newsletters or False - no newsletters"
}
Yes, there are 5 Curling clubs in Utah, and fun fact, there is a Curling club in Hawaii too.

Add the following endpoint to app.js in your express_store project.

app.post('/user', (req, res) => {
  // get the data
  const { username, password, favoriteClub, newsLetter } = req.body;

// validation code here

});
Validation is a wide and complex topic and can consume much of the time we spend writing server code. There are several libraries available that try to encapsulate validation rules, but they are so varied that we will look at a few options ourselves.

First, we need to consider if the value is required or not, and if it is not required what do we do if it is not provided. For example, if we require an address from the client we may say that the street address, the city, state, zip code and country are required, you cannot have a valid address without those values, but the building or apartment number is optional, not every address has one of those. Sometimes the optional fields may take a default value if that makes sense.

In the Curling example, it makes sense to default the newsLetter parameter to false and make it optional. The other values are required. To set a default value if one is not provided we can make use of the default value feature of the object destructuring statement.

- const { username, password, favoriteClub, newsLetter } = req.body;
+ const { username, password, favoriteClub, newsLetter=false } = req.body;
This way, if the body does not contain a newsLetter property, the value will be set to false. We want to be a bit more explicit in the check for the required values.

// validation code here
if (!username) {
  return res
    .status(400)
    .send('Username required');
}

if (!password) {
  return res
    .status(400)
    .send('Password required');
}

if (!favoriteClub) {
  return res
    .status(400)
    .send('favorite Club required');
}
If a required value is provided, we then have to check the type of the value, if a number is required was a number provided? Then if the correct data type was provided is the value formatted correctly? For instance, if a date is expected then the value provided must conform to some recognizable date format. Or an email must conform to valid email format.

if (username.length < 6 || username.length > 20) {
  return res
    .status(400)
    .send('Username must be between 6 and 20 characters');
}

// password length
if (password.length < 8 || password.length > 36) {
  return res
    .status(400)
    .send('Password must be between 8 and 36 characters');
}

// password contains digit, using a regex here
if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
  return res
    .status(400)
    .send('Password must be contain at least one digit');
}
});

app.get('/', (req, res) => {
  res
    .send('A GET Request.');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;