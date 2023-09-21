/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "child_process", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/platform", "vs/base/node/processes"], function (require, exports, assert, cp, network_1, objects, platform, processes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function fork(id) {
        const opts = {
            env: objects.$Ym(objects.$Vm(process.env), {
                VSCODE_AMD_ENTRYPOINT: id,
                VSCODE_PIPE_LOGGING: 'true',
                VSCODE_VERBOSE_LOGGING: true
            })
        };
        return cp.fork(network_1.$2f.asFileUri('bootstrap-fork').fsPath, ['--type=processTests'], opts);
    }
    suite('Processes', () => {
        test('buffered sending - simple data', function (done) {
            if (process.env['VSCODE_PID']) {
                return done(); // this test fails when run from within VS Code
            }
            const child = fork('vs/base/test/node/processes/fixtures/fork');
            const sender = processes.$vl(child);
            let counter = 0;
            const msg1 = 'Hello One';
            const msg2 = 'Hello Two';
            const msg3 = 'Hello Three';
            child.on('message', msgFromChild => {
                if (msgFromChild === 'ready') {
                    sender.send(msg1);
                    sender.send(msg2);
                    sender.send(msg3);
                }
                else {
                    counter++;
                    if (counter === 1) {
                        assert.strictEqual(msgFromChild, msg1);
                    }
                    else if (counter === 2) {
                        assert.strictEqual(msgFromChild, msg2);
                    }
                    else if (counter === 3) {
                        assert.strictEqual(msgFromChild, msg3);
                        child.kill();
                        done();
                    }
                }
            });
        });
        (!platform.$i || process.env['VSCODE_PID'] ? test.skip : test)('buffered sending - lots of data (potential deadlock on win32)', function (done) {
            const child = fork('vs/base/test/node/processes/fixtures/fork_large');
            const sender = processes.$vl(child);
            const largeObj = Object.create(null);
            for (let i = 0; i < 10000; i++) {
                largeObj[i] = 'some data';
            }
            const msg = JSON.stringify(largeObj);
            child.on('message', msgFromChild => {
                if (msgFromChild === 'ready') {
                    sender.send(msg);
                    sender.send(msg);
                    sender.send(msg);
                }
                else if (msgFromChild === 'done') {
                    child.kill();
                    done();
                }
            });
        });
    });
});
//# sourceMappingURL=processes.integrationTest.js.map