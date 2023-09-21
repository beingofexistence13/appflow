/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/search/common/ignoreFile"], function (require, exports, assert, ignoreFile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function runAssert(input, ignoreFile, ignoreFileLocation, shouldMatch, traverse) {
        return (prefix) => {
            const isDir = input.endsWith('/');
            const rawInput = isDir ? input.slice(0, input.length - 1) : input;
            const matcher = new ignoreFile_1.IgnoreFile(ignoreFile, prefix + ignoreFileLocation);
            if (traverse) {
                const traverses = matcher.isPathIncludedInTraversal(prefix + rawInput, isDir);
                if (shouldMatch) {
                    assert(traverses, `${ignoreFileLocation}: ${ignoreFile} should traverse ${isDir ? 'dir' : 'file'} ${prefix}${rawInput}`);
                }
                else {
                    assert(!traverses, `${ignoreFileLocation}: ${ignoreFile} should not traverse ${isDir ? 'dir' : 'file'} ${prefix}${rawInput}`);
                }
            }
            else {
                const ignores = matcher.isArbitraryPathIgnored(prefix + rawInput, isDir);
                if (shouldMatch) {
                    assert(ignores, `${ignoreFileLocation}: ${ignoreFile} should ignore ${isDir ? 'dir' : 'file'} ${prefix}${rawInput}`);
                }
                else {
                    assert(!ignores, `${ignoreFileLocation}: ${ignoreFile} should not ignore ${isDir ? 'dir' : 'file'} ${prefix}${rawInput}`);
                }
            }
        };
    }
    function assertNoTraverses(ignoreFile, ignoreFileLocation, input) {
        const runWithPrefix = runAssert(input, ignoreFile, ignoreFileLocation, false, true);
        runWithPrefix('');
        runWithPrefix('/someFolder');
    }
    function assertTraverses(ignoreFile, ignoreFileLocation, input) {
        const runWithPrefix = runAssert(input, ignoreFile, ignoreFileLocation, true, true);
        runWithPrefix('');
        runWithPrefix('/someFolder');
    }
    function assertIgnoreMatch(ignoreFile, ignoreFileLocation, input) {
        const runWithPrefix = runAssert(input, ignoreFile, ignoreFileLocation, true, false);
        runWithPrefix('');
        runWithPrefix('/someFolder');
    }
    function assertNoIgnoreMatch(ignoreFile, ignoreFileLocation, input) {
        const runWithPrefix = runAssert(input, ignoreFile, ignoreFileLocation, false, false);
        runWithPrefix('');
        runWithPrefix('/someFolder');
    }
    suite('Parsing .gitignore files', () => {
        test('paths with trailing slashes do not match files', () => {
            const i = 'node_modules/\n';
            assertNoIgnoreMatch(i, '/', '/node_modules');
            assertIgnoreMatch(i, '/', '/node_modules/');
            assertNoIgnoreMatch(i, '/', '/inner/node_modules');
            assertIgnoreMatch(i, '/', '/inner/node_modules/');
        });
        test('parsing simple gitignore files', () => {
            let i = 'node_modules\nout\n';
            assertIgnoreMatch(i, '/', '/node_modules');
            assertNoTraverses(i, '/', '/node_modules');
            assertIgnoreMatch(i, '/', '/node_modules/file');
            assertIgnoreMatch(i, '/', '/dir/node_modules');
            assertIgnoreMatch(i, '/', '/dir/node_modules/file');
            assertIgnoreMatch(i, '/', '/out');
            assertNoTraverses(i, '/', '/out');
            assertIgnoreMatch(i, '/', '/out/file');
            assertIgnoreMatch(i, '/', '/dir/out');
            assertIgnoreMatch(i, '/', '/dir/out/file');
            i = '/node_modules\n/out\n';
            assertIgnoreMatch(i, '/', '/node_modules');
            assertIgnoreMatch(i, '/', '/node_modules/file');
            assertNoIgnoreMatch(i, '/', '/dir/node_modules');
            assertNoIgnoreMatch(i, '/', '/dir/node_modules/file');
            assertIgnoreMatch(i, '/', '/out');
            assertIgnoreMatch(i, '/', '/out/file');
            assertNoIgnoreMatch(i, '/', '/dir/out');
            assertNoIgnoreMatch(i, '/', '/dir/out/file');
            i = 'node_modules/\nout/\n';
            assertNoIgnoreMatch(i, '/', '/node_modules');
            assertIgnoreMatch(i, '/', '/node_modules/');
            assertIgnoreMatch(i, '/', '/node_modules/file');
            assertIgnoreMatch(i, '/', '/dir/node_modules/');
            assertNoIgnoreMatch(i, '/', '/dir/node_modules');
            assertIgnoreMatch(i, '/', '/dir/node_modules/file');
            assertIgnoreMatch(i, '/', '/out/');
            assertNoIgnoreMatch(i, '/', '/out');
            assertIgnoreMatch(i, '/', '/out/file');
            assertNoIgnoreMatch(i, '/', '/dir/out');
            assertIgnoreMatch(i, '/', '/dir/out/');
            assertIgnoreMatch(i, '/', '/dir/out/file');
        });
        test('parsing files-in-folder exclude', () => {
            let i = 'node_modules/*\n';
            assertNoIgnoreMatch(i, '/', '/node_modules');
            assertNoIgnoreMatch(i, '/', '/node_modules/');
            assertTraverses(i, '/', '/node_modules');
            assertTraverses(i, '/', '/node_modules/');
            assertIgnoreMatch(i, '/', '/node_modules/something');
            assertNoTraverses(i, '/', '/node_modules/something');
            assertIgnoreMatch(i, '/', '/node_modules/something/else');
            assertIgnoreMatch(i, '/', '/node_modules/@types');
            assertNoTraverses(i, '/', '/node_modules/@types');
            i = 'node_modules/**/*\n';
            assertNoIgnoreMatch(i, '/', '/node_modules');
            assertNoIgnoreMatch(i, '/', '/node_modules/');
            assertIgnoreMatch(i, '/', '/node_modules/something');
            assertIgnoreMatch(i, '/', '/node_modules/something/else');
            assertIgnoreMatch(i, '/', '/node_modules/@types');
        });
        test('parsing simple negations', () => {
            let i = 'node_modules/*\n!node_modules/@types\n';
            assertNoIgnoreMatch(i, '/', '/node_modules');
            assertTraverses(i, '/', '/node_modules');
            assertIgnoreMatch(i, '/', '/node_modules/something');
            assertNoTraverses(i, '/', '/node_modules/something');
            assertIgnoreMatch(i, '/', '/node_modules/something/else');
            assertNoIgnoreMatch(i, '/', '/node_modules/@types');
            assertTraverses(i, '/', '/node_modules/@types');
            assertTraverses(i, '/', '/node_modules/@types/boop');
            i = '*.log\n!important.log\n';
            assertIgnoreMatch(i, '/', '/test.log');
            assertIgnoreMatch(i, '/', '/inner/test.log');
            assertNoIgnoreMatch(i, '/', '/important.log');
            assertNoIgnoreMatch(i, '/', '/inner/important.log');
            assertNoTraverses(i, '/', '/test.log');
            assertNoTraverses(i, '/', '/inner/test.log');
            assertTraverses(i, '/', '/important.log');
            assertTraverses(i, '/', '/inner/important.log');
        });
        test('nested .gitignores', () => {
            let i = 'node_modules\nout\n';
            assertIgnoreMatch(i, '/inner/', '/inner/node_modules');
            assertIgnoreMatch(i, '/inner/', '/inner/more/node_modules');
            i = '/node_modules\n/out\n';
            assertIgnoreMatch(i, '/inner/', '/inner/node_modules');
            assertNoIgnoreMatch(i, '/inner/', '/inner/more/node_modules');
            assertNoIgnoreMatch(i, '/inner/', '/node_modules');
            i = 'node_modules/\nout/\n';
            assertNoIgnoreMatch(i, '/inner/', '/inner/node_modules');
            assertIgnoreMatch(i, '/inner/', '/inner/node_modules/');
            assertNoIgnoreMatch(i, '/inner/', '/inner/more/node_modules');
            assertIgnoreMatch(i, '/inner/', '/inner/more/node_modules/');
            assertNoIgnoreMatch(i, '/inner/', '/node_modules');
        });
        test('file extension matches', () => {
            let i = '*.js\n';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/myFile.js');
            i = '/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.js');
            i = '**/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/more/myFile.js');
            i = 'inner/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.js');
            i = '/inner/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.js');
            i = '**/inner/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.js');
            i = '**/inner/**/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/more/myFile.js');
            i = '**/more/*.js';
            assertNoIgnoreMatch(i, '/', '/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.ts');
            assertNoIgnoreMatch(i, '/', '/inner/myFile.js');
            assertNoIgnoreMatch(i, '/', '/inner/more/myFile.ts');
            assertIgnoreMatch(i, '/', '/inner/more/myFile.js');
        });
        test('real world example: vscode-js-debug', () => {
            const i = `.cache/
			.profile/
			.cdp-profile/
			.headless-profile/
			.vscode-test/
			.DS_Store
			node_modules/
			out/
			dist
			/coverage
			/.nyc_output
			demos/web-worker/vscode-pwa-dap.log
			demos/web-worker/vscode-pwa-cdp.log
			.dynamic-testWorkspace
			**/test/**/*.actual
			/testWorkspace/web/tmp
			/testWorkspace/**/debug.log
			/testWorkspace/webview/win/true/
			*.cpuprofile`;
            const included = [
                '/distro',
                '/inner/coverage',
                '/inner/.nyc_output',
                '/inner/demos/web-worker/vscode-pwa-dap.log',
                '/inner/demos/web-worker/vscode-pwa-cdp.log',
                '/testWorkspace/webview/win/true',
                '/a/best/b/c.actual',
                '/best/b/c.actual',
            ];
            const excluded = [
                '/.profile/',
                '/inner/.profile/',
                '/.DS_Store',
                '/inner/.DS_Store',
                '/coverage',
                '/.nyc_output',
                '/demos/web-worker/vscode-pwa-dap.log',
                '/demos/web-worker/vscode-pwa-cdp.log',
                '/.dynamic-testWorkspace',
                '/inner/.dynamic-testWorkspace',
                '/test/.actual',
                '/test/hello.actual',
                '/a/test/.actual',
                '/a/test/b.actual',
                '/a/test/b/.actual',
                '/a/test/b/c.actual',
                '/a/b/test/.actual',
                '/a/b/test/f/c.actual',
                '/testWorkspace/web/tmp',
                '/testWorkspace/debug.log',
                '/testWorkspace/a/debug.log',
                '/testWorkspace/a/b/debug.log',
                '/testWorkspace/webview/win/true/',
                '/.cpuprofile',
                '/a.cpuprofile',
                '/aa/a.cpuprofile',
                '/aaa/aa/a.cpuprofile',
            ];
            for (const include of included) {
                assertNoIgnoreMatch(i, '/', include);
            }
            for (const exclude of excluded) {
                assertIgnoreMatch(i, '/', exclude);
            }
        });
        test('real world example: vscode', () => {
            const i = `.DS_Store
			.cache
			npm-debug.log
			Thumbs.db
			node_modules/
			.build/
			extensions/**/dist/
			/out*/
			/extensions/**/out/
			src/vs/server
			resources/server
			build/node_modules
			coverage/
			test_data/
			test-results/
			yarn-error.log
			vscode.lsif
			vscode.db
			/.profile-oss`;
            const included = [
                '/inner/extensions/dist',
                '/inner/extensions/boop/dist/test',
                '/inner/extensions/boop/doop/dist',
                '/inner/extensions/boop/doop/dist/test',
                '/inner/extensions/boop/doop/dist/test',
                '/inner/extensions/out/test',
                '/inner/extensions/boop/out',
                '/inner/extensions/boop/out/test',
                '/inner/out/',
                '/inner/out/test',
                '/inner/out1/',
                '/inner/out1/test',
                '/inner/out2/',
                '/inner/out2/test',
                '/inner/.profile-oss',
                // Files.
                '/extensions/dist',
                '/extensions/boop/doop/dist',
                '/extensions/boop/out',
            ];
            const excluded = [
                '/extensions/dist/',
                '/extensions/boop/dist/test',
                '/extensions/boop/doop/dist/',
                '/extensions/boop/doop/dist/test',
                '/extensions/boop/doop/dist/test',
                '/extensions/out/test',
                '/extensions/boop/out/',
                '/extensions/boop/out/test',
                '/out/',
                '/out/test',
                '/out1/',
                '/out1/test',
                '/out2/',
                '/out2/test',
                '/.profile-oss',
            ];
            for (const include of included) {
                assertNoIgnoreMatch(i, '/', include);
            }
            for (const exclude of excluded) {
                assertIgnoreMatch(i, '/', exclude);
            }
        });
        test('various advanced constructs found in popular repos', () => {
            const runTest = ({ pattern, included, excluded }) => {
                for (const include of included) {
                    assertNoIgnoreMatch(pattern, '/', include);
                }
                for (const exclude of excluded) {
                    assertIgnoreMatch(pattern, '/', exclude);
                }
            };
            runTest({
                pattern: `**/node_modules
			/packages/*/dist`,
                excluded: [
                    '/node_modules',
                    '/test/node_modules',
                    '/node_modules/test',
                    '/test/node_modules/test',
                    '/packages/a/dist',
                    '/packages/abc/dist',
                    '/packages/abc/dist/test',
                ],
                included: [
                    '/inner/packages/a/dist',
                    '/inner/packages/abc/dist',
                    '/inner/packages/abc/dist/test',
                    '/packages/dist',
                    '/packages/dist/test',
                    '/packages/a/b/dist',
                    '/packages/a/b/dist/test',
                ],
            });
            runTest({
                pattern: `.yarn/*
			# !.yarn/cache
			!.yarn/patches
			!.yarn/plugins
			!.yarn/releases
			!.yarn/sdks
			!.yarn/versions`,
                excluded: [
                    '/.yarn/test',
                    '/.yarn/cache',
                ],
                included: [
                    '/inner/.yarn/test',
                    '/inner/.yarn/cache',
                    '/.yarn/patches',
                    '/.yarn/plugins',
                    '/.yarn/releases',
                    '/.yarn/sdks',
                    '/.yarn/versions',
                ],
            });
            runTest({
                pattern: `[._]*s[a-w][a-z]
			[._]s[a-w][a-z]
			*.un~
			*~`,
                excluded: [
                    '/~',
                    '/abc~',
                    '/inner/~',
                    '/inner/abc~',
                    '/.un~',
                    '/a.un~',
                    '/test/.un~',
                    '/test/a.un~',
                    '/.saa',
                    '/....saa',
                    '/._._sby',
                    '/inner/._._sby',
                    '/_swz',
                ],
                included: [
                    '/.jaa',
                ],
            });
            // TODO: the rest of these :)
            runTest({
                pattern: `*.pbxuser
			!default.pbxuser
			*.mode1v3
			!default.mode1v3
			*.mode2v3
			!default.mode2v3
			*.perspectivev3
			!default.perspectivev3`,
                excluded: [],
                included: [],
            });
            runTest({
                pattern: `[Dd]ebug/
			[Dd]ebugPublic/
			[Rr]elease/
			[Rr]eleases/
			*.[Mm]etrics.xml
			[Tt]est[Rr]esult*/
			[Bb]uild[Ll]og.*
			bld/
			[Bb]in/
			[Oo]bj/
			[Ll]og/`,
                excluded: [],
                included: [],
            });
            runTest({
                pattern: `Dockerfile*
			!/tests/bud/*/Dockerfile*
			!/tests/conformance/**/Dockerfile*`,
                excluded: [],
                included: [],
            });
            runTest({
                pattern: `*.pdf
			*.html
			!author_bio.html
			!colo.html
			!copyright.html
			!cover.html
			!ix.html
			!titlepage.html
			!toc.html`,
                excluded: [],
                included: [],
            });
            runTest({
                pattern: `/log/*
			/tmp/*
			!/log/.keep
			!/tmp/.keep`,
                excluded: [],
                included: [],
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWdub3JlRmlsZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC90ZXN0L2NvbW1vbi9pZ25vcmVGaWxlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFLaEcsU0FBUyxTQUFTLENBQUMsS0FBYSxFQUFFLFVBQWtCLEVBQUUsa0JBQTBCLEVBQUUsV0FBb0IsRUFBRSxRQUFpQjtRQUN4SCxPQUFPLENBQUMsTUFBYyxFQUFFLEVBQUU7WUFDekIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUVsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLHVCQUFVLENBQUMsVUFBVSxFQUFFLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3hFLElBQUksUUFBUSxFQUFFO2dCQUNiLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLEdBQUcsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUU5RSxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLGtCQUFrQixLQUFLLFVBQVUsb0JBQW9CLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUM7aUJBQ3pIO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxHQUFHLGtCQUFrQixLQUFLLFVBQVUsd0JBQXdCLEtBQUssQ0FBQyxD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