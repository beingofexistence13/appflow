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
    function $kgc(params) {
        let service;
        let testDir = '';
        const { exists, stat, readFile, detectEncodingByBOM } = params;
        const disposables = new lifecycle_1.$jc();
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
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.txt'));
            await service.create([{ resource }]);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 0 /* no BOM */);
        });
        test('create - no encoding - content provided (string)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.txt'));
            await service.create([{ resource, value: 'Hello World' }]);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.toString(), 'Hello World');
            assert.strictEqual(res.byteLength, 'Hello World'.length);
        });
        test('create - no encoding - content provided (snapshot)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.txt'));
            await service.create([{ resource, value: (0, textfiles_1.$ND)('Hello World') }]);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.toString(), 'Hello World');
            assert.strictEqual(res.byteLength, 'Hello World'.length);
        });
        test('create - UTF 16 LE - no content', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf16le'));
            await service.create([{ resource }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$eD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.$hD.length);
        });
        test('create - UTF 16 LE - content provided', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf16le'));
            await service.create([{ resource, value: 'Hello World' }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$eD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length * 2 /* UTF16 2bytes per char */ + encoding_1.$hD.length);
        });
        test('create - UTF 16 BE - no content', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf16be'));
            await service.create([{ resource }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$dD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.$hD.length);
        });
        test('create - UTF 16 BE - content provided', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf16be'));
            await service.create([{ resource, value: 'Hello World' }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$dD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length * 2 /* UTF16 2bytes per char */ + encoding_1.$gD.length);
        });
        test('create - UTF 8 BOM - no content', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.$iD.length);
        });
        test('create - UTF 8 BOM - content provided', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource, value: 'Hello World' }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length + encoding_1.$iD.length);
        });
        function createTextModelSnapshot(text, preserveBOM) {
            const textModel = disposables.add((0, testTextModel_1.$O0b)(text));
            const snapshot = textModel.createSnapshot(preserveBOM);
            return snapshot;
        }
        test('create - UTF 8 BOM - empty content - snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource, value: createTextModelSnapshot('') }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, encoding_1.$iD.length);
        });
        test('create - UTF 8 BOM - content provided - snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_new.utf8bom'));
            await service.create([{ resource, value: createTextModelSnapshot('Hello World') }]);
            assert.strictEqual(await exists(resource.fsPath), true);
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            const res = await readFile(resource.fsPath);
            assert.strictEqual(res.byteLength, 'Hello World'.length + encoding_1.$iD.length);
        });
        test('write - use encoding (UTF 16 BE) - small content as string', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')), encoding_1.$dD, 'Hello\nWorld', 'Hello\nWorld');
        });
        test('write - use encoding (UTF 16 BE) - small content as snapshot', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')), encoding_1.$dD, createTextModelSnapshot('Hello\nWorld'), 'Hello\nWorld');
        });
        test('write - use encoding (UTF 16 BE) - large content as string', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')), encoding_1.$dD, 'Hello\nWorld', 'Hello\nWorld');
        });
        test('write - use encoding (UTF 16 BE) - large content as snapshot', async () => {
            await testEncoding(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')), encoding_1.$dD, createTextModelSnapshot('Hello\nWorld'), 'Hello\nWorld');
        });
        async function testEncoding(resource, encoding, content, expectedContent) {
            await service.write(resource, content, { encoding });
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding);
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.encoding, encoding);
            const textBuffer = disposables.add(resolved.value.create(platform_1.$i ? 2 /* DefaultEndOfLine.CRLF */ : 1 /* DefaultEndOfLine.LF */).textBuffer);
            assert.strictEqual((0, textfiles_1.$MD)(textBuffer.createSnapshot(false)), expectedContent);
        }
        test('write - use encoding (cp1252)', async () => {
            const filePath = (0, path_1.$9d)(testDir, 'some_cp1252.txt');
            const contents = await readFile(filePath, 'utf8');
            const eol = /\r\n/.test(contents) ? '\r\n' : '\n';
            await testEncodingKeepsData(uri_1.URI.file(filePath), 'cp1252', ['ObjectCount = LoadObjects("Öffentlicher Ordner");', '', 'Private = "Persönliche Information"', ''].join(eol));
        });
        test('write - use encoding (shiftjis)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.$9d)(testDir, 'some_shiftjis.txt')), 'shiftjis', '中文abc');
        });
        test('write - use encoding (gbk)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.$9d)(testDir, 'some_gbk.txt')), 'gbk', '中国abc');
        });
        test('write - use encoding (cyrillic)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.$9d)(testDir, 'some_cyrillic.txt')), 'cp866', 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя');
        });
        test('write - use encoding (big5)', async () => {
            await testEncodingKeepsData(uri_1.URI.file((0, path_1.$9d)(testDir, 'some_big5.txt')), 'cp950', '中文abc');
        });
        async function testEncodingKeepsData(resource, encoding, expected) {
            let resolved = await service.readStream(resource, { encoding });
            const textBuffer = disposables.add(resolved.value.create(platform_1.$i ? 2 /* DefaultEndOfLine.CRLF */ : 1 /* DefaultEndOfLine.LF */).textBuffer);
            const content = (0, textfiles_1.$MD)(textBuffer.createSnapshot(false));
            assert.strictEqual(content, expected);
            await service.write(resource, content, { encoding });
            resolved = await service.readStream(resource, { encoding });
            const textBuffer2 = disposables.add(resolved.value.create(2 /* DefaultEndOfLine.CRLF */).textBuffer);
            assert.strictEqual((0, textfiles_1.$MD)(textBuffer2.createSnapshot(false)), content);
            await service.write(resource, createTextModelSnapshot(content), { encoding });
            resolved = await service.readStream(resource, { encoding });
            const textBuffer3 = disposables.add(resolved.value.create(2 /* DefaultEndOfLine.CRLF */).textBuffer);
            assert.strictEqual((0, textfiles_1.$MD)(textBuffer3.createSnapshot(false)), content);
        }
        test('write - no encoding - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const content = (await readFile(resource.fsPath)).toString();
            await service.write(resource, content);
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.value.getFirstLineText(999999), content);
        });
        test('write - no encoding - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const content = (await readFile(resource.fsPath)).toString();
            await service.write(resource, createTextModelSnapshot(content));
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.value.getFirstLineText(999999), content);
        });
        test('write - encoding preserved (UTF 16 LE) - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf16le.css'));
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.encoding, encoding_1.$eD);
            await testEncoding(uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf16le.css')), encoding_1.$eD, 'Hello\nWorld', 'Hello\nWorld');
        });
        test('write - encoding preserved (UTF 16 LE) - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf16le.css'));
            const resolved = await service.readStream(resource);
            assert.strictEqual(resolved.encoding, encoding_1.$eD);
            await testEncoding(uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf16le.css')), encoding_1.$eD, createTextModelSnapshot('Hello\nWorld'), 'Hello\nWorld');
        });
        test('write - UTF8 variations - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            let detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            const content = (await readFile(resource.fsPath)).toString() + 'updates';
            await service.write(resource, content, { encoding: encoding_1.$cD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            // ensure BOM preserved if enforced
            await service.write(resource, content, { encoding: encoding_1.$cD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            // allow to remove BOM
            await service.write(resource, content, { encoding: encoding_1.$bD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            // BOM does not come back
            await service.write(resource, content, { encoding: encoding_1.$bD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
        });
        test('write - UTF8 variations - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            let detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            const model = disposables.add((0, testTextModel_1.$O0b)((await readFile(resource.fsPath)).toString() + 'updates'));
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.$cD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            // ensure BOM preserved if enforced
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.$cD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            // allow to remove BOM
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.$bD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
            // BOM does not come back
            await service.write(resource, model.createSnapshot(), { encoding: encoding_1.$bD });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, null);
        });
        test('write - preserve UTF8 BOM - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf8_bom.txt'));
            let detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
            await service.write(resource, 'Hello World', { encoding: detectedEncoding });
            detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
        });
        test('write - ensure BOM in empty file - content as string', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            await service.write(resource, '', { encoding: encoding_1.$cD });
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
        });
        test('write - ensure BOM in empty file - content as snapshot', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            await service.write(resource, createTextModelSnapshot(''), { encoding: encoding_1.$cD });
            const detectedEncoding = await detectEncodingByBOM(resource.fsPath);
            assert.strictEqual(detectedEncoding, encoding_1.$cD);
        });
        test('readStream - small text', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            await testReadStream(resource);
        });
        test('readStream - large text', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            await testReadStream(resource);
        });
        async function testReadStream(resource) {
            const result = await service.readStream(resource);
            assert.strictEqual(result.name, (0, path_1.$ae)(resource.fsPath));
            assert.strictEqual(result.size, (await stat(resource.fsPath)).size);
            const content = (await readFile(resource.fsPath)).toString();
            const textBuffer = disposables.add(result.value.create(1 /* DefaultEndOfLine.LF */).textBuffer);
            assert.strictEqual((0, textfiles_1.$MD)(textBuffer.createSnapshot(false)), (0, textfiles_1.$MD)(createTextModelSnapshot(content, false)));
        }
        test('read - small text', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            await testRead(resource);
        });
        test('read - large text', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            await testRead(resource);
        });
        async function testRead(resource) {
            const result = await service.read(resource);
            assert.strictEqual(result.name, (0, path_1.$ae)(resource.fsPath));
            assert.strictEqual(result.size, (await stat(resource.fsPath)).size);
            assert.strictEqual(result.value, (await readFile(resource.fsPath)).toString());
        }
        test('readStream - encoding picked up (CP1252)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'windows1252';
            const result = await service.readStream(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value.getFirstLineText(999999), 'Private = "Persönlicheß Information"');
        });
        test('read - encoding picked up (CP1252)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'windows1252';
            const result = await service.read(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value, 'Private = "Persönlicheß Information"');
        });
        test('read - encoding picked up (binary)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'binary';
            const result = await service.read(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value, 'Private = "Persönlicheß Information"');
        });
        test('read - encoding picked up (base64)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_small_cp1252.txt'));
            const encoding = 'base64';
            const result = await service.read(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            assert.strictEqual(result.value, btoa('Private = "Persönlicheß Information"'));
        });
        test('readStream - user overrides BOM', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf16le.css'));
            const result = await service.readStream(resource, { encoding: 'windows1252' });
            assert.strictEqual(result.encoding, 'windows1252');
        });
        test('readStream - BOM removed', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf8_bom.txt'));
            const result = await service.readStream(resource);
            assert.strictEqual(result.value.getFirstLineText(999999), 'This is some UTF 8 with BOM file.');
        });
        test('readStream - invalid encoding', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            const result = await service.readStream(resource, { encoding: 'superduper' });
            assert.strictEqual(result.encoding, 'utf8');
        });
        test('readStream - encoding override', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some.utf16le'));
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
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, `lorem_${encoding}.txt`));
            // Verify via `ITextFileService.readStream`
            const result = await service.readStream(resource, { encoding });
            assert.strictEqual(result.encoding, encoding);
            const textBuffer = disposables.add(result.value.create(1 /* DefaultEndOfLine.LF */).textBuffer);
            let contents = (0, textfiles_1.$MD)(textBuffer.createSnapshot(false));
            assert.strictEqual(contents.indexOf(needle), 0);
            assert.ok(contents.indexOf(needle, 10) > 0);
            // Verify via `ITextFileService.getDecodedTextFactory`
            const rawFile = await params.readFile(resource.fsPath);
            let rawFileVSBuffer;
            if (rawFile instanceof buffer_1.$Fd) {
                rawFileVSBuffer = rawFile;
            }
            else {
                rawFileVSBuffer = buffer_1.$Fd.wrap(rawFile);
            }
            const factory = await (0, textModel_1.$JC)(await service.getDecodedStream(resource, (0, buffer_1.$Td)(rawFileVSBuffer), { encoding }));
            const textBuffer2 = disposables.add(factory.create(1 /* DefaultEndOfLine.LF */).textBuffer);
            contents = (0, textfiles_1.$MD)(textBuffer2.createSnapshot(false));
            assert.strictEqual(contents.indexOf(needle), 0);
            assert.ok(contents.indexOf(needle, 10) > 0);
        }
        test('readStream - UTF16 LE (no BOM)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'utf16_le_nobom.txt'));
            const result = await service.readStream(resource);
            assert.strictEqual(result.encoding, 'utf16le');
        });
        test('readStream - UTF16 BE (no BOM)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'utf16_be_nobom.txt'));
            const result = await service.readStream(resource);
            assert.strictEqual(result.encoding, 'utf16be');
        });
        test('readStream - autoguessEncoding', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_cp1252.txt'));
            const result = await service.readStream(resource, { autoGuessEncoding: true });
            assert.strictEqual(result.encoding, 'windows1252');
        });
        test('readStream - FILE_IS_BINARY', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'binary.txt'));
            let error = undefined;
            try {
                await service.readStream(resource, { acceptTextOnly: true });
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.textFileOperationResult, 0 /* TextFileOperationResult.FILE_IS_BINARY */);
            const result = await service.readStream(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')), { acceptTextOnly: true });
            assert.strictEqual(result.name, 'small.txt');
        });
        test('read - FILE_IS_BINARY', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'binary.txt'));
            let error = undefined;
            try {
                await service.read(resource, { acceptTextOnly: true });
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.textFileOperationResult, 0 /* TextFileOperationResult.FILE_IS_BINARY */);
            const result = await service.read(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')), { acceptTextOnly: true });
            assert.strictEqual(result.name, 'small.txt');
        });
    }
    exports.default = $kgc;
});
//# sourceMappingURL=textFileService.io.test.js.map