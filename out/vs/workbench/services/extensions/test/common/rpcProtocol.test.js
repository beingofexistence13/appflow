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
                this._onMessage = new event_1.Emitter();
                this.onMessage = this._onMessage.event;
            }
            setPair(other) {
                this._pair = other;
            }
            send(buffer) {
                Promise.resolve().then(() => {
                    this._pair._onMessage.fire(buffer);
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
            disposables = new lifecycle_1.DisposableStore();
            const a_protocol = new MessagePassingProtocol();
            const b_protocol = new MessagePassingProtocol();
            a_protocol.setPair(b_protocol);
            b_protocol.setPair(a_protocol);
            const A = disposables.add(new rpcProtocol_1.RPCProtocol(a_protocol));
            const B = disposables.add(new rpcProtocol_1.RPCProtocol(b_protocol));
            const bIdentifier = new proxyIdentifier_1.ProxyIdentifier('bb');
            const bInstance = new BClass();
            B.set(bIdentifier, bInstance);
            bProxy = A.getProxy(bIdentifier);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
                assert.ok(a1 instanceof buffer_1.VSBuffer);
                return a1.buffer[a2];
            };
            const b = buffer_1.VSBuffer.alloc(4);
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
                const b = buffer_1.VSBuffer.alloc(4);
                b.buffer[0] = 1;
                b.buffer[1] = 2;
                b.buffer[2] = 3;
                b.buffer[3] = 4;
                return b;
            };
            bProxy.$m(4, 1).then((res) => {
                assert.ok(res instanceof buffer_1.VSBuffer);
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
            const tokenSource = new cancellation_1.CancellationTokenSource();
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
                return new proxyIdentifier_1.SerializableObjectWithBuffers({ string: a1.value.string + ' world', buff: a1.value.buff });
            };
            const b = buffer_1.VSBuffer.alloc(4);
            b.buffer[0] = 1;
            b.buffer[1] = 2;
            b.buffer[2] = 3;
            b.buffer[3] = 4;
            bProxy.$m(new proxyIdentifier_1.SerializableObjectWithBuffers({ string: 'hello', buff: b }), undefined).then((res) => {
                assert.ok(res instanceof proxyIdentifier_1.SerializableObjectWithBuffers);
                assert.strictEqual(res.value.string, 'hello world');
                assert.ok(res.value.buff instanceof buffer_1.VSBuffer);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjUHJvdG9jb2wudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL3Rlc3QvY29tbW9uL3JwY1Byb3RvY29sLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFFekIsSUFBSSxXQUE0QixDQUFDO1FBRWpDLE1BQU0sc0JBQXNCO1lBQTVCO2dCQUdrQixlQUFVLEdBQUcsSUFBSSxlQUFPLEVBQVksQ0FBQztnQkFDdEMsY0FBUyxHQUFvQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQVdwRSxDQUFDO1lBVE8sT0FBTyxDQUFDLEtBQTZCO2dCQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNwQixDQUFDO1lBRU0sSUFBSSxDQUFDLE1BQWdCO2dCQUMzQixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLEtBQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUM7U0FDRDtRQUVELElBQUksUUFBbUMsQ0FBQztRQUN4QyxJQUFJLE1BQWMsQ0FBQztRQUNuQixNQUFNLE1BQU07WUFDWCxFQUFFLENBQUMsRUFBTyxFQUFFLEVBQU87Z0JBQ2xCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxDQUFDO1NBQ0Q7UUFFRCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRXBDLE1BQU0sVUFBVSxHQUFHLElBQUksc0JBQXNCLEVBQUUsQ0FBQztZQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7WUFDaEQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMvQixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRS9CLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx5QkFBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsTUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHlCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUV2RCxNQUFNLFdBQVcsR0FBRyxJQUFJLGlDQUFlLENBQVMsSUFBSSxDQUFDLENBQUM7WUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5QixNQUFNLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLElBQUk7WUFDakMsUUFBUSxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUMvQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDRCQUE0QixFQUFFLFVBQVUsSUFBSTtZQUNoRCxRQUFRLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBVyxFQUFFLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDWixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLElBQUk7WUFDaEQsUUFBUSxHQUFHLENBQUMsRUFBWSxFQUFFLEVBQVUsRUFBRSxFQUFFO2dCQUN2QyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsWUFBWSxpQkFBUSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsR0FBRyxpQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsSUFBSTtZQUN4QyxRQUFRLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFhLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksaUJBQVEsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdEQUFnRCxFQUFFLFVBQVUsSUFBSTtZQUNwRSxRQUFRLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLGdDQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRTtnQkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsVUFBVSxJQUFJO1lBQ3BELFFBQVEsR0FBRyxDQUFDLEVBQVUsRUFBRSxLQUF3QixFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxnQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFXLEVBQUUsRUFBRTtnQkFDekQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlEQUFpRCxFQUFFLFVBQVUsSUFBSTtZQUNyRSxpRkFBaUY7WUFDakYsUUFBUSxHQUFHLENBQUMsRUFBVSxFQUFFLEtBQXdCLEVBQUUsRUFBRTtnQkFDbkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDdEMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7d0JBQ3RELFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDckIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNaLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDO1lBQ0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxzQ0FBdUIsRUFBRSxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBVyxFQUFFLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakIsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsSUFBSTtZQUN2QyxRQUFRLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQUU7Z0JBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDO1lBQ0YsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxJQUFJO1lBQ25DLFFBQVEsR0FBRyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBRTtnQkFDckMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNCLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxREFBcUQsRUFBRSxVQUFVLElBQUk7WUFDekUsUUFBUSxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFFO2dCQUNyQyxNQUFNLFFBQVEsR0FBUSxFQUFFLENBQUM7Z0JBQ3pCLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO2dCQUN6QixPQUFPLFFBQVEsQ0FBQztZQUNqQixDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDNUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0IsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOENBQThDLEVBQUUsVUFBVSxJQUFJO1lBQ2xFLFFBQVEsR0FBRyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBRTtnQkFDckMsNENBQTRDO2dCQUM1QyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNCLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsb0NBQW9DLEVBQUU7WUFDMUMsUUFBUSxHQUFHLENBQUMsRUFBTyxFQUFFLEVBQU8sRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0IsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDLENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUM5QyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtGQUFrRixFQUFFLEdBQUcsRUFBRTtZQUM3RixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDZixTQUFVLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztZQUVsQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtnQkFDbEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx1REFBdUQsRUFBRSxVQUFVLElBQUk7WUFDM0UsUUFBUSxHQUFHLENBQUMsRUFBcUUsRUFBRSxFQUFVLEVBQUUsRUFBRTtnQkFDaEcsT0FBTyxJQUFJLCtDQUE2QixDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZHLENBQUMsQ0FBQztZQUVGLE1BQU0sQ0FBQyxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWhCLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSwrQ0FBNkIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBdUMsRUFBRSxFQUFFO2dCQUN0SSxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSwrQ0FBNkIsQ0FBQyxDQUFDO2dCQUN4RCxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVwRCxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxZQUFZLGlCQUFRLENBQUMsQ0FBQztnQkFFOUMsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFdkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==