/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/services/languagesAssociations"], function (require, exports, assert, uri_1, utils_1, languagesAssociations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LanguagesAssociations', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Dynamically Register Text Mime', () => {
            let guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['application/unknown']);
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'codefile', filename: 'Codefile', mime: 'text/code' });
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('Codefile'));
            assert.deepStrictEqual(guess, ['text/code', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.Codefile'));
            assert.deepStrictEqual(guess, ['application/unknown']);
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'docker', filepattern: 'Docker*', mime: 'text/docker' });
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('Docker-debug'));
            assert.deepStrictEqual(guess, ['text/docker', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('docker-PROD'));
            assert.deepStrictEqual(guess, ['text/docker', 'text/plain']);
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'niceregex', mime: 'text/nice-regex', firstline: /RegexesAreNice/ });
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('Randomfile.noregistration'), 'RegexesAreNice');
            assert.deepStrictEqual(guess, ['text/nice-regex', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('Randomfile.noregistration'), 'RegexesAreNotNice');
            assert.deepStrictEqual(guess, ['application/unknown']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('Codefile'), 'RegexesAreNice');
            assert.deepStrictEqual(guess, ['text/code', 'text/plain']);
        });
        test('Mimes Priority', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'foobar', mime: 'text/foobar', firstline: /foobar/ });
            let guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco'), 'foobar');
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'docker', filename: 'dockerfile', mime: 'text/winner' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'docker', filepattern: 'dockerfile*', mime: 'text/looser' });
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('dockerfile'));
            assert.deepStrictEqual(guess, ['text/winner', 'text/plain']);
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'azure-looser', mime: 'text/azure-looser', firstline: /azure/ });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'azure-winner', mime: 'text/azure-winner', firstline: /azure/ });
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('azure'), 'azure');
            assert.deepStrictEqual(guess, ['text/azure-winner', 'text/plain']);
        });
        test('Specificity priority 1', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco2', extension: '.monaco2', mime: 'text/monaco2' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco2', filename: 'specific.monaco2', mime: 'text/specific-monaco2' });
            assert.deepStrictEqual((0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('specific.monaco2')), ['text/specific-monaco2', 'text/plain']);
            assert.deepStrictEqual((0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco2')), ['text/monaco2', 'text/plain']);
        });
        test('Specificity priority 2', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco3', filename: 'specific.monaco3', mime: 'text/specific-monaco3' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco3', extension: '.monaco3', mime: 'text/monaco3' });
            assert.deepStrictEqual((0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('specific.monaco3')), ['text/specific-monaco3', 'text/plain']);
            assert.deepStrictEqual((0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco3')), ['text/monaco3', 'text/plain']);
        });
        test('Mimes Priority - Longest Extension wins', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', extension: '.monaco.xml', mime: 'text/monaco-xml' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', extension: '.monaco.xml.build', mime: 'text/monaco-xml-build' });
            let guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco.xml'));
            assert.deepStrictEqual(guess, ['text/monaco-xml', 'text/plain']);
            guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco.xml.build'));
            assert.deepStrictEqual(guess, ['text/monaco-xml-build', 'text/plain']);
        });
        test('Mimes Priority - User configured wins', () => {
            (0, languagesAssociations_1.registerConfiguredLanguageAssociation)({ id: 'monaco', extension: '.monaco.xnl', mime: 'text/monaco' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', extension: '.monaco.xml', mime: 'text/monaco-xml' });
            const guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('foo.monaco.xnl'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
        });
        test('Mimes Priority - Pattern matches on path if specified', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', filepattern: '**/dot.monaco.xml', mime: 'text/monaco' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'other', filepattern: '*ot.other.xml', mime: 'text/other' });
            const guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('/some/path/dot.monaco.xml'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
        });
        test('Mimes Priority - Last registered mime wins', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'monaco', filepattern: '**/dot.monaco.xml', mime: 'text/monaco' });
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'other', filepattern: '**/dot.monaco.xml', mime: 'text/other' });
            const guess = (0, languagesAssociations_1.getMimeTypes)(uri_1.URI.file('/some/path/dot.monaco.xml'));
            assert.deepStrictEqual(guess, ['text/other', 'text/plain']);
        });
        test('Data URIs', () => {
            (0, languagesAssociations_1.registerPlatformLanguageAssociation)({ id: 'data', extension: '.data', mime: 'text/data' });
            assert.deepStrictEqual((0, languagesAssociations_1.getMimeTypes)(uri_1.URI.parse(`data:;label:something.data;description:data,`)), ['text/data', 'text/plain']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzQXNzb2NpYXRpb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vc2VydmljZXMvbGFuZ3VhZ2VzQXNzb2NpYXRpb25zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtRQUVuQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFBLG9DQUFZLEVBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1lBRXZELElBQUEsMkRBQW1DLEVBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDakcsS0FBSyxHQUFHLElBQUEsb0NBQVksRUFBQyxTQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDN0MsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUU3RCxLQUFLLEdBQUcsSUFBQSxvQ0FBWSxFQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBRTdELElBQUEsMkRBQW1DLEVBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxV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