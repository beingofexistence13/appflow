/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/outline/browser/outline.contribution", "vs/workbench/common/views", "./outlinePane", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/platform/instantiation/common/descriptors", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/outline/browser/outline", "./outlineActions"], function (require, exports, nls_1, views_1, outlinePane_1, platform_1, configurationRegistry_1, explorerViewlet_1, descriptors_1, codicons_1, iconRegistry_1, outline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --- view
    const outlineViewIcon = (0, iconRegistry_1.$9u)('outline-view-icon', codicons_1.$Pj.symbolClass, (0, nls_1.localize)(0, null));
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: outline_1.IOutlinePane.Id,
            name: (0, nls_1.localize)(1, null),
            containerIcon: outlineViewIcon,
            ctorDescriptor: new descriptors_1.$yh(outlinePane_1.$FZb),
            canToggleVisibility: true,
            canMoveView: true,
            hideByDefault: false,
            collapsed: true,
            order: 2,
            weight: 30,
            focusCommand: { id: 'outline.focus' }
        }], explorerViewlet_1.$TLb);
    // --- configurations
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        'id': 'outline',
        'order': 117,
        'title': (0, nls_1.localize)(2, null),
        'type': 'object',
        'properties': {
            ["outline.icons" /* OutlineConfigKeys.icons */]: {
                'description': (0, nls_1.localize)(3, null),
                'type': 'boolean',
                'default': true
            },
            ["outline.collapseItems" /* OutlineConfigKeys.collapseItems */]: {
                'description': (0, nls_1.localize)(4, null),
                'type': 'string',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                'enum': [
                    'alwaysCollapse',
                    'alwaysExpand'
                ],
                'enumDescriptions': [
                    (0, nls_1.localize)(5, null),
                    (0, nls_1.localize)(6, null)
                ],
                'default': 'alwaysExpand'
            },
            ["outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */]: {
                'description': (0, nls_1.localize)(7, null),
                'type': 'boolean',
                'default': true
            },
            ["outline.problems.colors" /* OutlineConfigKeys.problemsColors */]: {
                'description': (0, nls_1.localize)(8, null),
                'type': 'boolean',
                'default': true
            },
            ["outline.problems.badges" /* OutlineConfigKeys.problemsBadges */]: {
                'description': (0, nls_1.localize)(9, null),
                'type': 'boolean',
                'default': true
            },
            'outline.showFiles': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                default: true,
                markdownDescription: (0, nls_1.localize)(10, null)
            },
            'outline.showModules': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                default: true,
                markdownDescription: (0, nls_1.localize)(11, null)
            },
            'outline.showNamespaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(12, null)
            },
            'outline.showPackages': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(13, null)
            },
            'outline.showClasses': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(14, null)
            },
            'outline.showMethods': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(15, null)
            },
            'outline.showProperties': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(16, null)
            },
            'outline.showFields': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(17, null)
            },
            'outline.showConstructors': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(18, null)
            },
            'outline.showEnums': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(19, null)
            },
            'outline.showInterfaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(20, null)
            },
            'outline.showFunctions': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(21, null)
            },
            'outline.showVariables': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(22, null)
            },
            'outline.showConstants': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(23, null)
            },
            'outline.showStrings': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(24, null)
            },
            'outline.showNumbers': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(25, null)
            },
            'outline.showBooleans': {
                type: 'boolean',
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                default: true,
                markdownDescription: (0, nls_1.localize)(26, null)
            },
            'outline.showArrays': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(27, null)
            },
            'outline.showObjects': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(28, null)
            },
            'outline.showKeys': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(29, null)
            },
            'outline.showNull': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(30, null)
            },
            'outline.showEnumMembers': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(31, null)
            },
            'outline.showStructs': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(32, null)
            },
            'outline.showEvents': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(33, null)
            },
            'outline.showOperators': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(34, null)
            },
            'outline.showTypeParameters': {
                type: 'boolean',
                default: true,
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(35, null)
            }
        }
    });
});
//# sourceMappingURL=outline.contribution.js.map