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
    exports.$d5b = void 0;
    let $d5b = class $d5b {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = new Map();
        }
        //TODO @TylerLeonhardt @Tyriar to implement a process explorer for the web
        async openProcessExplorer() {
            console.error('openProcessExplorer is not implemented in web');
        }
        async openReporter(options) {
            const extensionId = options.extensionId;
            // If we don't have a extensionId, treat this as a Core issue
            if (!extensionId) {
                if (this.c.reportIssueUrl) {
                    const uri = this.h(this.c.reportIssueUrl);
                    dom.$jP(uri);
                    return;
                }
                throw new Error(`No issue reporting URL configured for ${this.c.nameLong}.`);
            }
            // If we have a handler registered for this extension, use it instead of anything else
            if (this.a.has(extensionId)) {
                try {
                    const uri = await this.f(extensionId, cancellation_1.CancellationToken.None);
                    dom.$jP(uri);
                    return;
                }
                catch (e) {
                    this.d.error(e);
                }
            }
            // if we don't have a handler, or the handler failed, try to get the extension's github url
            const selectedExtension = this.b.extensions.filter(ext => ext.identifier.value === options.extensionId)[0];
            const extensionGitHubUrl = this.g(selectedExtension);
            if (!extensionGitHubUrl) {
                throw new Error(`Unable to find issue reporting url for ${extensionId}`);
            }
            const uri = this.h(`${extensionGitHubUrl}/issues/new`, selectedExtension);
            dom.$jP(uri);
        }
        registerIssueUriRequestHandler(extensionId, handler) {
            this.a.set(extensionId, handler);
            return (0, lifecycle_1.$ic)(() => this.a.delete(extensionId));
        }
        async f(extensionId, token) {
            const handler = this.a.get(extensionId);
            if (!handler) {
                throw new Error(`No handler registered for extension ${extensionId}`);
            }
            const result = await handler.provideIssueUrl(token);
            return result.toString(true);
        }
        g(extension) {
            if (extension.isBuiltin && this.c.reportIssueUrl) {
                return (0, issueReporterUtil_1.$c5b)(this.c.reportIssueUrl);
            }
            let repositoryUrl = '';
            const bugsUrl = extension?.bugs?.url;
            const extensionUrl = extension?.repository?.url;
            // If given, try to match the extension's bug url
            if (bugsUrl && bugsUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.$c5b)(bugsUrl);
            }
            else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/(.*)/)) {
                repositoryUrl = (0, issueReporterUtil_1.$c5b)(extensionUrl);
            }
            return repositoryUrl;
        }
        h(baseUri, extension) {
            const issueDescription = `ADD ISSUE DESCRIPTION HERE

Version: ${this.c.version}
Commit: ${this.c.commit ?? 'unknown'}
User Agent: ${platform_1.$u ?? 'unknown'}
Embedder: ${this.c.embedderIdentifier ?? 'unknown'}
${extension?.version ? `\nExtension version: ${extension.version}` : ''}
<!-- generated by web issue reporter -->`;
            return `${baseUri}?body=${encodeURIComponent(issueDescription)}&labels=web`;
        }
    };
    exports.$d5b = $d5b;
    exports.$d5b = $d5b = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, productService_1.$kj),
        __param(2, log_1.$5i)
    ], $d5b);
});
//# sourceMappingURL=issueService.js.map