/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/node/fileSearch", "vs/base/test/node/testUtils", "vs/base/common/network"], function (require, exports, assert, path, platform, resources_1, uri_1, fileSearch_1, testUtils_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FIXTURES = path.$7d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const EXAMPLES_FIXTURES = uri_1.URI.file(path.$9d(TEST_FIXTURES, 'examples'));
    const MORE_FIXTURES = uri_1.URI.file(path.$9d(TEST_FIXTURES, 'more'));
    const TEST_ROOT_FOLDER = { folder: uri_1.URI.file(TEST_FIXTURES) };
    const ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    const ROOT_FOLDER_QUERY_36438 = [
        { folder: uri_1.URI.file(path.$7d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures2/36438').fsPath)) }
    ];
    const MULTIROOT_QUERIES = [
        { folder: EXAMPLES_FIXTURES },
        { folder: MORE_FIXTURES }
    ];
    (0, testUtils_1.flakySuite)('FileSearchEngine', () => {
        test('Files: *.js', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.js'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 4);
                done();
            });
        });
        test('Files: maxResults', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                maxResults: 1
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: maxResults without Ripgrep', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                maxResults: 1,
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: exists', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/file.txt': true },
                exists: true
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error, complete) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                assert.ok(complete.limitHit);
                done();
            });
        });
        test('Files: not exists', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/nofile.txt': true },
                exists: true
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error, complete) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                assert.ok(!complete.limitHit);
                done();
            });
        });
        test('Files: exists without Ripgrep', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/file.txt': true },
                exists: true,
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error, complete) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                assert.ok(complete.limitHit);
                done();
            });
        });
        test('Files: not exists without Ripgrep', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: { '**/nofile.txt': true },
                exists: true,
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error, complete) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                assert.ok(!complete.limitHit);
                done();
            });
        });
        test('Files: examples/com*', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.$9d('examples', 'com*')
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: examples (fuzzy)', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'xl'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 7);
                done();
            });
        });
        test('Files: multiroot', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                filePattern: 'file'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 3);
                done();
            });
        });
        test('Files: multiroot with includePattern and maxResults', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                maxResults: 1,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error, complete) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: multiroot with includePattern and exists', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: MULTIROOT_QUERIES,
                exists: true,
                includePattern: {
                    '*.txt': true,
                    '*.js': true
                },
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error, complete) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                assert.ok(complete.limitHit);
                done();
            });
        });
        test('Files: NPE (CamelCase)', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'NullPE'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: *.*', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 14);
                done();
            });
        });
        test('Files: *.as', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.as'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                done();
            });
        });
        test('Files: *.* without derived', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'site.*',
                excludePattern: { '**/*.css': { 'when': '$(basename).less' } }
            });
            let count = 0;
            let res;
            engine.search((result) => {
                if (result) {
                    count++;
                }
                res = result;
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                assert.strictEqual(path.$ae(res.relativePath), 'site.less');
                done();
            });
        });
        test('Files: *.* exclude folder without wildcard', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { 'examples': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 8);
                done();
            });
        });
        test('Files: exclude folder without wildcard #36438', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY_36438,
                excludePattern: { 'modules': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: include folder without wildcard #36438', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY_36438,
                includePattern: { 'modules/**': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: *.* exclude folder with leading wildcard', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { '**/examples': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 8);
                done();
            });
        });
        test('Files: *.* exclude folder with trailing wildcard', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { 'examples/**': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 8);
                done();
            });
        });
        test('Files: *.* exclude with unicode', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                excludePattern: { '**/üm laut汉语': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 13);
                done();
            });
        });
        test('Files: *.* include with unicode', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '*.*',
                includePattern: { '**/üm laut汉语/*': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
        test('Files: multiroot with exclude', function (done) {
            const folderQueries = [
                {
                    folder: EXAMPLES_FIXTURES,
                    excludePattern: {
                        '**/anotherfile.txt': true
                    }
                },
                {
                    folder: MORE_FIXTURES,
                    excludePattern: {
                        '**/file.txt': true
                    }
                }
            ];
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries,
                filePattern: '*'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 5);
                done();
            });
        });
        test('Files: Unicode and Spaces', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: '汉语'
            });
            let count = 0;
            let res;
            engine.search((result) => {
                if (result) {
                    count++;
                }
                res = result;
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                assert.strictEqual(path.$ae(res.relativePath), '汉语.txt');
                done();
            });
        });
        test('Files: no results', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: 'nofilematch'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 0);
                done();
            });
        });
        test('Files: relative path matched once', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.$7d(path.$9d('examples', 'company.js'))
            });
            let count = 0;
            let res;
            engine.search((result) => {
                if (result) {
                    count++;
                }
                res = result;
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                assert.strictEqual(path.$ae(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: Include pattern, single files', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                includePattern: {
                    'site.css': true,
                    'examples/company.js': true,
                    'examples/subfolder/subfile.txt': true
                }
            });
            const res = [];
            engine.search((result) => {
                res.push(result);
            }, () => { }, (error) => {
                assert.ok(!error);
                const basenames = res.map(r => path.$ae(r.relativePath));
                assert.ok(basenames.indexOf('site.css') !== -1, `site.css missing in ${JSON.stringify(basenames)}`);
                assert.ok(basenames.indexOf('company.js') !== -1, `company.js missing in ${JSON.stringify(basenames)}`);
                assert.ok(basenames.indexOf('subfile.txt') !== -1, `subfile.txt missing in ${JSON.stringify(basenames)}`);
                done();
            });
        });
        test('Files: extraFiles only', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: [],
                extraFileResources: [
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'site.css'))),
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'examples', 'company.js'))),
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'index.html')))
                ],
                filePattern: '*.js'
            });
            let count = 0;
            let res;
            engine.search((result) => {
                if (result) {
                    count++;
                }
                res = result;
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                assert.strictEqual(path.$ae(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: extraFiles only (with include)', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: [],
                extraFileResources: [
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'site.css'))),
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'examples', 'company.js'))),
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'index.html')))
                ],
                filePattern: '*.*',
                includePattern: { '**/*.css': true }
            });
            let count = 0;
            let res;
            engine.search((result) => {
                if (result) {
                    count++;
                }
                res = result;
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                assert.strictEqual(path.$ae(res.relativePath), 'site.css');
                done();
            });
        });
        test('Files: extraFiles only (with exclude)', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: [],
                extraFileResources: [
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'site.css'))),
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'examples', 'company.js'))),
                    uri_1.URI.file(path.$7d(path.$9d(network_1.$2f.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'index.html')))
                ],
                filePattern: '*.*',
                excludePattern: { '**/*.css': true }
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 2);
                done();
            });
        });
        test('Files: no dupes in nested folders', function (done) {
            const engine = new fileSearch_1.$ydc({
                type: 1 /* QueryType.File */,
                folderQueries: [
                    { folder: EXAMPLES_FIXTURES },
                    { folder: (0, resources_1.$ig)(EXAMPLES_FIXTURES, 'subfolder') }
                ],
                filePattern: 'subfile.txt'
            });
            let count = 0;
            engine.search((result) => {
                if (result) {
                    count++;
                }
            }, () => { }, (error) => {
                assert.ok(!error);
                assert.strictEqual(count, 1);
                done();
            });
        });
    });
    (0, testUtils_1.flakySuite)('FileWalker', () => {
        (platform.$i ? test.skip : test)('Find: exclude subfolder', function (done) {
            const file0 = './more/file.txt';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.$xdc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                excludePattern: { '**/something': true }
            });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.$xdc({
                    type: 1 /* QueryType.File */,
                    folderQueries: ROOT_FOLDER_QUERY,
                    excludePattern: { '**/subfolder': true }
                });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.$i ? test.skip : test)('Find: folder excludes', function (done) {
            const folderQueries = [
                {
                    folder: uri_1.URI.file(TEST_FIXTURES),
                    excludePattern: { '**/subfolder': true }
                }
            ];
            const file0 = './more/file.txt';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries });
            const cmd1 = walker.spawnFindCmd(folderQueries[0]);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert(outputContains(stdout1, file0), stdout1);
                assert(!outputContains(stdout1, file1), stdout1);
                done();
            });
        });
        (platform.$i ? test.skip : test)('Find: exclude multiple folders', function (done) {
            const file0 = './index.html';
            const file1 = './examples/small.js';
            const file2 = './more/file.txt';
            const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file2), -1, stdout1);
                const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '{**/examples,**/more}': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    assert.strictEqual(stdout2.split('\n').indexOf(file2), -1, stdout2);
                    done();
                });
            });
        });
        (platform.$i ? test.skip : test)('Find: exclude folder path suffix', function (done) {
            const file0 = './examples/company.js';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/examples/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/examples/subfolder': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.$i ? test.skip : test)('Find: exclude subfolder path suffix', function (done) {
            const file0 = './examples/subfolder/subfile.txt';
            const file1 = './examples/subfolder/anotherfolder/anotherfile.txt';
            const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder/anotherfolder': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.$i ? test.skip : test)('Find: exclude folder path', function (done) {
            const file0 = './examples/company.js';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { 'examples/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.$xdc({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { 'examples/subfolder': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.$i ? test.skip : test)('Find: exclude combination of paths', function (done) {
            const filesIn = [
                './examples/subfolder/subfile.txt',
                './examples/company.js',
                './index.html'
            ];
            const filesOut = [
                './examples/subfolder/anotherfolder/anotherfile.txt',
                './more/file.txt'
            ];
            const walker = new fileSearch_1.$xdc({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                excludePattern: {
                    '**/subfolder/anotherfolder': true,
                    '**/something/else': true,
                    '**/more': true,
                    '**/andmore': true
                }
            });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                for (const fileIn of filesIn) {
                    assert.notStrictEqual(stdout1.split('\n').indexOf(fileIn), -1, stdout1);
                }
                for (const fileOut of filesOut) {
                    assert.strictEqual(stdout1.split('\n').indexOf(fileOut), -1, stdout1);
                }
                done();
            });
        });
        function outputContains(stdout, ...files) {
            const lines = stdout.split('\n');
            return files.every(file => lines.indexOf(file) >= 0);
        }
    });
});
//# sourceMappingURL=search.integrationTest.js.map