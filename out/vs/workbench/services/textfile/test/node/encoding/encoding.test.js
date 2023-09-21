/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "vs/workbench/services/textfile/common/encoding", "vs/base/common/stream", "vs/base/common/buffer", "vs/base/common/strings", "vs/base/common/network", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, assert, fs, encoding, streams, buffer_1, strings_1, network_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.detectEncodingByBOM = void 0;
    async function detectEncodingByBOM(file) {
        try {
            const { buffer, bytesRead } = await readExactlyByFile(file, 3);
            return encoding.detectEncodingByBOMFromBuffer(buffer, bytesRead);
        }
        catch (error) {
            return null; // ignore errors (like file not found)
        }
    }
    exports.detectEncodingByBOM = detectEncodingByBOM;
    function readExactlyByFile(file, totalBytes) {
        return new Promise((resolve, reject) => {
            fs.open(file, 'r', null, (err, fd) => {
                if (err) {
                    return reject(err);
                }
                function end(err, resultBuffer, bytesRead) {
                    fs.close(fd, closeError => {
                        if (closeError) {
                            return reject(closeError);
                        }
                        if (err && err.code === 'EISDIR') {
                            return reject(err); // we want to bubble this error up (file is actually a folder)
                        }
                        return resolve({ buffer: resultBuffer ? buffer_1.VSBuffer.wrap(resultBuffer) : null, bytesRead });
                    });
                }
                const buffer = Buffer.allocUnsafe(totalBytes);
                let offset = 0;
                function readChunk() {
                    fs.read(fd, buffer, offset, totalBytes - offset, null, (err, bytesRead) => {
                        if (err) {
                            return end(err, null, 0);
                        }
                        if (bytesRead === 0) {
                            return end(null, buffer, offset);
                        }
                        offset += bytesRead;
                        if (offset === totalBytes) {
                            return end(null, buffer, offset);
                        }
                        return readChunk();
                    });
                }
                readChunk();
            });
        });
    }
    suite('Encoding', () => {
        test('detectBOM does not return error for non existing file', async () => {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/not-exist.css').fsPath;
            const detectedEncoding = await detectEncodingByBOM(file);
            assert.strictEqual(detectedEncoding, null);
        });
        test('detectBOM UTF-8', async () => {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf8.css').fsPath;
            const detectedEncoding = await detectEncodingByBOM(file);
            assert.strictEqual(detectedEncoding, 'utf8bom');
        });
        test('detectBOM UTF-16 LE', async () => {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16le.css').fsPath;
            const detectedEncoding = await detectEncodingByBOM(file);
            assert.strictEqual(detectedEncoding, 'utf16le');
        });
        test('detectBOM UTF-16 BE', async () => {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css').fsPath;
            const detectedEncoding = await detectEncodingByBOM(file);
            assert.strictEqual(detectedEncoding, 'utf16be');
        });
        test('detectBOM ANSI', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_ansi.css').fsPath;
            const detectedEncoding = await detectEncodingByBOM(file);
            assert.strictEqual(detectedEncoding, null);
        });
        test('detectBOM ANSI (2)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/empty.txt').fsPath;
            const detectedEncoding = await detectEncodingByBOM(file);
            assert.strictEqual(detectedEncoding, null);
        });
        test('detectEncodingFromBuffer (JSON saved as PNG)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.json.png').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (PNG saved as TXT)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.png.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.seemsBinary, true);
        });
        test('detectEncodingFromBuffer (XML saved as PNG)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.xml.png').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (QWOFF saved as TXT)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.qwoff.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.seemsBinary, true);
        });
        test('detectEncodingFromBuffer (CSS saved as QWOFF)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.css.qwoff').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (PDF)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.pdf').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.seemsBinary, true);
        });
        test('detectEncodingFromBuffer (guess UTF-16 LE from content without BOM)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/utf16_le_nobom.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.encoding, encoding.UTF16le);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (guess UTF-16 BE from content without BOM)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/utf16_be_nobom.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.detectEncodingFromBuffer(buffer);
            assert.strictEqual(mimes.encoding, encoding.UTF16be);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('autoGuessEncoding (UTF8)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_file.css').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
            assert.strictEqual(mimes.encoding, 'utf8');
        });
        test('autoGuessEncoding (ASCII)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_ansi.css').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
            assert.strictEqual(mimes.encoding, null);
        });
        test('autoGuessEncoding (ShiftJIS)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.shiftjis.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
            assert.strictEqual(mimes.encoding, 'shiftjis');
        });
        test('autoGuessEncoding (CP1252)', async function () {
            const file = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.cp1252.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.detectEncodingFromBuffer(buffer, true);
            assert.strictEqual(mimes.encoding, 'windows1252');
        });
        async function readAndDecodeFromDisk(path, fileEncoding) {
            return new Promise((resolve, reject) => {
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve((0, amdX_1.importAMDNodeModule)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js').then(iconv => iconv.decode(data, encoding.toNodeEncoding(fileEncoding))));
                    }
                });
            });
        }
        function newTestReadableStream(buffers) {
            const stream = (0, buffer_1.newWriteableBufferStream)();
            buffers
                .map(buffer_1.VSBuffer.wrap)
                .forEach(buffer => {
                setTimeout(() => {
                    stream.write(buffer);
                });
            });
            setTimeout(() => {
                stream.end();
            });
            return stream;
        }
        async function readAllAsString(stream) {
            return streams.consumeStream(stream, strings => strings.join(''));
        }
        test('toDecodeStream - some stream', async function () {
            const source = newTestReadableStream([
                Buffer.from([65, 66, 67]),
                Buffer.from([65, 66, 67]),
                Buffer.from([65, 66, 67]),
            ]);
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content, 'ABCABCABC');
        });
        test('toDecodeStream - some stream, expect too much data', async function () {
            const source = newTestReadableStream([
                Buffer.from([65, 66, 67]),
                Buffer.from([65, 66, 67]),
                Buffer.from([65, 66, 67]),
            ]);
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 64, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content, 'ABCABCABC');
        });
        test('toDecodeStream - some stream, no data', async function () {
            const source = (0, buffer_1.newWriteableBufferStream)();
            source.end();
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 512, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content, '');
        });
        test('toDecodeStream - encoding, utf16be', async function () {
            const path = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css').fsPath;
            const source = (0, buffer_1.streamToBufferReadableStream)(fs.createReadStream(path));
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 64, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            assert.strictEqual(detected.encoding, 'utf16be');
            assert.strictEqual(detected.seemsBinary, false);
            const expected = await readAndDecodeFromDisk(path, detected.encoding);
            const actual = await readAllAsString(stream);
            assert.strictEqual(actual, expected);
        });
        test('toDecodeStream - empty file', async function () {
            const path = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/empty.txt').fsPath;
            const source = (0, buffer_1.streamToBufferReadableStream)(fs.createReadStream(path));
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            const expected = await readAndDecodeFromDisk(path, detected.encoding);
            const actual = await readAllAsString(stream);
            assert.strictEqual(actual, expected);
        });
        test('toDecodeStream - decodes buffer entirely', async function () {
            const emojis = Buffer.from('🖥️💻💾');
            const incompleteEmojis = emojis.slice(0, emojis.length - 1);
            const buffers = [];
            for (let i = 0; i < incompleteEmojis.length; i++) {
                buffers.push(incompleteEmojis.slice(i, i + 1));
            }
            const source = newTestReadableStream(buffers);
            const { stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            const expected = new TextDecoder().decode(incompleteEmojis);
            const actual = await readAllAsString(stream);
            assert.strictEqual(actual, expected);
        });
        test('toDecodeStream - some stream (GBK issue #101856)', async function () {
            const path = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_gbk.txt').fsPath;
            const source = (0, buffer_1.streamToBufferReadableStream)(fs.createReadStream(path));
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async () => 'gbk' });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content.length, 65537);
        });
        test('toDecodeStream - some stream (UTF-8 issue #102202)', async function () {
            const path = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/issue_102202.txt').fsPath;
            const source = (0, buffer_1.streamToBufferReadableStream)(fs.createReadStream(path));
            const { detected, stream } = await encoding.toDecodeStream(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async () => 'utf-8' });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            const lines = (0, strings_1.splitLines)(content);
            assert.strictEqual(lines[981].toString(), '啊啊啊啊啊啊aaa啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊，啊啊啊啊啊啊啊啊啊啊啊。');
        });
        test('toDecodeStream - binary', async function () {
            const source = () => {
                return newTestReadableStream([
                    Buffer.from([0, 0, 0]),
                    Buffer.from('Hello World'),
                    Buffer.from([0])
                ]);
            };
            // acceptTextOnly: true
            let error = undefined;
            try {
                await encoding.toDecodeStream(source(), { acceptTextOnly: true, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            }
            catch (e) {
                error = e;
            }
            assert.ok(error instanceof encoding.DecodeStreamError);
            assert.strictEqual(error.decodeStreamErrorKind, 1 /* encoding.DecodeStreamErrorKind.STREAM_IS_BINARY */);
            // acceptTextOnly: false
            const { detected, stream } = await encoding.toDecodeStream(source(), { acceptTextOnly: false, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.UTF8 });
            assert.ok(detected);
            assert.strictEqual(detected.seemsBinary, true);
            assert.ok(stream);
        });
        test('toEncodeReadable - encoding, utf16be', async function () {
            const path = network_1.FileAccess.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css').fsPath;
            const source = await readAndDecodeFromDisk(path, encoding.UTF16be);
            const iconv = await (0, amdX_1.importAMDNodeModule)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
            const expected = buffer_1.VSBuffer.wrap(iconv.encode(source, encoding.toNodeEncoding(encoding.UTF16be))).toString();
            const actual = streams.consumeReadable(await encoding.toEncodeReadable(streams.toReadable(source), encoding.UTF16be), buffer_1.VSBuffer.concat).toString();
            assert.strictEqual(actual, expected);
        });
        test('toEncodeReadable - empty readable to utf8', async function () {
            const source = {
                read() {
                    return null;
                }
            };
            const actual = streams.consumeReadable(await encoding.toEncodeReadable(source, encoding.UTF8), buffer_1.VSBuffer.concat).toString();
            assert.strictEqual(actual, '');
        });
        [{
                utfEncoding: encoding.UTF8,
                relatedBom: encoding.UTF8_BOM
            }, {
                utfEncoding: encoding.UTF8_with_bom,
                relatedBom: encoding.UTF8_BOM
            }, {
                utfEncoding: encoding.UTF16be,
                relatedBom: encoding.UTF16be_BOM,
            }, {
                utfEncoding: encoding.UTF16le,
                relatedBom: encoding.UTF16le_BOM
            }].forEach(({ utfEncoding, relatedBom }) => {
            test(`toEncodeReadable - empty readable to ${utfEncoding} with BOM`, async function () {
                const source = {
                    read() {
                        return null;
                    }
                };
                const encodedReadable = encoding.toEncodeReadable(source, utfEncoding, { addBOM: true });
                const expected = buffer_1.VSBuffer.wrap(Buffer.from(relatedBom)).toString();
                const actual = streams.consumeReadable(await encodedReadable, buffer_1.VSBuffer.concat).toString();
                assert.strictEqual(actual, expected);
            });
        });
        test('encodingExists', async function () {
            for (const enc in encoding.SUPPORTED_ENCODINGS) {
                if (enc === encoding.UTF8_with_bom) {
                    continue; // skip over encodings from us
                }
                const iconv = await (0, amdX_1.importAMDNodeModule)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
                assert.strictEqual(iconv.encodingExists(enc), true, enc);
            }
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0ZmlsZS90ZXN0L25vZGUvZW5jb2RpbmcvZW5jb2RpbmcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZekYsS0FBSyxVQUFVLG1CQUFtQixDQUFDLElBQVk7UUFDckQsSUFBSTtZQUNILE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFL0QsT0FBTyxRQUFRLENBQUMsNkJBQTZCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ2pFO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxDQUFDLHNDQUFzQztTQUNuRDtJQUNGLENBQUM7SUFSRCxrREFRQztJQU9ELFNBQVMsaUJBQWlCLENBQUMsSUFBWSxFQUFFLFVBQWtCO1FBQzFELE9BQU8sSUFBSSxPQUFPLENBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEQsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxHQUFHLEVBQUU7b0JBQ1IsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ25CO2dCQUVELFNBQVMsR0FBRyxDQUFDLEdBQWlCLEVBQUUsWUFBMkIsRUFBRSxTQUFpQjtvQkFDN0UsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLEVBQUU7d0JBQ3pCLElBQUksVUFBVSxFQUFFOzRCQUNmLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3lCQUMxQjt3QkFFRCxJQUFJLEdB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