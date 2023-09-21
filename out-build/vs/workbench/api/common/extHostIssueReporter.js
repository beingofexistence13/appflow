/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5cc = void 0;
    class $5cc {
        constructor(mainContext) {
            this.a = new Map();
            this.b = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadIssueReporter);
        }
        async $getIssueReporterUri(extensionId, token) {
            if (this.a.size === 0) {
                throw new Error('No issue request handlers registered');
            }
            const provider = this.a.get(extensionId);
            if (!provider) {
                throw new Error('Issue request handler not found');
            }
            const result = await provider.handleIssueUrlRequest();
            if (!result) {
                throw new Error('Issue request handler returned no result');
            }
            return result;
        }
        registerIssueUriRequestHandler(extension, provider) {
            const extensionId = extension.identifier.value;
            this.a.set(extensionId, provider);
            this.b.$registerIssueUriRequestHandler(extensionId);
            return new extHostTypes_1.$3J(() => {
                this.b.$unregisterIssueUriRequestHandler(extensionId);
                this.a.delete(extensionId);
            });
        }
    }
    exports.$5cc = $5cc;
});
//# sourceMappingURL=extHostIssueReporter.js.map