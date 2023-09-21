/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/async", "vs/base/common/path", "vs/base/common/types", "vs/base/node/pfs", "vs/nls!vs/base/node/zip", "yauzl", "yazl"], function (require, exports, fs_1, async_1, path, types_1, pfs_1, nls, yauzl_1, yazl) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ep = exports.$dp = exports.zip = exports.$bp = exports.$ap = void 0;
    exports.$ap = 'end of central directory record signature not found';
    const CORRUPT_ZIP_PATTERN = new RegExp(exports.$ap);
    class $bp extends Error {
        constructor(type, cause) {
            let message = cause.message;
            switch (type) {
                case 'CorruptZip':
                    message = `Corrupt ZIP: ${message}`;
                    break;
            }
            super(message);
            this.type = type;
            this.cause = cause;
        }
    }
    exports.$bp = $bp;
    function modeFromEntry(entry) {
        const attr = entry.externalFileAttributes >> 16 || 33188;
        return [448 /* S_IRWXU */, 56 /* S_IRWXG */, 7 /* S_IRWXO */]
            .map(mask => attr & mask)
            .reduce((a, b) => a + b, attr & 61440 /* S_IFMT */);
    }
    function toExtractError(err) {
        if (err instanceof $bp) {
            return err;
        }
        let type = undefined;
        if (CORRUPT_ZIP_PATTERN.test(err.message)) {
            type = 'CorruptZip';
        }
        return new $bp(type, err);
    }
    function extractEntry(stream, fileName, mode, targetPath, options, token) {
        const dirName = path.$_d(fileName);
        const targetDirName = path.$9d(targetPath, dirName);
        if (!targetDirName.startsWith(targetPath)) {
            return Promise.reject(new Error(nls.localize(0, null, fileName)));
        }
        const targetFileName = path.$9d(targetPath, fileName);
        let istream;
        token.onCancellationRequested(() => {
            istream?.destroy();
        });
        return Promise.resolve(pfs_1.Promises.mkdir(targetDirName, { recursive: true })).then(() => new Promise((c, e) => {
            if (token.isCancellationRequested) {
                return;
            }
            try {
                istream = (0, fs_1.createWriteStream)(targetFileName, { mode });
                istream.once('close', () => c());
                istream.once('error', e);
                stream.once('error', e);
                stream.pipe(istream);
            }
            catch (error) {
                e(error);
            }
        }));
    }
    function extractZip(zipfile, targetPath, options, token) {
        let last = (0, async_1.$ug)(() => Promise.resolve());
        let extractedEntriesCount = 0;
        const listener = token.onCancellationRequested(() => {
            last.cancel();
            zipfile.close();
        });
        return new Promise((c, e) => {
            const throttler = new async_1.$Bg();
            const readNextEntry = (token) => {
                if (token.isCancellationRequested) {
                    return;
                }
                extractedEntriesCount++;
                zipfile.readEntry();
            };
            zipfile.once('error', e);
            zipfile.once('close', () => last.then(() => {
                if (token.isCancellationRequested || zipfile.entryCount === extractedEntriesCount) {
                    c();
                }
                else {
                    e(new $bp('Incomplete', new Error(nls.localize(1, null, extractedEntriesCount, zipfile.entryCount))));
                }
            }, e));
            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                if (token.isCancellationRequested) {
                    return;
                }
                if (!options.sourcePathRegex.test(entry.fileName)) {
                    readNextEntry(token);
                    return;
                }
                const fileName = entry.fileName.replace(options.sourcePathRegex, '');
                // directory file names end with '/'
                if (/\/$/.test(fileName)) {
                    const targetFileName = path.$9d(targetPath, fileName);
                    last = (0, async_1.$ug)(token => pfs_1.Promises.mkdir(targetFileName, { recursive: true }).then(() => readNextEntry(token)).then(undefined, e));
                    return;
                }
                const stream = openZipStream(zipfile, entry);
                const mode = modeFromEntry(entry);
                last = (0, async_1.$ug)(token => throttler.queue(() => stream.then(stream => extractEntry(stream, fileName, mode, targetPath, options, token).then(() => readNextEntry(token)))).then(null, e));
            });
        }).finally(() => listener.dispose());
    }
    function openZip(zipFile, lazy = false) {
        return new Promise((resolve, reject) => {
            (0, yauzl_1.open)(zipFile, lazy ? { lazyEntries: true } : undefined, (error, zipfile) => {
                if (error) {
                    reject(toExtractError(error));
                }
                else {
                    resolve((0, types_1.$uf)(zipfile));
                }
            });
        });
    }
    function openZipStream(zipFile, entry) {
        return new Promise((resolve, reject) => {
            zipFile.openReadStream(entry, (error, stream) => {
                if (error) {
                    reject(toExtractError(error));
                }
                else {
                    resolve((0, types_1.$uf)(stream));
                }
            });
        });
    }
    function zip(zipPath, files) {
        return new Promise((c, e) => {
            const zip = new yazl.ZipFile();
            files.forEach(f => {
                if (f.contents) {
                    zip.addBuffer(typeof f.contents === 'string' ? Buffer.from(f.contents, 'utf8') : f.contents, f.path);
                }
                else if (f.localPath) {
                    zip.addFile(f.localPath, f.path);
                }
            });
            zip.end();
            const zipStream = (0, fs_1.createWriteStream)(zipPath);
            zip.outputStream.pipe(zipStream);
            zip.outputStream.once('error', e);
            zipStream.once('error', e);
            zipStream.once('finish', () => c(zipPath));
        });
    }
    exports.zip = zip;
    function $dp(zipPath, targetPath, options = {}, token) {
        const sourcePathRegex = new RegExp(options.sourcePath ? `^${options.sourcePath}` : '');
        let promise = openZip(zipPath, true);
        if (options.overwrite) {
            promise = promise.then(zipfile => pfs_1.Promises.rm(targetPath).then(() => zipfile));
        }
        return promise.then(zipfile => extractZip(zipfile, targetPath, { sourcePathRegex }, token));
    }
    exports.$dp = $dp;
    function read(zipPath, filePath) {
        return openZip(zipPath).then(zipfile => {
            return new Promise((c, e) => {
                zipfile.on('entry', (entry) => {
                    if (entry.fileName === filePath) {
                        openZipStream(zipfile, entry).then(stream => c(stream), err => e(err));
                    }
                });
                zipfile.once('close', () => e(new Error(nls.localize(2, null, filePath))));
            });
        });
    }
    function $ep(zipPath, filePath) {
        return read(zipPath, filePath).then(stream => {
            return new Promise((c, e) => {
                const buffers = [];
                stream.once('error', e);
                stream.on('data', (b) => buffers.push(b));
                stream.on('end', () => c(Buffer.concat(buffers)));
            });
        });
    }
    exports.$ep = $ep;
});
//# sourceMappingURL=zip.js.map