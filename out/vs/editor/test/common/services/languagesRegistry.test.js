/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/services/languagesRegistry"], function (require, exports, assert, uri_1, utils_1, languagesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LanguagesRegistry', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('output language does not have a name', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'outputLangId',
                    extensions: [],
                    aliases: [],
                    mimetypes: ['outputLanguageMimeType'],
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), []);
            registry.dispose();
        });
        test('language with alias does have a name', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId',
                    extensions: [],
                    aliases: ['LangName'],
                    mimetypes: ['bla'],
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'LangName', languageId: 'langId' }]);
            assert.deepStrictEqual(registry.getLanguageName('langId'), 'LangName');
            registry.dispose();
        });
        test('language without alias gets a name', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId',
                    extensions: [],
                    mimetypes: ['bla'],
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'langId', languageId: 'langId' }]);
            assert.deepStrictEqual(registry.getLanguageName('langId'), 'langId');
            registry.dispose();
        });
        test('bug #4360: f# not shown in status bar', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId',
                    extensions: ['.ext1'],
                    aliases: ['LangName'],
                    mimetypes: ['bla'],
                }]);
            registry._registerLanguages([{
                    id: 'langId',
                    extensions: ['.ext2'],
                    aliases: [],
                    mimetypes: ['bla'],
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'LangName', languageId: 'langId' }]);
            assert.deepStrictEqual(registry.getLanguageName('langId'), 'LangName');
            registry.dispose();
        });
        test('issue #5278: Extension cannot override language name anymore', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId',
                    extensions: ['.ext1'],
                    aliases: ['LangName'],
                    mimetypes: ['bla'],
                }]);
            registry._registerLanguages([{
                    id: 'langId',
                    extensions: ['.ext2'],
                    aliases: ['BetterLanguageName'],
                    mimetypes: ['bla'],
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'BetterLanguageName', languageId: 'langId' }]);
            assert.deepStrictEqual(registry.getLanguageName('langId'), 'BetterLanguageName');
            registry.dispose();
        });
        test('mimetypes are generated if necessary', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId'
                }]);
            assert.deepStrictEqual(registry.getMimeType('langId'), 'text/x-langId');
            registry.dispose();
        });
        test('first mimetype wins', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId',
                    mimetypes: ['text/langId', 'text/langId2']
                }]);
            assert.deepStrictEqual(registry.getMimeType('langId'), 'text/langId');
            registry.dispose();
        });
        test('first mimetype wins 2', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'langId'
                }]);
            registry._registerLanguages([{
                    id: 'langId',
                    mimetypes: ['text/langId']
                }]);
            assert.deepStrictEqual(registry.getMimeType('langId'), 'text/x-langId');
            registry.dispose();
        });
        test('aliases', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'a'
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'a', languageId: 'a' }]);
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a'), 'a');
            assert.deepStrictEqual(registry.getLanguageName('a'), 'a');
            registry._registerLanguages([{
                    id: 'a',
                    aliases: ['A1', 'A2']
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'A1', languageId: 'a' }]);
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a1'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a2'), 'a');
            assert.deepStrictEqual(registry.getLanguageName('a'), 'A1');
            registry._registerLanguages([{
                    id: 'a',
                    aliases: ['A3', 'A4']
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'A3', languageId: 'a' }]);
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a1'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a2'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a3'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a4'), 'a');
            assert.deepStrictEqual(registry.getLanguageName('a'), 'A3');
            registry.dispose();
        });
        test('empty aliases array means no alias', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'a'
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'a', languageId: 'a' }]);
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a'), 'a');
            assert.deepStrictEqual(registry.getLanguageName('a'), 'a');
            registry._registerLanguages([{
                    id: 'b',
                    aliases: []
                }]);
            assert.deepStrictEqual(registry.getSortedRegisteredLanguageNames(), [{ languageName: 'a', languageId: 'a' }]);
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('a'), 'a');
            assert.deepStrictEqual(registry.getLanguageIdByLanguageName('b'), 'b');
            assert.deepStrictEqual(registry.getLanguageName('a'), 'a');
            assert.deepStrictEqual(registry.getLanguageName('b'), null);
            registry.dispose();
        });
        test('extensions', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'a',
                    aliases: ['aName'],
                    extensions: ['aExt']
                }]);
            assert.deepStrictEqual(registry.getExtensions('a'), ['aExt']);
            registry._registerLanguages([{
                    id: 'a',
                    extensions: ['aExt2']
                }]);
            assert.deepStrictEqual(registry.getExtensions('a'), ['aExt', 'aExt2']);
            registry.dispose();
        });
        test('extensions of primary language registration come first', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'a',
                    extensions: ['aExt3']
                }]);
            assert.deepStrictEqual(registry.getExtensions('a')[0], 'aExt3');
            registry._registerLanguages([{
                    id: 'a',
                    configuration: uri_1.URI.file('conf.json'),
                    extensions: ['aExt']
                }]);
            assert.deepStrictEqual(registry.getExtensions('a')[0], 'aExt');
            registry._registerLanguages([{
                    id: 'a',
                    extensions: ['aExt2']
                }]);
            assert.deepStrictEqual(registry.getExtensions('a')[0], 'aExt');
            registry.dispose();
        });
        test('filenames', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'a',
                    aliases: ['aName'],
                    filenames: ['aFilename']
                }]);
            assert.deepStrictEqual(registry.getFilenames('a'), ['aFilename']);
            registry._registerLanguages([{
                    id: 'a',
                    filenames: ['aFilename2']
                }]);
            assert.deepStrictEqual(registry.getFilenames('a'), ['aFilename', 'aFilename2']);
            registry.dispose();
        });
        test('configuration', () => {
            const registry = new languagesRegistry_1.LanguagesRegistry(false);
            registry._registerLanguages([{
                    id: 'a',
                    aliases: ['aName'],
                    configuration: uri_1.URI.file('/path/to/aFilename')
                }]);
            assert.deepStrictEqual(registry.getConfigurationFiles('a'), [uri_1.URI.file('/path/to/aFilename')]);
            assert.deepStrictEqual(registry.getConfigurationFiles('aname'), []);
            assert.deepStrictEqual(registry.getConfigurationFiles('aName'), []);
            registry._registerLanguages([{
                    id: 'a',
                    configuration: uri_1.URI.file('/path/to/aFilename2')
                }]);
            assert.deepStrictEqual(registry.getConfigurationFiles('a'), [uri_1.URI.file('/path/to/aFilename'), uri_1.URI.file('/path/to/aFilename2')]);
            assert.deepStrictEqual(registry.getConfigurationFiles('aname'), []);
            assert.deepStrictEqual(registry.getConfigurationFiles('aName'), []);
            registry.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VzUmVnaXN0cnkudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9zZXJ2aWNlcy9sYW5ndWFnZXNSZWdpc3RyeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFFL0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDakQsTUFBTSxRQUFRLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5QyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDNUIsRUFBRSxFQUFFLGNBQWM7b0JBQ2xCLFVBQVUsRUFBRSxFQUFFO29CQUNkLE9BQU8sRUFBRSxFQUFFO29CQUNYLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixDQUFDO2lCQUNyQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFeEUsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLHFDQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUM1QixFQUFFLEVBQUUsUUFBUTtvQkFDWixVQUFVLEVBQUUsRUFBRTtvQkFDZCxPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7b0JBQ3JCLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQztpQkFDbEIsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLENBQUMs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