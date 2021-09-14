require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')
const config = require("./DBconnect");
const router = express.Router();
const app = express();
var con = config.connection


app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors())

var sess;

const path = require('path');
const util = require('util');

const PORT = process.env.PORT || 3001;

const plaid = require('plaid');
const plaidClient = new plaid.Client({
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET,
    env: plaid.environments.sandbox,
});

app.use(express.static(__dirname + '/frontEnd/views'));
var sess;

router.get('/',(req,res) => {
    sess = req.session;
    if(sess.email) {
        return res.redirect('/plaid');
    }
    res.sendFile('index.html');
});

router.post('/login',(req,res) => {
    sess = req.session;
    console.log(req.body.email);
    console.log(req.body.pass);
    var sql = "SELECT u.* FROM Users u WHERE u.email='"+req.body.email+"' AND u.password='"+req.body.pass+"'"
    con.query(sql, function (err, result) {
        if (err) {throw err;}
        if (result.length <= 0) {
            console.log("Wrong Email & Password Combination.")
            res.end("failed")
        }
        console.log(result);
        sess.email = req.body.email;
        //sess.accessToken = result[0].accessToken
        res.end('done');
    });
    
});

router.get('/plaid',(req,res) => {
    sess = req.session;
    if(sess.email) {
        res.sendFile('/frontEnd/plaid.html', {root: __dirname })
        //res.end('+'>Logout);
    }
    else {
        res.write('Please login first.');
        res.end('+'>'login');
    }
});

router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});

app.get('/create-link-token', async (req, res) => {
    const { link_token: linkToken } = await plaidClient.createLinkToken({
        user: {
            client_user_id: 'some-unique-identifier',
        },
        client_name: 'App of Rafael',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
    });

    res.json({ linkToken });
});

app.post('/token-exchange', async (req, res) => {
    sess = req.session;
    const { publicToken } = req.body;
    const { access_token: accessToken } = await plaidClient.exchangePublicToken(publicToken);
    console.log(accessToken);
    var sql = "UPDATE Users SET accessToken = '"+accessToken+"' WHERE Users.email = '"+sess.email+"'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result)
    });


    const authResponse = await plaidClient.getAuth(accessToken);
    console.log('Auth response:');
    console.log(util.inspect(authResponse, false, null, true));
    console.log('---------------');

    const identityResponse = await plaidClient.getIdentity(accessToken);
    console.log('Identity response:');
    console.log(util.inspect(identityResponse, false, null, true));
    console.log('---------------');

    const balanceResponse = await plaidClient.getBalance(accessToken);
    console.log('Balance response');
    for (let i = 0; i < balanceResponse.accounts.length; i++) {
        console.log("Name: " + balanceResponse.accounts[i].name);
        console.log("Type: " + balanceResponse.accounts[i].subtype);
    }
    console.log('---------------');
/*cle
    res.sendStatus(200);*/
});

app.post("/mytoken", async (req, res) => {
    sess = req.session;
    var sql = "SELECT u.accessToken from Users u WHERE u.email = '"+sess.email+"'"
    con.query(sql, async function (err, result) {
        if(err) throw err;
        console.log("1"+result)
        //sess.accessToken = result[0].accessToken
        try {
            console.log("2"+sess.accessToken)
            const BalanceResponse = await plaidClient.getBalance(sess.accessToken);
            console.log('Auth response:');
            console.log(util.inspect(BalanceResponse, false, null, true));
            console.log('---------------');
        }catch(err){console.log(err)}
        
    })
    
    
})

app.use('/', router);

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
