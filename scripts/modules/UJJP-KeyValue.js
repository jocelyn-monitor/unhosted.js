/**
 * UJJP implementation of the KeyValue functionality
 */

define(['../interfaces/KeyValue'
        , '../modules'
        , '../util'
        , '../key-storage'
        , '../crypto'],
function(KeyValueInterface, modules, util, keyStorage, crypto) {
    modules.register('KeyValue', 0, 'modules/UJJP-KeyValue');

    /**
     * Inherit interfaces/KeyValue
     *
     * see scripts/interfaces/KeyValue.js for documentation on the methods
     */

    var UJJPKeyValue = Object.create(KeyValueInterface);

    /**
     * The UJJP protocol version this module supports
     */
    UJJPKeyValue.protocol = 'UJJP/0.2;KeyValue-0.2';
    var protocol = UJJPKeyValue.protocol;

    /**
     * Default post path
     */
    UJJPMessageQueue.defaultPostPath = '/UJ/KV/0.2/',

    // TOOD: sha1(key)

    UJJPKeyValue.set = function set(key, value, callback){
        var user = util.UJJP.getUserProperties.call(this);

        var cmd = JSON.stringify({
            method: 'SET'
            , user: user.id
            , keyHash: key
            , value: value
        });

        var privKey = keyStorage.retrievePrivKey(this.user.keyID);

        util.UJJP.sendPost(this.postURI, {
            protocol: protocol
            , password: user.password
            , command: cmd
            , pubSign: crypto.rsa.signSHA1(cmd, privKey)
        }, function postDone(err, status, data){
            if(err) { callback(err); return; }

            util.UJJP.handlePostError(status, data, callback);
        });
    };

    UJJPKeyValue.get = function get(key, callback) {
        var self = this;
        var user = util.UJJP.getUserProperties.call(this);

        var cmd = JSON.stringify({
            method: 'GET'
            , user: user.id
            , keyHash: key
        });

        util.UJJP.sendPost(this.postURI, {
            protocol: protocol
            , command: cmd
        }, function postDone(err, status, data){
            if(err) { callback(err); return; }

            util.UJJP.handlePostError(status, data, callback, function ok(){
                var res = JSON.parse(data);
                var pubKey = keyStorage.retrievePubKey(self.user.keyID);

                if(!crypto.rsa.verifySHA1(res.pubSign, res.cmd, pubKey)) {
                    throw new Error('Invalid signature');
                }

                var cmd = JSON.parse(res.cmd);

                callback(null, cmd.value, res.cmd);
            });
        });
    };

    return UJJPKeyValue;
});
