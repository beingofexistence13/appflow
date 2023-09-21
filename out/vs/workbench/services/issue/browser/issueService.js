/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/platform/issue/common/issueReporterUtil", "vs/workbench/services/extensions/common/extensions", "vs/platform/product/common/productService", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/common/cancellation", "vs/platform/log/common/log"], function (require, exports, dom, issueReporterUtil_1, extensions_1, productService_1, platform_1, lifecycle_1, cancellation_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebIssueService = void 0;
    let WebIssueService = class WebIssueService {
        constructor(extensionService, productService, logService) {
            this.extensionService = extensionService;
            this.productService = productService;
            this.logService = logService;
            this._handlers = new Map();
        }
        //TODO @TylerLeonhardt @Tyriar to implement a process explorer for the web
        async openProcessExplorer() {
            console.error('openProcessExplorer is not implemented in web');
        }
        async openReporter(options) {
            const extensionId = options.extensionId;
            // If we don't have a extensionId, treat this as a Core issue
            if (!extensionId) {
                if (this.productService.reportIssueUrl) {
                    const uri = this.getIssueUriFromStaticContent(this.productService.reportIssueUrl);
                    dom.windowOpenNoOpener(uri);
                    return;
                }
                throw new Error(`No issue reporting URL configured for ${this.productService.nameLong}.`);
            }
            // If we have a handler registered for this extension, use it instead of anything else
            if (this._handlers.has(extensionId)) {
                try {
                    const uri = await this.getIssueUriFromHandler(extensionId, cancellation_1.CancellationToken.None);
                    dom.windowOpenNoOpener(uri);
                    return;
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            // if we don't have a handler, or the handler failed, try to get the extension's github url
            const selectedExtension = this.extensionService.extensions.filter(ext => ext.identifier.value === options.extensionId)[0];
            const extensionGitHubUrl = this.getExtensionGitHubUrl(selectedExtension);
            if (!extensionGitHubUrl) {
                throw new Error(`Unable to find issue reporting url for ${extensionId}`);
            }
            const uri = this.getIssueUriFromStaticContent(`${extensionGitHubUrl}/issues/new`, selectedExtension);
            dom.windowOpenNoOpener(uri);
        }
        registerIssueUriRequestHandler(extensionId, handler) {
            this._handlers.set(extensionId, handler);
            return (0, lifecycle_1.toDisposable)(() => this._handlers.delete(extensionId));
        }
        async getIssueUriFromHandler(extensionId, token) {
            const handler = this._handlers.get(extensionId);
            if (!handler) {
                throw new Error(`No handler registered for extension ${extensionId}`);
            }
            const result = await handler.provideIssueUrl(token);
            return result.toString(true);
        }
        getExtensionGitHubUrl(extension) {
            if (extension.isBuiltin && this.productService.reportIssueUrl) {
                return (0, issueReporterUtil_1.normalizeGitHubUrl)(this.productService.reportIssueUrl);
            }
            let repositoryUrl = '';
            const bugsUrl = extension?.bugs?.url;
            const extensionUrl = extension?.repository?.url;
            // If given, try to match the extension's bug url
            if (bugsUrl && bugsUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.normalizeGitHubUrl)(bugsUrl);
            }
            else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.normalizeGitHubUrl)(extensionUrl);
            }
            return repositoryUrl;
        }
        getIssueUriFromStaticContent(baseUri, extension) {
            const issueDescription = `ADD ISSUE DESCRIPTION HERE

Version: ${this.productService.version}
Commit: ${this.productService.commit ?? 'unknown'}
User Agent: ${platform_1.userAgent ?? 'unknown'}
Embedder: ${this.productService.embedderIdentifier ?? 'unknown'}
${extension?.version ? `\nExtension version: ${extension.version}` : ''}
<!-- generated by web issue reporter -->`;
            return `${baseUri}?body=${encodeURIComponent(issueDescription)}&labels=web`;
        }
    };
    exports.WebIssueService = WebIssueService;
    exports.WebIssueService = WebIssueService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, productService_1.IProductService),
        __param(2, log_1.ILogService)
    ], WebIssueService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2lzc3VlL2Jyb3dzZXIvaXNzdWVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWN6RixJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO1FBSzNCLFlBQ29CLGdCQUFvRCxFQUN0RCxjQUFnRCxFQUNwRCxVQUF3QztZQUZqQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3JDLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBTHJDLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztRQU1wRSxDQUFDO1FBRUwsMEVBQTBFO1FBQzFFLEtBQUssQ0FBQyxtQkFBbUI7WUFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQW1DO1lBQ3JELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDeEMsNkRBQTZEO1lBQzdELElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUU7b0JBQ3ZDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNsRixHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzVCLE9BQU87aUJBQ1A7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2FBQzFGO1lBRUQsc0ZBQXNGO1lBQ3RGLElBQUksSUFBSSxD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