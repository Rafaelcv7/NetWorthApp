require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')
const config = require("./DB_connect");
const router = express.Router();
const app = express();
try {
    var con = config.connection
}
catch(err) {
    console.log("si funciona" + err)
}


app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors())

var sess;

const path = require('path');
const util = require('util');

const PORT = process.env.PORT || 3001;

const plaid = require('plaid');
const { runInNewContext } = require('vm');
const plaidClient = new plaid.Client({
    clientID: process.env.CLIENT_ID,
    secret: process.env.SECRET_SAND,
    env: plaid.environments.sandbox,
});

app.use(express.static(__dirname + '/frontEnd/views'));
var sess;

router.get('/',(req,res) => {
    sess = req.session;
    console.log(sess)
    if(sess.user) {
        return res.redirect('/plaid');
    }
    res.sendFile('index.html');
});

router.post('/login',(req,res) => {
    sess = req.session;
    var sql = "SELECT u.* FROM users_table u WHERE (u.email='"+req.body.emailUsername+"' OR u.username='"+req.body.emailUsername+"') AND u.password='"+req.body.pass+"'"
    con.query(sql, function (err, result) {
        if (err) {throw err;}
        if (result.length <= 0) {
            console.log("Wrong Credentials Combination.")
            res.end("failed")
        }
        else{
            console.log(result);
            sess.user = result[0].username;
            sess.user_id = result[0].id;
            console.log(sess.user_id)
            res.end('done');
        }
    });
    
});

router.get('/plaid',(req,res) => {
    sess = req.session;
    if(sess.user) {
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
            client_user_id: '@Rafaelcv7',
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
    const item = await plaidClient.exchangePublicToken(publicToken);
    console.log(item)
    var sql = `INSERT INTO items_table (id, user_id, plaid_access_token, plaid_item_id, plaid_institution_id, stat, created_at, updated_at) 
            VALUES (NULL, '`+sess.user_id+`', '`+item.access_token+`', '`+item.item_id+`', 'null', '`+item.status_code+`', current_timestamp(), current_timestamp());`;
    var itemId
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result.insertId)
        itemId = result.insertId
    });


    const accountsResponse = await plaidClient.getAccounts(item.access_token);
    console.log('Acccounts response:');
    //console.log(util.inspect(authResponse, false, null, true));
    console.log('---------------');
    var sql = `UPDATE items_table SET plaid_institution_id = '`+accountsResponse.item.institution_id+`' 
                WHERE items_table.plaid_item_id = '`+accountsResponse.item.item_id+`'`;
    con.query(sql, function (err, result) {
        if (err) throw err;
    });

    for (let i = 0; i < accountsResponse.accounts.length; i++) {
        var currentaccount = accountsResponse.accounts[i];
        var sql = `INSERT INTO accounts_table (id, item_id, plaid_account_id, name, mask, official_name, current_balance, 
            available_balance, iso_currency_code, unofficial_currency_code, type, subtype, created_at, updated_at) 
            VALUES (NULL, '`+itemId+`', '`+currentaccount.account_id+`', 
            '`+currentaccount.name+`', '`+currentaccount.mask+`', '`+currentaccount.official_name+`', `+currentaccount.balances.current+`, 
            `+currentaccount.balances.available+`, '`+currentaccount.balances.iso_currency_code+`', '`+currentaccount.balances.unofficial_currency_code+`', 
            '`+currentaccount.type+`', '`+currentaccount.subtype+`', current_timestamp(), current_timestamp());`
        con.query(sql, function (err, result) {
            if (err) throw err;
        });
    }

    const transactionsResponse = await plaidClient.getTransactions(item.access_token,'2019-01-01','2021-02-01');
    console.log('Transactions response');
    //console.log(transactionsResponse);
    console.log('---------------');
    //res.sendStatus(200);

    //const AssetsResponse = await plaidClient.getAssetReport(item.access_token)
    //console.log(AssetsResponse)
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
