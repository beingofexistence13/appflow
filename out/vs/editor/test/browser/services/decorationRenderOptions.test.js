/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/test/browser/editorTestServices", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, platform, uri_1, utils_1, editorTestServices_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Decoration Render Options', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const themeServiceMock = new testThemeService_1.TestThemeService();
        const options = {
            gutterIconPath: uri_1.URI.parse('https://github.com/microsoft/vscode/blob/main/resources/linux/code.png'),
            gutterIconSize: 'contain',
            backgroundColor: 'red',
            borderColor: 'yellow'
        };
        test('register and resolve decoration type', () => {
            const s = store.add(new editorTestServices_1.TestCodeEditorService(themeServiceMock));
            store.add(s.registerDecorationType('test', 'example', options));
            assert.notStrictEqual(s.resolveDecorationOptions('example', false), undefined);
        });
        test('remove decoration type', () => {
            const s = store.add(new editorTestServices_1.TestCodeEditorService(themeServiceMock));
            s.registerDecorationType('test', 'example', options);
            assert.notStrictEqual(s.resolveDecorationOptions('example', false), undefined);
            s.removeDecorationType('example');
            assert.throws(() => s.resolveDecorationOptions('example', false));
        });
        function readStyleSheet(styleSheet) {
            return styleSheet.read();
        }
        test('css properties', () => {
            const s = store.add(new editorTestServices_1.TestCodeEditorService(themeServiceMock));
            const styleSheet = s.globalStyleSheet;
            store.add(s.registerDecorationType('test', 'example', options));
            const sheet = readStyleSheet(styleSheet);
            assert(sheet.indexOf(`{background:url('https://github.com/microsoft/vscode/blob/main/resources/linux/code.png') center center no-repeat;background-size:contain;}`) >= 0);
            assert(sheet.indexOf(`{background-color:red;border-color:yellow;box-sizing: border-box;}`) >= 0);
        });
        test('theme color', () => {
            const options = {
                backgroundColor: { id: 'editorBackground' },
                borderColor: { id: 'editorBorder' },
            };
            const themeService = new testThemeService_1.TestThemeService(new testThemeService_1.TestColorTheme({
                editorBackground: '#FF0000'
            }));
            const s = store.add(new editorTestServices_1.TestCodeEditorService(themeService));
            const styleSheet = s.globalStyleSheet;
            s.registerDecorationType('test', 'example', options);
            assert.strictEqual(readStyleSheet(styleSheet), '.monaco-editor .ced-example-0 {background-color:#ff0000;border-color:transparent;box-sizing: border-box;}');
            themeService.setTheme(new testThemeService_1.TestColorTheme({
                editorBackground: '#EE0000',
                editorBorder: '#00FFFF'
            }));
            assert.strictEqual(readStyleSheet(styleSheet), '.monaco-editor .ced-example-0 {background-color:#ee0000;border-color:#00ffff;box-sizing: border-box;}');
            s.removeDecorationType('example');
            assert.strictEqual(readStyleSheet(styleSheet), '');
        });
        test('theme overrides', () => {
            const options = {
                color: { id: 'editorBackground' },
                light: {
                    color: '#FF00FF'
                },
                dark: {
                    color: '#000000',
                    after: {
                        color: { id: 'infoForeground' }
                    }
                }
            };
            const themeService = new testThemeService_1.TestThemeService(new testThemeService_1.TestColorTheme({
                editorBackground: '#FF0000',
                infoForeground: '#444444'
            }));
            const s = store.add(new editorTestServices_1.TestCodeEditorService(themeService));
            const styleSheet = s.globalStyleSheet;
            s.registerDecorationType('test', 'example', options);
            const expected = [
                '.vs-dark.monaco-editor .ced-example-4::after, .hc-black.monaco-editor .ced-example-4::after {color:#444444 !important;}',
                '.vs-dark.monaco-editor .ced-example-1, .hc-black.monaco-editor .ced-example-1 {color:#000000 !important;}',
                '.vs.monaco-editor .ced-example-1, .hc-light.monaco-editor .ced-example-1 {color:#FF00FF !important;}',
                '.monaco-editor .ced-example-1 {color:#ff0000 !important;}'
            ].join('\n');
            assert.strictEqual(readStyleSheet(styleSheet), expected);
            s.removeDecorationType('example');
            assert.strictEqual(readStyleSheet(styleSheet), '');
        });
        test('css properties, gutterIconPaths', () => {
            const s = store.add(new editorTestServices_1.TestCodeEditorService(themeServiceMock));
            const styleSheet = s.globalStyleSheet;
            // URI, only minimal encoding
            s.registerDecorationType('test', 'example', { gutterIconPath: uri_1.URI.parse('data:image/svg+xml;base64,PHN2ZyB4b+') });
            assert(readStyleSheet(styleSheet).indexOf(`{background:url('data:image/svg+xml;base64,PHN2ZyB4b+') center center no-repeat;}`) > 0);
            s.removeDecorationType('example');
            function assertBackground(url1, url2) {
                const actual = readStyleSheet(styleSheet);
                assert(actual.indexOf(`{background:url('${url1}') center center no-repeat;}`) > 0
                    || actual.indexOf(`{background:url('${url2}') center center no-repeat;}`) > 0);
            }
            if (platform.isWindows) {
                // windows file path (used as string)
                s.registerDecorationType('test', 'example', { gutterIconPath: uri_1.URI.file('c:\\files\\miles\\more.png') });
                assertBackground('file:///c:/files/miles/more.png', 'vscode-file://vscode-app/c:/files/miles/more.png');
                s.removeDecorationType('example');
                // single quote must always be escaped/encoded
                s.registerDecorationType('test', 'example', { gutterIconPath: uri_1.URI.file('c:\\files\\foo\\b\'ar.png') });
                assertBackground('file:///c:/files/foo/b%27ar.png', 'vscode-file://vscode-app/c:/files/foo/b%27ar.png');
                s.removeDecorationType('example');
            }
            else {
                // unix file path (used as string)
                s.registerDecorationType('test', 'example', { gutterIconPath: uri_1.URI.file('/Users/foo/bar.png') });
                assertBackground('file:///Users/foo/bar.png', 'vscode-file://vscode-app/Users/foo/bar.png');
                s.removeDecorationType('example');
                // single quote must always be escaped/encoded
                s.registerDecorationType('test', 'example', { gutterIconPath: uri_1.URI.file('/Users/foo/b\'ar.png') });
                assertBackground('file:///Users/foo/b%27ar.png', 'vscode-file://vscode-app/Users/foo/b%27ar.png');
                s.removeDecorationType('example');
            }
            s.registerDecorationType('test', 'example', { gutterIconPath: uri_1.URI.parse('http://test/pa\'th') });
            assert(readStyleSheet(styleSheet).indexOf(`{background:url('http://test/pa%27th') center center no-repeat;}`) > 0);
            s.removeDecorationType('example');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdGlvblJlbmRlck9wdGlvbnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2Jyb3dzZXIvc2VydmljZXMvZGVjb3JhdGlvblJlbmRlck9wdGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1FBQ3ZDLE1BQU0sS0FBSyxHQUFHLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUV4RCxNQUFNLGdCQUFnQixHQUFHLElBQUksbUNBQWdCLEVBQUUsQ0FBQztRQUVoRCxNQUFNLE9BQU8sR0FBNkI7WUFDekMsY0FBYyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsd0VBQXdFLENBQUM7WUFDbkcsY0FBYyxFQUFFLFNBQVM7WUFDekIsZUFBZSxFQUFFLEtBQUs7WUFDdEIsV0FBVyxFQUFFLFFBQVE7U0FDckIsQ0FBQztRQUNGLElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDakQsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDBDQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNqRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtZQUNuQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksMENBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvRSxDQUFDLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLGNBQWMsQ0FBQyxVQUFnQztZQUN2RCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtZQUMzQixNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksMENBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLDZJQUE2SSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUssTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsb0VBQW9FLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1lBQ3hCLE1BQU0sT0FBTyxHQUE2QjtnQkFDekMsZUFBZSxFQUFFLEVBQUUsRUFBRSxFQUFFLGtCQUFrQixFQUFFO2dCQUMzQyxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFO2FBQ25DLENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxJQUFJLG1DQUFnQixDQUFDLElBQUksaUNBQWMsQ0FBQztnQkFDNUQsZ0JBQWdCLEVBQUUsU0FBUzthQUMzQixDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSwwQ0FBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN0QyxDQUFDLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSwyR0FBMkcsQ0FBQyxDQUFDO1lBRTVKLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxpQ0FBYyxDQUFDO2dCQUN4QyxnQkFBZ0IsRUFBRSxTQUFTO2dCQUMzQixZQUFZLEVBQUUsU0FBUzthQUN2QixDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLHVHQUF1RyxDQUFDLENBQUM7WUFFeEosQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtZQUM1QixNQUFNLE9BQU8sR0FBNkI7Z0JBQ3pDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRTtnQkFDakMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxTQUFTO2lCQUNoQjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0wsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLEtBQUssRUFBRTt3QkFDTixLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUU7cUJBQy9CO2lCQUNEO2FBQ0QsQ0FBQztZQUVGLE1BQU0sWUFBWSxHQUFHLElBQUksbUNBQWdCLENBQUMsSUFBSSxpQ0FBYyxDQUFDO2dCQUM1RCxnQkFBZ0IsRUFBRSxTQUFTO2dCQUMzQixjQUFjLEVBQUUsU0FBUzthQUN6QixDQUFDLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSwwQ0FBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUN0QyxDQUFDLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyRCxNQUFNLFFBQVEsR0FBRztnQkFDaEIseUhBQXlIO2dCQUN6SCwyR0FBMkc7Z0JBQzNHLHNHQUFzRztnQkFDdEcsMkRBQTJEO2FBQzNELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFekQsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtZQUM1QyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksMENBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztZQUV0Qyw2QkFBNkI7WUFDN0IsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxjQUFjLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuSCxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtRkFBbUYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BJLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVsQyxTQUFTLGdCQUFnQixDQUFDLElBQVksRUFBRSxJQUFZO2dCQUNuRCxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sQ0FDTCxNQUFNLENBQUMsT0FBTyxDQUFDLG9CQUFvQixJQUFJLDhCQUE4QixDQUFDLEdBQUcsQ0FBQzt1QkFDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsQ0FDN0UsQ0FBQztZQUNILENBQUM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZCLHFDQUFxQztnQkFDckMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxjQUFjLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDeEcsZ0JBQWdCLENBQUMsaUNBQWlDLEVBQUUsa0RBQWtELENBQUMsQ0FBQztnQkFDeEcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVsQyw4Q0FBOEM7Z0JBQzlDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsY0FBYyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZHLGdCQUFnQixDQUFDLGlDQUFpQyxFQUFFLGtEQUFrRCxDQUFDLENBQUM7Z0JBQ3hHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNsQztpQkFBTTtnQkFDTixrQ0FBa0M7Z0JBQ2xDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsY0FBYyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hHLGdCQUFnQixDQUFDLDJCQUEyQixFQUFFLDRDQUE0QyxDQUFDLENBQUM7Z0JBQzVGLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFbEMsOENBQThDO2dCQUM5QyxDQUFDLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLGNBQWMsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRyxnQkFBZ0IsQ0FBQyw4QkFBOEIsRUFBRSwrQ0FBK0MsQ0FBQyxDQUFDO2dCQUNsRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDbEM7WUFFRCxDQUFDLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLGNBQWMsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLGtFQUFrRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkgsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==