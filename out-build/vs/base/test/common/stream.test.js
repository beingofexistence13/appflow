/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/stream", "vs/base/test/common/utils"], function (require, exports, assert, async_1, buffer_1, cancellation_1, stream_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Stream', () => {
        test('isReadable', () => {
            assert.ok(!(0, stream_1.$qd)(undefined));
            assert.ok(!(0, stream_1.$qd)(Object.create(null)));
            assert.ok((0, stream_1.$qd)((0, buffer_1.$Qd)(buffer_1.$Fd.fromString(''))));
        });
        test('isReadableStream', () => {
            assert.ok(!(0, stream_1.$rd)(undefined));
            assert.ok(!(0, stream_1.$rd)(Object.create(null)));
            assert.ok((0, stream_1.$rd)((0, stream_1.$td)(d => d)));
        });
        test('isReadableBufferedStream', async () => {
            assert.ok(!(0, stream_1.$sd)(Object.create(null)));
            const stream = (0, stream_1.$td)(d => d);
            stream.end();
            const bufferedStream = await (0, stream_1.$yd)(stream, 1);
            assert.ok((0, stream_1.$sd)(bufferedStream));
        });
        test('WriteableStream - basics', () => {
            const stream = (0, stream_1.$td)(strings => strings.join());
            let error = false;
            stream.on('error', e => {
                error = true;
            });
            let end = false;
            stream.on('end', () => {
                end = true;
            });
            stream.write('Hello');
            const chunks = [];
            stream.on('data', data => {
                chunks.push(data);
            });
            assert.strictEqual(chunks[0], 'Hello');
            stream.write('World');
            assert.strictEqual(chunks[1], 'World');
            assert.strictEqual(error, false);
            assert.strictEqual(end, false);
            stream.pause();
            stream.write('1');
            stream.write('2');
            stream.write('3');
            assert.strictEqual(chunks.length, 2);
            stream.resume();
            assert.strictEqual(chunks.length, 3);
            assert.strictEqual(chunks[2], '1,2,3');
            stream.error(new Error());
            assert.strictEqual(error, true);
            error = false;
            stream.error(new Error());
            assert.strictEqual(error, true);
            stream.end('Final Bit');
            assert.strictEqual(chunks.length, 4);
            assert.strictEqual(chunks[3], 'Final Bit');
            assert.strictEqual(end, true);
            stream.destroy();
            stream.write('Unexpected');
            assert.strictEqual(chunks.length, 4);
        });
        test('WriteableStream - end with empty string works', async () => {
            const reducer = (strings) => strings.length > 0 ? strings.join() : 'error';
            const stream = (0, stream_1.$td)(reducer);
            stream.end('');
            const result = await (0, stream_1.$wd)(stream, reducer);
            assert.strictEqual(result, '');
        });
        test('WriteableStream - end with error works', async () => {
            const reducer = (errors) => errors[0];
            const stream = (0, stream_1.$td)(reducer);
            stream.end(new Error('error'));
            const result = await (0, stream_1.$wd)(stream, reducer);
            assert.ok(result instanceof Error);
        });
        test('WriteableStream - removeListener', () => {
            const stream = (0, stream_1.$td)(strings => strings.join());
            let error = false;
            const errorListener = (e) => {
                error = true;
            };
            stream.on('error', errorListener);
            let data = false;
            const dataListener = () => {
                data = true;
            };
            stream.on('data', dataListener);
            stream.write('Hello');
            assert.strictEqual(data, true);
            data = false;
            stream.removeListener('data', dataListener);
            stream.write('World');
            assert.strictEqual(data, false);
            stream.error(new Error());
            assert.strictEqual(error, true);
            error = false;
            stream.removeListener('error', errorListener);
            // always leave at least one error listener to streams to avoid unexpected errors during test running
            stream.on('error', () => { });
            stream.error(new Error());
            assert.strictEqual(error, false);
        });
        test('WriteableStream - highWaterMark', async () => {
            const stream = (0, stream_1.$td)(strings => strings.join(), { highWaterMark: 3 });
            let res = stream.write('1');
            assert.ok(!res);
            res = stream.write('2');
            assert.ok(!res);
            res = stream.write('3');
            assert.ok(!res);
            const promise1 = stream.write('4');
            assert.ok(promise1 instanceof Promise);
            const promise2 = stream.write('5');
            assert.ok(promise2 instanceof Promise);
            let drained1 = false;
            (async () => {
                await promise1;
                drained1 = true;
            })();
            let drained2 = false;
            (async () => {
                await promise2;
                drained2 = true;
            })();
            let data = undefined;
            stream.on('data', chunk => {
                data = chunk;
            });
            assert.ok(data);
            await (0, async_1.$Hg)(0);
            assert.strictEqual(drained1, true);
            assert.strictEqual(drained2, true);
        });
        test('consumeReadable', () => {
            const readable = arrayToReadable(['1', '2', '3', '4', '5']);
            const consumed = (0, stream_1.$ud)(readable, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('peekReadable', () => {
            for (let i = 0; i < 5; i++) {
                const readable = arrayToReadable(['1', '2', '3', '4', '5']);
                const consumedOrReadable = (0, stream_1.$vd)(readable, strings => strings.join(), i);
                if (typeof consumedOrReadable === 'string') {
                    assert.fail('Unexpected result');
                }
                else {
                    const consumed = (0, stream_1.$ud)(consumedOrReadable, strings => strings.join());
                    assert.strictEqual(consumed, '1,2,3,4,5');
                }
            }
            let readable = arrayToReadable(['1', '2', '3', '4', '5']);
            let consumedOrReadable = (0, stream_1.$vd)(readable, strings => strings.join(), 5);
            assert.strictEqual(consumedOrReadable, '1,2,3,4,5');
            readable = arrayToReadable(['1', '2', '3', '4', '5']);
            consumedOrReadable = (0, stream_1.$vd)(readable, strings => strings.join(), 6);
            assert.strictEqual(consumedOrReadable, '1,2,3,4,5');
        });
        test('peekReadable - error handling', async () => {
            // 0 Chunks
            let stream = (0, stream_1.$td)(data => data);
            let error = undefined;
            let promise = (async () => {
                try {
                    await (0, stream_1.$yd)(stream, 1);
                }
                catch (err) {
                    error = err;
                }
            })();
            stream.error(new Error());
            await promise;
            assert.ok(error);
            // 1 Chunk
            stream = (0, stream_1.$td)(data => data);
            error = undefined;
            promise = (async () => {
                try {
                    await (0, stream_1.$yd)(stream, 1);
                }
                catch (err) {
                    error = err;
                }
            })();
            stream.write('foo');
            stream.error(new Error());
            await promise;
            assert.ok(error);
            // 2 Chunks
            stream = (0, stream_1.$td)(data => data);
            error = undefined;
            promise = (async () => {
                try {
                    await (0, stream_1.$yd)(stream, 1);
                }
                catch (err) {
                    error = err;
                }
            })();
            stream.write('foo');
            stream.write('bar');
            stream.error(new Error());
            await promise;
            assert.ok(!error);
            stream.on('error', err => error = err);
            stream.on('data', chunk => { });
            assert.ok(error);
        });
        function arrayToReadable(array) {
            return {
                read: () => array.shift() || null
            };
        }
        function readableToStream(readable) {
            const stream = (0, stream_1.$td)(strings => strings.join());
            // Simulate async behavior
            setTimeout(() => {
                let chunk = null;
                while ((chunk = readable.read()) !== null) {
                    stream.write(chunk);
                }
                stream.end();
            }, 0);
            return stream;
        }
        test('consumeStream', async () => {
            const stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            const consumed = await (0, stream_1.$wd)(stream, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('consumeStream - without reducer', async () => {
            const stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            const consumed = await (0, stream_1.$wd)(stream);
            assert.strictEqual(consumed, undefined);
        });
        test('consumeStream - without reducer and error', async () => {
            const stream = (0, stream_1.$td)(strings => strings.join());
            stream.error(new Error());
            const consumed = await (0, stream_1.$wd)(stream);
            assert.strictEqual(consumed, undefined);
        });
        test('listenStream', () => {
            const stream = (0, stream_1.$td)(strings => strings.join());
            let error = false;
            let end = false;
            let data = '';
            (0, stream_1.$xd)(stream, {
                onData: d => {
                    data = d;
                },
                onError: e => {
                    error = true;
                },
                onEnd: () => {
                    end = true;
                }
            });
            stream.write('Hello');
            assert.strictEqual(data, 'Hello');
            stream.write('World');
            assert.strictEqual(data, 'World');
            assert.strictEqual(error, false);
            assert.strictEqual(end, false);
            stream.error(new Error());
            assert.strictEqual(error, true);
            stream.end('Final Bit');
            assert.strictEqual(end, true);
        });
        test('listenStream - cancellation', () => {
            const stream = (0, stream_1.$td)(strings => strings.join());
            let error = false;
            let end = false;
            let data = '';
            const cts = new cancellation_1.$pd();
            (0, stream_1.$xd)(stream, {
                onData: d => {
                    data = d;
                },
                onError: e => {
                    error = true;
                },
                onEnd: () => {
                    end = true;
                }
            }, cts.token);
            cts.cancel();
            stream.write('Hello');
            assert.strictEqual(data, '');
            stream.write('World');
            assert.strictEqual(data, '');
            stream.error(new Error());
            assert.strictEqual(error, false);
            stream.end('Final Bit');
            assert.strictEqual(end, false);
        });
        test('peekStream', async () => {
            for (let i = 0; i < 5; i++) {
                const stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
                const result = await (0, stream_1.$yd)(stream, i);
                assert.strictEqual(stream, result.stream);
                if (result.ended) {
                    assert.fail('Unexpected result, stream should not have ended yet');
                }
                else {
                    assert.strictEqual(result.buffer.length, i + 1, `maxChunks: ${i}`);
                    const additionalResult = [];
                    await (0, stream_1.$wd)(stream, strings => {
                        additionalResult.push(...strings);
                        return strings.join();
                    });
                    assert.strictEqual([...result.buffer, ...additionalResult].join(), '1,2,3,4,5');
                }
            }
            let stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            let result = await (0, stream_1.$yd)(stream, 5);
            assert.strictEqual(stream, result.stream);
            assert.strictEqual(result.buffer.join(), '1,2,3,4,5');
            assert.strictEqual(result.ended, true);
            stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            result = await (0, stream_1.$yd)(stream, 6);
            assert.strictEqual(stream, result.stream);
            assert.strictEqual(result.buffer.join(), '1,2,3,4,5');
            assert.strictEqual(result.ended, true);
        });
        test('toStream', async () => {
            const stream = (0, stream_1.$zd)('1,2,3,4,5', strings => strings.join());
            const consumed = await (0, stream_1.$wd)(stream, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('toReadable', async () => {
            const readable = (0, stream_1.$Bd)('1,2,3,4,5');
            const consumed = (0, stream_1.$ud)(readable, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('transform', async () => {
            const source = (0, stream_1.$td)(strings => strings.join());
            const result = (0, stream_1.$Cd)(source, { data: string => string + string }, strings => strings.join());
            // Simulate async behavior
            setTimeout(() => {
                source.write('1');
                source.write('2');
                source.write('3');
                source.write('4');
                source.end('5');
            }, 0);
            const consumed = await (0, stream_1.$wd)(result, strings => strings.join());
            assert.strictEqual(consumed, '11,22,33,44,55');
        });
        test('events are delivered even if a listener is removed during delivery', () => {
            const stream = (0, stream_1.$td)(strings => strings.join());
            let listener1Called = false;
            let listener2Called = false;
            const listener1 = () => { stream.removeListener('end', listener1); listener1Called = true; };
            const listener2 = () => { listener2Called = true; };
            stream.on('end', listener1);
            stream.on('end', listener2);
            stream.on('data', () => { });
            stream.end('');
            assert.strictEqual(listener1Called, true);
            assert.strictEqual(listener2Called, true);
        });
        test('prefixedReadable', () => {
            // Basic
            let readable = (0, stream_1.$Dd)('1,2', arrayToReadable(['3', '4', '5']), val => val.join(','));
            assert.strictEqual((0, stream_1.$ud)(readable, val => val.join(',')), '1,2,3,4,5');
            // Empty
            readable = (0, stream_1.$Dd)('empty', arrayToReadable([]), val => val.join(','));
            assert.strictEqual((0, stream_1.$ud)(readable, val => val.join(',')), 'empty');
        });
        test('prefixedStream', async () => {
            // Basic
            let stream = (0, stream_1.$td)(strings => strings.join());
            stream.write('3');
            stream.write('4');
            stream.write('5');
            stream.end();
            let prefixStream = (0, stream_1.$Ed)('1,2', stream, val => val.join(','));
            assert.strictEqual(await (0, stream_1.$wd)(prefixStream, val => val.join(',')), '1,2,3,4,5');
            // Empty
            stream = (0, stream_1.$td)(strings => strings.join());
            stream.end();
            prefixStream = (0, stream_1.$Ed)('1,2', stream, val => val.join(','));
            assert.strictEqual(await (0, stream_1.$wd)(prefixStream, val => val.join(',')), '1,2');
            // Error
            stream = (0, stream_1.$td)(strings => strings.join());
            stream.error(new Error('fail'));
            prefixStream = (0, stream_1.$Ed)('error', stream, val => val.join(','));
            let error;
            try {
                await (0, stream_1.$wd)(prefixStream, val => val.join(','));
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=stream.test.js.map