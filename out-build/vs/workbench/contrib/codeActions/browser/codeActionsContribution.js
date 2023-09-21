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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/nls!vs/workbench/contrib/codeActions/browser/codeActionsContribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform"], function (require, exports, event_1, lifecycle_1, editorConfigurationSchema_1, codeAction_1, types_1, nls, configurationRegistry_1, keybinding_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k1b = exports.$j1b = void 0;
    const createCodeActionsAutoSave = (description) => {
        return {
            type: 'string',
            enum: ['always', 'never', 'explicit'],
            enumDescriptions: [nls.localize(0, null), nls.localize(1, null), nls.localize(2, null)],
            default: 'explicit',
            description: description
        };
    };
    const codeActionsOnSaveDefaultProperties = Object.freeze({
        'source.fixAll': createCodeActionsAutoSave(nls.localize(3, null)),
    });
    const codeActionsOnSaveSchema = {
        oneOf: [
            {
                type: 'object',
                properties: codeActionsOnSaveDefaultProperties,
                additionalProperties: {
                    type: 'string'
                },
            },
            {
                type: 'array',
                items: { type: 'string' }
            }
        ],
        markdownDescription: nls.localize(4, null),
        type: 'object',
        additionalProperties: {
            type: 'string'
        },
        default: {},
        scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    };
    exports.$j1b = Object.freeze({
        ...editorConfigurationSchema_1.$k1,
        properties: {
            'editor.codeActionsOnSave': codeActionsOnSaveSchema
        }
    });
    let $k1b = class $k1b extends lifecycle_1.$kc {
        constructor(codeActionsExtensionPoint, keybindingService) {
            super();
            this.a = [];
            this.b = this.B(new event_1.$fd());
            codeActionsExtensionPoint.setHandler(extensionPoints => {
                this.a = extensionPoints.map(x => x.value).flat();
                this.c(this.a);
                this.b.fire();
            });
            keybindingService.registerSchemaContribution({
                getSchemaAdditions: () => this.g(),
                onDidChange: this.b.event,
            });
        }
        c(codeActionContributions) {
            const newProperties = { ...codeActionsOnSaveDefaultProperties };
            for (const [sourceAction, props] of this.f(codeActionContributions)) {
                newProperties[sourceAction] = createCodeActionsAutoSave(nls.localize(5, null, props.title));
            }
            codeActionsOnSaveSchema.properties = newProperties;
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
                .notifyConfigurationSchemaUpdated(exports.$j1b);
        }
        f(contributions) {
            const defaultKinds = Object.keys(codeActionsOnSaveDefaultProperties).map(value => new types_1.$v1(value));
            const sourceActions = new Map();
            for (const contribution of contributions) {
                for (const action of contribution.actions) {
                    const kind = new types_1.$v1(action.kind);
                    if (types_1.$v1.Source.contains(kind)
                        // Exclude any we already included by default
                        && !defaultKinds.some(defaultKind => defaultKind.contains(kind))) {
                        sourceActions.set(kind.value, action);
                    }
                }
            }
            return sourceActions;
        }
        g() {
            const conditionalSchema = (command, actions) => {
                return {
                    if: {
                        required: ['command'],
                        properties: {
                            'command': { const: command }
                        }
                    },
                    then: {
                        properties: {
                            'args': {
                                required: ['kind'],
                                properties: {
                                    'kind': {
                                        anyOf: [
                                            {
                                                enum: actions.map(action => action.kind),
                                                enumDescriptions: actions.map(action => action.description ?? action.title),
                                            },
                                            { type: 'string' },
                                        ]
                                    }
                                }
                            }
                        }
                    }
                };
            };
            const getActions = (ofKind) => {
                const allActions = this.a.map(desc => desc.actions).flat();
                const out = new Map();
                for (const action of allActions) {
                    if (!out.has(action.kind) && ofKind.contains(new types_1.$v1(action.kind))) {
                        out.set(action.kind, action);
                    }
                }
                return Array.from(out.values());
            };
            return [
                conditionalSchema(codeAction_1.$A1, getActions(types_1.$v1.Empty)),
                conditionalSchema(codeAction_1.$D1, getActions(types_1.$v1.Refactor)),
                conditionalSchema(codeAction_1.$F1, getActions(types_1.$v1.Source)),
            ];
        }
    };
    exports.$k1b = $k1b;
    exports.$k1b = $k1b = __decorate([
        __param(1, keybinding_1.$2D)
    ], $k1b);
});
//# sourceMappingURL=codeActionsContribution.js.map