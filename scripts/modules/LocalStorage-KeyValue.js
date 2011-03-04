/**
 * Browser local storage implementation of the KeyValue functionality
 *
 * This is primarily intended to be used for testing unhosted applications
 * without the need to run a storage node and as a fallback in case a user has
 * no storage node.
 */

define(['../interfaces/KeyValue'
        , '../modules'],
function(KeyValueInterface, modules) {
    modules.register('LocalKeyValue', 0, 'modules/LocalStorage-KeyValue');
    modules.register('KeyValue', 100, 'modules/LocalStorage-KeyValue');

    /**
     * Inherit interfaces/KeyValue
     *
     * see scripts/interfaces/KeyValue.js for documentation on the methods
     */

    var LocalKeyValue = Object.create(KeyValueInterface);

    LocalKeyValue.set = function set(key, value, callback){
        localStorage.setItem('unhosted-local-' + key, value);
        callback(null);
    };

    UJJPKeyValue.get = function get(key, callback) {
        var value = localStorage.getItem('unhosted-local' + key);
        callback(null, value);
    };

    return UJJPKeyValue;
});
