/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/tunnel/common/tunnel", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, lifecycle_1, platform_1, uri_1, utils_1, tunnel_1, workspace_1, linkDetector_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Link Detector', () => {
        let disposables;
        let linkDetector;
        /**
         * Instantiate a {@link $2Pb} for use by the functions being tested.
         */
        setup(() => {
            disposables = new lifecycle_1.$jc();
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            instantiationService.stub(tunnel_1.$Wz, { canTunnel: () => false });
            linkDetector = instantiationService.createInstance(linkDetector_1.$2Pb);
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        /**
         * Assert that a given Element is an anchor element.
         *
         * @param element The Element to verify.
         */
        function assertElementIsLink(element) {
            assert(element instanceof HTMLAnchorElement);
        }
        test('noLinks', () => {
            const input = 'I am a string';
            const expectedOutput = '<span>I am a string</span>';
            const output = linkDetector.linkify(input);
            assert.strictEqual(0, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual(expectedOutput, output.outerHTML);
        });
        test('trailingNewline', () => {
            const input = 'I am a string\n';
            const expectedOutput = '<span>I am a string\n</span>';
            const output = linkDetector.linkify(input);
            assert.strictEqual(0, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual(expectedOutput, output.outerHTML);
        });
        test('trailingNewlineSplit', () => {
            const input = 'I am a string\n';
            const expectedOutput = '<span>I am a string\n</span>';
            const output = linkDetector.linkify(input, true);
            assert.strictEqual(0, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual(expectedOutput, output.outerHTML);
        });
        test('singleLineLink', () => {
            const input = platform_1.$i ? 'C:\\foo\\bar.js:12:34' : '/Users/foo/bar.js:12:34';
            const expectedOutput = platform_1.$i ? '<span><a tabindex="0">C:\\foo\\bar.js:12:34<\/a><\/span>' : '<span><a tabindex="0">/Users/foo/bar.js:12:34<\/a><\/span>';
            const output = linkDetector.linkify(input);
            assert.strictEqual(1, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual('A', output.firstElementChild.tagName);
            assert.strictEqual(expectedOutput, output.outerHTML);
            assertElementIsLink(output.firstElementChild);
            assert.strictEqual(platform_1.$i ? 'C:\\foo\\bar.js:12:34' : '/Users/foo/bar.js:12:34', output.firstElementChild.textContent);
        });
        test('relativeLink', () => {
            const input = '\./foo/bar.js';
            const expectedOutput = '<span>\./foo/bar.js</span>';
            const output = linkDetector.linkify(input);
            assert.strictEqual(0, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual(expectedOutput, output.outerHTML);
        });
        test('relativeLinkWithWorkspace', async () => {
            const input = '\./foo/bar.js';
            const output = linkDetector.linkify(input, false, new workspace_1.$Vh({ uri: uri_1.URI.file('/path/to/workspace'), name: 'ws', index: 0 }));
            assert.strictEqual('SPAN', output.tagName);
            assert.ok(output.outerHTML.indexOf('link') >= 0);
        });
        test('singleLineLinkAndText', function () {
            const input = platform_1.$i ? 'The link: C:/foo/bar.js:12:34' : 'The link: /Users/foo/bar.js:12:34';
            const expectedOutput = /^<span>The link: <a tabindex="0">.*\/foo\/bar.js:12:34<\/a><\/span>$/;
            const output = linkDetector.linkify(input);
            assert.strictEqual(1, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual('A', output.children[0].tagName);
            assert(expectedOutput.test(output.outerHTML));
            assertElementIsLink(output.children[0]);
            assert.strictEqual(platform_1.$i ? 'C:/foo/bar.js:12:34' : '/Users/foo/bar.js:12:34', output.children[0].textContent);
        });
        test('singleLineMultipleLinks', () => {
            const input = platform_1.$i ? 'Here is a link C:/foo/bar.js:12:34 and here is another D:/boo/far.js:56:78' :
                'Here is a link /Users/foo/bar.js:12:34 and here is another /Users/boo/far.js:56:78';
            const expectedOutput = /^<span>Here is a link <a tabindex="0">.*\/foo\/bar.js:12:34<\/a> and here is another <a tabindex="0">.*\/boo\/far.js:56:78<\/a><\/span>$/;
            const output = linkDetector.linkify(input);
            assert.strictEqual(2, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual('A', output.children[0].tagName);
            assert.strictEqual('A', output.children[1].tagName);
            assert(expectedOutput.test(output.outerHTML));
            assertElementIsLink(output.children[0]);
            assertElementIsLink(output.children[1]);
            assert.strictEqual(platform_1.$i ? 'C:/foo/bar.js:12:34' : '/Users/foo/bar.js:12:34', output.children[0].textContent);
            assert.strictEqual(platform_1.$i ? 'D:/boo/far.js:56:78' : '/Users/boo/far.js:56:78', output.children[1].textContent);
        });
        test('multilineNoLinks', () => {
            const input = 'Line one\nLine two\nLine three';
            const expectedOutput = /^<span><span>Line one\n<\/span><span>Line two\n<\/span><span>Line three<\/span><\/span>$/;
            const output = linkDetector.linkify(input, true);
            assert.strictEqual(3, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual('SPAN', output.children[0].tagName);
            assert.strictEqual('SPAN', output.children[1].tagName);
            assert.strictEqual('SPAN', output.children[2].tagName);
            assert(expectedOutput.test(output.outerHTML));
        });
        test('multilineTrailingNewline', () => {
            const input = 'I am a string\nAnd I am another\n';
            const expectedOutput = '<span><span>I am a string\n<\/span><span>And I am another\n<\/span><\/span>';
            const output = linkDetector.linkify(input, true);
            assert.strictEqual(2, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual('SPAN', output.children[0].tagName);
            assert.strictEqual('SPAN', output.children[1].tagName);
            assert.strictEqual(expectedOutput, output.outerHTML);
        });
        test('multilineWithLinks', () => {
            const input = platform_1.$i ? 'I have a link for you\nHere it is: C:/foo/bar.js:12:34\nCool, huh?' :
                'I have a link for you\nHere it is: /Users/foo/bar.js:12:34\nCool, huh?';
            const expectedOutput = /^<span><span>I have a link for you\n<\/span><span>Here it is: <a tabindex="0">.*\/foo\/bar.js:12:34<\/a>\n<\/span><span>Cool, huh\?<\/span><\/span>$/;
            const output = linkDetector.linkify(input, true);
            assert.strictEqual(3, output.children.length);
            assert.strictEqual('SPAN', output.tagName);
            assert.strictEqual('SPAN', output.children[0].tagName);
            assert.strictEqual('SPAN', output.children[1].tagName);
            assert.strictEqual('SPAN', output.children[2].tagName);
            assert.strictEqual('A', output.children[1].children[0].tagName);
            assert(expectedOutput.test(output.outerHTML));
            assertElementIsLink(output.children[1].children[0]);
            assert.strictEqual(platform_1.$i ? 'C:/foo/bar.js:12:34' : '/Users/foo/bar.js:12:34', output.children[1].children[0].textContent);
        });
    });
});
//# sourceMappingURL=linkDetector.test.js.map