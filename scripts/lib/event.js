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

define(function(){
    var EventEmittter = {};

    function isArray(obj) {
        return obj && obj.constructor.toString().indexOf("Array") != -1;
    }

    EventEmittter.on = function on(type, listener){
        if(typeof listener !== 'function') {
            throw new Error('listener must be a function');
        }

        if(!this._events) {
            this._events = {};
        }
        
        this.emit('newListener', type, listener);

        if(isArray(this._events[type])) {
            this._events[type].push(listener);
        } else {
            this._events[type] = [listener];
        }

        return this;
    }

    EventEmittter.emit = function(type){
        var args = Array.prototype.splice.call(arguments, 1);

        if(type == 'error' && !isArray(this._events['error'])) {
            if (args[0] instanceof Error) {
                throw args[0];
            } else {
                throw new Error("Uncaught, unspecified 'error' event.");
            }

            return false;
        }

        if(this._events && isArray(this._events[type])) {
            this._events[type].forEach(function(handler){
                handler.apply(this, args);
            }, this);

            return true;
        }
        
        return false;
    }

    EventEmittter.removeListener = function(type, listener){
        if(type
           && this._events
           && this._events[type]
           && typeof this._evnets[type] === 'array')
        {
            var i = list.indexOf(listener);
            if (i < 0) return this;
            list.splice(i, 1);
            if (list.length === 0)
                delete this._events[type];
        }

        return this;
    }

    EventEmittter.removeAllListeners = function(type) {
        if (type && this._events && this._events[type]) {
            delete this._events[type];
        }
        
        return this;
    };
    
    return EventEmittter;
});
