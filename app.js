var http = require('http');
var fs = require('fs');
var { MongoClient } = require('mongodb');

var mongoUrl = "mongodb://127.0.0.1:27017/";
var client = new MongoClient(mongoUrl);

var server = http.createServer(async function (req, res) {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream('./index.html').pipe(res);
  } 
  else if (req.url === '/server' && req.method === 'POST') {
    var rawData = '';

    req.on('data', function (chunk) {
      rawData += chunk;
    });

    req.on('end', async function () {
      var inputdata = new URLSearchParams(rawData);

      var userObject = {
        name: inputdata.get('name'),
        password: inputdata.get('password'),
        age: inputdata.get('age'),
        mobile: inputdata.get('mobile'),
        email: inputdata.get('email'),
        gender: inputdata.get('gender'),
        state: inputdata.get('state'),
        skills: inputdata.getAll('skills').join(', ')
      };

      try {
        await client.connect();
        var dbo = client.db("kidsDB");
        await dbo.collection("kids_users").insertOne(userObject);
        console.log("1 Kid User record inserted successfully into MongoDB.");

        res.writeHead(200, { "Content-Type": "text/html" });
        var responseHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Kids Learning - Submitted Details</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 30px; }
              table { border-collapse: collapse; width: 50%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #ff6f61; color: white; }
              h2 { color: #2e7d32; }
            </style>
          </head>
          <body>
            <h2>Registration Successful!</h2>
            <h3>User Submitted Details</h3>
            <table>
              <tr><th>Field</th><th>Submitted Value</th></tr>
              <tr><td><b>Kid's Name</b></td><td>${userObject.name}</td></tr>
              <tr><td><b>Password</b></td><td>${userObject.password}</td></tr>
              <tr><td><b>Age</b></td><td>${userObject.age}</td></tr>
              <tr><td><b>Mobile Number</b></td><td>${userObject.mobile}</td></tr>
              <tr><td><b>Email</b></td><td>${userObject.email}</td></tr>
              <tr><td><b>Gender</b></td><td>${userObject.gender}</td></tr>
              <tr><td><b>State</b></td><td>${userObject.state}</td></tr>
              <tr><td><b>Selected Skills</b></td><td>${userObject.skills || 'None'}</td></tr>
            </table>
            <br>
            <a href="/">Back to Form</a>
          </body>
          </html>
        `;
        res.end(responseHTML);
      } catch (err) {
        console.error("Database error:", err);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("Database error occurred");
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("404 Not Found");
  }
});

server.listen(3000, function () {
  console.log('Kids Learning Server is running at http://localhost:3000');
});