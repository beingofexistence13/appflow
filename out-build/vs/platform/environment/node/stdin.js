/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/extpath", "vs/base/node/pfs", "vs/base/node/terminalEncoding"], function (require, exports, os_1, async_1, extpath_1, pfs_1, terminalEncoding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$H7b = exports.$G7b = exports.$F7b = exports.$E7b = void 0;
    function $E7b() {
        try {
            return !process.stdin.isTTY; // Via https://twitter.com/MylesBorins/status/782009479382626304
        }
        catch (error) {
            // Windows workaround for https://github.com/nodejs/node/issues/11656
        }
        return false;
    }
    exports.$E7b = $E7b;
    function $F7b(durationinMs) {
        return new Promise(resolve => {
            const dataListener = () => resolve(true);
            // wait for 1s maximum...
            setTimeout(() => {
                process.stdin.removeListener('data', dataListener);
                resolve(false);
            }, durationinMs);
            // ...but finish early if we detect data
            process.stdin.once('data', dataListener);
        });
    }
    exports.$F7b = $F7b;
    function $G7b() {
        return (0, extpath_1.$Qf)((0, os_1.tmpdir)(), 'code-stdin', 3);
    }
    exports.$G7b = $G7b;
    async function $H7b(targetPath, verbose) {
        let [encoding, iconv] = await Promise.all([
            (0, terminalEncoding_1.$RS)(verbose),
            new Promise((resolve_1, reject_1) => { require(['@vscode/iconv-lite-umd'], resolve_1, reject_1); }),
            pfs_1.Promises.appendFile(targetPath, '') // make sure file exists right away (https://github.com/microsoft/vscode/issues/155341)
        ]);
        if (!iconv.encodingExists(encoding)) {
            console.log(`Unsupported terminal encoding: ${encoding}, falling back to UTF-8.`);
            encoding = 'utf8';
        }
        // Use a `Queue` to be able to use `appendFile`
        // which helps file watchers to be aware of the
        // changes because each append closes the underlying
        // file descriptor.
        // (https://github.com/microsoft/vscode/issues/148952)
        const appendFileQueue = new async_1.$Ng();
        const decoder = iconv.getDecoder(encoding);
        process.stdin.on('data', chunk => {
            const chunkStr = decoder.write(chunk);
            appendFileQueue.queue(() => pfs_1.Promises.appendFile(targetPath, chunkStr));
        });
        process.stdin.on('end', () => {
            const end = decoder.end();
            if (typeof end === 'string') {
                appendFileQueue.queue(() => pfs_1.Promises.appendFile(targetPath, end));
            }
        });
    }
    exports.$H7b = $H7b;
});
//# sourceMappingURL=stdin.js.map