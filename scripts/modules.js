
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

define({
    modules: [],
    register: function(functionality, priority, modulePath){
        this.modules.push({func: functionality
                           , priority: priority
                           , modulePath: modulePath});
    },

    get: function(functionality){
        var candidates = {};
        var min = null;
        this.modules.forEach(function(module){
            if(module.func == functionality) {
                if(typeof min === 'null') {
                    min = module.priority;
                } else {
                    min = min < module.priority ? min : module.priority;
                }
                candidates[module.priority] = candidates[module.priority] || [];
                candidates[module.priority].push(module);
            }
        });

        if(min !== null){
            return candidates[min][0].modulePath;
        }
    }
});
