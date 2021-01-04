var fs = require('fs');
var path = require('path');

var helper = require('./helper.js');
var logger = helper.getLogger('Create-Channel');


var createChannel = async function(channelName, channelConfigPath, username, orgName){
    logger.debug('\n=============== Create Channel \''+channelName+'\'======\n');
    try {
        var client = await helper.getClientForOrg(orgName);
        logger.debug("Successfully setup fabric client for the organisation"+orgName);

        var envelop = fs.readFileSync(path.join(__dirname, channelConfigPath));
        var channelconfig = client.extractchannelconfig(envelop);

        let signature = client.signChanelConfig(channelConfig)
        let request = {
            config: channelconfig,
            signature: [signature],
            name: channelName,
            txId: client.newTransactionID(true)
        }
        var response = await client.createChannel(request)
        logger.debug('response ::%j', response);
        if (response && response.status == 'SUCCESS'){
            loger.debug('Successfully created the channel,');
            let response = {
                success: true,
                message: 'Channel \'' + channelName + '\' created Succesfully'
            };
            return response;
        }else {
            logger.error('\n !!!! Failed to create the channel \'' + channelName + '\' !!!!\n\n');
            throw new Error('Failed to create the channel \'' + channelName + '\'');
        }
    } catch (err) {
        logger.error('Failed to initialize the channel: '+ err.stack ? err.stack : err);
        throw new Error('Failed to initialize the channels' + err.toString())
    }
};

exports.createChannel = createChannel; 