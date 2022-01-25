// import express from 'express';
import * as express from 'express';
import {Request,Response} from 'express';
import * as path from "path";

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/',function(req:Request,res:Response){
    res.sendFile(path.resolve("./public/covid.html"));
})

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/`);
});


// https server
var fs = require('fs');
var https = require('https')
var privateKey = fs.readFileSync('sslcert/selfsigned.key', 'utf8');
var certificate = fs.readFileSync('sslcert/selfsigned.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

const PORT_HTTPS = 8443
httpsServer.listen(PORT_HTTPS, () => {
    console.log(`Listening at https://localhost:${PORT_HTTPS}/`)
});