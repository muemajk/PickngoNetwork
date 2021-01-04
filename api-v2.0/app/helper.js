'use strict';

var { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

const util = require('util');
const { get } = require('https');

const getCCP = async (org) => {
    let ccpPath;
    if(org == "Org1") {
        ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');

    }else if ( org= "Org2") {
        ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org2.json');
    }else {
        return null
    }
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp  = JSON.parse(ccpJSON);
    return ccp;

}

const getCaUrl = async (org, ccp) => {
    let caURL;
    if (org == "Org1") {
        caURL = ccp.certificateAuthorities['ca.org1.pickngo.com'].url;
    } else if (org == "Org2" ) {
        caURL = ccp.certificateAuthorities['ca.org2.pickngo.com'].url;
    }else {
        return null
    }
    return caURL
}

const getWalletPath = async (org) => {
    let walletPath;
    if (org == "Org1") {
        walletPath = path.join(process.cwd(), 'org1-wallet');

    }else if (org == "Org2") {
        walletPath = path.join(process.cwd(), 'org2-wallet');
    }else{
        return null
    }
    return walletPath;
}

const getAffiliation = async (org) => {
    return org == "Org1" ? 'org1.department1' : 'org2.department1'
}

const getRegisteredUser = async (username, userorg, isjson) => {
    let ccp = await getCCP(userorg)
    const caURL = await getCaUrl(userorg, ccp)
    console.log(caURL)
    const ca = new FabricCAServices(caURL);
    console.log(ca)

    let walletPath = await getWalletPath(userorg);
    console.log(`Wallet Path: ${walletPath}`);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const useridentity = await wallet.get(username);
    if (useridentity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        var response = {
            success: true,
            message: username + "enrolled successfully",
        };
        return response
    }

    let adminidentity = await wallet.get('admin');
    if(!adminidentity){
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userorg, ccp);
        adminidentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }
    const provider = wallet.getProviderRegistry().getProvider(adminidentity.type);
    const adminUser = await provider.getUserContext(adminidentity, 'admin');
    let secret;
    try {
        console.log(adminUser)
        secret = await ca.register({affiliation: await getAffiliation(userorg), enrollmentID: username, role: 'client' }, adminUser);
    } catch (error) {
        return error.message;
    }

    const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret})

    let x509;
    if (userorg == "Org1") {
        x509 = {
            credentials : {
                certificate: enrollment.certificate,
                privateKey : enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
    } else if (userorg == "Org2") {
        x509 = {
            credentials : {
                certificate: enrollment.certificate,
                privateKey : enrollment.key.toBytes(),
            },
            mspId: 'Org2MSP',
            type: 'X.509',
        };
    }

    await wallet.put(username, x509);
    var response = {
        success: true,
        message: username + ' enrolled successfully',
    };
    return response
}

const isUserRegistered = async (username, userorg) => {
    const walletPath = await getWalletPath(userorg)
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    console.log(`Wallet path: ${walletPath}`)
    const useridentity = await wallet.get(username);
    if (useridentity) {
        console.log(`An identity for the user ${username} exists in the wallet`);
        return true
    }
    return false 
}

const getCaInfo = async (org, ccp) => {
    let caInfo;
    if (org == "Org1") {
        caInfo = ccp.certificateAuthorities['ca.org1.pickngo.com'];
    } else if (org == "Org2") {
        caInfo = ccp.certificateAuthorities['ca.org2.pickngo.com'];
    } else {
        return null;
    }
    return caInfo;
}

const enrollAdmin = async (org, ccp) => {
    console.log('Calling enroll Admin method');

    try {
        const caInfo = await getCaInfo(org, ccp);
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const walletPath = await getWalletPath(org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const identiy = await wallet.get('admin');
        if (identiy) {
            console.log('An identiy for the admin user "admin" already exists in the wallet');
            return;
        }
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw'});
        let x509identity;
        if(org == "org1") {
            x509identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(0)
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
        } else if (org = "Org2") {
            x509identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org2MSP',
                type: 'X.509'
            };
        }
        await wallet.put('admin',x509identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`)
    }
}

exports.getRegisteredUser = getRegisteredUser

module.exports = {
    getCCP: getCCP,
    getWalletPath: getWalletPath,
    getRegisteredUser: getRegisteredUser,
    isUserRegistered : isUserRegistered

}