const bodyParser = require('body-parser');
const express = require('express');
const sqlServer = require('./sqlServer/sqlserver');

const PORT = 3000;
const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.post('/sqlserver', sqlServer);

const server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server listening at http://%s:%s", host, port)
});