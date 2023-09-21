/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.finishBuild = exports.writeFile = exports.write = exports.load = exports.getConfiguredDefaultLocale = exports.localize = void 0;
    const buildMap = {};
    const buildMapKeys = {};
    const entryPoints = {};
    function localize(data, message, ...args) {
        throw new Error(`Not supported at build time!`);
    }
    exports.localize = localize;
    function getConfiguredDefaultLocale() {
        throw new Error(`Not supported at build time!`);
    }
    exports.getConfiguredDefaultLocale = getConfiguredDefaultLocale;
    /**
     * Invoked by the loader at build-time
     */
    function load(name, req, load, config) {
        if (!name || name.length === 0) {
            load({ localize, getConfiguredDefaultLocale });
        }
        else {
            req([name + '.nls', name + '.nls.keys'], function (messages, keys) {
                buildMap[name] = messages;
                buildMapKeys[name] = keys;
                load(messages);
            });
        }
    }
    exports.load = load;
    /**
     * Invoked by the loader at build-time
     */
    function write(pluginName, moduleName, write) {
        const entryPoint = write.getEntryPoint();
        entryPoints[entryPoint] = entryPoints[entryPoint] || [];
        entryPoints[entryPoint].push(moduleName);
        if (moduleName !== entryPoint) {
            write.asModule(pluginName + '!' + moduleName, 'define([\'vs/nls\', \'vs/nls!' + entryPoint + '\'], function(nls, data) { return nls.create("' + moduleName + '", data); });');
        }
    }
    exports.write = write;
    /**
     * Invoked by the loader at build-time
     */
    function writeFile(pluginName, moduleName, req, write, config) {
        if (entryPoints.hasOwnProperty(moduleName)) {
            const fileName = req.toUrl(moduleName + '.nls.js');
            const contents = [
                '/*---------------------------------------------------------',
                ' * Copyright (c) Microsoft Corporation. All rights reserved.',
                ' *--------------------------------------------------------*/'
            ], entries = entryPoints[moduleName];
            const data = {};
            for (let i = 0; i < entries.length; i++) {
                data[entries[i]] = buildMap[entries[i]];
            }
            contents.push('define("' + moduleName + '.nls", ' + JSON.stringify(data, null, '\t') + ');');
            write(fileName, contents.join('\r\n'));
        }
    }
    exports.writeFile = writeFile;
    /**
     * Invoked by the loader at build-time
     */
    function finishBuild(write) {
        write('nls.metadata.json', JSON.stringify({
            keys: buildMapKeys,
            messages: buildMap,
            bundles: entryPoints
        }, null, '\t'));
    }
    exports.finishBuild = finishBuild;
});
//# sourceMappingURL=nls.build.js.map