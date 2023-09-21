/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/nls!vs/platform/files/common/io", "vs/platform/files/common/files"], function (require, exports, buffer_1, errors_1, nls_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cp = void 0;
    /**
     * A helper to read a file from a provider with open/read/close capability into a stream.
     */
    async function $Cp(provider, resource, target, transformer, options, token) {
        let error = undefined;
        try {
            await doReadFileIntoStream(provider, resource, target, transformer, options, token);
        }
        catch (err) {
            error = err;
        }
        finally {
            if (error && options.errorTransformer) {
                error = options.errorTransformer(error);
            }
            if (typeof error !== 'undefined') {
                target.error(error);
            }
            target.end();
        }
    }
    exports.$Cp = $Cp;
    async function doReadFileIntoStream(provider, resource, target, transformer, options, token) {
        // Check for cancellation
        throwIfCancelled(token);
        // open handle through provider
        const handle = await provider.open(resource, { create: false });
        try {
            // Check for cancellation
            throwIfCancelled(token);
            let totalBytesRead = 0;
            let bytesRead = 0;
            let allowedRemainingBytes = (options && typeof options.length === 'number') ? options.length : undefined;
            let buffer = buffer_1.$Fd.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === 'number' ? allowedRemainingBytes : options.bufferSize));
            let posInFile = options && typeof options.position === 'number' ? options.position : 0;
            let posInBuffer = 0;
            do {
                // read from source (handle) at current position (pos) into buffer (buffer) at
                // buffer position (posInBuffer) up to the size of the buffer (buffer.byteLength).
                bytesRead = await provider.read(handle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
                posInFile += bytesRead;
                posInBuffer += bytesRead;
                totalBytesRead += bytesRead;
                if (typeof allowedRemainingBytes === 'number') {
                    allowedRemainingBytes -= bytesRead;
                }
                // when buffer full, create a new one and emit it through stream
                if (posInBuffer === buffer.byteLength) {
                    await target.write(transformer(buffer));
                    buffer = buffer_1.$Fd.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === 'number' ? allowedRemainingBytes : options.bufferSize));
                    posInBuffer = 0;
                }
            } while (bytesRead > 0 && (typeof allowedRemainingBytes !== 'number' || allowedRemainingBytes > 0) && throwIfCancelled(token) && throwIfTooLarge(totalBytesRead, options));
            // wrap up with last buffer (also respect maxBytes if provided)
            if (posInBuffer > 0) {
                let lastChunkLength = posInBuffer;
                if (typeof allowedRemainingBytes === 'number') {
                    lastChunkLength = Math.min(posInBuffer, allowedRemainingBytes);
                }
                target.write(transformer(buffer.slice(0, lastChunkLength)));
            }
        }
        catch (error) {
            throw (0, files_1.$gk)(error);
        }
        finally {
            await provider.close(handle);
        }
    }
    function throwIfCancelled(token) {
        if (token.isCancellationRequested) {
            throw (0, errors_1.$4)();
        }
        return true;
    }
    function throwIfTooLarge(totalBytesRead, options) {
        // Return early if file is too large to load and we have configured limits
        if (typeof options?.limits?.size === 'number' && totalBytesRead > options.limits.size) {
            throw (0, files_1.$fk)((0, nls_1.localize)(0, null), files_1.FileSystemProviderErrorCode.FileTooLarge);
        }
        return true;
    }
});
//# sourceMappingURL=io.js.map