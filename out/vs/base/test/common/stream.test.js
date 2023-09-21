/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/stream", "vs/base/test/common/utils"], function (require, exports, assert, async_1, buffer_1, cancellation_1, stream_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Stream', () => {
        test('isReadable', () => {
            assert.ok(!(0, stream_1.isReadable)(undefined));
            assert.ok(!(0, stream_1.isReadable)(Object.create(null)));
            assert.ok((0, stream_1.isReadable)((0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(''))));
        });
        test('isReadableStream', () => {
            assert.ok(!(0, stream_1.isReadableStream)(undefined));
            assert.ok(!(0, stream_1.isReadableStream)(Object.create(null)));
            assert.ok((0, stream_1.isReadableStream)((0, stream_1.newWriteableStream)(d => d)));
        });
        test('isReadableBufferedStream', async () => {
            assert.ok(!(0, stream_1.isReadableBufferedStream)(Object.create(null)));
            const stream = (0, stream_1.newWriteableStream)(d => d);
            stream.end();
            const bufferedStream = await (0, stream_1.peekStream)(stream, 1);
            assert.ok((0, stream_1.isReadableBufferedStream)(bufferedStream));
        });
        test('WriteableStream - basics', () => {
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
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
            const stream = (0, stream_1.newWriteableStream)(reducer);
            stream.end('');
            const result = await (0, stream_1.consumeStream)(stream, reducer);
            assert.strictEqual(result, '');
        });
        test('WriteableStream - end with error works', async () => {
            const reducer = (errors) => errors[0];
            const stream = (0, stream_1.newWriteableStream)(reducer);
            stream.end(new Error('error'));
            const result = await (0, stream_1.consumeStream)(stream, reducer);
            assert.ok(result instanceof Error);
        });
        test('WriteableStream - removeListener', () => {
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
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
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join(), { highWaterMark: 3 });
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
            await (0, async_1.timeout)(0);
            assert.strictEqual(drained1, true);
            assert.strictEqual(drained2, true);
        });
        test('consumeReadable', () => {
            const readable = arrayToReadable(['1', '2', '3', '4', '5']);
            const consumed = (0, stream_1.consumeReadable)(readable, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('peekReadable', () => {
            for (let i = 0; i < 5; i++) {
                const readable = arrayToReadable(['1', '2', '3', '4', '5']);
                const consumedOrReadable = (0, stream_1.peekReadable)(readable, strings => strings.join(), i);
                if (typeof consumedOrReadable === 'string') {
                    assert.fail('Unexpected result');
                }
                else {
                    const consumed = (0, stream_1.consumeReadable)(consumedOrReadable, strings => strings.join());
                    assert.strictEqual(consumed, '1,2,3,4,5');
                }
            }
            let readable = arrayToReadable(['1', '2', '3', '4', '5']);
            let consumedOrReadable = (0, stream_1.peekReadable)(readable, strings => strings.join(), 5);
            assert.strictEqual(consumedOrReadable, '1,2,3,4,5');
            readable = arrayToReadable(['1', '2', '3', '4', '5']);
            consumedOrReadable = (0, stream_1.peekReadable)(readable, strings => strings.join(), 6);
            assert.strictEqual(consumedOrReadable, '1,2,3,4,5');
        });
        test('peekReadable - error handling', async () => {
            // 0 Chunks
            let stream = (0, stream_1.newWriteableStream)(data => data);
            let error = undefined;
            let promise = (async () => {
                try {
                    await (0, stream_1.peekStream)(stream, 1);
                }
                catch (err) {
                    error = err;
                }
            })();
            stream.error(new Error());
            await promise;
            assert.ok(error);
            // 1 Chunk
            stream = (0, stream_1.newWriteableStream)(data => data);
            error = undefined;
            promise = (async () => {
                try {
                    await (0, stream_1.peekStream)(stream, 1);
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
            stream = (0, stream_1.newWriteableStream)(data => data);
            error = undefined;
            promise = (async () => {
                try {
                    await (0, stream_1.peekStream)(stream, 1);
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
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
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
            const consumed = await (0, stream_1.consumeStream)(stream, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('consumeStream - without reducer', async () => {
            const stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            const consumed = await (0, stream_1.consumeStream)(stream);
            assert.strictEqual(consumed, undefined);
        });
        test('consumeStream - without reducer and error', async () => {
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
            stream.error(new Error());
            const consumed = await (0, stream_1.consumeStream)(stream);
            assert.strictEqual(consumed, undefined);
        });
        test('listenStream', () => {
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
            let error = false;
            let end = false;
            let data = '';
            (0, stream_1.listenStream)(stream, {
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
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
            let error = false;
            let end = false;
            let data = '';
            const cts = new cancellation_1.CancellationTokenSource();
            (0, stream_1.listenStream)(stream, {
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
                const result = await (0, stream_1.peekStream)(stream, i);
                assert.strictEqual(stream, result.stream);
                if (result.ended) {
                    assert.fail('Unexpected result, stream should not have ended yet');
                }
                else {
                    assert.strictEqual(result.buffer.length, i + 1, `maxChunks: ${i}`);
                    const additionalResult = [];
                    await (0, stream_1.consumeStream)(stream, strings => {
                        additionalResult.push(...strings);
                        return strings.join();
                    });
                    assert.strictEqual([...result.buffer, ...additionalResult].join(), '1,2,3,4,5');
                }
            }
            let stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            let result = await (0, stream_1.peekStream)(stream, 5);
            assert.strictEqual(stream, result.stream);
            assert.strictEqual(result.buffer.join(), '1,2,3,4,5');
            assert.strictEqual(result.ended, true);
            stream = readableToStream(arrayToReadable(['1', '2', '3', '4', '5']));
            result = await (0, stream_1.peekStream)(stream, 6);
            assert.strictEqual(stream, result.stream);
            assert.strictEqual(result.buffer.join(), '1,2,3,4,5');
            assert.strictEqual(result.ended, true);
        });
        test('toStream', async () => {
            const stream = (0, stream_1.toStream)('1,2,3,4,5', strings => strings.join());
            const consumed = await (0, stream_1.consumeStream)(stream, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('toReadable', async () => {
            const readable = (0, stream_1.toReadable)('1,2,3,4,5');
            const consumed = (0, stream_1.consumeReadable)(readable, strings => strings.join());
            assert.strictEqual(consumed, '1,2,3,4,5');
        });
        test('transform', async () => {
            const source = (0, stream_1.newWriteableStream)(strings => strings.join());
            const result = (0, stream_1.transform)(source, { data: string => string + string }, strings => strings.join());
            // Simulate async behavior
            setTimeout(() => {
                source.write('1');
                source.write('2');
                source.write('3');
                source.write('4');
                source.end('5');
            }, 0);
            const consumed = await (0, stream_1.consumeStream)(result, strings => strings.join());
            assert.strictEqual(consumed, '11,22,33,44,55');
        });
        test('events are delivered even if a listener is removed during delivery', () => {
            const stream = (0, stream_1.newWriteableStream)(strings => strings.join());
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
            let readable = (0, stream_1.prefixedReadable)('1,2', arrayToReadable(['3', '4', '5']), val => val.join(','));
            assert.strictEqual((0, stream_1.consumeReadable)(readable, val => val.join(',')), '1,2,3,4,5');
            // Empty
            readable = (0, stream_1.prefixedReadable)('empty', arrayToReadable([]), val => val.join(','));
            assert.strictEqual((0, stream_1.consumeReadable)(readable, val => val.join(',')), 'empty');
        });
        test('prefixedStream', async () => {
            // Basic
            let stream = (0, stream_1.newWriteableStream)(strings => strings.join());
            stream.write('3');
            stream.write('4');
            stream.write('5');
            stream.end();
            let prefixStream = (0, stream_1.prefixedStream)('1,2', stream, val => val.join(','));
            assert.strictEqual(await (0, stream_1.consumeStream)(prefixStream, val => val.join(',')), '1,2,3,4,5');
            // Empty
            stream = (0, stream_1.newWriteableStream)(strings => strings.join());
            stream.end();
            prefixStream = (0, stream_1.prefixedStream)('1,2', stream, val => val.join(','));
            assert.strictEqual(await (0, stream_1.consumeStream)(prefixStream, val => val.join(',')), '1,2');
            // Error
            stream = (0, stream_1.newWriteableStream)(strings => strings.join());
            stream.error(new Error('fail'));
            prefixStream = (0, stream_1.prefixedStream)('error', stream, val => val.join(','));
            let error;
            try {
                await (0, stream_1.consumeStream)(prefixStream, val => val.join(','));
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL3N0cmVhbS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBRXBCLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLG1CQUFVLEVBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBQSxtQkFBVSxFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBQSxtQkFBVSxFQUFDLElBQUEseUJBQWdCLEVBQUMsaUJBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQzdCLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFBLHlCQUFnQixFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUEseUJBQWdCLEVBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFBLHlCQUFnQixFQUFDLElBQUEsMkJBQWtCLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxJQUFJLEVBQUU7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