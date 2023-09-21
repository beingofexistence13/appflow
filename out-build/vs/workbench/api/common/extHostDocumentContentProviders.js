/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/api/common/extHostTypes", "./extHost.protocol", "vs/base/common/network", "vs/base/common/cancellation", "vs/base/common/strings"], function (require, exports, errors_1, uri_1, extHostTypes_1, extHost_protocol_1, network_1, cancellation_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$obc = void 0;
    class $obc {
        static { this.a = 0; }
        constructor(mainContext, d, e) {
            this.d = d;
            this.e = e;
            this.b = new Map();
            this.c = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadDocumentContentProviders);
        }
        registerTextDocumentContentProvider(scheme, provider) {
            // todo@remote
            // check with scheme from fs-providers!
            if (Object.keys(network_1.Schemas).indexOf(scheme) >= 0) {
                throw new Error(`scheme '${scheme}' already registered`);
            }
            const handle = $obc.a++;
            this.b.set(handle, provider);
            this.c.$registerTextContentProvider(handle, scheme);
            let subscription;
            if (typeof provider.onDidChange === 'function') {
                subscription = provider.onDidChange(uri => {
                    if (uri.scheme !== scheme) {
                        this.e.warn(`Provider for scheme '${scheme}' is firing event for schema '${uri.scheme}' which will be IGNORED`);
                        return;
                    }
                    if (this.d.getDocument(uri)) {
                        this.$provideTextDocumentContent(handle, uri).then(value => {
                            if (!value && typeof value !== 'string') {
                                return;
                            }
                            const document = this.d.getDocument(uri);
                            if (!document) {
                                // disposed in the meantime
                                return;
                            }
                            // create lines and compare
                            const lines = (0, strings_1.$Ae)(value);
                            // broadcast event when content changed
                            if (!document.equalLines(lines)) {
                                return this.c.$onVirtualDocumentChange(uri, value);
                            }
                        }, errors_1.$Y);
                    }
                });
            }
            return new extHostTypes_1.$3J(() => {
                if (this.b.delete(handle)) {
                    this.c.$unregisterTextContentProvider(handle);
                }
                if (subscription) {
                    subscription.dispose();
                    subscription = undefined;
                }
            });
        }
        $provideTextDocumentContent(handle, uri) {
            const provider = this.b.get(handle);
            if (!provider) {
                return Promise.reject(new Error(`unsupported uri-scheme: ${uri.scheme}`));
            }
            return Promise.resolve(provider.provideTextDocumentContent(uri_1.URI.revive(uri), cancellation_1.CancellationToken.None));
        }
    }
    exports.$obc = $obc;
});
//# sourceMappingURL=extHostDocumentContentProviders.js.map