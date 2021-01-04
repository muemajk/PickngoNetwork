'use strict'
const log4js = require('log4js');
const logger = log4js.getLogger('PicknGoNetwork');
const bodyParser = require('body-parser');
const http = require('http');
const util = require('util');
const express = require('express');
const app = express();
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken')
const bearerToken = require('express-bearer-token');
const cors = require('cors');

const constants = require('./config/constants.json');

const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;


const helper = require('./app/helper')
const invoke = require('./app/invoke')
const qscc = require('./app/qscc')
const query = require('./app/query')

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.set('secret', 'thisismysecret');
/*app.use(expressJWT({
    secret: 'thisismysecret'
}).unless({
    path: ['/users', '/users/login']
}));
*/
app.use(bearerToken());

logger.level = 'debug';

function authenticateToken(req, res, next) {
    // Gather the jwt access token from the request header
    console.log("dfsdfsdfds")
    const authHeader = req.headers.authorization 
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) // if there isn't any token
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err)
      if (err) return res.sendStatus(403)
      req.user = user
      next() // pass the execution off to whatever request the client intended
    })
  }
app.use((req, res, next) => {
    logger.debug('New req for %s', req.originalUrl);
    if(req.originalUrl.indexOf('/users') >= 0) {
        return next();
        
    }
    const authHeader = req.headers.authorization;
    if(authHeader){
        var token = authHeader.split(' ')[1];
        jwt.verify(token, app.get('secret'), (err, decoded) => {
            if(err) {
                console.log(`Error =======: ${err}`)
                res.send({  
                    success: false,
                    message: 'Failed to authenticate token. Make sure to include the ' +
                        'token returned from /users call in the authorization header ' +
                        ' as a Bearer token',
                    authenticated: false
                });
                return;
            }else {
                req.username = decoded.username;
                req.orgname = decoded.orgName;
                logger.debug(util.format('Decode from JWT token: Username - %s, Orgname _ %s', decoded.username, decoded.orgName))
                return next();
            }
        });
    }
});

var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 240000;
 function getErrorMessage(feild) {
     var response = {
         success: false,
         message: feild + 'field is missing or invalid in the request'
     };
     return response;
 }
app.get('/verify', async function (req, res) {
    return res.json({username: req.username})
})
 app.post('/users' , async function (req, res) {
     var username = req.body.username;
     var orgName = req.body.orgName;
     logger.debug('End point : /users');
     logger.debug('User name : ' + username);
     logger.debug('Org name :' + orgName);

     if (!username) {
        res.json(getErrorMessage('\'username\''))
     }
     if (!orgName) {
        res.json(getErrorMessage('\'orgName\''))
     }
     var token = jwt.sign({
         exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
         username: username,
         orgName: orgName
     },app.get('secret'));

     let response = await helper.getRegisteredUser(username, orgName, true);

     logger.debug('--returned from registering the username %s for organization %s', username, orgName);
     if (response && typeof response !== 'string') {
         logger.debug('Successfully registered the username %s for organization %s', username, orgName);
         response.token = token;
         response.username = username;
         response.success = true;
         res.json(response);
     }else {
         logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
         res.json({success: false, message: response});
     }
 })

// Login and get jwt
app.post('/users/login', async function (req, res) {
    var username = req.body.username;
    var orgName = req.body.orgName;
    logger.debug('End point : /users/login');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        username: username,
        orgName: orgName
    }, app.get('secret'));

    let isUserRegistered = await helper.isUserRegistered(username, orgName);

    if (isUserRegistered) {
        res.json({ success: true, message: { token: token, username: username } });

    } else {
        res.json({ success: false, message: `User with username ${username} is not registered with ${orgName}, Please register first.` });
    }
});



 app.post('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
    try {
        logger.debug('======= INVOKE ON CHAINCODE ========');
        var peers = req.body.peers;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.body.fcn;
        var args = req.body.args;
        var transient = req.body.transient;
        console.log(`Transient data is ;${transient}`)
        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn  : ' + fcn);
        logger.debug('args  : ' + args);
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''))
        }        
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''))
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''))
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''))
        }

        let message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, req.username, req.orgname, transient);
        console.log(`message result sai hapa is : ${message}`)
        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }
        res.send(response_payload)
    }catch(err) {
        const response_payload = {
            result:null,
            error:error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.get('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res){
    try {
        logger.debug('========= QUERY BY CHAINCODE ============')
        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;
        console.log(fcn)
        logger.debug('ChannelName : '+ channelName);
        logger.debug('chaincodeName : '+ chaincodeName);
        logger.debug('fcn : '+ fcn);
        logger.debug('args : '+ args);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
        }
        if(!args) {
            res.json(getErrorMessage('\'args\''));
        }
        console.log('args=======', args);
        logger.debug(args);

        let message = await query.query(channelName, chaincodeName, args, fcn, req.username, req.orgname);

        const response_payload = {
            result: message,
            count: message.length ? message.length : null,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error:error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
})

app.get('/query/transactions/channels/:channelName/chaincodes/:chaincodeName', async function (req, res){
    try {
        logger.debug('========= QUERY BY CHAINCODE ============')
        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;
        console.log(fcn)
        logger.debug('ChannelName : '+ channelName);
        logger.debug('chaincodeName : '+ chaincodeName);
        logger.debug('fcn : '+ fcn);
        logger.debug('args : '+ args);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
        }
        if(!args) {
            res.json(getErrorMessage('\'args\''));
        }
        console.log('args=======', args);
        logger.debug(args);
        if('queryAllTransactions'){
            let message = await query.query(channelName, chaincodeName, args, fcn, req.username, req.orgname);
            let x
            let usertransactions = []
            for (x=0; x < message.length; x++ ){
                if(req.username === message[x].from && message[x].picked < message[x].stock ){
                    usertransactions.push(message[x])
                }
            }
            const response_payload = {
                result: usertransactions,
                count: usertransactions.length,
                error: null,
                errorData: null
            }

            res.send(response_payload)
        }
        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        
    } catch (error) {
        const response_payload = {
            result: null,
            error:error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
})

app.get('/qscc/channels/:channelName/chaincodes/:chaincodeName', async function (req, res){
    try {
        logger.debug('============ QUERY BY CHAINCODE ============');
        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is : ${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;

        logger.debug('channelName : '+channelName);
        logger.debug('chaincodeName : '+chaincodeName);
        logger.debug('fcn : '+ fcn);
        logger.debug('args : '+args);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
        console.log('args==========', args);
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
        logger.debug(args);

        let response_payload = await qscc.qscc(channelName, chaincodeName, args, fcn, req.username, req.orgname)

        res.send(response_payload);

    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});


app.get('/query/channels/:channelName/chaincodes/:chaincodeName/transaction', async function (req, res){
    try {
        logger.debug('========= QUERY BY CHAINCODE ============')
        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = JSON.parse(req.query.args);
        let fcn = req.query.fcn;

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
        }
        if(!args) {
            res.json(getErrorMessage('\'args\''));
        }
        let productids = []
        let transactionids = []
        productids.push(args[1])
        transactionids.push(args[0])
        let product_message = await query.query(channelName, chaincodeName, productids, 'queryProduct', req.username, req.orgname);
        let transaction_message = await query.query(channelName, chaincodeName, transactionids, 'queryTransaction', req.username, req.orgname);
        let data_response = {
            transaction: args[0],
            product: args[1],
            name: product_message.name,
            to:transaction_message.to,
            from: transaction_message.from,
            Amount_purchased: transaction_message.stock,
            Amount_to_pick: transaction_message.picked,
            price: product_message.price,
            image: product_message.image,
            category: product_message.category,
            created_at: transaction_message.created_at
        }

        const response_payload = {
            result: data_response,
            error: null,
            errorData: null
        }
        res.send(response_payload)
        
    } catch (error) {
        const response_payload = {
            result: null,
            error:error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
})