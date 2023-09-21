/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/editor/common/services/languageService", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedDetailsRenderer", "vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, network_1, languageService_1, testNotificationService_1, gettingStartedDetailsRenderer_1, gettingStartedService_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Getting Started Markdown Renderer', () => {
        test('renders theme picker markdown with images', async () => {
            const fileService = new workbenchTestServices_1.$Fec();
            const languageService = new languageService_1.$jmb();
            const renderer = new gettingStartedDetailsRenderer_1.$QYb(fileService, new testNotificationService_1.$I0b(), new workbenchTestServices_2.$aec(), languageService);
            const mdPath = (0, gettingStartedService_1.$2Xb)('theme_picker').with({ query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker' }) });
            const mdBase = network_1.$2f.asFileUri('vs/workbench/contrib/welcomeGettingStarted/common/media/');
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
//# sourceMappingURL=gettingStartedMarkdownRenderer.test.js.map