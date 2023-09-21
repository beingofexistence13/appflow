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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmxzLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvbmxzLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRyxNQUFNLFFBQVEsR0FBaUMsRUFBRSxDQUFDO0lBQ2xELE1BQU0sWUFBWSxHQUFpQyxFQUFFLENBQUM7SUFDdEQsTUFBTSxXQUFXLEdBQXVDLEVBQUUsQ0FBQztJQU8zRCxTQUFnQixRQUFRLENBQUMsSUFBNEIsRUFBRSxPQUFlLEVBQUUsR0FBRyxJQUFzRDtRQUNoSSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUZELDRCQUVDO0lBRUQsU0FBZ0IsMEJBQTBCO1FBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRkQsZ0VBRUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLElBQUksQ0FBQyxJQUFZLEVBQUUsR0FBK0IsRUFBRSxJQUFtQyxFQUFFLE1BQXVDO1FBQy9JLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFFLENBQUMsQ0FBQztTQUMvQzthQUFNO1lBQ04sR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sRUFBRSxJQUFJLEdBQUcsV0FBVyxDQUFDLEVBQUUsVUFBVSxRQUFrQixFQUFFLElBQWM7Z0JBQ3BGLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7Z0JBQzFCLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztTQUNIO0lBQ0YsQ0FBQztJQVZELG9CQVVDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixLQUFLLENBQUMsVUFBa0IsRUFBRSxVQUFrQixFQUFFLEtBQXFDO1FBQ2xHLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUV6QyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4RCxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLElBQUksVUFBVSxLQUFLLFVBQVUsRUFBRTtZQUM5QixLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsVUFBVSxFQUFFLCtCQUErQixHQUFHLFVBQVUsR0FBRyxnREFBZ0QsR0FBRyxVQUFVLEdBQUcsZUFBZSxDQUFDLENBQUM7U0FDOUs7SUFDRixDQUFDO0lBVEQsc0JBU0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLFNBQVMsQ0FBQyxVQUFrQixFQUFFLFVBQWtCLEVBQUUsR0FBK0IsRUFBRSxLQUF5QyxFQUFFLE1BQXVDO1FBQ3BMLElBQUksV0FBVyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMzQyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUNuRCxNQUFNLFFBQVEsR0FBRztnQkFDaEIsNkRBQTZEO2dCQUM3RCw4REFBOEQ7Z0JBQzlELDhEQUE4RDthQUM5RCxFQUNBLE9BQU8sR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFbkMsTUFBTSxJQUFJLEdBQXVDLEVBQUUsQ0FBQztZQUNwRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4QztZQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzdGLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0YsQ0FBQztJQWxCRCw4QkFrQkM7SUFFRDs7T0FFRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxLQUF5QztRQUNwRSxLQUFLLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN6QyxJQUFJLEVBQUUsWUFBWTtZQUNsQixRQUFRLEVBQUUsUUFBUTtZQUNsQixPQUFPLEVBQUUsV0FBVztTQUNwQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFORCxrQ0FNQyJ9