/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/uri", "vs/base/common/path", "vs/workbench/services/textfile/common/encoding", "vs/base/common/buffer", "vs/editor/test/common/testTextModel", "vs/base/common/platform", "vs/editor/common/model/textModel", "vs/base/common/lifecycle"], function (require, exports, assert, textfiles_1, uri_1, path_1, encoding_1, buffer_1, testTextModel_1, platform_1, textModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Allows us to reuse test suite across different environments.
     *
     * It introduces a bit of complexity with setup and teardown, however
     * it helps us to ensure that tests are added for all environments at once,
     * hence helps us catch bugs better.
     */
    function createSuite(params) {
        let service;
        let testDir = '';
        const { exists, stat, readFile, detectEncodingByBOM } = params;
        const disposables = new lifecycle_1.DisposableStore();
        setup(async () => {
            const result = await params.setup();
            service = result.service;
            testDir = result.testDir;
        });
        teardown(async () => {
            await params.teardown();
            disposables.clear();
        });
        test('create - no encoding - content empty', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.txt'));
            await service.create([{ resource }]);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 0 /* no BOM */);
        });
        test('create - no encoding - content provided (string)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.txt'));
            await service.create([{ resource, value: 'Hello World' }]);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.toString(), 'Hello World');
            assert.strictEqual(res.byteLength, 'Hello World'.length);
        });
        test('create - no encoding - content provided (snapshot)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.txt'));
            await service.create([{ resource, value: (0, textfiles_1.stringToSnapshot)('Hello World') }]);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.toString(), 'Hello World');
            assert.strictEqual(res.byteLength, 'Hello World'.length);
        });
        test('create - UTF 16 LE - no content', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf16le'));
            await service.create([{ resource }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF16le);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.UTF16le_BOM.length);
        });
        test('create - UTF 16 LE - content provided', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf16le'));
            await service.create([{ resource, value: 'Hello World' }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF16le);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length * 2 /* UTF16 2bytes per char */ + encoding_1.UTF16le_BOM.length);
        });
        test('create - UTF 16 BE - no content', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf16be'));
            await service.create([{ resource }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF16be);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.UTF16le_BOM.length);
        });
        test('create - UTF 16 BE - content provided', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf16be'));
            await service.create([{ resource, value: 'Hello World' }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF16be);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length * 2 /* UTF16 2bytes per char */ + encoding_1.UTF16be_BOM.length);
        });
        test('create - UTF 8 BOM - no content', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.UTF8_BOM.length);
        });
        test('create - UTF 8 BOM - content provided', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource, value: 'Hello World' }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length + encoding_1.UTF8_BOM.length);
        });
        function createTextModelSnapshot(text, preserveBOM) {
            const textModel = disposables.add((0, testTextModel_1.createTextModel)(text));
            const snapshot = textModel.createSnapshot(preserveBOM);
            return snapshot;
        }
        test('create - UTF 8 BOM - empty content - snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource, value: createTextModelSnapshot('') }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.UTF8_BOM.length);
        });
        test('create - UTF 8 BOM - content provided - snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource, value: createTextModelSnapshot('Hello World') }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length + encoding_1.UTF8_BOM.length);
        });
        test('write - use encoding (UTF 16 BE) - small content as string', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.join)(testDir, 'small.txt')), encoding_1.UTF16be, 'Hello\nWorld', 'Hello\nWorld');
        });
        test('write - use encoding (UTF 16 BE) - small content as snapshot', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.join)(testDir, 'small.txt')), encoding_1.UTF16be, createTextModelSnapshot('Hello\nWorld'), 'Hello\nWorld');
        });
        test('write - use encoding (UTF 16 BE) - large content as string', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.join)(testDir, 'lorem.txt')), encoding_1.UTF16be, 'Hello\nWorld', 'Hello\nWorld');
        });
        test('write - use encoding (UTF 16 BE) - large content as snapshot', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.join)(testDir, 'lorem.txt')), encoding_1.UTF16be, createTextModelSnapshot('Hello\nWorld'), 'Hello\nWorld');
        });
        async function testEncoding(resource, encoding, content, expectedContent) {
            await service.write(resource, content, { encoding });
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding);
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.encoding, encoding);
            const textBuffer = disposables.add(resolved.value.create(platform_1.isWindows ? 2 /* DefaultEndOfLine.CRLF */ : 1 /* DefaultEndOfLine.LF */).textBuffer);
            assert.strictEqual((0, textfiles_1.snapshotToString)(textBuffer.createSnapshot(false)), expectedContent);
        }
        test('write - use encoding (cp1252)', async () => {
            const filePath = (0, path_1.join)(testDir, 'some_cp1252.txt');
            const contents = await readFile(filePath, 'utf8');
            const eol = /\r\n/.test(contents) ? '\r\n' : '\n';
            await testEncodingKeepsData(uri_1.URI.file(filePath), 'cp1252', ['ObjectCount = LoadObjects("Öffentlicher Ordner");', '', 'Private = "Persönliche Information"', ''].join(eol));
        });
        test('write - use encoding (shiftjis)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.join)(testDir, 'some_shiftjis.txt')), 'shiftjis', '中文abc');
        });
        test('write - use encoding (gbk)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.join)(testDir, 'some_gbk.txt')), 'gbk', '中国abc');
        });
        test('write - use encoding (cyrillic)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.join)(testDir, 'some_cyrillic.txt')), 'cp866', 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя');
        });
        test('write - use encoding (big5)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.join)(testDir, 'some_big5.txt')), 'cp950', '中文abc');
        });
        async function testEncodingKeepsData(resource, encoding, expected) {
            let resolved = await service.readStream(resource, { encoding });
            const textBuffer = disposables.add(resolved.value.create(platform_1.isWindows ? 2 /* DefaultEndOfLine.CRLF */ : 1 /* DefaultEndOfLine.LF */).textBuffer);
            const content = (0, textfiles_1.snapshotToString)(textBuffer.createSnapshot(false));
            assert.strictEqual(content, expected);
            await service.write(resource, content, { encoding });
            resolved = await service.readStream(resource, { encoding });
            const textBuffer2 = disposables.add(resolved.value.create(2 /* DefaultEndOfLine.CRLF */).textBuffer);
            assert.strictEqual((0, textfiles_1.snapshotToString)(textBuffer2.createSnapshot(false)), content);
            await service.write(resource, createTextModelSnapshot(content), { encoding });
            resolved = await service.readStream(resource, { encoding });
            const textBuffer3 = disposables.add(resolved.value.create(2 /* DefaultEndOfLine.CRLF */).textBuffer);
            assert.strictEqual((0, textfiles_1.snapshotToString)(textBuffer3.createSnapshot(false)), content);
        }
        test('write - no encoding - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small.txt'));
            const content = (await readFile(resource.fsPath)).toString();
            await service.write(resource, content);
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.value.getFirstLineText(999999), content);
        });
        test('write - no encoding - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small.txt'));
            const content = (await readFile(resource.fsPath)).toString();
            await service.write(resource, createTextModelSnapshot(content));
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.value.getFirstLineText(999999), content);
        });
        test('write - encoding preserved (UTF 16 LE) - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_utf16le.css'));
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.encoding, encoding_1.UTF16le);
            await testEncoding(uri_1.URI.file((0, path_1.join)(testDir, 'some_utf16le.css')), encoding_1.UTF16le, 'Hello\nWorld', 'Hello\nWorld');
        });
        test('write - encoding preserved (UTF 16 LE) - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_utf16le.css'));
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.encoding, encoding_1.UTF16le);
            await testEncoding(uri_1.URI.file((0, path_1.join)(testDir, 'some_utf16le.css')), encoding_1.UTF16le, createTextModelSnapshot('Hello\nWorld'), 'Hello\nWorld');
        });
        test('write - UTF8 variations - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'index.html'));
            let detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            const content = (await readFile(resource.fsPath)).toString() + 'updates';
            await service.write(resource, content, { encoding: encoding_1.UTF8_with_bom });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            // ensure BOM preserved if enforced
            await service.write(resource, content, { encoding: encoding_1.UTF8_with_bom });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            // allow to remove BOM
            await service.write(resource, content, { encoding: encoding_1.UTF8 });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            // BOM does not come back
            await service.write(resource, content, { encoding: encoding_1.UTF8 });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
        });
        test('write - UTF8 variations - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'index.html'));
            let detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            const model = disposables.add((0, testTextModel_1.createTextModel)((await readFile(resource.fsPath)).toString() + 'updates'));
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.UTF8_with_bom });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            // ensure BOM preserved if enforced
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.UTF8_with_bom });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            // allow to remove BOM
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.UTF8 });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            // BOM does not come back
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.UTF8 });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
        });
        test('write - preserve UTF8 BOM - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_utf8_bom.txt'));
            let detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
            await service.write(resource, 'Hello World', { encoding: detectedEncoding });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
        });
        test('write - ensure BOM in empty file - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small.txt'));
            await service.write(resource, '', { encoding: encoding_1.UTF8_with_bom });
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
        });
        test('write - ensure BOM in empty file - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small.txt'));
            await service.write(resource, createTextModelSnapshot(''), { encoding: encoding_1.UTF8_with_bom });
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.UTF8_with_bom);
        });
        test('readStream - small text', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small.txt'));
            await testReadStream(resource);
        });
        test('readStream - large text', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'lorem.txt'));
            await testReadStream(resource);
        });
        async function testReadStream(resource) {
            const result = await service.readStream(resource);
            assert.strictEqual(result.name, (0, path_1.basename)(resource.fsPath));
            assert.strictEqual(result.size, (await stat(resource.fsPath)).size);
            const content = (await readFile(resource.fsPath)).toString();
            const textBuffer = disposables.add(result.value.create(1 /* DefaultEndOfLine.LF */).textBuffer);
            assert.strictEqual((0, textfiles_1.snapshotToString)(textBuffer.createSnapshot(false)), (0, textfiles_1.snapshotToString)(createTextModelSnapshot(content, false)));
        }
        test('read - small text', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'small.txt'));
            await testRead(resource);
        });
        test('read - large text', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'lorem.txt'));
            await testRead(resource);
        });
        async function testRead(resource) {
            const result = await service.read(resource);
            assert.strictEqual(result.name, (0, path_1.basename)(resource.fsPath));
            assert.strictEqual(result.size, (await stat(resource.fsPath)).size);
            assert.strictEqual(result.value, (await readFile(resource.fsPath)).toString());
        }
        test('readStream - encoding picked up (CP1252)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'windows1252';
            const result = await service.readStream(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value.getFirstLineText(999999), 'Private = "Persönlicheß Information"');
        });
        test('read - encoding picked up (CP1252)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'windows1252';
            const result = await service.read(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value, 'Private = "Persönlicheß Information"');
        });
        test('read - encoding picked up (binary)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'binary';
            const result = await service.read(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value, 'Private = "Persönlicheß Information"');
        });
        test('read - encoding picked up (base64)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'base64';
            const result = await service.read(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value, btoa('Private = "Persönlicheß Information"'));
        });
        test('readStream - user overrides BOM', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_utf16le.css'));
            const result = await service.readStream(resource, { encoding: 'windows1252' });
            assert.strictEqual(result.encoding, 'windows1252');
        });
        test('readStream - BOM removed', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_utf8_bom.txt'));
            const result = await service.readStream(resource);
            assert.strictEqual(result.value.getFirstLineText(999999), 'This is some UTF 8 with BOM file.');
        });
        test('readStream - invalid encoding', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'index.html'));
            const result = await service.readStream(resource, { encoding: 'superduper' });
            assert.strictEqual(result.encoding, 'utf8');
        });
        test('readStream - encoding override', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some.utf16le'));
            const result = await service.readStream(resource, { encoding: 'windows1252' });
            assert.strictEqual(result.encoding, 'utf16le');
            assert.strictEqual(result.value.getFirstLineText(999999), 'This is some UTF 16 with BOM file.');
        });
        test('readStream - large Big5', async () => {
            await testLargeEncoding('big5', '中文abc');
        });
        test('readStream - large CP1252', async () => {
            await testLargeEncoding('cp1252', 'öäüß');
        });
        test('readStream - large Cyrillic', async () => {
            await testLargeEncoding('cp866', 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя');
        });
        test('readStream - large GBK', async () => {
            await testLargeEncoding('gbk', '中国abc');
        });
        test('readStream - large ShiftJIS', async () => {
            await testLargeEncoding('shiftjis', '中文abc');
        });
        test('readStream - large UTF8 BOM', async () => {
            await testLargeEncoding('utf8bom', 'öäüß');
        });
        test('readStream - large UTF16 LE', async () => {
            await testLargeEncoding('utf16le', 'öäüß');
        });
        test('readStream - large UTF16 BE', async () => {
            await testLargeEncoding('utf16be', 'öäüß');
        });
        async function testLargeEncoding(encoding, needle) {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, `lorem_${encoding}.txt`));
            // Verify via `ITextFileService.readStream`
            const result = await service.readStream(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            const textBuffer = disposables.add(result.value.create(1 /* DefaultEndOfLine.LF */).textBuffer);
            let contents = (0, textfiles_1.snapshotToString)(textBuffer.createSnapshot(false));
            assert.strictEqual(contents.indexOf(needle), 0);
            assert.ok(contents.indexOf(needle, 10) > 0);
            // Verify via `ITextFileService.getDecodedTextFactory`
            const rawFile = await params.readFile(resource.fsPath);
            let rawFileVSBuffer;
            if (rawFile instanceof buffer_1.VSBuffer) {
                rawFileVSBuffer = rawFile;
            }
            else {
                rawFileVSBuffer = buffer_1.VSBuffer.wrap(rawFile);
            }
            const factory = await (0, textModel_1.createTextBufferFactoryFromStream)(await service.getDecodedStream(resource, (0, buffer_1.bufferToStream)(rawFileVSBuffer), { encoding }));
            const textBuffer2 = disposables.add(factory.create(1 /* DefaultEndOfLine.LF */).textBuffer);
            contents = (0, textfiles_1.snapshotToString)(textBuffer2.createSnapshot(false));
            assert.strictEqual(contents.indexOf(needle), 0);
            assert.ok(contents.indexOf(needle, 10) > 0);
        }
        test('readStream - UTF16 LE (no BOM)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'utf16_le_nobom.txt'));
            const result = await service.readStream(resource);
            assert.strictEqual(result.encoding, 'utf16le');
        });
        test('readStream - UTF16 BE (no BOM)', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'utf16_be_nobom.txt'));
            const result = await service.readStream(resource);
            assert.strictEqual(result.encoding, 'utf16be');
        });
        test('readStream - autoguessEncoding', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'some_cp1252.txt'));
            const result = await service.readStream(resource, { autoGuessEncoding: true });
            assert.strictEqual(result.encoding, 'windows1252');
        });
        test('readStream - FILE_IS_BINARY', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'binary.txt'));
            let error = undefined;
            try {
                await service.readStream(resource, { acceptTextOnly: true });
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.textFileOperationResult, 0 /* TextFileOperationResult.FILE_IS_BINARY */);
            const result = await service.readStream(uri_1.URI.file((0, path_1.join)(testDir, 'small.txt')), { acceptTextOnly: true });
            assert.strictEqual(result.name, 'small.txt');
        });
        test('read - FILE_IS_BINARY', async () => {
            const resource = uri_1.URI.file((0, path_1.join)(testDir, 'binary.txt'));
            let error = undefined;
            try {
                await service.read(resource, { acceptTextOnly: true });
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.textFileOperationResult, 0 /* TextFileOperationResult.FILE_IS_BINARY */);
            const result = await service.read(uri_1.URI.file((0, path_1.join)(testDir, 'small.txt')), { acceptTextOnly: true });
            assert.strictEqual(result.name, 'small.txt');
        });
    }
    exports.default = createSuite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVTZXJ2aWNlLmlvLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dGZpbGUvdGVzdC9jb21tb24vdGV4dEZpbGVTZXJ2aWNlLmlvLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUE2QmhHOzs7Ozs7T0FNRztJQUNILFNBQXdCLFdBQVcsQ0FBQyxNQUFjO1FBQ2pELElBQUksT0FBeUIsQ0FBQztRQUM5QixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsTUFBTSxDQUFDO1FBQy9ELE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN6QixPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNuQixNQUFNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0NBQXNDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkQsTUFBTSxRQUFRLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUUxRCxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFB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