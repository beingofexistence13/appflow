/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/errors", "vs/nls", "vs/platform/files/common/files"], function (require, exports, buffer_1, errors_1, nls_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readFileIntoStream = void 0;
    /**
     * A helper to read a file from a provider with open/read/close capability into a stream.
     */
    async function readFileIntoStream(provider, resource, target, transformer, options, token) {
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
    exports.readFileIntoStream = readFileIntoStream;
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
            let buffer = buffer_1.VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === 'number' ? allowedRemainingBytes : options.bufferSize));
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
                    buffer = buffer_1.VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === 'number' ? allowedRemainingBytes : options.bufferSize));
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
            throw (0, files_1.ensureFileSystemProviderError)(error);
        }
        finally {
            await provider.close(handle);
        }
    }
    function throwIfCancelled(token) {
        if (token.isCancellationRequested) {
            throw (0, errors_1.canceled)();
        }
        return true;
    }
    function throwIfTooLarge(totalBytesRead, options) {
        // Return early if file is too large to load and we have configured limits
        if (typeof options?.limits?.size === 'number' && totalBytesRead > options.limits.size) {
            throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)('fileTooLargeError', "File is too large to open"), files_1.FileSystemProviderErrorCode.FileTooLarge);
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9maWxlcy9jb21tb24vaW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRzs7T0FFRztJQUNJLEtBQUssVUFBVSxrQkFBa0IsQ0FDdkMsUUFBNkQsRUFDN0QsUUFBYSxFQUNiLE1BQTBCLEVBQzFCLFdBQTBDLEVBQzFDLE9BQWlDLEVBQ2pDLEtBQXdCO1FBRXhCLElBQUksS0FBSyxHQUFzQixTQUFTLENBQUM7UUFFekMsSUFBSTtZQUNILE1BQU0sb0JBQW9CLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNwRjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUNaO2dCQUFTO1lBQ1QsSUFBSSxLQUFLLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFO2dCQUN0QyxLQUFLLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQ2pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEI7WUFFRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDYjtJQUNGLENBQUM7SUF6QkQsZ0RBeUJDO0lBRUQsS0FBSyxVQUFVLG9CQUFvQixDQUFJLFFBQTZELEVBQUUsUUFBYSxFQUFFLE1BQTBCLEVBQUUsV0FBMEMsRUFBRSxPQUFpQyxFQUFFLEtBQXdCO1FBRXZQLHlCQUF5QjtRQUN6QixnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4QiwrQkFBK0I7UUFDL0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFB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