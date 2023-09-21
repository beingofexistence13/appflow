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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver", "vs/editor/contrib/codeAction/browser/codeActionMenu", "vs/editor/contrib/codeAction/browser/lightBulbWidget", "vs/editor/contrib/message/browser/messageController", "vs/nls!vs/editor/contrib/codeAction/browser/codeActionController", "vs/platform/actionWidget/browser/actionWidget", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress", "../common/types", "./codeActionModel"], function (require, exports, dom_1, errors_1, lazy_1, lifecycle_1, position_1, languageFeatures_1, codeAction_1, codeActionKeybindingResolver_1, codeActionMenu_1, lightBulbWidget_1, messageController_1, nls_1, actionWidget_1, commands_1, configuration_1, contextkey_1, instantiation_1, markers_1, progress_1, types_1, codeActionModel_1) {
    "use strict";
    var $Q2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q2 = void 0;
    let $Q2 = class $Q2 extends lifecycle_1.$kc {
        static { $Q2_1 = this; }
        static { this.ID = 'editor.contrib.codeActionController'; }
        static get(editor) {
            return editor.getContribution($Q2_1.ID);
        }
        constructor(editor, markerService, contextKeyService, instantiationService, languageFeaturesService, progressService, m, n, r, s) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.f = this.B(new lifecycle_1.$lc());
            this.g = false;
            this.j = false;
            this.a = editor;
            this.b = this.B(new codeActionModel_1.$P2(this.a, languageFeaturesService.codeActionProvider, markerService, contextKeyService, progressService));
            this.B(this.b.onDidChangeState(newState => this.w(newState)));
            this.c = new lazy_1.$T(() => {
                const widget = this.a.getContribution(lightBulbWidget_1.$J2.ID);
                if (widget) {
                    this.B(widget.onClick(e => this.showCodeActionList(e.actions, e, { includeDisabledActions: false, fromLightbulb: true })));
                }
                return widget;
            });
            this.h = instantiationService.createInstance(codeActionKeybindingResolver_1.$K1);
            this.B(this.a.onDidLayoutChange(() => this.r.hide()));
        }
        dispose() {
            this.j = true;
            super.dispose();
        }
        showCodeActions(_trigger, actions, at) {
            return this.showCodeActionList(actions, at, { includeDisabledActions: false, fromLightbulb: false });
        }
        hideCodeActions() {
            this.r.hide();
        }
        manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply) {
            if (!this.a.hasModel()) {
                return;
            }
            messageController_1.$M2.get(this.a)?.closeMessage();
            const triggerPosition = this.a.getPosition();
            this.t({ type: 1 /* CodeActionTriggerType.Invoke */, triggerAction, filter, autoApply, context: { notAvailableMessage, position: triggerPosition } });
        }
        t(trigger) {
            return this.b.trigger(trigger);
        }
        async u(action, retrigger, preview) {
            try {
                await this.s.invokeFunction(codeAction_1.$J1, action, codeAction_1.ApplyCodeActionReason.FromCodeActions, { preview, editor: this.a });
            }
            finally {
                if (retrigger) {
                    this.t({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.QuickFix, filter: {} });
                }
            }
        }
        hideLightBulbWidget() {
            this.c.rawValue?.hide();
        }
        async w(newState) {
            if (newState.type !== 1 /* CodeActionsState.Type.Triggered */) {
                this.c.rawValue?.hide();
                return;
            }
            let actions;
            try {
                actions = await newState.actions;
            }
            catch (e) {
                (0, errors_1.$Y)(e);
                return;
            }
            if (this.j) {
                return;
            }
            this.c.value?.update(actions, newState.trigger, newState.position);
            if (newState.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
                if (newState.trigger.filter?.include) { // Triggered for specific scope
                    // Check to see if we want to auto apply.
                    const validActionToApply = this.C(newState.trigger, actions);
                    if (validActionToApply) {
                        try {
                            this.c.value?.hide();
                            await this.u(validActionToApply, false, false);
                        }
                        finally {
                            actions.dispose();
                        }
                        return;
                    }
                    // Check to see if there is an action that we would have applied were it not invalid
                    if (newState.trigger.context) {
                        const invalidAction = this.z(newState.trigger, actions);
                        if (invalidAction && invalidAction.action.disabled) {
                            messageController_1.$M2.get(this.a)?.showMessage(invalidAction.action.disabled, newState.trigger.context.position);
                            actions.dispose();
                            return;
                        }
                    }
                }
                const includeDisabledActions = !!newState.trigger.filter?.include;
                if (newState.trigger.context) {
                    if (!actions.allActions.length || !includeDisabledActions && !actions.validActions.length) {
                        messageController_1.$M2.get(this.a)?.showMessage(newState.trigger.context.notAvailableMessage, newState.trigger.context.position);
                        this.f.value = actions;
                        actions.dispose();
                        return;
                    }
                }
                this.f.value = actions;
                this.showCodeActionList(actions, this.D(newState.position), { includeDisabledActions, fromLightbulb: false });
            }
            else {
                // auto magically triggered
                if (this.r.isVisible) {
                    // TODO: Figure out if we should update the showing menu?
                    actions.dispose();
                }
                else {
                    this.f.value = actions;
                }
            }
        }
        z(trigger, actions) {
            if (!actions.allActions.length) {
                return undefined;
            }
            if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length === 0)
                || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.allActions.length === 1)) {
                return actions.allActions.find(({ action }) => action.disabled);
            }
            return undefined;
        }
        C(trigger, actions) {
            if (!actions.validActions.length) {
                return undefined;
            }
            if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length > 0)
                || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.validActions.length === 1)) {
                return actions.validActions[0];
            }
            return undefined;
        }
        async showCodeActionList(actions, at, options) {
            const editorDom = this.a.getDomNode();
            if (!editorDom) {
                return;
            }
            const actionsToShow = options.includeDisabledActions && (this.g || actions.validActions.length === 0) ? actions.allActions : actions.validActions;
            if (!actionsToShow.length) {
                return;
            }
            const anchor = position_1.$js.isIPosition(at) ? this.D(at) : at;
            const delegate = {
                onSelect: async (action, preview) => {
                    this.u(action, /* retrigger */ true, !!preview);
                    this.r.hide();
                },
                onHide: () => {
                    this.a?.focus();
                },
                onFocus: async (action, token) => {
                    await action.resolve(token);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    return { canPreview: !!action.action.edit?.edits.length };
                }
            };
            this.r.show('codeActionWidget', true, (0, codeActionMenu_1.$I2)(actionsToShow, this.F(), this.h.getResolver()), delegate, anchor, editorDom, this.G(actions, at, options));
        }
        D(position) {
            if (!this.a.hasModel()) {
                return { x: 0, y: 0 };
            }
            this.a.revealPosition(position, 1 /* ScrollType.Immediate */);
            this.a.render();
            // Translate to absolute editor position
            const cursorCoords = this.a.getScrolledVisiblePosition(position);
            const editorCoords = (0, dom_1.$FO)(this.a.getDomNode());
            const x = editorCoords.left + cursorCoords.left;
            const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
            return { x, y };
        }
        F() {
            const model = this.a?.getModel();
            return this.n.getValue('editor.codeActionWidget.showHeaders', { resource: model?.uri });
        }
        G(actions, at, options) {
            if (options.fromLightbulb) {
                return [];
            }
            const resultActions = actions.documentation.map((command) => ({
                id: command.id,
                label: command.title,
                tooltip: command.tooltip ?? '',
                class: undefined,
                enabled: true,
                run: () => this.m.executeCommand(command.id, ...(command.arguments ?? [])),
            }));
            if (options.includeDisabledActions && actions.validActions.length > 0 && actions.allActions.length !== actions.validActions.length) {
                resultActions.push(this.g ? {
                    id: 'hideMoreActions',
                    label: (0, nls_1.localize)(0, null),
                    enabled: true,
                    tooltip: '',
                    class: undefined,
                    run: () => {
                        this.g = false;
                        return this.showCodeActionList(actions, at, options);
                    }
                } : {
                    id: 'showMoreActions',
                    label: (0, nls_1.localize)(1, null),
                    enabled: true,
                    tooltip: '',
                    class: undefined,
                    run: () => {
                        this.g = true;
                        return this.showCodeActionList(actions, at, options);
                    }
                });
            }
            return resultActions;
        }
    };
    exports.$Q2 = $Q2;
    exports.$Q2 = $Q2 = $Q2_1 = __decorate([
        __param(1, markers_1.$3s),
        __param(2, contextkey_1.$3i),
        __param(3, instantiation_1.$Ah),
        __param(4, languageFeatures_1.$hF),
        __param(5, progress_1.$7u),
        __param(6, commands_1.$Fr),
        __param(7, configuration_1.$8h),
        __param(8, actionWidget_1.$N2),
        __param(9, instantiation_1.$Ah)
    ], $Q2);
});
//# sourceMappingURL=codeActionController.js.map