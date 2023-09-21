/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle"], function (require, exports, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prefixedStream = exports.prefixedReadable = exports.transform = exports.toReadable = exports.emptyStream = exports.toStream = exports.peekStream = exports.listenStream = exports.consumeStream = exports.peekReadable = exports.consumeReadable = exports.newWriteableStream = exports.isReadableBufferedStream = exports.isReadableStream = exports.isReadable = void 0;
    function isReadable(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return typeof candidate.read === 'function';
    }
    exports.isReadable = isReadable;
    function isReadableStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return [candidate.on, candidate.pause, candidate.resume, candidate.destroy].every(fn => typeof fn === 'function');
    }
    exports.isReadableStream = isReadableStream;
    function isReadableBufferedStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return isReadableStream(candidate.stream) && Array.isArray(candidate.buffer) && typeof candidate.ended === 'boolean';
    }
    exports.isReadableBufferedStream = isReadableBufferedStream;
    function newWriteableStream(reducer, options) {
        return new WriteableStreamImpl(reducer, options);
    }
    exports.newWriteableStream = newWriteableStream;
    class WriteableStreamImpl {
        constructor(reducer, options) {
            this.reducer = reducer;
            this.options = options;
            this.state = {
                flowing: false,
                ended: false,
                destroyed: false
            };
            this.buffer = {
                data: [],
                error: []
            };
            this.listeners = {
                data: [],
                error: [],
                end: []
            };
            this.pendingWritePromises = [];
        }
        pause() {
            if (this.state.destroyed) {
                return;
            }
            this.state.flowing = false;
        }
        resume() {
            if (this.state.destroyed) {
                return;
            }
            if (!this.state.flowing) {
                this.state.flowing = true;
                // emit buffered events
                this.flowData();
                this.flowErrors();
                this.flowEnd();
            }
        }
        write(data) {
            if (this.state.destroyed) {
                return;
            }
            // flowing: directly send the data to listeners
            if (this.state.flowing) {
                this.emitData(data);
            }
            // not yet flowing: buffer data until flowing
            else {
                this.buffer.data.push(data);
                // highWaterMark: if configured, signal back when buffer reached limits
                if (typeof this.options?.highWaterMark === 'number' && this.buffer.data.length > this.options.highWaterMark) {
                    return new Promise(resolve => this.pendingWritePromises.push(resolve));
                }
            }
        }
        error(error) {
            if (this.state.destroyed) {
                return;
            }
            // flowing: directly send the error to listeners
            if (this.state.flowing) {
                this.emitError(error);
            }
            // not yet flowing: buffer errors until flowing
            else {
                this.buffer.error.push(error);
            }
        }
        end(result) {
            if (this.state.destroyed) {
                return;
            }
            // end with data if provided
            if (typeof result !== 'undefined') {
                this.write(result);
            }
            // flowing: send end event to listeners
            if (this.state.flowing) {
                this.emitEnd();
                this.destroy();
            }
            // not yet flowing: remember state
            else {
                this.state.ended = true;
            }
        }
        emitData(data) {
            this.listeners.data.slice(0).forEach(listener => listener(data)); // slice to avoid listener mutation from delivering event
        }
        emitError(error) {
            if (this.listeners.error.length === 0) {
                (0, errors_1.onUnexpectedError)(error); // nobody listened to this error so we log it as unexpected
            }
            else {
                this.listeners.error.slice(0).forEach(listener => listener(error)); // slice to avoid listener mutation from delivering event
            }
        }
        emitEnd() {
            this.listeners.end.slice(0).forEach(listener => listener()); // slice to avoid listener mutation from delivering event
        }
        on(event, callback) {
            if (this.state.destroyed) {
                return;
            }
            switch (event) {
                case 'data':
                    this.listeners.data.push(callback);
                    // switch into flowing mode as soon as the first 'data'
                    // listener is added and we are not yet in flowing mode
                    this.resume();
                    break;
                case 'end':
                    this.listeners.end.push(callback);
                    // emit 'end' event directly if we are flowing
                    // and the end has already been reached
                    //
                    // finish() when it went through
                    if (this.state.flowing && this.flowEnd()) {
                        this.destroy();
                    }
                    break;
                case 'error':
                    this.listeners.error.push(callback);
                    // emit buffered 'error' events unless done already
                    // now that we know that we have at least one listener
                    if (this.state.flowing) {
                        this.flowErrors();
                    }
                    break;
            }
        }
        removeListener(event, callback) {
            if (this.state.destroyed) {
                return;
            }
            let listeners = undefined;
            switch (event) {
                case 'data':
                    listeners = this.listeners.data;
                    break;
                case 'end':
                    listeners = this.listeners.end;
                    break;
                case 'error':
                    listeners = this.listeners.error;
                    break;
            }
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            }
        }
        flowData() {
            if (this.buffer.data.length > 0) {
                const fullDataBuffer = this.reducer(this.buffer.data);
                this.emitData(fullDataBuffer);
                this.buffer.data.length = 0;
                // When the buffer is empty, resolve all pending writers
                const pendingWritePromises = [...this.pendingWritePromises];
                this.pendingWritePromises.length = 0;
                pendingWritePromises.forEach(pendingWritePromise => pendingWritePromise());
            }
        }
        flowErrors() {
            if (this.listeners.error.length > 0) {
                for (const error of this.buffer.error) {
                    this.emitError(error);
                }
                this.buffer.error.length = 0;
            }
        }
        flowEnd() {
            if (this.state.ended) {
                this.emitEnd();
                return this.listeners.end.length > 0;
            }
            return false;
        }
        destroy() {
            if (!this.state.destroyed) {
                this.state.destroyed = true;
                this.state.ended = true;
                this.buffer.data.length = 0;
                this.buffer.error.length = 0;
                this.listeners.data.length = 0;
                this.listeners.error.length = 0;
                this.listeners.end.length = 0;
                this.pendingWritePromises.length = 0;
            }
        }
    }
    /**
     * Helper to fully read a T readable into a T.
     */
    function consumeReadable(readable, reducer) {
        const chunks = [];
        let chunk;
        while ((chunk = readable.read()) !== null) {
            chunks.push(chunk);
        }
        return reducer(chunks);
    }
    exports.consumeReadable = consumeReadable;
    /**
     * Helper to read a T readable up to a maximum of chunks. If the limit is
     * reached, will return a readable instead to ensure all data can still
     * be read.
     */
    function peekReadable(readable, reducer, maxChunks) {
        const chunks = [];
        let chunk = undefined;
        while ((chunk = readable.read()) !== null && chunks.length < maxChunks) {
            chunks.push(chunk);
        }
        // If the last chunk is null, it means we reached the end of
        // the readable and return all the data at once
        if (chunk === null && chunks.length > 0) {
            return reducer(chunks);
        }
        // Otherwise, we still have a chunk, it means we reached the maxChunks
        // value and as such we return a new Readable that first returns
        // the existing read chunks and then continues with reading from
        // the underlying readable.
        return {
            read: () => {
                // First consume chunks from our array
                if (chunks.length > 0) {
                    return chunks.shift();
                }
                // Then ensure to return our last read chunk
                if (typeof chunk !== 'undefined') {
                    const lastReadChunk = chunk;
                    // explicitly use undefined here to indicate that we consumed
                    // the chunk, which could have either been null or valued.
                    chunk = undefined;
                    return lastReadChunk;
                }
                // Finally delegate back to the Readable
                return readable.read();
            }
        };
    }
    exports.peekReadable = peekReadable;
    function consumeStream(stream, reducer) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            listenStream(stream, {
                onData: chunk => {
                    if (reducer) {
                        chunks.push(chunk);
                    }
                },
                onError: error => {
                    if (reducer) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                },
                onEnd: () => {
                    if (reducer) {
                        resolve(reducer(chunks));
                    }
                    else {
                        resolve(undefined);
                    }
                }
            });
        });
    }
    exports.consumeStream = consumeStream;
    /**
     * Helper to listen to all events of a T stream in proper order.
     */
    function listenStream(stream, listener, token) {
        stream.on('error', error => {
            if (!token?.isCancellationRequested) {
                listener.onError(error);
            }
        });
        stream.on('end', () => {
            if (!token?.isCancellationRequested) {
                listener.onEnd();
            }
        });
        // Adding the `data` listener will turn the stream
        // into flowing mode. As such it is important to
        // add this listener last (DO NOT CHANGE!)
        stream.on('data', data => {
            if (!token?.isCancellationRequested) {
                listener.onData(data);
            }
        });
    }
    exports.listenStream = listenStream;
    /**
     * Helper to peek up to `maxChunks` into a stream. The return type signals if
     * the stream has ended or not. If not, caller needs to add a `data` listener
     * to continue reading.
     */
    function peekStream(stream, maxChunks) {
        return new Promise((resolve, reject) => {
            const streamListeners = new lifecycle_1.DisposableStore();
            const buffer = [];
            // Data Listener
            const dataListener = (chunk) => {
                // Add to buffer
                buffer.push(chunk);
                // We reached maxChunks and thus need to return
                if (buffer.length > maxChunks) {
                    // Dispose any listeners and ensure to pause the
                    // stream so that it can be consumed again by caller
                    streamListeners.dispose();
                    stream.pause();
                    return resolve({ stream, buffer, ended: false });
                }
            };
            // Error Listener
            const errorListener = (error) => {
                streamListeners.dispose();
                return reject(error);
            };
            // End Listener
            const endListener = () => {
                streamListeners.dispose();
                return resolve({ stream, buffer, ended: true });
            };
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('error', errorListener)));
            stream.on('error', errorListener);
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('end', endListener)));
            stream.on('end', endListener);
            // Important: leave the `data` listener last because
            // this can turn the stream into flowing mode and we
            // want `error` events to be received as well.
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('data', dataListener)));
            stream.on('data', dataListener);
        });
    }
    exports.peekStream = peekStream;
    /**
     * Helper to create a readable stream from an existing T.
     */
    function toStream(t, reducer) {
        const stream = newWriteableStream(reducer);
        stream.end(t);
        return stream;
    }
    exports.toStream = toStream;
    /**
     * Helper to create an empty stream
     */
    function emptyStream() {
        const stream = newWriteableStream(() => { throw new Error('not supported'); });
        stream.end();
        return stream;
    }
    exports.emptyStream = emptyStream;
    /**
     * Helper to convert a T into a Readable<T>.
     */
    function toReadable(t) {
        let consumed = false;
        return {
            read: () => {
                if (consumed) {
                    return null;
                }
                consumed = true;
                return t;
            }
        };
    }
    exports.toReadable = toReadable;
    /**
     * Helper to transform a readable stream into another stream.
     */
    function transform(stream, transformer, reducer) {
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => target.write(transformer.data(data)),
            onError: error => target.error(transformer.error ? transformer.error(error) : error),
            onEnd: () => target.end()
        });
        return target;
    }
    exports.transform = transform;
    /**
     * Helper to take an existing readable that will
     * have a prefix injected to the beginning.
     */
    function prefixedReadable(prefix, readable, reducer) {
        let prefixHandled = false;
        return {
            read: () => {
                const chunk = readable.read();
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    // If we have also a read-result, make
                    // sure to reduce it to a single result
                    if (chunk !== null) {
                        return reducer([prefix, chunk]);
                    }
                    // Otherwise, just return prefix directly
                    return prefix;
                }
                return chunk;
            }
        };
    }
    exports.prefixedReadable = prefixedReadable;
    /**
     * Helper to take an existing stream that will
     * have a prefix injected to the beginning.
     */
    function prefixedStream(prefix, stream, reducer) {
        let prefixHandled = false;
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    return target.write(reducer([prefix, data]));
                }
                return target.write(data);
            },
            onError: error => target.error(error),
            onEnd: () => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    target.write(prefix);
                }
                target.end();
            }
        });
        return target;
    }
    exports.prefixedStream = prefixedStream;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vc3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQStFaEcsU0FBZ0IsVUFBVSxDQUFJLEdBQVk7UUFDekMsTUFBTSxTQUFTLEdBQUcsR0FBOEIsQ0FBQztRQUNqRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2YsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELE9BQU8sT0FBTyxTQUFTLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztJQUM3QyxDQUFDO0lBUEQsZ0NBT0M7SUFnRUQsU0FBZ0IsZ0JBQWdCLENBQUksR0FBWTtRQUMvQyxNQUFNLFNBQVMsR0FBRyxHQUFvQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxVQUFVLENBQUMsQ0FBQztJQUNuSCxDQUFDO0lBUEQsNENBT0M7SUFFRCxTQUFnQix3QkFBd0IsQ0FBSSxHQUFZO1FBQ3ZELE1BQU0sU0FBUyxHQUFHLEdBQTRDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNmLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxPQUFPLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDO0lBQ3RILENBQUM7SUFQRCw0REFPQztJQW1CRCxTQUFn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