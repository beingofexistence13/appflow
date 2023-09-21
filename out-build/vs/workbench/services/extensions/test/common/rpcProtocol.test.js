/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/workbench/services/extensions/common/rpcProtocol"], function (require, exports, assert, buffer_1, cancellation_1, event_1, lifecycle_1, utils_1, proxyIdentifier_1, rpcProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('RPCProtocol', () => {
        let disposables;
        class MessagePassingProtocol {
            constructor() {
                this.c = new event_1.$fd();
                this.onMessage = this.c.event;
            }
            setPair(other) {
                this.a = other;
            }
            send(buffer) {
                Promise.resolve().then(() => {
                    this.a.c.fire(buffer);
                });
            }
        }
        let delegate;
        let bProxy;
        class BClass {
            $m(a1, a2) {
                return Promise.resolve(delegate.call(null, a1, a2));
            }
        }
        setup(() => {
            disposables = new lifecycle_1.$jc();
            const a_protocol = new MessagePassingProtocol();
            const b_protocol = new MessagePassingProtocol();
            a_protocol.setPair(b_protocol);
            b_protocol.setPair(a_protocol);
            const A = disposables.add(new rpcProtocol_1.$H3b(a_protocol));
            const B = disposables.add(new rpcProtocol_1.$H3b(b_protocol));
            const bIdentifier = new proxyIdentifier_1.$aA('bb');
            const bInstance = new BClass();
            B.set(bIdentifier, bInstance);
            bProxy = A.getProxy(bIdentifier);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('simple call', function (done) {
            delegate = (a1, a2) => a1 + a2;
            bProxy.$m(4, 1).then((res) => {
                assert.strictEqual(res, 5);
                done(null);
            }, done);
        });
        test('simple call without result', function (done) {
            delegate = (a1, a2) => { };
            bProxy.$m(4, 1).then((res) => {
                assert.strictEqual(res, undefined);
                done(null);
            }, done);
        });
        test('passing buffer as argument', function (done) {
            delegate = (a1, a2) => {
                assert.ok(a1 instanceof buffer_1.$Fd);
                return a1.buffer[a2];
            };
            const b = buffer_1.$Fd.alloc(4);
            b.buffer[0] = 1;
            b.buffer[1] = 2;
            b.buffer[2] = 3;
            b.buffer[3] = 4;
            bProxy.$m(b, 2).then((res) => {
                assert.strictEqual(res, 3);
                done(null);
            }, done);
        });
        test('returning a buffer', function (done) {
            delegate = (a1, a2) => {
                const b = buffer_1.$Fd.alloc(4);
                b.buffer[0] = 1;
                b.buffer[1] = 2;
                b.buffer[2] = 3;
                b.buffer[3] = 4;
                return b;
            };
            bProxy.$m(4, 1).then((res) => {
                assert.ok(res instanceof buffer_1.$Fd);
                assert.strictEqual(res.buffer[0], 1);
                assert.strictEqual(res.buffer[1], 2);
                assert.strictEqual(res.buffer[2], 3);
                assert.strictEqual(res.buffer[3], 4);
                done(null);
            }, done);
        });
        test('cancelling a call via CancellationToken before', function (done) {
            delegate = (a1, a2) => a1 + a2;
            const p = bProxy.$m(4, cancellation_1.CancellationToken.Cancelled);
            p.then((res) => {
                assert.fail('should not receive result');
            }, (err) => {
                assert.ok(true);
                done(null);
            });
        });
        test('passing CancellationToken.None', function (done) {
            delegate = (a1, token) => {
                assert.ok(!!token);
                return a1 + 1;
            };
            bProxy.$m(4, cancellation_1.CancellationToken.None).then((res) => {
                assert.strictEqual(res, 5);
                done(null);
            }, done);
        });
        test('cancelling a call via CancellationToken quickly', function (done) {
            // this is an implementation which, when cancellation is triggered, will return 7
            delegate = (a1, token) => {
                return new Promise((resolve, reject) => {
                    const disposable = token.onCancellationRequested((e) => {
                        disposable.dispose();
                        resolve(7);
                    });
                });
            };
            const tokenSource = new cancellation_1.$pd();
            const p = bProxy.$m(4, tokenSource.token);
            p.then((res) => {
                assert.strictEqual(res, 7);
            }, (err) => {
                assert.fail('should not receive error');
            }).finally(done);
            tokenSource.cancel();
        });
        test('throwing an error', function (done) {
            delegate = (a1, a2) => {
                throw new Error(`nope`);
            };
            bProxy.$m(4, 1).then((res) => {
                assert.fail('unexpected');
            }, (err) => {
                assert.strictEqual(err.message, 'nope');
            }).finally(done);
        });
        test('error promise', function (done) {
            delegate = (a1, a2) => {
                return Promise.reject(undefined);
            };
            bProxy.$m(4, 1).then((res) => {
                assert.fail('unexpected');
            }, (err) => {
                assert.strictEqual(err, undefined);
            }).finally(done);
        });
        test('issue #60450: Converting circular structure to JSON', function (done) {
            delegate = (a1, a2) => {
                const circular = {};
                circular.self = circular;
                return circular;
            };
            bProxy.$m(4, 1).then((res) => {
                assert.strictEqual(res, null);
            }, (err) => {
                assert.fail('unexpected');
            }).finally(done);
        });
        test('issue #72798: null errors are hard to digest', function (done) {
            delegate = (a1, a2) => {
                // eslint-disable-next-line no-throw-literal
                throw { 'what': 'what' };
            };
            bProxy.$m(4, 1).then((res) => {
                assert.fail('unexpected');
            }, (err) => {
                assert.strictEqual(err.what, 'what');
            }).finally(done);
        });
        test('undefined arguments arrive as null', function () {
            delegate = (a1, a2) => {
                assert.strictEqual(typeof a1, 'undefined');
                assert.strictEqual(a2, null);
                return 7;
            };
            return bProxy.$m(undefined, null).then((res) => {
                assert.strictEqual(res, 7);
            });
        });
        test('issue #81424: SerializeRequest should throw if an argument can not be serialized', () => {
            const badObject = {};
            badObject.loop = badObject;
            assert.throws(() => {
                bProxy.$m(badObject, '2');
            });
        });
        test('SerializableObjectWithBuffers is correctly transfered', function (done) {
            delegate = (a1, a2) => {
                return new proxyIdentifier_1.$dA({ string: a1.value.string + ' world', buff: a1.value.buff });
            };
            const b = buffer_1.$Fd.alloc(4);
            b.buffer[0] = 1;
            b.buffer[1] = 2;
            b.buffer[2] = 3;
            b.buffer[3] = 4;
            bProxy.$m(new proxyIdentifier_1.$dA({ string: 'hello', buff: b }), undefined).then((res) => {
                assert.ok(res instanceof proxyIdentifier_1.$dA);
                assert.strictEqual(res.value.string, 'hello world');
                assert.ok(res.value.buff instanceof buffer_1.$Fd);
                const bufferValues = Array.from(res.value.buff.buffer);
                assert.strictEqual(bufferValues[0], 1);
                assert.strictEqual(bufferValues[1], 2);
                assert.strictEqual(bufferValues[2], 3);
                assert.strictEqual(bufferValues[3], 4);
                done(null);
            }, done);
        });
    });
});
//# sourceMappingURL=rpcProtocol.test.js.map