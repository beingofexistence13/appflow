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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/editorConfigurationSchema", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform"], function (require, exports, event_1, lifecycle_1, editorConfigurationSchema_1, codeAction_1, types_1, nls, configurationRegistry_1, keybinding_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionsContribution = exports.editorConfiguration = void 0;
    const createCodeActionsAutoSave = (description) => {
        return {
            type: 'string',
            enum: ['always', 'never', 'explicit'],
            enumDescriptions: [nls.localize('alwaysSave', 'Always triggers Code Actions on save'), nls.localize('neverSave', 'Never triggers Code Actions on save'), nls.localize('explicitSave', 'Triggers Code Actions only when explicitly saved')],
            default: 'explicit',
            description: description
        };
    };
    const codeActionsOnSaveDefaultProperties = Object.freeze({
        'source.fixAll': createCodeActionsAutoSave(nls.localize('codeActionsOnSave.fixAll', "Controls whether auto fix action should be run on file save.")),
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
        markdownDescription: nls.localize('editor.codeActionsOnSave', 'Run CodeActions for the editor on save. CodeActions must be specified and the editor must not be shutting down. Example: `"source.organizeImports": "explicit" `'),
        type: 'object',
        additionalProperties: {
            type: 'string'
        },
        default: {},
        scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
    };
    exports.editorConfiguration = Object.freeze({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            'editor.codeActionsOnSave': codeActionsOnSaveSchema
        }
    });
    let CodeActionsContribution = class CodeActionsContribution extends lifecycle_1.Disposable {
        constructor(codeActionsExtensionPoint, keybindingService) {
            super();
            this._contributedCodeActions = [];
            this._onDidChangeContributions = this._register(new event_1.Emitter());
            codeActionsExtensionPoint.setHandler(extensionPoints => {
                this._contributedCodeActions = extensionPoints.map(x => x.value).flat();
                this.updateConfigurationSchema(this._contributedCodeActions);
                this._onDidChangeContributions.fire();
            });
            keybindingService.registerSchemaContribution({
                getSchemaAdditions: () => this.getSchemaAdditions(),
                onDidChange: this._onDidChangeContributions.event,
            });
        }
        updateConfigurationSchema(codeActionContributions) {
            const newProperties = { ...codeActionsOnSaveDefaultProperties };
            for (const [sourceAction, props] of this.getSourceActions(codeActionContributions)) {
                newProperties[sourceAction] = createCodeActionsAutoSave(nls.localize('codeActionsOnSave.generic', "Controls whether '{0}' actions should be run on file save.", props.title));
            }
            codeActionsOnSaveSchema.properties = newProperties;
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
                .notifyConfigurationSchemaUpdated(exports.editorConfiguration);
        }
        getSourceActions(contributions) {
            const defaultKinds = Object.keys(codeActionsOnSaveDefaultProperties).map(value => new types_1.CodeActionKind(value));
            const sourceActions = new Map();
            for (const contribution of contributions) {
                for (const action of contribution.actions) {
                    const kind = new types_1.CodeActionKind(action.kind);
                    if (types_1.CodeActionKind.Source.contains(kind)
                        // Exclude any we already included by default
                        && !defaultKinds.some(defaultKind => defaultKind.contains(kind))) {
                        sourceActions.set(kind.value, action);
                    }
                }
            }
            return sourceActions;
        }
        getSchemaAdditions() {
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
                const allActions = this._contributedCodeActions.map(desc => desc.actions).flat();
                const out = new Map();
                for (const action of allActions) {
                    if (!out.has(action.kind) && ofKind.contains(new types_1.CodeActionKind(action.kind))) {
                        out.set(action.kind, action);
                    }
                }
                return Array.from(out.values());
            };
            return [
                conditionalSchema(codeAction_1.codeActionCommandId, getActions(types_1.CodeActionKind.Empty)),
                conditionalSchema(codeAction_1.refactorCommandId, getActions(types_1.CodeActionKind.Refactor)),
                conditionalSchema(codeAction_1.sourceActionCommandId, getActions(types_1.CodeActionKind.Source)),
            ];
        }
    };
    exports.CodeActionsContribution = CodeActionsContribution;
    exports.CodeActionsContribution = CodeActionsContribution = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], CodeActionsContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbnNDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb2RlQWN0aW9ucy9icm93c2VyL2NvZGVBY3Rpb25zQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCaEcsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLFdBQW1CLEVBQWUsRUFBRTtRQUN0RSxPQUFPO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQztZQUNyQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLHNDQUFzQyxDQUFDLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUscUNBQXFDLENBQUMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxrREFBa0QsQ0FBQyxDQUFDO1lBQzFPLE9BQU8sRUFBRSxVQUFVO1lBQ25CLFdBQVcsRUFBRSxXQUFXO1NBQ3hCLENBQUM7SUFDSCxDQUFDLENBQUM7SUFFRixNQUFNLGtDQUFrQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQWlCO1FBQ3hFLGVBQWUsRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLDhEQUE4RCxDQUFDLENBQUM7S0FDcEosQ0FBQyxDQUFDO0lBRUgsTUFBTSx1QkFBdUIsR0FBaUM7UUFDN0QsS0FBSyxFQUFFO1lBQ047Z0JBQ0MsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFLGtDQUFrQztnQkFDOUMsb0JBQW9CLEVBQUU7b0JBQ3JCLElBQUksRUFBRSxRQUFRO2lCQUNkO2FBQ0Q7WUFDRDtnQkFDQyxJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVB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