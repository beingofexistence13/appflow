/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/extpath", "vs/base/node/pfs", "vs/base/node/terminalEncoding"], function (require, exports, os_1, async_1, extpath_1, pfs_1, terminalEncoding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readFromStdin = exports.getStdinFilePath = exports.stdinDataListener = exports.hasStdinWithoutTty = void 0;
    function hasStdinWithoutTty() {
        try {
            return !process.stdin.isTTY; // Via https://twitter.com/MylesBorins/status/782009479382626304
        }
        catch (error) {
            // Windows workaround for https://github.com/nodejs/node/issues/11656
        }
        return false;
    }
    exports.hasStdinWithoutTty = hasStdinWithoutTty;
    function stdinDataListener(durationinMs) {
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
    exports.stdinDataListener = stdinDataListener;
    function getStdinFilePath() {
        return (0, extpath_1.randomPath)((0, os_1.tmpdir)(), 'code-stdin', 3);
    }
    exports.getStdinFilePath = getStdinFilePath;
    async function readFromStdin(targetPath, verbose) {
        let [encoding, iconv] = await Promise.all([
            (0, terminalEncoding_1.resolveTerminalEncoding)(verbose),
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
        const appendFileQueue = new async_1.Queue();
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
    exports.readFromStdin = readFromStdin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RkaW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9lbnZpcm9ubWVudC9ub2RlL3N0ZGluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxTQUFnQixrQkFBa0I7UUFDakMsSUFBSTtZQUNILE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLGdFQUFnRTtTQUM3RjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2YscUVBQXFFO1NBQ3JFO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBUEQsZ0RBT0M7SUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxZQUFvQjtRQUNyRCxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzVCLE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6Qyx5QkFBeUI7WUFDekIsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBRW5ELE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFFakIsd0NBQXdDO1lBQ3hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFkRCw4Q0FjQztJQUVELFNBQWdCLGdCQUFnQjtRQUMvQixPQUFPLElBQUEsb0JBQVUsRUFBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRkQsNENBRUM7SUFFTSxLQUFLLFVBQVUsYUFBYSxDQUFDLFVBQWtCLEVBQUUsT0FBZ0I7UUFFdkUsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDekMsSUFBQSwwQ0FBdUIsRUFBQyxPQUFPLENBQUM7NERBQ3pCLHdCQUF3QjtZQUMvQixjQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyx1RkFBdUY7U0FDM0gsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsUUFBUSwwQkFBMEIsQ0FBQyxDQUFDO1lBQ2xGLFFBQVEsR0FBRyxNQUFNLENBQUM7U0FDbEI7UUFFRCwrQ0FBK0M7UUFDL0MsK0NBQStDO1FBQy9DLG9EQUFvRDtRQUNwRCxtQkFBbUI7UUFDbkIsc0RBQXNEO1FBRXRELE1BQU0sZUFBZSxHQUFHLElBQUksYUFBSyxFQUFFLENBQUM7UUFFcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUzQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDaEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzVCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMxQixJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDNUIsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxjQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQ2xFO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBbENELHNDQWtDQyJ9