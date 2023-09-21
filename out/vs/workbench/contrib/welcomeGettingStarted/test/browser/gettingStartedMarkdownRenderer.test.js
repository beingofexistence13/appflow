/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/editor/common/services/languageService", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, network_1, languageService_1, testNotificationService_1, gettingStartedDetailsRenderer_1, gettingStartedService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Getting Started Markdown Renderer', () => {
        test('renders theme picker markdown with images', async () => {
            const fileService = new workbenchTestServices_1.TestFileService();
            const languageService = new languageService_1.LanguageService();
            const renderer = new gettingStartedDetailsRenderer_1.GettingStartedDetailsRenderer(fileService, new testNotificationService_1.TestNotificationService(), new workbenchTestServices_2.TestExtensionService(), languageService);
            const mdPath = (0, gettingStartedService_1.convertInternalMediaPathToFileURI)('theme_picker').with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker' }) });
            const mdBase = network_1.FileAccess.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/');
            const rendered = await renderer.renderMarkdown(mdPath, mdBase);
            const imageSrcs = [...rendered.matchAll(/img src="[^"]*"/g)].map(match => match[0]);
            for (const src of imageSrcs) {
                const targetSrcFormat = /^img src="https:\/\/file\+.vscode-resource.vscode-cdn.net\/.*\/vs\/workbench\/contrib\/welcomeGettingStarted\/common\/media\/.*.png"$/;
                assert(targetSrcFormat.test(src), `${src} didnt match regex`);
            }
            languageService.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRNYXJrZG93blJlbmRlcmVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWxjb21lR2V0dGluZ1N0YXJ0ZWQvdGVzdC9icm93c2VyL2dldHRpbmdTdGFydGVkTWFya2Rvd25SZW5kZXJlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7UUFDL0MsSUFBSSxDQUFDLDJDQUEyQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzVELE1BQU0sV0FBVyxHQUFHLElBQUksdUNBQWUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sZUFBZSxHQUFHLElBQUksaUNBQWUsRUFBRSxDQUFDO1lBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksNkRBQTZCLENBQUMsV0FBVyxFQUFFLElBQUksaURBQXVCLEVBQUUsRUFBRSxJQUFJLDRDQUFvQixFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDNUksTUFBTSxNQUFNLEdBQUcsSUFBQSx5REFBaUMsRUFBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxzRUFBc0UsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZMLE1BQU0sTUFBTSxHQUFHLG9CQUFVLENBQUMsU0FBUyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7WUFDaEcsTUFBTSxRQUFRLEdBQUcsTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMvRCxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEYsS0FBSyxNQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUU7Z0JBQzVCLE1BQU0sZUFBZSxHQUFHLHVJQUF1SSxDQUFDO2dCQUNoSyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsQ0FBQzthQUM5RDtZQUNELGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=