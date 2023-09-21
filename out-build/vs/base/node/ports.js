/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "net"], function (require, exports, net) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8f = exports.$7f = exports.$6f = void 0;
    /**
     * Given a start point and a max number of retries, will find a port that
     * is openable. Will return 0 in case no free port can be found.
     */
    function $6f(startPort, giveUpAfter, timeout, stride = 1) {
        let done = false;
        return new Promise(resolve => {
            const timeoutHandle = setTimeout(() => {
                if (!done) {
                    done = true;
                    return resolve(0);
                }
            }, timeout);
            doFindFreePort(startPort, giveUpAfter, stride, (port) => {
                if (!done) {
                    done = true;
                    clearTimeout(timeoutHandle);
                    return resolve(port);
                }
            });
        });
    }
    exports.$6f = $6f;
    function doFindFreePort(startPort, giveUpAfter, stride, clb) {
        if (giveUpAfter === 0) {
            return clb(0);
        }
        const client = new net.Socket();
        // If we can connect to the port it means the port is already taken so we continue searching
        client.once('connect', () => {
            dispose(client);
            return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
        });
        client.once('data', () => {
            // this listener is required since node.js 8.x
        });
        client.once('error', (err) => {
            dispose(client);
            // If we receive any non ECONNREFUSED error, it means the port is used but we cannot connect
            if (err.code !== 'ECONNREFUSED') {
                return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
            }
            // Otherwise it means the port is free to use!
            return clb(startPort);
        });
        client.connect(startPort, '127.0.0.1');
    }
    // Reference: https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/net/base/port_util.cc#56
    exports.$7f = {
        1: true,
        7: true,
        9: true,
        11: true,
        13: true,
        15: true,
        17: true,
        19: true,
        20: true,
        21: true,
        22: true,
        23: true,
        25: true,
        37: true,
        42: true,
        43: true,
        53: true,
        69: true,
        77: true,
        79: true,
        87: true,
        95: true,
        101: true,
        102: true,
        103: true,
        104: true,
        109: true,
        110: true,
        111: true,
        113: true,
        115: true,
        117: true,
        119: true,
        123: true,
        135: true,
        137: true,
        139: true,
        143: true,
        161: true,
        179: true,
        389: true,
        427: true,
        465: true,
        512: true,
        513: true,
        514: true,
        515: true,
        526: true,
        530: true,
        531: true,
        532: true,
        540: true,
        548: true,
        554: true,
        556: true,
        563: true,
        587: true,
        601: true,
        636: true,
        989: true,
        990: true,
        993: true,
        995: true,
        1719: true,
        1720: true,
        1723: true,
        2049: true,
        3659: true,
        4045: true,
        5060: true,
        5061: true,
        6000: true,
        6566: true,
        6665: true,
        6666: true,
        6667: true,
        6668: true,
        6669: true,
        6697: true,
        10080: true // Amanda
    };
    /**
     * Uses listen instead of connect. Is faster, but if there is another listener on 0.0.0.0 then this will take 127.0.0.1 from that listener.
     */
    function $8f(startPort, giveUpAfter, timeout, hostname = '127.0.0.1') {
        let resolved = false;
        let timeoutHandle = undefined;
        let countTried = 1;
        const server = net.createServer({ pauseOnConnect: true });
        function doResolve(port, resolve) {
            if (!resolved) {
                resolved = true;
                server.removeAllListeners();
                server.close();
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                resolve(port);
            }
        }
        return new Promise(resolve => {
            timeoutHandle = setTimeout(() => {
                doResolve(0, resolve);
            }, timeout);
            server.on('listening', () => {
                doResolve(startPort, resolve);
            });
            server.on('error', err => {
                if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES') && (countTried < giveUpAfter)) {
                    startPort++;
                    countTried++;
                    server.listen(startPort, hostname);
                }
                else {
                    doResolve(0, resolve);
                }
            });
            server.on('close', () => {
                doResolve(0, resolve);
            });
            server.listen(startPort, hostname);
        });
    }
    exports.$8f = $8f;
    function dispose(socket) {
        try {
            socket.removeAllListeners('connect');
            socket.removeAllListeners('error');
            socket.end();
            socket.destroy();
            socket.unref();
        }
        catch (error) {
            console.error(error); // otherwise this error would get lost in the callback chain
        }
    }
});
//# sourceMappingURL=ports.js.map