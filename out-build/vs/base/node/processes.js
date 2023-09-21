/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/processes", "vs/base/common/types", "vs/base/node/pfs"], function (require, exports, path, Platform, process, processes_1, Types, pfs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.win32 = exports.$vl = exports.$ul = exports.TerminateResponseCode = exports.Source = void 0;
    Object.defineProperty(exports, "Source", { enumerable: true, get: function () { return processes_1.Source; } });
    Object.defineProperty(exports, "TerminateResponseCode", { enumerable: true, get: function () { return processes_1.TerminateResponseCode; } });
    function $ul(env = process.env) {
        return env['comspec'] || 'cmd.exe';
    }
    exports.$ul = $ul;
    // Wrapper around process.send() that will queue any messages if the internal node.js
    // queue is filled with messages and only continue sending messages when the internal
    // queue is free again to consume messages.
    // On Windows we always wait for the send() method to return before sending the next message
    // to workaround https://github.com/nodejs/node/issues/7657 (IPC can freeze process)
    function $vl(childProcess) {
        let msgQueue = [];
        let useQueue = false;
        const send = function (msg) {
            if (useQueue) {
                msgQueue.push(msg); // add to the queue if the process cannot handle more messages
                return;
            }
            const result = childProcess.send(msg, (error) => {
                if (error) {
                    console.error(error); // unlikely to happen, best we can do is log this error
                }
                useQueue = false; // we are good again to send directly without queue
                // now send all the messages that we have in our queue and did not send yet
                if (msgQueue.length > 0) {
                    const msgQueueCopy = msgQueue.slice(0);
                    msgQueue = [];
                    msgQueueCopy.forEach(entry => send(entry));
                }
            });
            if (!result || Platform.$i /* workaround https://github.com/nodejs/node/issues/7657 */) {
                useQueue = true;
            }
        };
        return { send };
    }
    exports.$vl = $vl;
    var win32;
    (function (win32) {
        async function findExecutable(command, cwd, paths) {
            // If we have an absolute path then we take it.
            if (path.$8d(command)) {
                return command;
            }
            if (cwd === undefined) {
                cwd = process.cwd();
            }
            const dir = path.$_d(command);
            if (dir !== '.') {
                // We have a directory and the directory is relative (see above). Make the path absolute
                // to the current working directory.
                return path.$9d(cwd, command);
            }
            if (paths === undefined && Types.$jf(process.env['PATH'])) {
                paths = process.env['PATH'].split(path.$ge);
            }
            // No PATH environment. Make path absolute to the cwd.
            if (paths === undefined || paths.length === 0) {
                return path.$9d(cwd, command);
            }
            async function fileExists(path) {
                if (await pfs.Promises.exists(path)) {
                    let statValue;
                    try {
                        statValue = await pfs.Promises.stat(path);
                    }
                    catch (e) {
                        if (e.message.startsWith('EACCES')) {
                            // it might be symlink
                            statValue = await pfs.Promises.lstat(path);
                        }
                    }
                    return statValue ? !statValue.isDirectory() : false;
                }
                return false;
            }
            // We have a simple file name. We get the path variable from the env
            // and try to find the executable on the path.
            for (const pathEntry of paths) {
                // The path entry is absolute.
                let fullPath;
                if (path.$8d(pathEntry)) {
                    fullPath = path.$9d(pathEntry, command);
                }
                else {
                    fullPath = path.$9d(cwd, pathEntry, command);
                }
                if (await fileExists(fullPath)) {
                    return fullPath;
                }
                let withExtension = fullPath + '.com';
                if (await fileExists(withExtension)) {
                    return withExtension;
                }
                withExtension = fullPath + '.exe';
                if (await fileExists(withExtension)) {
                    return withExtension;
                }
            }
            return path.$9d(cwd, command);
        }
        win32.findExecutable = findExecutable;
    })(win32 || (exports.win32 = win32 = {}));
});
//# sourceMappingURL=processes.js.map