/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "vs/workbench/services/textfile/common/encoding", "vs/base/common/stream", "vs/base/common/buffer", "vs/base/common/strings", "vs/base/common/network", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, assert, fs, encoding, streams, buffer_1, strings_1, network_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lgc = void 0;
    async function $lgc(file) {
        try {
            const { buffer, bytesRead } = await readExactlyByFile(file, 3);
            return encoding.$oD(buffer, bytesRead);
        }
        catch (error) {
            return null; // ignore errors (like file not found)
        }
    }
    exports.$lgc = $lgc;
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
                        return resolve({ buffer: resultBuffer ? buffer_1.$Fd.wrap(resultBuffer) : null, bytesRead });
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
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/not-exist.css').fsPath;
            const detectedEncoding = await $lgc(file);
            assert.strictEqual(detectedEncoding, null);
        });
        test('detectBOM UTF-8', async () => {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf8.css').fsPath;
            const detectedEncoding = await $lgc(file);
            assert.strictEqual(detectedEncoding, 'utf8bom');
        });
        test('detectBOM UTF-16 LE', async () => {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16le.css').fsPath;
            const detectedEncoding = await $lgc(file);
            assert.strictEqual(detectedEncoding, 'utf16le');
        });
        test('detectBOM UTF-16 BE', async () => {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css').fsPath;
            const detectedEncoding = await $lgc(file);
            assert.strictEqual(detectedEncoding, 'utf16be');
        });
        test('detectBOM ANSI', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_ansi.css').fsPath;
            const detectedEncoding = await $lgc(file);
            assert.strictEqual(detectedEncoding, null);
        });
        test('detectBOM ANSI (2)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/empty.txt').fsPath;
            const detectedEncoding = await $lgc(file);
            assert.strictEqual(detectedEncoding, null);
        });
        test('detectEncodingFromBuffer (JSON saved as PNG)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.json.png').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (PNG saved as TXT)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.png.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.seemsBinary, true);
        });
        test('detectEncodingFromBuffer (XML saved as PNG)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.xml.png').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (QWOFF saved as TXT)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.qwoff.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.seemsBinary, true);
        });
        test('detectEncodingFromBuffer (CSS saved as QWOFF)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.css.qwoff').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (PDF)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.pdf').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.seemsBinary, true);
        });
        test('detectEncodingFromBuffer (guess UTF-16 LE from content without BOM)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/utf16_le_nobom.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.encoding, encoding.$eD);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('detectEncodingFromBuffer (guess UTF-16 BE from content without BOM)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/utf16_be_nobom.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512);
            const mimes = encoding.$qD(buffer);
            assert.strictEqual(mimes.encoding, encoding.$dD);
            assert.strictEqual(mimes.seemsBinary, false);
        });
        test('autoGuessEncoding (UTF8)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_file.css').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.$qD(buffer, true);
            assert.strictEqual(mimes.encoding, 'utf8');
        });
        test('autoGuessEncoding (ASCII)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_ansi.css').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.$qD(buffer, true);
            assert.strictEqual(mimes.encoding, null);
        });
        test('autoGuessEncoding (ShiftJIS)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.shiftjis.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.$qD(buffer, true);
            assert.strictEqual(mimes.encoding, 'shiftjis');
        });
        test('autoGuessEncoding (CP1252)', async function () {
            const file = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some.cp1252.txt').fsPath;
            const buffer = await readExactlyByFile(file, 512 * 8);
            const mimes = await encoding.$qD(buffer, true);
            assert.strictEqual(mimes.encoding, 'windows1252');
        });
        async function readAndDecodeFromDisk(path, fileEncoding) {
            return new Promise((resolve, reject) => {
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve((0, amdX_1.$aD)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js').then(iconv => iconv.decode(data, encoding.$nD(fileEncoding))));
                    }
                });
            });
        }
        function newTestReadableStream(buffers) {
            const stream = (0, buffer_1.$Vd)();
            buffers
                .map(buffer_1.$Fd.wrap)
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
            return streams.$wd(stream, strings => strings.join(''));
        }
        test('toDecodeStream - some stream', async function () {
            const source = newTestReadableStream([
                Buffer.from([65, 66, 67]),
                Buffer.from([65, 66, 67]),
                Buffer.from([65, 66, 67]),
            ]);
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
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
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 64, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content, 'ABCABCABC');
        });
        test('toDecodeStream - some stream, no data', async function () {
            const source = (0, buffer_1.$Vd)();
            source.end();
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 512, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content, '');
        });
        test('toDecodeStream - encoding, utf16be', async function () {
            const path = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css').fsPath;
            const source = (0, buffer_1.$Ud)(fs.createReadStream(path));
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 64, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
            assert.strictEqual(detected.encoding, 'utf16be');
            assert.strictEqual(detected.seemsBinary, false);
            const expected = await readAndDecodeFromDisk(path, detected.encoding);
            const actual = await readAllAsString(stream);
            assert.strictEqual(actual, expected);
        });
        test('toDecodeStream - empty file', async function () {
            const path = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/empty.txt').fsPath;
            const source = (0, buffer_1.$Ud)(fs.createReadStream(path));
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
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
            const { stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
            const expected = new TextDecoder().decode(incompleteEmojis);
            const actual = await readAllAsString(stream);
            assert.strictEqual(actual, expected);
        });
        test('toDecodeStream - some stream (GBK issue #101856)', async function () {
            const path = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_gbk.txt').fsPath;
            const source = (0, buffer_1.$Ud)(fs.createReadStream(path));
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async () => 'gbk' });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            assert.strictEqual(content.length, 65537);
        });
        test('toDecodeStream - some stream (UTF-8 issue #102202)', async function () {
            const path = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/issue_102202.txt').fsPath;
            const source = (0, buffer_1.$Ud)(fs.createReadStream(path));
            const { detected, stream } = await encoding.$kD(source, { acceptTextOnly: true, minBytesRequiredForDetection: 4, guessEncoding: false, overwriteEncoding: async () => 'utf-8' });
            assert.ok(detected);
            assert.ok(stream);
            const content = await readAllAsString(stream);
            const lines = (0, strings_1.$Ae)(content);
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
                await encoding.$kD(source(), { acceptTextOnly: true, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
            }
            catch (e) {
                error = e;
            }
            assert.ok(error instanceof encoding.$jD);
            assert.strictEqual(error.decodeStreamErrorKind, 1 /* encoding.DecodeStreamErrorKind.STREAM_IS_BINARY */);
            // acceptTextOnly: false
            const { detected, stream } = await encoding.$kD(source(), { acceptTextOnly: false, guessEncoding: false, overwriteEncoding: async (detected) => detected || encoding.$bD });
            assert.ok(detected);
            assert.strictEqual(detected.seemsBinary, true);
            assert.ok(stream);
        });
        test('toEncodeReadable - encoding, utf16be', async function () {
            const path = network_1.$2f.asFileUri('vs/workbench/services/textfile/test/node/encoding/fixtures/some_utf16be.css').fsPath;
            const source = await readAndDecodeFromDisk(path, encoding.$dD);
            const iconv = await (0, amdX_1.$aD)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
            const expected = buffer_1.$Fd.wrap(iconv.encode(source, encoding.$nD(encoding.$dD))).toString();
            const actual = streams.$ud(await encoding.$lD(streams.$Bd(source), encoding.$dD), buffer_1.$Fd.concat).toString();
            assert.strictEqual(actual, expected);
        });
        test('toEncodeReadable - empty readable to utf8', async function () {
            const source = {
                read() {
                    return null;
                }
            };
            const actual = streams.$ud(await encoding.$lD(source, encoding.$bD), buffer_1.$Fd.concat).toString();
            assert.strictEqual(actual, '');
        });
        [{
                utfEncoding: encoding.$bD,
                relatedBom: encoding.$iD
            }, {
                utfEncoding: encoding.$cD,
                relatedBom: encoding.$iD
            }, {
                utfEncoding: encoding.$dD,
                relatedBom: encoding.$gD,
            }, {
                utfEncoding: encoding.$eD,
                relatedBom: encoding.$hD
            }].forEach(({ utfEncoding, relatedBom }) => {
            test(`toEncodeReadable - empty readable to ${utfEncoding} with BOM`, async function () {
                const source = {
                    read() {
                        return null;
                    }
                };
                const encodedReadable = encoding.$lD(source, utfEncoding, { addBOM: true });
                const expected = buffer_1.$Fd.wrap(Buffer.from(relatedBom)).toString();
                const actual = streams.$ud(await encodedReadable, buffer_1.$Fd.concat).toString();
                assert.strictEqual(actual, expected);
            });
        });
        test('encodingExists', async function () {
            for (const enc in encoding.$rD) {
                if (enc === encoding.$cD) {
                    continue; // skip over encodings from us
                }
                const iconv = await (0, amdX_1.$aD)('@vscode/iconv-lite-umd', 'lib/iconv-lite-umd.js');
                assert.strictEqual(iconv.encodingExists(enc), true, enc);
            }
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=encoding.test.js.map