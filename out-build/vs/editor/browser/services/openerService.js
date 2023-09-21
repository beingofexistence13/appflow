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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/linkedList", "vs/base/common/map", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/platform/commands/common/commands", "vs/platform/editor/common/editor", "vs/platform/opener/common/opener"], function (require, exports, dom, cancellation_1, linkedList_1, map_1, marshalling_1, network_1, resources_1, uri_1, codeEditorService_1, commands_1, editor_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OBb = void 0;
    let CommandOpener = class CommandOpener {
        constructor(a) {
            this.a = a;
        }
        async open(target, options) {
            if (!(0, opener_1.$OT)(target, network_1.Schemas.command)) {
                return false;
            }
            if (!options?.allowCommands) {
                // silently ignore commands when command-links are disabled, also
                // suppress other openers by returning TRUE
                return true;
            }
            if (typeof target === 'string') {
                target = uri_1.URI.parse(target);
            }
            if (Array.isArray(options.allowCommands)) {
                // Only allow specific commands
                if (!options.allowCommands.includes(target.path)) {
                    // Suppress other openers by returning TRUE
                    return true;
                }
            }
            // execute as command
            let args = [];
            try {
                args = (0, marshalling_1.$0g)(decodeURIComponent(target.query));
            }
            catch {
                // ignore and retry
                try {
                    args = (0, marshalling_1.$0g)(target.query);
                }
                catch {
                    // ignore error
                }
            }
            if (!Array.isArray(args)) {
                args = [args];
            }
            await this.a.executeCommand(target.path, ...args);
            return true;
        }
    };
    CommandOpener = __decorate([
        __param(0, commands_1.$Fr)
    ], CommandOpener);
    let EditorOpener = class EditorOpener {
        constructor(a) {
            this.a = a;
        }
        async open(target, options) {
            if (typeof target === 'string') {
                target = uri_1.URI.parse(target);
            }
            const { selection, uri } = (0, opener_1.$RT)(target);
            target = uri;
            if (target.scheme === network_1.Schemas.file) {
                target = (0, resources_1.$jg)(target); // workaround for non-normalized paths (https://github.com/microsoft/vscode/issues/12954)
            }
            await this.a.openCodeEditor({
                resource: target,
                options: {
                    selection,
                    source: options?.fromUserGesture ? editor_1.EditorOpenSource.USER : editor_1.EditorOpenSource.API,
                    ...options?.editorOptions
                }
            }, this.a.getFocusedCodeEditor(), options?.openToSide);
            return true;
        }
    };
    EditorOpener = __decorate([
        __param(0, codeEditorService_1.$nV)
    ], EditorOpener);
    let $OBb = class $OBb {
        constructor(editorService, commandService) {
            this.a = new linkedList_1.$tc();
            this.b = new linkedList_1.$tc();
            this.c = new linkedList_1.$tc();
            this.d = new map_1.$zi(uri => uri.with({ path: null, fragment: null, query: null }).toString());
            this.f = new linkedList_1.$tc();
            // Default external opener is going through window.open()
            this.e = {
                openExternal: async (href) => {
                    // ensure to open HTTP/HTTPS links into new windows
                    // to not trigger a navigation. Any other link is
                    // safe to be set as HREF to prevent a blank window
                    // from opening.
                    if ((0, opener_1.$PT)(href, network_1.Schemas.http, network_1.Schemas.https)) {
                        dom.$jP(href);
                    }
                    else {
                        window.location.href = href;
                    }
                    return true;
                }
            };
            // Default opener: any external, maito, http(s), command, and catch-all-editors
            this.a.push({
                open: async (target, options) => {
                    if (options?.openExternal || (0, opener_1.$PT)(target, network_1.Schemas.mailto, network_1.Schemas.http, network_1.Schemas.https, network_1.Schemas.vsls)) {
                        // open externally
                        await this.g(target, options);
                        return true;
                    }
                    return false;
                }
            });
            this.a.push(new CommandOpener(commandService));
            this.a.push(new EditorOpener(editorService));
        }
        registerOpener(opener) {
            const remove = this.a.unshift(opener);
            return { dispose: remove };
        }
        registerValidator(validator) {
            const remove = this.b.push(validator);
            return { dispose: remove };
        }
        registerExternalUriResolver(resolver) {
            const remove = this.c.push(resolver);
            return { dispose: remove };
        }
        setDefaultExternalOpener(externalOpener) {
            this.e = externalOpener;
        }
        registerExternalOpener(opener) {
            const remove = this.f.push(opener);
            return { dispose: remove };
        }
        async open(target, options) {
            // check with contributed validators
            const targetURI = typeof target === 'string' ? uri_1.URI.parse(target) : target;
            // validate against the original URI that this URI resolves to, if one exists
            const validationTarget = this.d.get(targetURI) ?? target;
            for (const validator of this.b) {
                if (!(await validator.shouldOpen(validationTarget, options))) {
                    return false;
                }
            }
            // check with contributed openers
            for (const opener of this.a) {
                const handled = await opener.open(target, options);
                if (handled) {
                    return true;
                }
            }
            return false;
        }
        async resolveExternalUri(resource, options) {
            for (const resolver of this.c) {
                try {
                    const result = await resolver.resolveExternalUri(resource, options);
                    if (result) {
                        if (!this.d.has(result.resolved)) {
                            this.d.set(result.resolved, resource);
                        }
                        return result;
                    }
                }
                catch {
                    // noop
                }
            }
            throw new Error('Could not resolve external URI: ' + resource.toString());
        }
        async g(resource, options) {
            //todo@jrieken IExternalUriResolver should support `uri: URI | string`
            const uri = typeof resource === 'string' ? uri_1.URI.parse(resource) : resource;
            let externalUri;
            try {
                externalUri = (await this.resolveExternalUri(uri, options)).resolved;
            }
            catch {
                externalUri = uri;
            }
            let href;
            if (typeof resource === 'string' && uri.toString() === externalUri.toString()) {
                // open the url-string AS IS
                href = resource;
            }
            else {
                // open URI using the toString(noEncode)+encodeURI-trick
                href = encodeURI(externalUri.toString(true));
            }
            if (options?.allowContributedOpeners) {
                const preferredOpenerId = typeof options?.allowContributedOpeners === 'string' ? options?.allowContributedOpeners : undefined;
                for (const opener of this.f) {
                    const didOpen = await opener.openExternal(href, {
                        sourceUri: uri,
                        preferredOpenerId,
                    }, cancellation_1.CancellationToken.None);
                    if (didOpen) {
                        return true;
                    }
                }
            }
            return this.e.openExternal(href, { sourceUri: uri }, cancellation_1.CancellationToken.None);
        }
        dispose() {
            this.b.clear();
        }
    };
    exports.$OBb = $OBb;
    exports.$OBb = $OBb = __decorate([
        __param(0, codeEditorService_1.$nV),
        __param(1, commands_1.$Fr)
    ], $OBb);
});
//# sourceMappingURL=openerService.js.map