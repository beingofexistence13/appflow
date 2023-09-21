/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "net", "vs/base/node/ports", "vs/base/test/node/testUtils"], function (require, exports, assert, net, ports, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Ports', () => {
        (process.env['VSCODE_PID'] ? test.skip /* this test fails when run from within VS Code */ : test)('Finds a free port (no timeout)', function (done) {
            // get an initial freeport >= 7000
            ports.$6f(7000, 100, 300000).then(initialPort => {
                assert.ok(initialPort >= 7000);
                // create a server to block this port
                const server = net.createServer();
                server.listen(initialPort, undefined, undefined, () => {
                    // once listening, find another free port and assert that the port is different from the opened one
                    ports.$6f(7000, 50, 300000).then(freePort => {
                        assert.ok(freePort >= 7000 && freePort !== initialPort);
                        server.close();
                        done();
                    }, err => done(err));
                });
            }, err => done(err));
        });
    });
});
//# sourceMappingURL=port.test.js.map