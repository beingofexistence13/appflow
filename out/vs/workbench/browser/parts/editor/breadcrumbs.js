/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform"], function (require, exports, event_1, nls_1, configurationRegistry_1, extensions_1, instantiation_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsConfig = exports.BreadcrumbsService = exports.IBreadcrumbsService = void 0;
    exports.IBreadcrumbsService = (0, instantiation_1.createDecorator)('IEditorBreadcrumbsService');
    class BreadcrumbsService {
        constructor() {
            this._map = new Map();
        }
        register(group, widget) {
            if (this._map.has(group)) {
                throw new Error(`group (${group}) has already a widget`);
            }
            this._map.set(group, widget);
            return {
                dispose: () => this._map.delete(group)
            };
        }
        getWidget(group) {
            return this._map.get(group);
        }
    }
    exports.BreadcrumbsService = BreadcrumbsService;
    (0, extensions_1.registerSingleton)(exports.IBreadcrumbsService, BreadcrumbsService, 1 /* InstantiationType.Delayed */);
    //#region config
    class BreadcrumbsConfig {
        constructor() {
            // internal
        }
        static { this.IsEnabled = BreadcrumbsConfig._stub('breadcrumbs.enabled'); }
        static { this.UseQuickPick = BreadcrumbsConfig._stub('breadcrumbs.useQuickPick'); }
        static { this.FilePath = BreadcrumbsConfig._stub('breadcrumbs.filePath'); }
        static { this.SymbolPath = BreadcrumbsConfig._stub('breadcrumbs.symbolPath'); }
        static { this.SymbolSortOrder = BreadcrumbsConfig._stub('breadcrumbs.symbolSortOrder'); }
        static { this.Icons = BreadcrumbsConfig._stub('breadcrumbs.icons'); }
        static { this.TitleScrollbarSizing = BreadcrumbsConfig._stub('workbench.editor.titleScrollbarSizing'); }
        static { this.FileExcludes = BreadcrumbsConfig._stub('files.exclude'); }
        static _stub(name) {
            return {
                bindTo(service) {
                    const onDidChange = new event_1.Emitter();
                    const listener = service.onDidChangeConfiguration(e => {
                        if (e.affectsConfiguration(name)) {
                            onDidChange.fire(undefined);
                        }
                    });
                    return new class {
                        constructor() {
                            this.name = name;
                            this.onDidChange = onDidChange.event;
                        }
                        getValue(overrides) {
                            if (overrides) {
                                return service.getValue(name, overrides);
                            }
                            else {
                                return service.getValue(name);
                            }
                        }
                        updateValue(newValue, overrides) {
                            if (overrides) {
                                return service.updateValue(name, newValue, overrides);
                            }
                            else {
                                return service.updateValue(name, newValue);
                            }
                        }
                        dispose() {
                            listener.dispose();
                            onDidChange.dispose();
                        }
                    };
                }
            };
        }
    }
    exports.BreadcrumbsConfig = BreadcrumbsConfig;
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'breadcrumbs',
        title: (0, nls_1.localize)('title', "Breadcrumb Navigation"),
        order: 101,
        type: 'object',
        properties: {
            'breadcrumbs.enabled': {
                description: (0, nls_1.localize)('enabled', "Enable/disable navigation breadcrumbs."),
                type: 'boolean',
                default: true
            },
            'breadcrumbs.filePath': {
                description: (0, nls_1.localize)('filepath', "Controls whether and how file paths are shown in the breadcrumbs view."),
                type: 'string',
                default: 'on',
                enum: ['on', 'off', 'last'],
                enumDescriptions: [
                    (0, nls_1.localize)('filepath.on', "Show the file path in the breadcrumbs view."),
                    (0, nls_1.localize)('filepath.off', "Do not show the file path in the breadcrumbs view."),
                    (0, nls_1.localize)('filepath.last', "Only show the last element of the file path in the breadcrumbs view."),
                ]
            },
            'breadcrumbs.symbolPath': {
                description: (0, nls_1.localize)('symbolpath', "Controls whether and how symbols are shown in the breadcrumbs view."),
                type: 'string',
                default: 'on',
                enum: ['on', 'off', 'last'],
                enumDescriptions: [
                    (0, nls_1.localize)('symbolpath.on', "Show all symbols in the breadcrumbs view."),
                    (0, nls_1.localize)('symbolpath.off', "Do not show symbols in the breadcrumbs view."),
                    (0, nls_1.localize)('symbolpath.last', "Only show the current symbol in the breadcrumbs view."),
                ]
            },
            'breadcrumbs.symbolSortOrder': {
                description: (0, nls_1.localize)('symbolSortOrder', "Controls how symbols are sorted in the breadcrumbs outline view."),
                type: 'string',
                default: 'position',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                enum: ['position', 'name', 'type'],
                enumDescriptions: [
                    (0, nls_1.localize)('symbolSortOrder.position', "Show symbol outline in file position order."),
                    (0, nls_1.localize)('symbolSortOrder.name', "Show symbol outline in alphabetical order."),
                    (0, nls_1.localize)('symbolSortOrder.type', "Show symbol outline in symbol type order."),
                ]
            },
            'breadcrumbs.icons': {
                description: (0, nls_1.localize)('icons', "Render breadcrumb items with icons."),
                type: 'boolean',
                default: true
            },
            'breadcrumbs.showFiles': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.file', "When enabled breadcrumbs show `file`-symbols.")
            },
            'breadcrumbs.showModules': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.module', "When enabled breadcrumbs show `module`-symbols.")
            },
            'breadcrumbs.showNamespaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.namespace', "When enabled breadcrumbs show `namespace`-symbols.")
            },
            'breadcrumbs.showPackages': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.package', "When enabled breadcrumbs show `package`-symbols.")
            },
            'breadcrumbs.showClasses': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.class', "When enabled breadcrumbs show `class`-symbols.")
            },
            'breadcrumbs.showMethods': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.method', "When enabled breadcrumbs show `method`-symbols.")
            },
            'breadcrumbs.showProperties': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.property', "When enabled breadcrumbs show `property`-symbols.")
            },
            'breadcrumbs.showFields': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.field', "When enabled breadcrumbs show `field`-symbols.")
            },
            'breadcrumbs.showConstructors': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.constructor', "When enabled breadcrumbs show `constructor`-symbols.")
            },
            'breadcrumbs.showEnums': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.enum', "When enabled breadcrumbs show `enum`-symbols.")
            },
            'breadcrumbs.showInterfaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.interface', "When enabled breadcrumbs show `interface`-symbols.")
            },
            'breadcrumbs.showFunctions': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.function', "When enabled breadcrumbs show `function`-symbols.")
            },
            'breadcrumbs.showVariables': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.variable', "When enabled breadcrumbs show `variable`-symbols.")
            },
            'breadcrumbs.showConstants': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.constant', "When enabled breadcrumbs show `constant`-symbols.")
            },
            'breadcrumbs.showStrings': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.string', "When enabled breadcrumbs show `string`-symbols.")
            },
            'breadcrumbs.showNumbers': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.number', "When enabled breadcrumbs show `number`-symbols.")
            },
            'breadcrumbs.showBooleans': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.boolean', "When enabled breadcrumbs show `boolean`-symbols.")
            },
            'breadcrumbs.showArrays': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.array', "When enabled breadcrumbs show `array`-symbols.")
            },
            'breadcrumbs.showObjects': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.object', "When enabled breadcrumbs show `object`-symbols.")
            },
            'breadcrumbs.showKeys': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.key', "When enabled breadcrumbs show `key`-symbols.")
            },
            'breadcrumbs.showNull': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.null', "When enabled breadcrumbs show `null`-symbols.")
            },
            'breadcrumbs.showEnumMembers': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.enumMember', "When enabled breadcrumbs show `enumMember`-symbols.")
            },
            'breadcrumbs.showStructs': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.struct', "When enabled breadcrumbs show `struct`-symbols.")
            },
            'breadcrumbs.showEvents': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.event', "When enabled breadcrumbs show `event`-symbols.")
            },
            'breadcrumbs.showOperators': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.operator', "When enabled breadcrumbs show `operator`-symbols.")
            },
            'breadcrumbs.showTypeParameters': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.typeParameter', "When enabled breadcrumbs show `typeParameter`-symbols.")
            }
        }
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9lZGl0b3IvYnJlYWRjcnVtYnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY25GLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwrQkFBZSxFQUFzQiwyQkFBMkIsQ0FBQyxDQUFDO0lBWXJHLE1BQWEsa0JBQWtCO1FBQS9CO1lBSWtCLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztRQWU5RCxDQUFDO1FBYkEsUUFBUSxDQUFDLEtBQWEsRUFBRSxNQUF5QjtZQUNoRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyx3QkFBd0IsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzdCLE9BQU87Z0JBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQzthQUN0QyxDQUFDO1FBQ0gsQ0FBQztRQUVELFNBQVMsQ0FBQyxLQUFhO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztLQUNEO0lBbkJELGdEQW1CQztJQUVELElBQUEsOEJBQWlCLEVBQUMsMkJBQW1CLEVBQUUsa0JBQWtCLG9DQUE0QixDQUFDO0lBR3RGLGdCQUFnQjtJQUVoQixNQUFzQixpQkFBaUI7UUFTdEM7WUFDQyxXQUFXO1FBQ1osQ0FBQztpQkFFZSxjQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFVLHFCQUFxQixDQUFDLENBQUM7aUJB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