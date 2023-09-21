/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/electron-sandbox/webviewCommands", "vs/workbench/contrib/webview/electron-sandbox/webviewService"], function (require, exports, actions_1, extensions_1, webview_1, webviewCommands, webviewService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(webview_1.IWebviewService, webviewService_1.ElectronWebviewService, 1 /* InstantiationType.Delayed */);
    (0, actions_1.registerAction2)(webviewCommands.OpenWebviewDeveloperToolsAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlldy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2VsZWN0cm9uLXNhbmRib3gvd2Vidmlldy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsSUFBQSw4QkFBaUIsRUFBQyx5QkFBZSxFQUFFLHVDQUFzQixvQ0FBNEIsQ0FBQztJQUV0RixJQUFBLHlCQUFlLEVBQUMsZUFBZSxDQUFDLCtCQUErQixDQUFDLENBQUMifQ==