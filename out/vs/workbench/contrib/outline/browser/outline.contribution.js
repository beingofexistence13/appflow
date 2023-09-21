/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/common/views", "./outlinePane", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/platform/instantiation/common/descriptors", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/outline/browser/outline", "./outlineActions"], function (require, exports, nls_1, views_1, outlinePane_1, platform_1, configurationRegistry_1, explorerViewlet_1, descriptors_1, codicons_1, iconRegistry_1, outline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- view
    const outlineViewIcon = (0, iconRegistry_1.registerIcon)('outline-view-icon', codicons_1.Codicon.symbolClass, (0, nls_1.localize)('outlineViewIcon', 'View icon of the outline view.'));
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: outline_1.IOutlinePane.Id,
            name: (0, nls_1.localize)('name', "Outline"),
            containerIcon: outlineViewIcon,
            ctorDescriptor: new descriptors_1.SyncDescriptor(outlinePane_1.OutlinePane),
            canToggleVisibility: true,
            canMoveView: true,
            hideByDefault: false,
            collapsed: true,
            order: 2,
            weight: 30,
            focusCommand: { id: 'outline.focus' }
        }], explorerViewlet_1.VIEW_CONTAINER);
    // --- configurations
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': 'outline',
        'order': 117,
        'title': (0, nls_1.localize)('outlineConfigurationTitle', "Outline"),
        'type': 'object',
        'properties': {
            ["outline.icons" /* OutlineConfigKeys.icons */]: {
                'description': (0, nls_1.localize)('outline.showIcons', "Render Outline elements with icons."),
                'type': 'boolean',
                'default': true
            },
            ["outline.collapseItems" /* OutlineConfigKeys.collapseItems */]: {
                'description': (0, nls_1.localize)('outline.initialState', "Controls whether Outline items are collapsed or expanded."),
                'type': 'string',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                'enum': [
                    'alwaysCollapse',
                    'alwaysExpand'
                ],
                'enumDescriptions': [
                    (0, nls_1.localize)('outline.initialState.collapsed', "Collapse all items."),
                    (0, nls_1.localize)('outline.initialState.expanded', "Expand all items.")
                ],
                'default': 'alwaysExpand'
            },
            ["outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */]: {
                'description': (0, nls_1.localize)('outline.showProblem', "Show errors and warnings on Outline elements."),
                'type': 'boolean',
                'default': true
            },
            ["outline.problems.colors" /* OutlineConfigKeys.problemsColors */]: {
                'description': (0, nls_1.localize)('outline.problem.colors', "Use colors for errors and warnings on Outline elements."),
                'type': 'boolean',
                'default': true
            },
            ["outline.problems.badges" /* OutlineConfigKeys.problemsBadges */]: {
                'description': (0, nls_1.localize)('outline.problems.badges', "Use badges for errors and warnings on Outline elements."),
                'type': 'boolean',
                'default': true
            },
            'outline.showFiles': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                default: true,
                markdownDescription: (0, nls_1.localize)('filteredTypes.file', "When enabled, Outline shows `file`-symbols.")
            },
            'outline.showModules': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                default: true,
                markdownDescription: (0, nls_1.localize)('filteredTypes.module', "When enabled, Outline shows `module`-symbols.")
            },
            'outline.showNamespaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.namespace', "When enabled, Outline shows `namespace`-symbols.")
            },
            'outline.showPackages': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.package', "When enabled, Outline shows `package`-symbols.")
            },
            'outline.showClasses': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.class', "When enabled, Outline shows `class`-symbols.")
            },
            'outline.showMethods': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.method', "When enabled, Outline shows `method`-symbols.")
            },
            'outline.showProperties': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.property', "When enabled, Outline shows `property`-symbols.")
            },
            'outline.showFields': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.field', "When enabled, Outline shows `field`-symbols.")
            },
            'outline.showConstructors': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.constructor', "When enabled, Outline shows `constructor`-symbols.")
            },
            'outline.showEnums': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.enum', "When enabled, Outline shows `enum`-symbols.")
            },
            'outline.showInterfaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.interface', "When enabled, Outline shows `interface`-symbols.")
            },
            'outline.showFunctions': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.function', "When enabled, Outline shows `function`-symbols.")
            },
            'outline.showVariables': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.variable', "When enabled, Outline shows `variable`-symbols.")
            },
            'outline.showConstants': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.constant', "When enabled, Outline shows `constant`-symbols.")
            },
            'outline.showStrings': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.string', "When enabled, Outline shows `string`-symbols.")
            },
            'outline.showNumbers': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.number', "When enabled, Outline shows `number`-symbols.")
            },
            'outline.showBooleans': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                default: true,
                markdownDescription: (0, nls_1.localize)('filteredTypes.boolean', "When enabled, Outline shows `boolean`-symbols.")
            },
            'outline.showArrays': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.array', "When enabled, Outline shows `array`-symbols.")
            },
            'outline.showObjects': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.object', "When enabled, Outline shows `object`-symbols.")
            },
            'outline.showKeys': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.key', "When enabled, Outline shows `key`-symbols.")
            },
            'outline.showNull': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.null', "When enabled, Outline shows `null`-symbols.")
            },
            'outline.showEnumMembers': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.enumMember', "When enabled, Outline shows `enumMember`-symbols.")
            },
            'outline.showStructs': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.struct', "When enabled, Outline shows `struct`-symbols.")
            },
            'outline.showEvents': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.event', "When enabled, Outline shows `event`-symbols.")
            },
            'outline.showOperators': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.operator', "When enabled, Outline shows `operator`-symbols.")
            },
            'outline.showTypeParameters': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)('filteredTypes.typeParameter', "When enabled, Outline shows `typeParameter`-symbols.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9vdXRsaW5lL2Jyb3dzZXIvb3V0bGluZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFrQmhHLFdBQVc7SUFFWCxNQUFNLGVBQWUsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUJBQW1CLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO0lBRTlJLG1CQUFRLENBQUMsRUFBRSxDQUFpQixrQkFBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hFLEVBQUUsRUFBRSxzQkFBWSxDQUFDLEVBQUU7WUFDbkIsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7WUFDakMsYUFBYSxFQUFFLGVBQWU7WUFDOUIsY0FBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyx5QkFBVyxDQUFDO1lBQy9DLG1CQUFtQixFQUFFLElBQUk7WUFDekIsV0FBVyxFQUFFLElBQUk7WUFDakIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsU0FBUyxFQUFFLElBQUk7WUFDZixLQUFLLEVBQUUsQ0FBQztZQUNSLE1BQU0sRUFBRSxFQUFFO1lBQ1YsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLGVBQWUsRUFBRTtTQUNyQyxDQUFDLEVBQUUsZ0NBQWMsQ0FBQyxDQUFDO0lBRXBCLHFCQUFxQjtJQUVyQixtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUMscUJBQXFCLENBQUM7UUFDaEcsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsR0FBRztRQUNaLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFB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