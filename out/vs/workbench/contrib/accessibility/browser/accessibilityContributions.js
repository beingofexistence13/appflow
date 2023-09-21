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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/standaloneStrings", "vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode", "vs/nls", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/contrib/files/browser/fileConstants", "vs/editor/contrib/hover/browser/hover", "vs/platform/contextview/browser/contextView", "vs/editor/common/editorContextKeys", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/list/browser/listService", "vs/workbench/common/contextkeys", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/services/hover/browser/hover", "vs/base/browser/ui/aria/aria", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/base/common/themables", "vs/base/common/codicons", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, lifecycle_1, codeEditorService_1, standaloneStrings_1, toggleTabFocusMode_1, nls_1, keybinding_1, accessibilityConfiguration_1, strings, instantiation_1, commands_1, fileConstants_1, hover_1, contextView_1, editorContextKeys_1, notificationsCommands_1, listService_1, contextkeys_1, accessibleView_1, hover_2, aria_1, accessibleViewActions_1, themables_1, codicons_1, inlineCompletionsController_1, inlineCompletionContextKeys_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionsAccessibleViewContribution = exports.alertFocusChange = exports.NotificationAccessibleViewContribution = exports.HoverAccessibleViewContribution = exports.EditorAccessibilityHelpContribution = void 0;
    class EditorAccessibilityHelpContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(95, 'editor', async (accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const instantiationService = accessor.get(instantiation_1.IInstantiationService);
                const commandService = accessor.get(commands_1.ICommandService);
                let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                if (!codeEditor) {
                    await commandService.executeCommand(fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID);
                    codeEditor = codeEditorService.getActiveCodeEditor();
                }
                accessibleViewService.show(instantiationService.createInstance(AccessibilityHelpProvider, codeEditor));
            }, editorContextKeys_1.EditorContextKeys.focus));
        }
    }
    exports.EditorAccessibilityHelpContribution = EditorAccessibilityHelpContribution;
    let AccessibilityHelpProvider = class AccessibilityHelpProvider {
        onClose() {
            this._editor.focus();
        }
        constructor(_editor, _keybindingService) {
            this._editor = _editor;
            this._keybindingService = _keybindingService;
            this.options = { type: "help" /* AccessibleViewType.Help */, readMoreUrl: 'https://go.microsoft.com/fwlink/?linkid=851010' };
            this.verbositySettingKey = "accessibility.verbosity.editor" /* AccessibilityVerbositySettingId.Editor */;
        }
        _descriptionForCommand(commandId, msg, noKbMsg) {
            const kb = this._keybindingService.lookupKeybinding(commandId);
            if (kb) {
                return strings.format(msg, kb.getAriaLabel());
            }
            return strings.format(noKbMsg, commandId);
        }
        provideContent() {
            const options = this._editor.getOptions();
            const content = [];
            if (options.get(61 /* EditorOption.inDiffEditor */)) {
                if (options.get(90 /* EditorOption.readOnly */)) {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.readonlyDiffEditor);
                }
                else {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.editableDiffEditor);
                }
            }
            else {
                if (options.get(90 /* EditorOption.readOnly */)) {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.readonlyEditor);
                }
                else {
                    content.push(standaloneStrings_1.AccessibilityHelpNLS.editableEditor);
                }
            }
            if (options.get(114 /* EditorOption.stickyScroll */).enabled) {
                content.push(this._descriptionForCommand('editor.action.focusStickyScroll', standaloneStrings_1.AccessibilityHelpNLS.stickScrollKb, standaloneStrings_1.AccessibilityHelpNLS.stickScrollNoKb));
            }
            if (options.get(142 /* EditorOption.tabFocusMode */)) {
                content.push(this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOnMsg, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOnMsgNoKb));
            }
            else {
                content.push(this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOffMsg, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOffMsgNoKb));
            }
            return content.join('\n\n');
        }
    };
    AccessibilityHelpProvider = __decorate([
        __param(1, keybinding_1.IKeybindingService)
    ], AccessibilityHelpProvider);
    class HoverAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._options = { language: 'typescript', type: "view" /* AccessibleViewType.View */ };
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(95, 'hover', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                const editorHoverContent = editor ? hover_1.ModesHoverController.get(editor)?.getWidgetContent() ?? undefined : undefined;
                if (!editor || !editorHoverContent) {
                    return false;
                }
                this._options.language = editor?.getModel()?.getLanguageId() ?? undefined;
                accessibleViewService.show({
                    verbositySettingKey: "accessibility.verbosity.hover" /* AccessibilityVerbositySettingId.Hover */,
                    provideContent() { return editorHoverContent; },
                    onClose() {
                        hover_1.ModesHoverController.get(editor)?.focus();
                    },
                    options: this._options
                });
                return true;
            }, editorContextKeys_1.EditorContextKeys.hoverFocused));
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(90, 'extension-hover', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const contextViewService = accessor.get(contextView_1.IContextViewService);
                const contextViewElement = contextViewService.getContextViewElement();
                const extensionHoverContent = contextViewElement?.textContent ?? undefined;
                const hoverService = accessor.get(hover_2.IHoverService);
                if (contextViewElement.classList.contains('accessible-view-container') || !extensionHoverContent) {
                    // The accessible view, itself, uses the context view service to display the text. We don't want to read that.
                    return false;
                }
                accessibleViewService.show({
                    verbositySettingKey: "accessibility.verbosity.hover" /* AccessibilityVerbositySettingId.Hover */,
                    provideContent() { return extensionHoverContent; },
                    onClose() {
                        hoverService.showAndFocusLastHover();
                    },
                    options: this._options
                });
                return true;
            }));
            this._register(accessibleViewActions_1.AccessibilityHelpAction.addImplementation(115, 'accessible-view', accessor => {
                accessor.get(accessibleView_1.IAccessibleViewService).showAccessibleViewHelp();
                return true;
            }, accessibilityConfiguration_1.accessibleViewIsShown));
        }
    }
    exports.HoverAccessibleViewContribution = HoverAccessibleViewContribution;
    class NotificationAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(90, 'notifications', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const listService = accessor.get(listService_1.IListService);
                const commandService = accessor.get(commands_1.ICommandService);
                function renderAccessibleView() {
                    const notification = (0, notificationsCommands_1.getNotificationFromContext)(listService);
                    if (!notification) {
                        return false;
                    }
                    commandService.executeCommand('notifications.showList');
                    let notificationIndex;
                    let length;
                    const list = listService.lastFocusedList;
                    if (list instanceof listService_1.WorkbenchList) {
                        notificationIndex = list.indexOf(notification);
                        length = list.length;
                    }
                    if (notificationIndex === undefined) {
                        return false;
                    }
                    function focusList() {
                        commandService.executeCommand('notifications.showList');
                        if (list && notificationIndex !== undefined) {
                            list.domFocus();
                            try {
                                list.setFocus([notificationIndex]);
                            }
                            catch { }
                        }
                    }
                    const message = notification.message.original.toString();
                    if (!message) {
                        return false;
                    }
                    notification.onDidClose(() => accessibleViewService.next());
                    accessibleViewService.show({
                        provideContent: () => {
                            return notification.source ? (0, nls_1.localize)('notification.accessibleViewSrc', '{0} Source: {1}', message, notification.source) : (0, nls_1.localize)('notification.accessibleView', '{0}', message);
                        },
                        onClose() {
                            focusList();
                        },
                        next() {
                            if (!list) {
                                return;
                            }
                            focusList();
                            list.focusNext();
                            alertFocusChange(notificationIndex, length, 'next');
                            renderAccessibleView();
                        },
                        previous() {
                            if (!list) {
                                return;
                            }
                            focusList();
                            list.focusPrevious();
                            alertFocusChange(notificationIndex, length, 'previous');
                            renderAccessibleView();
                        },
                        verbositySettingKey: "accessibility.verbosity.notification" /* AccessibilityVerbositySettingId.Notification */,
                        options: { type: "view" /* AccessibleViewType.View */ },
                        actions: getActionsFromNotification(notification)
                    });
                    return true;
                }
                return renderAccessibleView();
            }, contextkeys_1.NotificationFocusedContext));
        }
    }
    exports.NotificationAccessibleViewContribution = NotificationAccessibleViewContribution;
    function getActionsFromNotification(notification) {
        let actions = undefined;
        if (notification.actions) {
            actions = [];
            if (notification.actions.primary) {
                actions.push(...notification.actions.primary);
            }
            if (notification.actions.secondary) {
                actions.push(...notification.actions.secondary);
            }
        }
        if (actions) {
            for (const action of actions) {
                action.class = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.bell);
                const initialAction = action.run;
                action.run = () => {
                    initialAction();
                    notification.close();
                };
            }
        }
        const manageExtension = actions?.find(a => a.label.includes('Manage Extension'));
        if (manageExtension) {
            manageExtension.class = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.gear);
        }
        if (actions) {
            actions.push({ id: 'clearNotification', label: (0, nls_1.localize)('clearNotification', "Clear Notification"), tooltip: (0, nls_1.localize)('clearNotification', "Clear Notification"), run: () => notification.close(), enabled: true, class: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.clearAll) });
        }
        return actions;
    }
    function alertFocusChange(index, length, type) {
        if (index === undefined || length === undefined) {
            return;
        }
        const number = index + 1;
        if (type === 'next' && number + 1 <= length) {
            (0, aria_1.alert)(`Focused ${number + 1} of ${length}`);
        }
        else if (type === 'previous' && number - 1 > 0) {
            (0, aria_1.alert)(`Focused ${number - 1} of ${length}`);
        }
        return;
    }
    exports.alertFocusChange = alertFocusChange;
    class InlineCompletionsAccessibleViewContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._options = { type: "view" /* AccessibleViewType.View */ };
            this._register(accessibleViewActions_1.AccessibleViewAction.addImplementation(95, 'inline-completions', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.IAccessibleViewService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const show = () => {
                    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                    if (!editor) {
                        return false;
                    }
                    const model = inlineCompletionsController_1.InlineCompletionsController.get(editor)?.model.get();
                    const state = model?.state.get();
                    if (!model || !state) {
                        return false;
                    }
                    const lineText = model.textModel.getLineContent(state.ghostText.lineNumber);
                    if (!lineText) {
                        return false;
                    }
                    const ghostText = state.ghostText.renderForScreenReader(lineText);
                    if (!ghostText) {
                        return false;
                    }
                    this._options.language = editor.getModel()?.getLanguageId() ?? undefined;
                    accessibleViewService.show({
                        verbositySettingKey: "accessibility.verbosity.inlineCompletions" /* AccessibilityVerbositySettingId.InlineCompletions */,
                        provideContent() { return lineText + ghostText; },
                        onClose() {
                            model.stop();
                            editor.focus();
                        },
                        next() {
                            model.next();
                            setTimeout(() => show(), 50);
                        },
                        previous() {
                            model.previous();
                            setTimeout(() => show(), 50);
                        },
                        options: this._options
                    });
                    return true;
                };
                contextkey_1.ContextKeyExpr.and(inlineCompletionContextKeys_1.InlineCompletionContextKeys.inlineSuggestionVisible);
                return show();
            }));
        }
    }
    exports.InlineCompletionsAccessibleViewContribution = InlineCompletionsAccessibleViewContribution;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eUNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvYWNjZXNzaWJpbGl0eUNvbnRyaWJ1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0NoRyxNQUFhLG1DQUFvQyxTQUFRLHNCQUFVO1FBRWxFO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsU0FBUyxDQUFDLCtDQUF1QixDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDLFFBQVEsRUFBQyxFQUFFO2dCQUN2RixNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0NBQWtCLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHVDQUFzQixDQUFDLENBQUM7Z0JBQ25FLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztnQkFDckQsSUFBSSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2dCQUNyRyxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNoQixNQUFNLGNBQWMsQ0FBQyxjQUFjLENBQUMsNENBQTRCLENBQUMsQ0FBQztvQkFDbEUsVUFBVSxHQUFHLGlCQUFpQixDQUFDLG1CQUFtQixFQUFHLENBQUM7aUJBQ3REO2dCQUNELHFCQUFxQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUJBQXlCLEVBQUUsVUFB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