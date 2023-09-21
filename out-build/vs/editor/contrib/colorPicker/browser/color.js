/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider", "vs/platform/configuration/common/configuration"], function (require, exports, cancellation_1, errors_1, uri_1, range_1, model_1, commands_1, languageFeatures_1, defaultDocumentColorProvider_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c3 = exports.$b3 = void 0;
    async function $b3(colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled = true) {
        return _findColorData(new ColorDataCollector(), colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled);
    }
    exports.$b3 = $b3;
    function $c3(model, colorInfo, provider, token) {
        return Promise.resolve(provider.provideColorPresentations(model, colorInfo, token));
    }
    exports.$c3 = $c3;
    class ColorDataCollector {
        constructor() { }
        async compute(provider, model, token, colors) {
            const documentColors = await provider.provideDocumentColors(model, token);
            if (Array.isArray(documentColors)) {
                for (const colorInfo of documentColors) {
                    colors.push({ colorInfo, provider });
                }
            }
            return Array.isArray(documentColors);
        }
    }
    class ExtColorDataCollector {
        constructor() { }
        async compute(provider, model, token, colors) {
            const documentColors = await provider.provideDocumentColors(model, token);
            if (Array.isArray(documentColors)) {
                for (const colorInfo of documentColors) {
                    colors.push({ range: colorInfo.range, color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha] });
                }
            }
            return Array.isArray(documentColors);
        }
    }
    class ColorPresentationsCollector {
        constructor(a) {
            this.a = a;
        }
        async compute(provider, model, _token, colors) {
            const documentColors = await provider.provideColorPresentations(model, this.a, cancellation_1.CancellationToken.None);
            if (Array.isArray(documentColors)) {
                colors.push(...documentColors);
            }
            return Array.isArray(documentColors);
        }
    }
    async function _findColorData(collector, colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled) {
        let validDocumentColorProviderFound = false;
        let defaultProvider;
        const colorData = [];
        const documentColorProviders = colorProviderRegistry.ordered(model);
        for (let i = documentColorProviders.length - 1; i >= 0; i--) {
            const provider = documentColorProviders[i];
            if (provider instanceof defaultDocumentColorProvider_1.$a3) {
                defaultProvider = provider;
            }
            else {
                try {
                    if (await collector.compute(provider, model, token, colorData)) {
                        validDocumentColorProviderFound = true;
                    }
                }
                catch (e) {
                    (0, errors_1.$Z)(e);
                }
            }
        }
        if (validDocumentColorProviderFound) {
            return colorData;
        }
        if (defaultProvider && isDefaultColorDecoratorsEnabled) {
            await collector.compute(defaultProvider, model, token, colorData);
            return colorData;
        }
        return [];
    }
    function _setupColorCommand(accessor, resource) {
        const { colorProvider: colorProviderRegistry } = accessor.get(languageFeatures_1.$hF);
        const model = accessor.get(model_1.$yA).getModel(resource);
        if (!model) {
            throw (0, errors_1.$5)();
        }
        const isDefaultColorDecoratorsEnabled = accessor.get(configuration_1.$8h).getValue('editor.defaultColorDecorators', { resource });
        return { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled };
    }
    commands_1.$Gr.registerCommand('_executeDocumentColorProvider', function (accessor, ...args) {
        const [resource] = args;
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.$5)();
        }
        const { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled } = _setupColorCommand(accessor, resource);
        return _findColorData(new ExtColorDataCollector(), colorProviderRegistry, model, cancellation_1.CancellationToken.None, isDefaultColorDecoratorsEnabled);
    });
    commands_1.$Gr.registerCommand('_executeColorPresentationProvider', function (accessor, ...args) {
        const [color, context] = args;
        const { uri, range } = context;
        if (!(uri instanceof uri_1.URI) || !Array.isArray(color) || color.length !== 4 || !range_1.$ks.isIRange(range)) {
            throw (0, errors_1.$5)();
        }
        const { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled } = _setupColorCommand(accessor, uri);
        const [red, green, blue, alpha] = color;
        return _findColorData(new ColorPresentationsCollector({ range: range, color: { red, green, blue, alpha } }), colorProviderRegistry, model, cancellation_1.CancellationToken.None, isDefaultColorDecoratorsEnabled);
    });
});
//# sourceMappingURL=color.js.map