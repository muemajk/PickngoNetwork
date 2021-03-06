'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
logger.setLevel('DEBUG')
var { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
var path = require('path');
var util = require('util');

var fabclient = require('fabric-client');
fabclient.setLogger(logger)

async function getClientForOrg(userorg, username) {
    logger.debug('getClientForOrg - *** START %s %s', userorg, username)

    let config = '-connection-profile-path';

    let client = fabclient.loadFromConfig(fabclient.getConfigSetting('network' + config));
    client.loadFromConfig(fabclient.getConfigSetting(userorg + config));
    await client.initCredentialStores();

    if (username) {
        let user = await client.getUserContext(username, true);
        if(!user) {
            throw new Error(util,format('User was not found :', username));
        } else {
            logger.debug('User %s was found to be registered and enrolled', username)
        }
    }
    logger.debug('getClientForOrg - ***** END %s %s \n\n', userorg, username)
    return client;

}

const getWalletPath = async (org) => {
    let walletPath;
    if (org == "Org1") {
        walletPath = path.join(process.cwd(), 'org1-wallet');

    } else if (org == "Org2") {
        walletPath = path.join(process.cwd(), 'org2-wallet');
    } else
        return null
    return walletPath

}


const isUserRegistered =async  (username, userOrg) => {
    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(username);
    if (userIdentity) {
        console.log(`An identity for the user ${username} exists in the wallet`);
        return true
    }
    return false
}



var getRegisteredUser = async function (username, userOrg, isJson) {
    try {
        var client = await getClientForOrg(userOrg);
        logger.debug('successfully initialized the credential stores');
        var user = await client.getUserContext(username, true);
        if(user && user.isEnrolled()){
            logger.info('Successfully loaded member from persistence');
        } else {
            logger.info('User %s was not enrolled, so we will need an admin user to register ', username);
            var admins = fabclient.getConfigSetting('admins');
            let adminUserObj = await client.setUserContext({
                username: admins[0].username,
                password: admins[0].secret
            });
            let caClient = client.getCertificateAuthority();
            let secret = await caClient.register({
                enrollmentID: username,
                affiliation: userOrg.toLowerCase() + '.department1',
                attrs: [{name: 'role', value: 'approver', ecert: true}]
            }, adminUserObj)

            logger.debug('Successfully got the secret for user %s', username);
            user = await client.setUserContext({ username: username, password: secret, 
            attr_reps: [{ name: 'role', optional: false }]})
        }
        if ( user && user.isEnrolled ) {
            if ( isJson && isJson === true ) {
                var response = {
                    success: true,
                    secret: user._enrollmentSecret,
                    message: username + ' enrolled Successfully',
                };
                return response;
            }
        } else {
            throw new Error('User was not enrolled');
        }
    } catch (e) {
        logger.error('Failed to get registered user: %s with error: %s', username, e.toString());
        return 'failed' + e.toString();
    }
}

var setupChaincodeDeploy = function () {
    process.env.GOPATH = path.join(_dirname, fabclient.getConfigSetting('CC_SRC_PATH'));
}

var getLogger = function (moduleName) {
    var logger = log4js.getLogger(moduleName);
    logger.setLevel('DEBUG');
    return logger;
}

exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getRegisteredUser = getRegisteredUser;
exports.isUserRegistered = isUserRegistered;

