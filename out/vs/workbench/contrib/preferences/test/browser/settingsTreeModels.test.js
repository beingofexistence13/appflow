/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/workbench/contrib/preferences/browser/settingsTreeModels"], function (require, exports, assert, utils_1, settingsTreeModels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SettingsTree', () => {
        test('settingKeyToDisplayFormat', () => {
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar'), {
                category: 'Foo',
                label: 'Bar'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc'), {
                category: 'Foo › Bar',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.etcSomething'), {
                category: 'Foo Bar',
                label: 'Etc Something'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo'), {
                category: '',
                label: 'Foo'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.1leading.number'), {
                category: 'Foo › 1leading',
                label: 'Number'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.1Leading.number'), {
                category: 'Foo › 1 Leading',
                label: 'Number'
            });
        });
        test('settingKeyToDisplayFormat - with category', () => {
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar', 'foo'), {
                category: '',
                label: 'Bar'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('disableligatures.ligatures', 'disableligatures'), {
                category: '',
                label: 'Ligatures'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc', 'foo'), {
                category: 'Bar',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.etcSomething', 'foo'), {
                category: 'Foo Bar',
                label: 'Etc Something'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc', 'foo/bar'), {
                category: '',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc', 'something/foo'), {
                category: 'Bar',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('bar.etc', 'something.bar'), {
                category: '',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.etc', 'fooBar'), {
                category: '',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.somethingElse.etc', 'fooBar'), {
                category: 'Something Else',
                label: 'Etc'
            });
        });
        test('settingKeyToDisplayFormat - known acronym/term', () => {
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('css.someCssSetting'), {
                category: 'CSS',
                label: 'Some CSS Setting'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('powershell.somePowerShellSetting'), {
                category: 'PowerShell',
                label: 'Some PowerShell Setting'
            });
        });
        test('parseQuery', () => {
            function testParseQuery(input, expected) {
                assert.deepStrictEqual((0, settingsTreeModels_1.parseQuery)(input), expected, input);
            }
            testParseQuery('', {
                tags: [],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@modified', {
                tags: ['modified'],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@tag:foo', {
                tags: ['foo'],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@modified foo', {
                tags: ['modified'],
                extensionFilters: [],
                query: 'foo',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@tag:foo @modified', {
                tags: ['foo', 'modified'],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@tag:foo @modified my query', {
                tags: ['foo', 'modified'],
                extensionFilters: [],
                query: 'my query',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('test @modified query', {
                tags: ['modified'],
                extensionFilters: [],
                query: 'test  query',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('test @modified', {
                tags: ['modified'],
                extensionFilters: [],
                query: 'test',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('query has @ for some reason', {
                tags: [],
                extensionFilters: [],
                query: 'query has @ for some reason',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@ext:github.vscode-pull-request-github', {
                tags: [],
                extensionFilters: ['github.vscode-pull-request-github'],
                query: '',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@ext:github.vscode-pull-request-github,vscode.git', {
                tags: [],
                extensionFilters: ['github.vscode-pull-request-github', 'vscode.git'],
                query: '',
                featureFilters: [],
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@feature:scm', {
                tags: [],
                extensionFilters: [],
                featureFilters: ['scm'],
                query: '',
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@feature:scm,terminal', {
                tags: [],
                extensionFilters: [],
                featureFilters: ['scm', 'terminal'],
                query: '',
                idFilters: [],
                languageFilter: undefined
            });
            testParseQuery('@id:files.autoSave', {
                tags: [],
                extensionFilters: [],
                featureFilters: [],
                query: '',
                idFilters: ['files.autoSave'],
                languageFilter: undefined
            });
            testParseQuery('@id:files.autoSave,terminal.integrated.commandsToSkipShell', {
                tags: [],
                extensionFilters: [],
                featureFilters: [],
                query: '',
                idFilters: ['files.autoSave', 'terminal.integrated.commandsToSkipShell'],
                languageFilter: undefined
            });
            testParseQuery('@lang:cpp', {
                tags: [],
                extensionFilters: [],
                featureFilters: [],
                query: '',
                idFilters: [],
                languageFilter: 'cpp'
            });
            testParseQuery('@lang:cpp,python', {
                tags: [],
                extensionFilters: [],
                featureFilters: [],
                query: '',
                idFilters: [],
                languageFilter: 'cpp'
            });
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NUcmVlTW9kZWxzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wcmVmZXJlbmNlcy90ZXN0L2Jyb3dzZXIvc2V0dGluZ3NUcmVlTW9kZWxzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFNaEcsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7UUFDMUIsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxNQUFNLENBQUMsZUFBZSxDQUNyQixJQUFBLDhDQUF5QixFQUFDLFNBQVMsQ0FBQyxFQUNwQztnQkFDQyxRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLEVBQUUsS0FBSzthQUNaLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsOENBQXlCLEVBQUMsYUFBYSxDQUFDLEVBQ3hDO2dCQUNDLFFBQVEsRUFBRSxXQUFXO2dCQUNyQixLQUFLLEVBQUUsS0FBSzthQUNaLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsOENBQXlCLEVBQUMscUJBQXFCLENBQUMsRUFDaEQ7Z0JBQ0MsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLEtBQUssRUFBRSxlQUFlO2FBQ3RCLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsOENBQXlCLEVBQUMsS0FBSyxDQUFDLEVBQ2hDO2dCQUNDLFFBQVEsRUFBRSxFQUFFO2dCQUNaLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxxQkFBcUIsQ0FBQyxFQUNoRDtnQkFDQyxRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixLQUFLLEVBQUUsUUFBUTthQUNmLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsOENBQXlCLEVBQUMscUJBQXFCLENBQUMsRUFDaEQ7Z0JBQ0MsUUFBUSxFQUFFLGlCQUFpQjtnQkFDM0IsS0FBSyxFQUFFLFFBQVE7YUFDZixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7WUFDdEQsTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQzNDO2dCQUNDLFFBQVEsRUFBRSxFQUFFO2dCQUNaLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyw0QkFBNEIsRUFBRSxrQkFBa0IsQ0FBQyxFQUMzRTtnQkFDQyxRQUFRLEVBQUUsRUFBRTtnQkFDWixLQUFLLEVBQUUsV0FBVzthQUNsQixDQUFDLENBQUM7WUFFSixNQUFNLENBQUMsZUFBZSxDQUNyQixJQUFBLDhDQUF5QixFQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsRUFDL0M7Z0JBQ0MsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsS0FBSyxFQUFFLEtBQUs7YUFDWixDQUFDLENBQUM7WUFFSixNQUFNLENBQUMsZUFBZSxDQUNyQixJQUFBLDhDQUF5QixFQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxFQUN2RDtnQkFDQyxRQUFRLEVBQUUsU0FBUztnQkFDbkIsS0FBSyxFQUFFLGVBQWU7YUFDdEIsQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLEVBQ25EO2dCQUNDLFFBQVEsRUFBRSxFQUFFO2dCQUNaLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLEVBQ3pEO2dCQUNDLFFBQVEsRUFBRSxLQUFLO2dCQUNmLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQ3JEO2dCQUNDLFFBQVEsRUFBRSxFQUFFO2dCQUNaLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1lBRUosTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQ2pEO2dCQUNDLFFBQVEsRUFBRSxFQUFFO2dCQUNaLEtBQUssRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1lBR0osTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsRUFDL0Q7Z0JBQ0MsUUFBUSxFQUFFLGdCQUFnQjtnQkFDMUIsS0FBSyxFQUFFLEtBQUs7YUFDWixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnREFBZ0QsRUFBRSxHQUFHLEVBQUU7WUFDM0QsTUFBTSxDQUFDLGVBQWUsQ0FDckIsSUFBQSw4Q0FBeUIsRUFBQyxvQkFBb0IsQ0FBQyxFQUMvQztnQkFDQyxRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLEVBQUUsa0JBQWtCO2FBQ3pCLENBQUMsQ0FBQztZQUVKLE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsOENBQXlCLEVBQUMsa0NBQWtDLENBQUMsRUFDN0Q7Z0JBQ0MsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLEtBQUssRUFBRSx5QkFBeUI7YUFDaEMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtZQUN2QixTQUFTLGNBQWMsQ0FBQyxLQUFhLEVBQUUsUUFBc0I7Z0JBQzVELE1BQU0sQ0FBQyxlQUFlLENBQ3JCLElBQUEsK0JBQVUsRUFBQyxLQUFLLENBQUMsRUFDakIsUUFBUSxFQUNSLEtBQUssQ0FDTCxDQUFDO1lBQ0gsQ0FBQztZQUVELGNBQWMsQ0FDYixFQUFFLEVBQ1k7Z0JBQ2IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUVKLGNBQWMsQ0FDYixXQUFXLEVBQ0c7Z0JBQ2IsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNsQixnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwQixLQUFLLEVBQUUsRUFBRTtnQkFDVCxjQUFjLEVBQUUsRUFBRTtnQkFDbEIsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsY0FBYyxFQUFFLFNBQVM7YUFDekIsQ0FBQyxDQUFDO1lBRUosY0FBYyxDQUNiLFVBQVUsRUFDSTtnQkFDYixJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7Z0JBQ2IsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUVKLGNBQWMsQ0FDYixlQUFlLEVBQ0Q7Z0JBQ2IsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNsQixnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwQixLQUFLLEVBQUUsS0FBSztnQkFDWixjQUFjLEVBQUUsRUFBRTtnQkFDbEIsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsY0FBYyxFQUFFLFNBQVM7YUFDekIsQ0FBQyxDQUFDO1lBRUosY0FBYyxDQUNiLG9CQUFvQixFQUNOO2dCQUNiLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7Z0JBQ3pCLGdCQUFnQixFQUFFLEVBQUU7Z0JBQ3BCLEtBQUssRUFBRSxFQUFFO2dCQUNULGNBQWMsRUFBRSxFQUFFO2dCQUNsQixTQUFTLEVBQUUsRUFBRTtnQkFDYixjQUFjLEVBQUUsU0FBUzthQUN6QixDQUFDLENBQUM7WUFFSixjQUFjLENBQ2IsNkJBQTZCLEVBQ2Y7Z0JBQ2IsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQztnQkFDekIsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsS0FBSyxFQUFFLFVBQVU7Z0JBQ2pCLGNBQWMsRUFBRSxFQUFFO2dCQUNsQixTQUFTLEVBQUUsRUFBRTtnQkFDYixjQUFjLEVBQUUsU0FBUzthQUN6QixDQUFDLENBQUM7WUFFSixjQUFjLENBQ2Isc0JBQXNCLEVBQ1I7Z0JBQ2IsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNsQixnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwQixLQUFLLEVBQUUsYUFBYTtnQkFDcEIsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUVKLGNBQWMsQ0FDYixnQkFBZ0IsRUFDRjtnQkFDYixJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUM7Z0JBQ2xCLGdCQUFnQixFQUFFLEVBQUU7Z0JBQ3BCLEtBQUssRUFBRSxNQUFNO2dCQUNiLGNBQWMsRUFBRSxFQUFFO2dCQUNsQixTQUFTLEVBQUUsRUFBRTtnQkFDYixjQUFjLEVBQUUsU0FBUzthQUN6QixDQUFDLENBQUM7WUFFSixjQUFjLENBQ2IsNkJBQTZCLEVBQ2Y7Z0JBQ2IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsS0FBSyxFQUFFLDZCQUE2QjtnQkFDcEMsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUVKLGNBQWMsQ0FDYix3Q0FBd0MsRUFDMUI7Z0JBQ2IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsQ0FBQyxtQ0FBbUMsQ0FBQztnQkFDdkQsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUVKLGNBQWMsQ0FDYixtREFBbUQsRUFDckM7Z0JBQ2IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRSxZQUFZLENBQUM7Z0JBQ3JFLEtBQUssRUFBRSxFQUFFO2dCQUNULGNBQWMsRUFBRSxFQUFFO2dCQUNsQixTQUFTLEVBQUUsRUFBRTtnQkFDYixjQUFjLEVBQUUsU0FBUzthQUN6QixDQUFDLENBQUM7WUFDSixjQUFjLENBQ2IsY0FBYyxFQUNBO2dCQUNiLElBQUksRUFBRSxFQUFFO2dCQUNSLGdCQUFnQixFQUFFLEVBQUU7Z0JBQ3BCLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFDdkIsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsY0FBYyxFQUFFLFNBQVM7YUFDekIsQ0FBQyxDQUFDO1lBRUosY0FBYyxDQUNiLHVCQUF1QixFQUNUO2dCQUNiLElBQUksRUFBRSxFQUFFO2dCQUNSLGdCQUFnQixFQUFFLEVBQUU7Z0JBQ3BCLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7Z0JBQ25DLEtBQUssRUFBRSxFQUFFO2dCQUNULFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUNKLGNBQWMsQ0FDYixvQkFBb0IsRUFDTjtnQkFDYixJQUFJLEVBQUUsRUFBRTtnQkFDUixnQkFBZ0IsRUFBRSxFQUFFO2dCQUNwQixjQUFjLEVBQUUsRUFBRTtnQkFDbEIsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzdCLGNBQWMsRUFBRSxTQUFTO2FBQ3pCLENBQUMsQ0FBQztZQUVKLGNBQWMsQ0FDYiw0REFBNEQsRUFDOUM7Z0JBQ2IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLEtBQUssRUFBRSxFQUFFO2dCQUNULFNBQVMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLHlDQUF5QyxDQUFDO2dCQUN4RSxjQUFjLEVBQUUsU0FBUzthQUN6QixDQUFDLENBQUM7WUFFSixjQUFjLENBQ2IsV0FBVyxFQUNHO2dCQUNiLElBQUksRUFBRSxFQUFFO2dCQUNSLGdCQUFnQixFQUFFLEVBQUU7Z0JBQ3BCLGNBQWMsRUFBRSxFQUFFO2dCQUNsQixLQUFLLEVBQUUsRUFBRTtnQkFDVCxTQUFTLEVBQUUsRUFBRTtnQkFDYixjQUFjLEVBQUUsS0FBSzthQUNyQixDQUFDLENBQUM7WUFFSixjQUFjLENBQ2Isa0JBQWtCLEVBQ0o7Z0JBQ2IsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsZ0JBQWdCLEVBQUUsRUFBRTtnQkFDcEIsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLEtBQUssRUFBRSxFQUFFO2dCQUNULFNBQVMsRUFBRSxFQUFFO2dCQUNiLGNBQWMsRUFBRSxLQUFLO2FBQ3JCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDIn0=