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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/common/standaloneStrings", "vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode", "vs/nls!vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/base/common/strings", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/contrib/files/browser/fileConstants", "vs/editor/contrib/hover/browser/hover", "vs/platform/contextview/browser/contextView", "vs/editor/common/editorContextKeys", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/list/browser/listService", "vs/workbench/common/contextkeys", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/services/hover/browser/hover", "vs/base/browser/ui/aria/aria", "vs/workbench/contrib/accessibility/browser/accessibleViewActions", "vs/base/common/themables", "vs/base/common/codicons", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, lifecycle_1, codeEditorService_1, standaloneStrings_1, toggleTabFocusMode_1, nls_1, keybinding_1, accessibilityConfiguration_1, strings, instantiation_1, commands_1, fileConstants_1, hover_1, contextView_1, editorContextKeys_1, notificationsCommands_1, listService_1, contextkeys_1, accessibleView_1, hover_2, aria_1, accessibleViewActions_1, themables_1, codicons_1, inlineCompletionsController_1, inlineCompletionContextKeys_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gJb = exports.$fJb = exports.$eJb = exports.$dJb = exports.$cJb = void 0;
    class $cJb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$tGb.addImplementation(95, 'editor', async (accessor) => {
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const instantiationService = accessor.get(instantiation_1.$Ah);
                const commandService = accessor.get(commands_1.$Fr);
                let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                if (!codeEditor) {
                    await commandService.executeCommand(fileConstants_1.$oHb);
                    codeEditor = codeEditorService.getActiveCodeEditor();
                }
                accessibleViewService.show(instantiationService.createInstance(AccessibilityHelpProvider, codeEditor));
            }, editorContextKeys_1.EditorContextKeys.focus));
        }
    }
    exports.$cJb = $cJb;
    let AccessibilityHelpProvider = class AccessibilityHelpProvider {
        onClose() {
            this.b.focus();
        }
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.options = { type: "help" /* AccessibleViewType.Help */, readMoreUrl: 'https://go.microsoft.com/fwlink/?linkid=851010' };
            this.verbositySettingKey = "accessibility.verbosity.editor" /* AccessibilityVerbositySettingId.Editor */;
        }
        d(commandId, msg, noKbMsg) {
            const kb = this.c.lookupKeybinding(commandId);
            if (kb) {
                return strings.$ne(msg, kb.getAriaLabel());
            }
            return strings.$ne(noKbMsg, commandId);
        }
        provideContent() {
            const options = this.b.getOptions();
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
                content.push(this.d('editor.action.focusStickyScroll', standaloneStrings_1.AccessibilityHelpNLS.stickScrollKb, standaloneStrings_1.AccessibilityHelpNLS.stickScrollNoKb));
            }
            if (options.get(142 /* EditorOption.tabFocusMode */)) {
                content.push(this.d(toggleTabFocusMode_1.$30.ID, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOnMsg, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOnMsgNoKb));
            }
            else {
                content.push(this.d(toggleTabFocusMode_1.$30.ID, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOffMsg, standaloneStrings_1.AccessibilityHelpNLS.tabFocusModeOffMsgNoKb));
            }
            return content.join('\n\n');
        }
    };
    AccessibilityHelpProvider = __decorate([
        __param(1, keybinding_1.$2D)
    ], AccessibilityHelpProvider);
    class $dJb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.b = { language: 'typescript', type: "view" /* AccessibleViewType.View */ };
            this.B(accessibleViewActions_1.$uGb.addImplementation(95, 'hover', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                const editorHoverContent = editor ? hover_1.$Q6.get(editor)?.getWidgetContent() ?? undefined : undefined;
                if (!editor || !editorHoverContent) {
                    return false;
                }
                this.b.language = editor?.getModel()?.getLanguageId() ?? undefined;
                accessibleViewService.show({
                    verbositySettingKey: "accessibility.verbosity.hover" /* AccessibilityVerbositySettingId.Hover */,
                    provideContent() { return editorHoverContent; },
                    onClose() {
                        hover_1.$Q6.get(editor)?.focus();
                    },
                    options: this.b
                });
                return true;
            }, editorContextKeys_1.EditorContextKeys.hoverFocused));
            this.B(accessibleViewActions_1.$uGb.addImplementation(90, 'extension-hover', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const contextViewService = accessor.get(contextView_1.$VZ);
                const contextViewElement = contextViewService.getContextViewElement();
                const extensionHoverContent = contextViewElement?.textContent ?? undefined;
                const hoverService = accessor.get(hover_2.$zib);
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
                    options: this.b
                });
                return true;
            }));
            this.B(accessibleViewActions_1.$tGb.addImplementation(115, 'accessible-view', accessor => {
                accessor.get(accessibleView_1.$wqb).showAccessibleViewHelp();
                return true;
            }, accessibilityConfiguration_1.$jqb));
        }
    }
    exports.$dJb = $dJb;
    class $eJb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.B(accessibleViewActions_1.$uGb.addImplementation(90, 'notifications', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const listService = accessor.get(listService_1.$03);
                const commandService = accessor.get(commands_1.$Fr);
                function renderAccessibleView() {
                    const notification = (0, notificationsCommands_1.$_Ib)(listService);
                    if (!notification) {
                        return false;
                    }
                    commandService.executeCommand('notifications.showList');
                    let notificationIndex;
                    let length;
                    const list = listService.lastFocusedList;
                    if (list instanceof listService_1.$p4) {
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
                            return notification.source ? (0, nls_1.localize)(0, null, message, notification.source) : (0, nls_1.localize)(1, null, message);
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
                            $fJb(notificationIndex, length, 'next');
                            renderAccessibleView();
                        },
                        previous() {
                            if (!list) {
                                return;
                            }
                            focusList();
                            list.focusPrevious();
                            $fJb(notificationIndex, length, 'previous');
                            renderAccessibleView();
                        },
                        verbositySettingKey: "accessibility.verbosity.notification" /* AccessibilityVerbositySettingId.Notification */,
                        options: { type: "view" /* AccessibleViewType.View */ },
                        actions: getActionsFromNotification(notification)
                    });
                    return true;
                }
                return renderAccessibleView();
            }, contextkeys_1.$vdb));
        }
    }
    exports.$eJb = $eJb;
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
                action.class = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.bell);
                const initialAction = action.run;
                action.run = () => {
                    initialAction();
                    notification.close();
                };
            }
        }
        const manageExtension = actions?.find(a => a.label.includes('Manage Extension'));
        if (manageExtension) {
            manageExtension.class = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.gear);
        }
        if (actions) {
            actions.push({ id: 'clearNotification', label: (0, nls_1.localize)(2, null), tooltip: (0, nls_1.localize)(3, null), run: () => notification.close(), enabled: true, class: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.clearAll) });
        }
        return actions;
    }
    function $fJb(index, length, type) {
        if (index === undefined || length === undefined) {
            return;
        }
        const number = index + 1;
        if (type === 'next' && number + 1 <= length) {
            (0, aria_1.$$P)(`Focused ${number + 1} of ${length}`);
        }
        else if (type === 'previous' && number - 1 > 0) {
            (0, aria_1.$$P)(`Focused ${number - 1} of ${length}`);
        }
        return;
    }
    exports.$fJb = $fJb;
    class $gJb extends lifecycle_1.$kc {
        constructor() {
            super();
            this.b = { type: "view" /* AccessibleViewType.View */ };
            this.B(accessibleViewActions_1.$uGb.addImplementation(95, 'inline-completions', accessor => {
                const accessibleViewService = accessor.get(accessibleView_1.$wqb);
                const codeEditorService = accessor.get(codeEditorService_1.$nV);
                const show = () => {
                    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                    if (!editor) {
                        return false;
                    }
                    const model = inlineCompletionsController_1.$V8.get(editor)?.model.get();
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
                    this.b.language = editor.getModel()?.getLanguageId() ?? undefined;
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
                        options: this.b
                    });
                    return true;
                };
                contextkey_1.$Ii.and(inlineCompletionContextKeys_1.$95.inlineSuggestionVisible);
                return show();
            }));
        }
    }
    exports.$gJb = $gJb;
});
//# sourceMappingURL=accessibilityContributions.js.map