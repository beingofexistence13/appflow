/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/workbench/services/search/node/fileSearch", "vs/base/test/node/testUtils", "vs/base/common/network"], function (require, exports, assert, path, platform, resources_1, uri_1, fileSearch_1, testUtils_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TEST_FIXTURES = path.normalize(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath);
    const EXAMPLES_FIXTURES = uri_1.URI.file(path.join(TEST_FIXTURES, 'examples'));
    const MORE_FIXTURES = uri_1.URI.file(path.join(TEST_FIXTURES, 'more'));
    const TEST_ROOT_FOLDER = { folder: uri_1.URI.file(TEST_FIXTURES) };
    const ROOT_FOLDER_QUERY = [
        TEST_ROOT_FOLDER
    ];
    const ROOT_FOLDER_QUERY_36438 = [
        { folder: uri_1.URI.file(path.normalize(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures2/36438').fsPath)) }
    ];
    const MULTIROOT_QUERIES = [
        { folder: EXAMPLES_FIXTURES },
        { folder: MORE_FIXTURES }
    ];
    (0, testUtils_1.flakySuite)('FileSearchEngine', () => {
        test('Files: *.js', function (done) {
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.join('examples', 'com*')
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
                assert.strictEqual(path.basename(res.relativePath), 'site.less');
                done();
            });
        });
        test('Files: *.* exclude folder without wildcard', function (done) {
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
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
                assert.strictEqual(path.basename(res.relativePath), '汉语.txt');
                done();
            });
        });
        test('Files: no results', function (done) {
            const engine = new fileSearch_1.Engine({
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
            const engine = new fileSearch_1.Engine({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                filePattern: path.normalize(path.join('examples', 'company.js'))
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
                assert.strictEqual(path.basename(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: Include pattern, single files', function (done) {
            const engine = new fileSearch_1.Engine({
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
                const basenames = res.map(r => path.basename(r.relativePath));
                assert.ok(basenames.indexOf('site.css') !== -1, `site.css missing in ${JSON.stringify(basenames)}`);
                assert.ok(basenames.indexOf('company.js') !== -1, `company.js missing in ${JSON.stringify(basenames)}`);
                assert.ok(basenames.indexOf('subfile.txt') !== -1, `subfile.txt missing in ${JSON.stringify(basenames)}`);
                done();
            });
        });
        test('Files: extraFiles only', function (done) {
            const engine = new fileSearch_1.Engine({
                type: 1 /* QueryType.File */,
                folderQueries: [],
                extraFileResources: [
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'site.css'))),
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'examples', 'company.js'))),
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'index.html')))
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
                assert.strictEqual(path.basename(res.relativePath), 'company.js');
                done();
            });
        });
        test('Files: extraFiles only (with include)', function (done) {
            const engine = new fileSearch_1.Engine({
                type: 1 /* QueryType.File */,
                folderQueries: [],
                extraFileResources: [
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'site.css'))),
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'examples', 'company.js'))),
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'index.html')))
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
                assert.strictEqual(path.basename(res.relativePath), 'site.css');
                done();
            });
        });
        test('Files: extraFiles only (with exclude)', function (done) {
            const engine = new fileSearch_1.Engine({
                type: 1 /* QueryType.File */,
                folderQueries: [],
                extraFileResources: [
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'site.css'))),
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'examples', 'company.js'))),
                    uri_1.URI.file(path.normalize(path.join(network_1.FileAccess.asFileUri('vs/workbench/services/search/test/node/fixtures').fsPath, 'index.html')))
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
            const engine = new fileSearch_1.Engine({
                type: 1 /* QueryType.File */,
                folderQueries: [
                    { folder: EXAMPLES_FIXTURES },
                    { folder: (0, resources_1.joinPath)(EXAMPLES_FIXTURES, 'subfolder') }
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
        (platform.isWindows ? test.skip : test)('Find: exclude subfolder', function (done) {
            const file0 = './more/file.txt';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.FileWalker({
                type: 1 /* QueryType.File */,
                folderQueries: ROOT_FOLDER_QUERY,
                excludePattern: { '**/something': true }
            });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.FileWalker({
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
        (platform.isWindows ? test.skip : test)('Find: folder excludes', function (done) {
            const folderQueries = [
                {
                    folder: uri_1.URI.file(TEST_FIXTURES),
                    excludePattern: { '**/subfolder': true }
                }
            ];
            const file0 = './more/file.txt';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries });
            const cmd1 = walker.spawnFindCmd(folderQueries[0]);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert(outputContains(stdout1, file0), stdout1);
                assert(!outputContains(stdout1, file1), stdout1);
                done();
            });
        });
        (platform.isWindows ? test.skip : test)('Find: exclude multiple folders', function (done) {
            const file0 = './index.html';
            const file1 = './examples/small.js';
            const file2 = './more/file.txt';
            const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file2), -1, stdout1);
                const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '{**/examples,**/more}': true } });
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
        (platform.isWindows ? test.skip : test)('Find: exclude folder path suffix', function (done) {
            const file0 = './examples/company.js';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/examples/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/examples/subfolder': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.isWindows ? test.skip : test)('Find: exclude subfolder path suffix', function (done) {
            const file0 = './examples/subfolder/subfile.txt';
            const file1 = './examples/subfolder/anotherfolder/anotherfile.txt';
            const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { '**/subfolder/anotherfolder': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.isWindows ? test.skip : test)('Find: exclude folder path', function (done) {
            const file0 = './examples/company.js';
            const file1 = './examples/subfolder/subfile.txt';
            const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { 'examples/something': true } });
            const cmd1 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
            walker.readStdout(cmd1, 'utf8', (err1, stdout1) => {
                assert.strictEqual(err1, null);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                assert.notStrictEqual(stdout1.split('\n').indexOf(file1), -1, stdout1);
                const walker = new fileSearch_1.FileWalker({ type: 1 /* QueryType.File */, folderQueries: ROOT_FOLDER_QUERY, excludePattern: { 'examples/subfolder': true } });
                const cmd2 = walker.spawnFindCmd(TEST_ROOT_FOLDER);
                walker.readStdout(cmd2, 'utf8', (err2, stdout2) => {
                    assert.strictEqual(err2, null);
                    assert.notStrictEqual(stdout1.split('\n').indexOf(file0), -1, stdout1);
                    assert.strictEqual(stdout2.split('\n').indexOf(file1), -1, stdout2);
                    done();
                });
            });
        });
        (platform.isWindows ? test.skip : test)('Find: exclude combination of paths', function (done) {
            const filesIn = [
                './examples/subfolder/subfile.txt',
                './examples/company.js',
                './index.html'
            ];
            const filesOut = [
                './examples/subfolder/anotherfolder/anotherfile.txt',
                './more/file.txt'
            ];
            const walker = new fileSearch_1.FileWalker({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmludGVncmF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zZWFyY2gvdGVzdC9ub2RlL3NlYXJjaC5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxpREFBaUQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JILE1BQU0saUJBQWlCLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLE1BQU0sYUFBYSxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqRSxNQUFNLGdCQUFnQixHQUFpQixFQUFFLE1BQU0sRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7SUFDM0UsTUFBTSxpQkFBaUIsR0FBbUI7UUFDekMsZ0JBQWdCO0tBQ2hCLENBQUM7SUFFRixNQUFNLHVCQUF1QixHQUFtQjtRQUMvQyxFQUFFLE1BQU0sRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsd0RBQXdELENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO0tBQzNILENBQUM7SUFFRixNQUFNLGlCQUFpQixHQUFtQjtRQUN6QyxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRTtRQUM3QixFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUU7S0FDekIsQ0FBQztJQUVGLElBQUEsc0JBQVUsRUFBQyxrQkFBa0IsRUFB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