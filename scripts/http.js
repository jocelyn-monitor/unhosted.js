/*
 * The Unhosted.js library
 * Copyright (C) 2011  Daniel Gröber <darklord ät darkboxed.org>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Clone of the nodeJS http interface for the browser.
 */

define(['./lib/event'],
function(EventEmitter){
    // XMLHttpRequest ready states
    var UNSET = 0, OPENED = 1, HEADERS_RECEIVED = 2, LOADING = 3, DONE = 4;


    /**
     * Try different constructors for an XMLHttpRequest
     */
    function createXMLHTTPObject() {
        var XMLHttpFactories = [
            function() { return new XMLHttpRequest() },
            function() { return new ActiveXObject("Msxml2.XMLHTTP") },
            function() { return new ActiveXObject("Msxml3.XMLHTTP") },
            function() { return new ActiveXObject("Microsoft.XMLHTTP") }
        ];
        var xmlhttp = null;
        for (var i=0; i < XMLHttpFactories.length ;i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            } catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    }

    var Response = Object.create(EventEmitter);
    
    Response.create = function(){
        var inst = Object.create(Response);

        return inst;
    }

    Response._parseHeaders = function(headers) {
        var lines = headers.split('\r\n');
        this.headers = lines.map(function(line){
            return line.split(':').map(function(part){
                // trim whitespace
                return part.replace(/^\s+|\s+$/g, '');
            });
        });

        return this;
    }

    var Request = Object.create(EventEmitter);

    Request.create = function(){
        var inst = Object.create(Request);
        
        inst._buffer = [];
        inst._xmlHTTP = createXMLHTTPObject();
        inst._xmlHTTP.onreadystatechange = onReadyStateChange;
       
        function onReadyStateChange(){
            var state = inst._xmlHTTP.readyState;
            if(state === OPENED) {
                inst.emit('open');
            }

            if(state === DONE) {
                var res = Response.create();

                res._xmlHTTP = inst._xmlHTTP;
                res.statusCode = this.status;
                res._parseHeaders(this.getAllResponseHeaders());

                inst.emit('response', res);
                res.emit('data', this.responseText);

                if(this.responseXML) {
                    res.emit('xml', this.responseXML);
                }
                
                res.emit('end');
            }
        };
        
        return inst;
    }
    
    Request._open = function(){
        try {
            this._xmlHTTP.open(this.method, this.uri, true);
        } catch(e) {
            self.emit('error', e);
        }
        
        return this;
    }
    
    Request._setHeaders = function(headers){
        var self = this;
        this.on('open', function(){
            for(var h in headers) {
                if(headers.hasOwnProperty(h)) {
                    try {
                        self._xmlHTTP.setRequestHeader(h, headers[h]);
                    } catch(e) {
                        self.emit('error', e);
                    }
                }
            }
        });

        return this;
    }
    
    Request.write = function(chunk){
        if(chunk) {
            this._buffer .push(chunk);
        }

        return this;
    }

    Request.end = function(data){
        var self = this;

        this.write(data);
        if(this._xmlHTTP.readyState == OPENED) {
            try {
                self._xmlHTTP.send(self._buffer.join(''));
            } catch(e) {
                self.emit('error', e);
            }
        } else {
            var self = this;
            this.on('open', function(){
                self.end();
            });
        }

        return this;
    }

    /**
     *
     * Options:
     *
     *   - `uri`      Request URI, overrides `host`, `port` and `path`
     *   - `host`     Request host. Defaults to document.location.host
     *   - `port`     Request port. Defaults to ''
     *   - `data`     Request body
     *   - `path`     Request path. Defaults to '/'
     *   - `method`   Request method. Defaults to 'GET'
     *   - `secure`   true: https, false: http. Defaults to
     *     document.location.protocol
     *   - `headers`  Request headers
     *
     * @param {Object} options
     * @return {Request}
     * @api public
     */
    request = function(options, callback){
        var uri, host, port, data, path, secure, method, headers;

        headers = options.headers || {};
        method = options.method || 'GET';
        secure = options.secure || document.location.protocol == 'https:';
        path = options.path || '/';
        port = options.port || secure ? 443 : 80
        host = options.host || document.location.host;
        data = options.data;
        uri = options.uri
            || (secure ? 'https:' : 'http:') + '//'
            + host + (port && ':' + port)
            + path;
        
        var req = Request.create();

        req.method = method;
        req.uri = uri;

        req._setHeaders(headers);
        req._open();
        if(data) {
            req.end(data);
        }

        if(callback) {
            req.on('error', function(err){
                callback(err);

                // just to be sure
                callback = function(){};
            });

            req.on('response', function(res){
                var buffer = [];

                res.on('data', function(chunk){
                    buffer.push(chunk.toString());
                });

                res.on('end', function(){
                    callback(null, res.statusCode, buffer.join(''));
                });
            });
        }

        return req;
    }

    return {
        request: request
        , Request: Request
        , Response: Response
    };
});
