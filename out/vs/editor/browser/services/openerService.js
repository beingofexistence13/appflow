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
    exports.OpenerService = void 0;
    let CommandOpener = class CommandOpener {
        constructor(_commandService) {
            this._commandService = _commandService;
        }
        async open(target, options) {
            if (!(0, opener_1.matchesScheme)(target, network_1.Schemas.command)) {
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
                args = (0, marshalling_1.parse)(decodeURIComponent(target.query));
            }
            catch {
                // ignore and retry
                try {
                    args = (0, marshalling_1.parse)(target.query);
                }
                catch {
                    // ignore error
                }
            }
            if (!Array.isArray(args)) {
                args = [args];
            }
            await this._commandService.executeCommand(target.path, ...args);
            return true;
        }
    };
    CommandOpener = __decorate([
        __param(0, commands_1.ICommandService)
    ], CommandOpener);
    let EditorOpener = class EditorOpener {
        constructor(_editorService) {
            this._editorService = _editorService;
        }
        async open(target, options) {
            if (typeof target === 'string') {
                target = uri_1.URI.parse(target);
            }
            const { selection, uri } = (0, opener_1.extractSelection)(target);
            target = uri;
            if (target.scheme === network_1.Schemas.file) {
                target = (0, resources_1.normalizePath)(target); // workaround for non-normalized paths (https://github.com/microsoft/vscode/issues/12954)
            }
            await this._editorService.openCodeEditor({
                resource: target,
                options: {
                    selection,
                    source: options?.fromUserGesture ? editor_1.EditorOpenSource.USER : editor_1.EditorOpenSource.API,
                    ...options?.editorOptions
                }
            }, this._editorService.getFocusedCodeEditor(), options?.openToSide);
            return true;
        }
    };
    EditorOpener = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService)
    ], EditorOpener);
    let OpenerService = class OpenerService {
        constructor(editorService, commandService) {
            this._openers = new linkedList_1.LinkedList();
            this._validators = new linkedList_1.LinkedList();
            this._resolvers = new linkedList_1.LinkedList();
            this._resolvedUriTargets = new map_1.ResourceMap(uri => uri.with({ path: null, fragment: null, query: null }).toString());
            this._externalOpeners = new linkedList_1.LinkedList();
            // Default external opener is going through window.open()
            this._defaultExternalOpener = {
                openExternal: async (href) => {
                    // ensure to open HTTP/HTTPS links into new windows
                    // to not trigger a navigation. Any other link is
                    // safe to be set as HREF to prevent a blank window
                    // from opening.
                    if ((0, opener_1.matchesSomeScheme)(href, network_1.Schemas.http, network_1.Schemas.https)) {
                        dom.windowOpenNoOpener(href);
                    }
                    else {
                        window.location.href = href;
                    }
                    return true;
                }
            };
            // Default opener: any external, maito, http(s), command, and catch-all-editors
            this._openers.push({
                open: async (target, options) => {
                    if (options?.openExternal || (0, opener_1.matchesSomeScheme)(target, network_1.Schemas.mailto, network_1.Schemas.http, network_1.Schemas.https, network_1.Schemas.vsls)) {
                        // open externally
                        await this._doOpenExternal(target, options);
                        return true;
                    }
                    return false;
                }
            });
            this._openers.push(new CommandOpener(commandService));
            this._openers.push(new EditorOpener(editorService));
        }
        registerOpener(opener) {
            const remove = this._openers.unshift(opener);
            return { dispose: remove };
        }
        registerValidator(validator) {
            const remove = this._validators.push(validator);
            return { dispose: remove };
        }
        registerExternalUriResolver(resolver) {
            const remove = this._resolvers.push(resolver);
            return { dispose: remove };
        }
        setDefaultExternalOpener(externalOpener) {
            this._defaultExternalOpener = externalOpener;
        }
        registerExternalOpener(opener) {
            const remove = this._externalOpeners.push(opener);
            return { dispose: remove };
        }
        async open(target, options) {
            // check with contributed validators
            const targetURI = typeof target === 'string' ? uri_1.URI.parse(target) : target;
            // validate against the original URI that this URI resolves to, if one exists
            const validationTarget = this._resolvedUriTargets.get(targetURI) ?? target;
            for (const validator of this._validators) {
                if (!(await validator.shouldOpen(validationTarget, options))) {
                    return false;
                }
            }
            // check with contributed openers
            for (const opener of this._openers) {
                const handled = await opener.open(target, options);
                if (handled) {
                    return true;
                }
            }
            return false;
        }
        async resolveExternalUri(resource, options) {
            for (const resolver of this._resolvers) {
                try {
                    const result = await resolver.resolveExternalUri(resource, options);
                    if (result) {
                        if (!this._resolvedUriTargets.has(result.resolved)) {
                            this._resolvedUriTargets.set(result.resolved, resource);
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
        async _doOpenExternal(resource, options) {
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
                for (const opener of this._externalOpeners) {
                    const didOpen = await opener.openExternal(href, {
                        sourceUri: uri,
                        preferredOpenerId,
                    }, cancellation_1.CancellationToken.None);
                    if (didOpen) {
                        return true;
                    }
                }
            }
            return this._defaultExternalOpener.openExternal(href, { sourceUri: uri }, cancellation_1.CancellationToken.None);
        }
        dispose() {
            this._validators.clear();
        }
    };
    exports.OpenerService = OpenerService;
    exports.OpenerService = OpenerService = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService),
        __param(1, commands_1.ICommandService)
    ], OpenerService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmVyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3NlcnZpY2VzL29wZW5lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0JoRyxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO1FBRWxCLFlBQThDLGVBQWdDO1lBQWhDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUFJLENBQUM7UUFFbkYsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFvQixFQUFFLE9BQXFCO1lBQ3JELElBQUksQ0FBQyxJQUFBLHNCQUFhLEVBQUMsTUFBTSxFQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzVDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRTtnQkFDNUIsaUVBQWlFO2dCQUNqRSwyQ0FBMkM7Z0JBQzNDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDL0IsTUFBTSxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDM0I7WUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUN6QywrQkFBK0I7Z0JBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2pELDJDQUEyQztvQkFDM0MsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELHFCQUFxQjtZQUNyQixJQUFJLElBQUksR0FBUSxFQUFFLENBQUM7WUFDbkIsSUFBSTtnQkFDSCxJQUFJLEdBQUcsSUFBQSxtQkFBSyxFQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxL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