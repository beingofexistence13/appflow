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
define(["require", "exports", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "./webviewEditorInput", "./webviewWorkbenchService"], function (require, exports, uri_1, extensions_1, webviewEditorInput_1, webviewWorkbenchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qlb = exports.$plb = exports.$olb = exports.$nlb = void 0;
    let $nlb = class $nlb {
        static { this.ID = webviewEditorInput_1.$cfb.typeId; }
        constructor(a) {
            this.a = a;
        }
        canSerialize(input) {
            return this.a.shouldPersist(input);
        }
        serialize(input) {
            if (!this.a.shouldPersist(input)) {
                return undefined;
            }
            const data = this.c(input);
            try {
                return JSON.stringify(data);
            }
            catch {
                return undefined;
            }
        }
        deserialize(_instantiationService, serializedEditorInput) {
            const data = this.b(JSON.parse(serializedEditorInput));
            return this.a.openRevivedWebview({
                webviewInitInfo: {
                    providedViewType: data.providedId,
                    origin: data.origin,
                    title: data.title,
                    options: data.webviewOptions,
                    contentOptions: data.contentOptions,
                    extension: data.extension,
                },
                viewType: data.viewType,
                title: data.title,
                iconPath: data.iconPath,
                state: data.state,
                group: data.group
            });
        }
        b(data) {
            return {
                ...data,
                extension: $olb(data.extensionId, data.extensionLocation),
                iconPath: reviveIconPath(data.iconPath),
                state: reviveState(data.state),
                webviewOptions: $plb(data.options),
                contentOptions: $qlb(data.options),
            };
        }
        c(input) {
            return {
                origin: input.webview.origin,
                viewType: input.viewType,
                providedId: input.providedId,
                title: input.getName(),
                options: { ...input.webview.options, ...input.webview.contentOptions },
                extensionLocation: input.extension?.location,
                extensionId: input.extension?.id.value,
                state: input.webview.state,
                iconPath: input.iconPath ? { light: input.iconPath.light, dark: input.iconPath.dark, } : undefined,
                group: input.group
            };
        }
    };
    exports.$nlb = $nlb;
    exports.$nlb = $nlb = __decorate([
        __param(0, webviewWorkbenchService_1.$hfb)
    ], $nlb);
    function $olb(extensionId, extensionLocation) {
        if (!extensionId) {
            return undefined;
        }
        const location = reviveUri(extensionLocation);
        if (!location) {
            return undefined;
        }
        return {
            id: new extensions_1.$Vl(extensionId),
            location,
        };
    }
    exports.$olb = $olb;
    function reviveIconPath(data) {
        if (!data) {
            return undefined;
        }
        const light = reviveUri(data.light);
        const dark = reviveUri(data.dark);
        return light && dark ? { light, dark } : undefined;
    }
    function reviveUri(data) {
        if (!data) {
            return undefined;
        }
        try {
            if (typeof data === 'string') {
                return uri_1.URI.parse(data);
            }
            return uri_1.URI.from(data);
        }
        catch {
            return undefined;
        }
    }
    function reviveState(state) {
        return typeof state === 'string' ? state : undefined;
    }
    function $plb(options) {
        return options;
    }
    exports.$plb = $plb;
    function $qlb(options) {
        return {
            ...options,
            localResourceRoots: options.localResourceRoots?.map(uri => reviveUri(uri)),
        };
    }
    exports.$qlb = $qlb;
});
//# sourceMappingURL=webviewEditorInputSerializer.js.map