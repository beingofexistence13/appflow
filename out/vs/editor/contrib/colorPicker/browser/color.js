/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider", "vs/platform/configuration/common/configuration"], function (require, exports, cancellation_1, errors_1, uri_1, range_1, model_1, commands_1, languageFeatures_1, defaultDocumentColorProvider_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getColorPresentations = exports.getColors = void 0;
    async function getColors(colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled = true) {
        return _findColorData(new ColorDataCollector(), colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled);
    }
    exports.getColors = getColors;
    function getColorPresentations(model, colorInfo, provider, token) {
        return Promise.resolve(provider.provideColorPresentations(model, colorInfo, token));
    }
    exports.getColorPresentations = getColorPresentations;
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
        constructor(colorInfo) {
            this.colorInfo = colorInfo;
        }
        async compute(provider, model, _token, colors) {
            const documentColors = await provider.provideColorPresentations(model, this.colorInfo, cancellation_1.CancellationToken.None);
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
            if (provider instanceof defaultDocumentColorProvider_1.DefaultDocumentColorProvider) {
                defaultProvider = provider;
            }
            else {
                try {
                    if (await collector.compute(provider, model, token, colorData)) {
                        validDocumentColorProviderFound = true;
                    }
                }
                catch (e) {
                    (0, errors_1.onUnexpectedExternalError)(e);
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
        const { colorProvider: colorProviderRegistry } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(resource);
        if (!model) {
            throw (0, errors_1.illegalArgument)();
        }
        const isDefaultColorDecoratorsEnabled = accessor.get(configuration_1.IConfigurationService).getValue('editor.defaultColorDecorators', { resource });
        return { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled };
    }
    commands_1.CommandsRegistry.registerCommand('_executeDocumentColorProvider', function (accessor, ...args) {
        const [resource] = args;
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.illegalArgument)();
        }
        const { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled } = _setupColorCommand(accessor, resource);
        return _findColorData(new ExtColorDataCollector(), colorProviderRegistry, model, cancellation_1.CancellationToken.None, isDefaultColorDecoratorsEnabled);
    });
    commands_1.CommandsRegistry.registerCommand('_executeColorPresentationProvider', function (accessor, ...args) {
        const [color, context] = args;
        const { uri, range } = context;
        if (!(uri instanceof uri_1.URI) || !Array.isArray(color) || color.length !== 4 || !range_1.Range.isIRange(range)) {
            throw (0, errors_1.illegalArgument)();
        }
        const { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled } = _setupColorCommand(accessor, uri);
        const [red, green, blue, alpha] = color;
        return _findColorData(new ColorPresentationsCollector({ range: range, color: { red, green, blue, alpha } }), colorProviderRegistry, model, cancellation_1.CancellationToken.None, isDefaultColorDecoratorsEnabled);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2xvclBpY2tlci9icm93c2VyL2NvbG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCekYsS0FBSyxVQUFVLFNBQVMsQ0FBQyxxQkFBcUUsRUFBRSxLQUFpQixFQUFFLEtBQXdCLEVBQUUsa0NBQTJDLElBQUk7UUFDbE0sT0FBTyxjQUFjLENBQWEsSUFBSSxrQkFBa0IsRUFBRSxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsK0JBQStCLENBQUMsQ0FBQztJQUNuSSxDQUFDO0lBRkQsOEJBRUM7SUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxLQUFpQixFQUFFLFNBQTRCLEVBQUUsUUFBK0IsRUFBRSxLQUF3QjtRQUMvSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRkQsc0RBRUM7SUFhRCxNQUFNLGtCQUFrQjtRQUN2QixnQkFBZ0IsQ0FBQztRQUNqQixLQUFLLENBQUMsT0FBTyxDQUFDLFFBQStCLEVBQUUsS0FBaUIsRUFBRSxLQUF3QixFQUFFLE1BQW9CO1lBQy9HLE1BQU0sY0FBYyxHQUFHLE1BQU0sUUFBUSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ2xDLEtBQUssTUFBTSxTQUFTLElBQUksY0FBYyxFQUFFO29CQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Q7WUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdEMsQ0FBQztLQUNEO0lBRUQsTUFBTSxxQkFBcUI7UUFDMUIsZ0JBQWdCLENBQUM7UUFDakIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUErQixFQUFFLEtBQWlCLEVBQUUsS0FBd0IsRUFBRSxNQUF1QjtZQUNsSCxNQUFNLGNBQWMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO2dCQUNsQyxLQUFLLE1BQU0sU0FBUyxJQUFJLGNBQWMsRUFBRTtvQkFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUMxSTthQUNEO1lBQ0QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FFRDtJQUVELE1BQU0sMkJBQTJCO1FBQ2hDLFlBQW9CLFNBQTRCO1lBQTVCLGNBQVMsR0FBVCxTQUFTLENBQW1CO1FBQUksQ0FBQztRQUNyRCxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQStCLEVBQUUsS0FBaUIsRUFBRSxNQUF5QixFQUFFLE1BQTRCO1lBQ3hILE1BQU0sY0FBYyxHQUFHLE1BQU0sUUFBUSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9HLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDO2FBQy9CO1lBQ0QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FDRDtJQUVELEtBQUssVUFBVSxjQUFjLENBQTRELFNBQTJCLEVBQUUscUJBQXFFLEVBQUUsS0FBaUIsRUFBRSxLQUF3QixFQUFFLCtCQUF3QztRQUNqUixJQUFJLCtCQUErQixHQUFHLEtBQUssQ0FBQztRQUM1QyxJQUFJLGVBQXlELENBQUM7UUFDOUQsTUFBTSxTQUFTLEdBQVEsRUFBRSxDQUFDO1FBQzFCLE1BQU0sc0JBQXNCLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BFLEtBQUssSUFBSSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVELE1BQU0sUUFBUSxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksUUFBUSxZQUFZLDJEQUE0QixFQUFFO2dCQUNyRCxlQUFlLEdBQUcsUUFBUSxDQUFDO2FBQzNCO2lCQUFNO2dCQUNOLElBQUk7b0JBQ0gsSUFBSSxNQUFNLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7d0JBQy9ELCtCQUErQixHQUFHLElBQUksQ0FBQztxQkFDdkM7aUJBQ0Q7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1gsSUFBQSxrQ0FBeUIsRUFBQyxDQUFDLENBQUMsQ0FBQztpQkFDN0I7YUFDRDtTQUNEO1FBQ0QsSUFBSSwrQkFBK0IsRUFBRTtZQUNwQyxPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUNELElBQUksZUFBZSxJQUFJLCtCQUErQixFQUFFO1lBQ3ZELE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNsRSxPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVELFNBQVMsa0JBQWtCLENBQUMsUUFBMEIsRUFBRSxRQUFhO1FBQ3BFLE1BQU0sRUFBRSxhQUFhLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJDQUF3QixDQUFDLENBQUM7UUFDeEYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDWCxNQUFNLElBQUEsd0JBQWUsR0FBRSxDQUFDO1NBQ3hCO1FBQ0QsTUFBTSwrQkFBK0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFDQUFxQixDQUFDLENBQUMsUUFBUSxDQUFVLCtCQUErQixFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3SSxPQUFPLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLCtCQUErQixFQUFFLENBQUM7SUFDMUUsQ0FBQztJQUVELDJCQUFnQixDQUFDLGVBQWUsQ0FBQywrQkFBK0IsRUFBRSxVQUFVLFFBQVEsRUFBRSxHQUFHLElBQUk7UUFDNUYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN4QixJQUFJLENBQUMsQ0FBQyxRQUFRLFlBQVksU0FBRyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxJQUFBLHdCQUFlLEdBQUUsQ0FBQztTQUN4QjtRQUNELE1BQU0sRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsK0JBQStCLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakgsT0FBTyxjQUFjLENBQWdCLElBQUkscUJBQXFCLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxFQUFFLCtCQUErQixDQUFDLENBQUM7SUFDMUosQ0FBQyxDQUFDLENBQUM7SUFFSCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsbUNBQW1DLEVBQUUsVUFBVSxRQUFRLEVBQUUsR0FBRyxJQUFJO1FBQ2hHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzlCLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsWUFBWSxTQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ25HLE1BQU0sSUFBQSx3QkFBZSxHQUFFLENBQUM7U0FDeEI7UUFDRCxNQUFNLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLCtCQUErQixFQUFFLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDeEMsT0FBTyxjQUFjLENBQXFCLElBQUksMkJBQTJCLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxFQUFFLCtCQUErQixDQUFDLENBQUM7SUFDek4sQ0FBQyxDQUFDLENBQUMifQ==