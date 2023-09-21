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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/browser/codeAction", "vs/editor/contrib/codeAction/browser/codeActionKeybindingResolver", "vs/editor/contrib/codeAction/browser/codeActionMenu", "vs/editor/contrib/codeAction/browser/lightBulbWidget", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/actionWidget/browser/actionWidget", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/progress/common/progress", "../common/types", "./codeActionModel"], function (require, exports, dom_1, errors_1, lazy_1, lifecycle_1, position_1, languageFeatures_1, codeAction_1, codeActionKeybindingResolver_1, codeActionMenu_1, lightBulbWidget_1, messageController_1, nls_1, actionWidget_1, commands_1, configuration_1, contextkey_1, instantiation_1, markers_1, progress_1, types_1, codeActionModel_1) {
    "use strict";
    var CodeActionController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionController = void 0;
    let CodeActionController = class CodeActionController extends lifecycle_1.Disposable {
        static { CodeActionController_1 = this; }
        static { this.ID = 'editor.contrib.codeActionController'; }
        static get(editor) {
            return editor.getContribution(CodeActionController_1.ID);
        }
        constructor(editor, markerService, contextKeyService, instantiationService, languageFeaturesService, progressService, _commandService, _configurationService, _actionWidgetService, _instantiationService) {
            super();
            this._commandService = _commandService;
            this._configurationService = _configurationService;
            this._actionWidgetService = _actionWidgetService;
            this._instantiationService = _instantiationService;
            this._activeCodeActions = this._register(new lifecycle_1.MutableDisposable());
            this._showDisabled = false;
            this._disposed = false;
            this._editor = editor;
            this._model = this._register(new codeActionModel_1.CodeActionModel(this._editor, languageFeaturesService.codeActionProvider, markerService, contextKeyService, progressService));
            this._register(this._model.onDidChangeState(newState => this.update(newState)));
            this._lightBulbWidget = new lazy_1.Lazy(() => {
                const widget = this._editor.getContribution(lightBulbWidget_1.LightBulbWidget.ID);
                if (widget) {
                    this._register(widget.onClick(e => this.showCodeActionList(e.actions, e, { includeDisabledActions: false, fromLightbulb: true })));
                }
                return widget;
            });
            this._resolver = instantiationService.createInstance(codeActionKeybindingResolver_1.CodeActionKeybindingResolver);
            this._register(this._editor.onDidLayoutChange(() => this._actionWidgetService.hide()));
        }
        dispose() {
            this._disposed = true;
            super.dispose();
        }
        showCodeActions(_trigger, actions, at) {
            return this.showCodeActionList(actions, at, { includeDisabledActions: false, fromLightbulb: false });
        }
        hideCodeActions() {
            this._actionWidgetService.hide();
        }
        manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply) {
            if (!this._editor.hasModel()) {
                return;
            }
            messageController_1.MessageController.get(this._editor)?.closeMessage();
            const triggerPosition = this._editor.getPosition();
            this._trigger({ type: 1 /* CodeActionTriggerType.Invoke */, triggerAction, filter, autoApply, context: { notAvailableMessage, position: triggerPosition } });
        }
        _trigger(trigger) {
            return this._model.trigger(trigger);
        }
        async _applyCodeAction(action, retrigger, preview) {
            try {
                await this._instantiationService.invokeFunction(codeAction_1.applyCodeAction, action, codeAction_1.ApplyCodeActionReason.FromCodeActions, { preview, editor: this._editor });
            }
            finally {
                if (retrigger) {
                    this._trigger({ type: 2 /* CodeActionTriggerType.Auto */, triggerAction: types_1.CodeActionTriggerSource.QuickFix, filter: {} });
                }
            }
        }
        hideLightBulbWidget() {
            this._lightBulbWidget.rawValue?.hide();
        }
        async update(newState) {
            if (newState.type !== 1 /* CodeActionsState.Type.Triggered */) {
                this._lightBulbWidget.rawValue?.hide();
                return;
            }
            let actions;
            try {
                actions = await newState.actions;
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                return;
            }
            if (this._disposed) {
                return;
            }
            this._lightBulbWidget.value?.update(actions, newState.trigger, newState.position);
            if (newState.trigger.type === 1 /* CodeActionTriggerType.Invoke */) {
                if (newState.trigger.filter?.include) { // Triggered for specific scope
                    // Check to see if we want to auto apply.
                    const validActionToApply = this.tryGetValidActionToApply(newState.trigger, actions);
                    if (validActionToApply) {
                        try {
                            this._lightBulbWidget.value?.hide();
                            await this._applyCodeAction(validActionToApply, false, false);
                        }
                        finally {
                            actions.dispose();
                        }
                        return;
                    }
                    // Check to see if there is an action that we would have applied were it not invalid
                    if (newState.trigger.context) {
                        const invalidAction = this.getInvalidActionThatWouldHaveBeenApplied(newState.trigger, actions);
                        if (invalidAction && invalidAction.action.disabled) {
                            messageController_1.MessageController.get(this._editor)?.showMessage(invalidAction.action.disabled, newState.trigger.context.position);
                            actions.dispose();
                            return;
                        }
                    }
                }
                const includeDisabledActions = !!newState.trigger.filter?.include;
                if (newState.trigger.context) {
                    if (!actions.allActions.length || !includeDisabledActions && !actions.validActions.length) {
                        messageController_1.MessageController.get(this._editor)?.showMessage(newState.trigger.context.notAvailableMessage, newState.trigger.context.position);
                        this._activeCodeActions.value = actions;
                        actions.dispose();
                        return;
                    }
                }
                this._activeCodeActions.value = actions;
                this.showCodeActionList(actions, this.toCoords(newState.position), { includeDisabledActions, fromLightbulb: false });
            }
            else {
                // auto magically triggered
                if (this._actionWidgetService.isVisible) {
                    // TODO: Figure out if we should update the showing menu?
                    actions.dispose();
                }
                else {
                    this._activeCodeActions.value = actions;
                }
            }
        }
        getInvalidActionThatWouldHaveBeenApplied(trigger, actions) {
            if (!actions.allActions.length) {
                return undefined;
            }
            if ((trigger.autoApply === "first" /* CodeActionAutoApply.First */ && actions.validActions.length === 0)
                || (trigger.autoApply === "ifSingle" /* CodeActionAutoApply.IfSingle */ && actions.allActions.length === 1)) {
                return actions.allActions.find(({ action }) => action.disabled);
            }
            return undefined;
        }
        tryGetValidActionToApply(trigger, actions) {
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
            const editorDom = this._editor.getDomNode();
            if (!editorDom) {
                return;
            }
            const actionsToShow = options.includeDisabledActions && (this._showDisabled || actions.validActions.length === 0) ? actions.allActions : actions.validActions;
            if (!actionsToShow.length) {
                return;
            }
            const anchor = position_1.Position.isIPosition(at) ? this.toCoords(at) : at;
            const delegate = {
                onSelect: async (action, preview) => {
                    this._applyCodeAction(action, /* retrigger */ true, !!preview);
                    this._actionWidgetService.hide();
                },
                onHide: () => {
                    this._editor?.focus();
                },
                onFocus: async (action, token) => {
                    await action.resolve(token);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    return { canPreview: !!action.action.edit?.edits.length };
                }
            };
            this._actionWidgetService.show('codeActionWidget', true, (0, codeActionMenu_1.toMenuItems)(actionsToShow, this._shouldShowHeaders(), this._resolver.getResolver()), delegate, anchor, editorDom, this._getActionBarActions(actions, at, options));
        }
        toCoords(position) {
            if (!this._editor.hasModel()) {
                return { x: 0, y: 0 };
            }
            this._editor.revealPosition(position, 1 /* ScrollType.Immediate */);
            this._editor.render();
            // Translate to absolute editor position
            const cursorCoords = this._editor.getScrolledVisiblePosition(position);
            const editorCoords = (0, dom_1.getDomNodePagePosition)(this._editor.getDomNode());
            const x = editorCoords.left + cursorCoords.left;
            const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
            return { x, y };
        }
        _shouldShowHeaders() {
            const model = this._editor?.getModel();
            return this._configurationService.getValue('editor.codeActionWidget.showHeaders', { resource: model?.uri });
        }
        _getActionBarActions(actions, at, options) {
            if (options.fromLightbulb) {
                return [];
            }
            const resultActions = actions.documentation.map((command) => ({
                id: command.id,
                label: command.title,
                tooltip: command.tooltip ?? '',
                class: undefined,
                enabled: true,
                run: () => this._commandService.executeCommand(command.id, ...(command.arguments ?? [])),
            }));
            if (options.includeDisabledActions && actions.validActions.length > 0 && actions.allActions.length !== actions.validActions.length) {
                resultActions.push(this._showDisabled ? {
                    id: 'hideMoreActions',
                    label: (0, nls_1.localize)('hideMoreActions', 'Hide Disabled'),
                    enabled: true,
                    tooltip: '',
                    class: undefined,
                    run: () => {
                        this._showDisabled = false;
                        return this.showCodeActionList(actions, at, options);
                    }
                } : {
                    id: 'showMoreActions',
                    label: (0, nls_1.localize)('showMoreActions', 'Show Disabled'),
                    enabled: true,
                    tooltip: '',
                    class: undefined,
                    run: () => {
                        this._showDisabled = true;
                        return this.showCodeActionList(actions, at, options);
                    }
                });
            }
            return resultActions;
        }
    };
    exports.CodeActionController = CodeActionController;
    exports.CodeActionController = CodeActionController = CodeActionController_1 = __decorate([
        __param(1, markers_1.IMarkerService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, languageFeatures_1.ILanguageFeaturesService),
        __param(5, progress_1.IEditorProgressService),
        __param(6, commands_1.ICommandService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, actionWidget_1.IActionWidgetService),
        __param(9, instantiation_1.IInstantiationService)
    ], CodeActionController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbkNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9jb2RlQWN0aW9uL2Jyb3dzZXIvY29kZUFjdGlvbkNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXFDekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBVTs7aUJBRTVCLE9BQUUsR0FBRyxxQ0FBcUMsQUFBeEMsQ0FBeUM7UUFFM0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQXVCLHNCQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFhRCxZQUNDLE1BQW1CLEVBQ0gsYUFBNkIsRUFDekIsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUN4Qyx1QkFBaUQsRUFDbkQsZUFBdUMsRUFDOUMsZUFBaUQsRUFDM0MscUJBQTZELEVBQzlELG9CQUEyRCxFQUMxRCxxQkFBNkQ7WUFFcEYsS0FBSyxFQUFFLENBQUM7WUFMMEIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQzFCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDN0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUN6QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBakJwRSx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQWlCLENBQUMsQ0FBQztZQUNyRixrQkFBYSxHQUFHLEtBQUssQ0FBQztZQUl0QixjQUFTLEdBQUcsS0FBSyxDQUFDO1lBZ0J6QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxpQ0FBZSxDQUFDLElB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