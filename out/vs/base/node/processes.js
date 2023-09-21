/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/processes", "vs/base/common/types", "vs/base/node/pfs"], function (require, exports, path, Platform, process, processes_1, Types, pfs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.win32 = exports.createQueuedSender = exports.getWindowsShell = exports.TerminateResponseCode = exports.Source = void 0;
    Object.defineProperty(exports, "Source", { enumerable: true, get: function () { return processes_1.Source; } });
    Object.defineProperty(exports, "TerminateResponseCode", { enumerable: true, get: function () { return processes_1.TerminateResponseCode; } });
    function getWindowsShell(env = process.env) {
        return env['comspec'] || 'cmd.exe';
    }
    exports.getWindowsShell = getWindowsShell;
    // Wrapper around process.send() that will queue any messages if the internal node.js
    // queue is filled with messages and only continue sending messages when the internal
    // queue is free again to consume messages.
    // On Windows we always wait for the send() method to return before sending the next message
    // to workaround https://github.com/nodejs/node/issues/7657 (IPC can freeze process)
    function createQueuedSender(childProcess) {
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
            if (!result || Platform.isWindows /* workaround https://github.com/nodejs/node/issues/7657 */) {
                useQueue = true;
            }
        };
        return { send };
    }
    exports.createQueuedSender = createQueuedSender;
    var win32;
    (function (win32) {
        async function findExecutable(command, cwd, paths) {
            // If we have an absolute path then we take it.
            if (path.isAbsolute(command)) {
                return command;
            }
            if (cwd === undefined) {
                cwd = process.cwd();
            }
            const dir = path.dirname(command);
            if (dir !== '.') {
                // We have a directory and the directory is relative (see above). Make the path absolute
                // to the current working directory.
                return path.join(cwd, command);
            }
            if (paths === undefined && Types.isString(process.env['PATH'])) {
                paths = process.env['PATH'].split(path.delimiter);
            }
            // No PATH environment. Make path absolute to the cwd.
            if (paths === undefined || paths.length === 0) {
                return path.join(cwd, command);
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
                if (path.isAbsolute(pathEntry)) {
                    fullPath = path.join(pathEntry, command);
                }
                else {
                    fullPath = path.join(cwd, pathEntry, command);
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
            return path.join(cwd, command);
        }
        win32.findExecutable = findExecutable;
    })(win32 || (exports.win32 = win32 = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9ub2RlL3Byb2Nlc3Nlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVN0MsdUZBSGIsa0JBQU0sT0FHYTtJQUFxQixzR0FIQSxpQ0FBcUIsT0FHQTtJQU9uRyxTQUFnQixlQUFlLENBQUMsTUFBTSxPQUFPLENBQUMsR0FBbUM7UUFDaEYsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDO0lBQ3BDLENBQUM7SUFGRCwwQ0FFQztJQU1ELHFGQUFxRjtJQUNyRixxRkFBcUY7SUFDckYsMkNBQTJDO0lBQzNDLDRGQUE0RjtJQUM1RixvRkFBb0Y7SUFDcEYsU0FBZ0Isa0JBQWtCLENBQUMsWUFBNkI7UUFDL0QsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO1FBQzVCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUVyQixNQUFNLElBQUksR0FBRyxVQUFVLEdBQVE7WUFDOUIsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDhEQUE4RDtnQkFDbEYsT0FBTzthQUNQO1lBRUQsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFtQixFQUFFLEVBQUU7Z0JBQzdELElBQUksS0FBSyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyx1REFBdUQ7aUJBQzdFO2dCQUVELFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxtREFBbUQ7Z0JBRXJFLDJFQUEyRTtnQkFDM0UsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEIsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FB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