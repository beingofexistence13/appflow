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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/nls", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/commands/common/commands", "vs/editor/common/languages/modesRegistry", "vs/base/common/network", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/editor/browser/editorExtensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/formattedTextRenderer", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/platform", "vs/base/browser/ui/aria/aria", "vs/platform/registry/common/platform", "vs/workbench/common/configuration", "vs/workbench/services/output/common/output", "vs/workbench/services/search/common/search", "vs/css!./emptyTextEditorHint"], function (require, exports, dom, lifecycle_1, nls_1, editorStatus_1, commands_1, modesRegistry_1, network_1, event_1, configuration_1, editorExtensions_1, keybinding_1, editorGroupsService_1, formattedTextRenderer_1, fileTemplateSnippets_1, inlineChatSession_1, inlineChat_1, telemetry_1, productService_1, keybindingLabel_1, platform_1, aria_1, platform_2, configuration_2, output_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmptyTextEditorHintContribution = exports.emptyTextEditorHintSetting = void 0;
    const $ = dom.$;
    // TODO@joyceerhl remove this after a few iterations
    platform_2.Registry.as(configuration_2.Extensions.ConfigurationMigration)
        .registerConfigurationMigrations([{
            key: 'workbench.editor.untitled.hint',
            migrateFn: (value, _accessor) => ([
                [exports.emptyTextEditorHintSetting, { value }],
            ])
        },
        {
            key: 'accessibility.verbosity.untitledHint',
            migrateFn: (value, _accessor) => ([
                ["accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */, { value }],
            ])
        }]);
    exports.emptyTextEditorHintSetting = 'workbench.editor.empty.hint';
    let EmptyTextEditorHintContribution = class EmptyTextEditorHintContribution {
        static { this.ID = 'editor.contrib.emptyTextEditorHint'; }
        constructor(editor, editorGroupsService, commandService, configurationService, keybindingService, inlineChatSessionService, inlineChatService, telemetryService, productService) {
            this.editor = editor;
            this.editorGroupsService = editorGroupsService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.inlineChatService = inlineChatService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.toDispose = [];
            this.toDispose.push(this.editor.onDidChangeModel(() => this.update()));
            this.toDispose.push(this.editor.onDidChangeModelLanguage(() => this.update()));
            this.toDispose.push(this.editor.onDidChangeModelDecorations(() => this.update()));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(exports.emptyTextEditorHintSetting)) {
                    this.update();
                }
            }));
            this.toDispose.push(inlineChatSessionService.onWillStartSession(editor => {
                if (this.editor === editor) {
                    this.textHintContentWidget?.dispose();
                }
            }));
            this.toDispose.push(inlineChatSessionService.onDidEndSession(editor => {
                if (this.editor === editor) {
                    this.update();
                }
            }));
        }
        _shouldRenderHint() {
            const configValue = this.configurationService.getValue(exports.emptyTextEditorHintSetting);
            if (configValue === 'hidden') {
                return false;
            }
            if (this.editor.getOption(90 /* EditorOption.readOnly */)) {
                return false;
            }
            const model = this.editor.getModel();
            const languageId = model?.getLanguageId();
            if (!model || languageId === output_1.OUTPUT_MODE_ID || languageId === output_1.LOG_MODE_ID || languageId === search_1.SEARCH_RESULT_LANGUAGE_ID) {
                return false;
            }
            const conflictingDecoration = this.editor.getLineDecorations(1)?.find((d) => d.options.beforeContentClassName
                || d.options.afterContentClassName
                || d.options.before?.content
                || d.options.after?.content);
            if (conflictingDecoration) {
                return false;
            }
            const inlineChatProviders = [...this.inlineChatService.getAllProvider()];
            const shouldRenderDefaultHint = model?.uri.scheme === network_1.Schemas.untitled && languageId === modesRegistry_1.PLAINTEXT_LANGUAGE_ID && !inlineChatProviders.length;
            return inlineChatProviders.length > 0 || shouldRenderDefaultHint;
        }
        update() {
            this.textHintContentWidget?.dispose();
            if (this._shouldRenderHint()) {
                this.textHintContentWidget = new EmptyTextEditorHintContentWidget(this.editor, this.editorGroupsService, this.commandService, this.configurationService, this.keybindingService, this.inlineChatService, this.telemetryService, this.productService);
            }
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.toDispose);
            this.textHintContentWidget?.dispose();
        }
    };
    exports.EmptyTextEditorHintContribution = EmptyTextEditorHintContribution;
    exports.EmptyTextEditorHintContribution = EmptyTextEditorHintContribution = __decorate([
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, commands_1.ICommandService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, inlineChatSession_1.IInlineChatSessionService),
        __param(6, inlineChat_1.IInlineChatService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, productService_1.IProductService)
    ], EmptyTextEditorHintContribution);
    class EmptyTextEditorHintContentWidget {
        static { this.ID = 'editor.widget.emptyHint'; }
        constructor(editor, editorGroupsService, commandService, configurationService, keybindingService, inlineChatService, telemetryService, productService) {
            this.editor = editor;
            this.editorGroupsService = editorGroupsService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.keybindingService = keybindingService;
            this.inlineChatService = inlineChatService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.isVisible = false;
            this.ariaLabel = '';
            this.toDispose = new lifecycle_1.DisposableStore();
            this.toDispose.add(this.inlineChatService.onDidChangeProviders(() => this.onDidChangeModelContent()));
            this.toDispose.add(this.editor.onDidChangeModelContent(() => this.onDidChangeModelContent()));
            this.toDispose.add(this.editor.onDidChangeConfiguration((e) => {
                if (this.domNode && e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.editor.applyFontInfo(this.domNode);
                }
            }));
            const onDidFocusEditorText = event_1.Event.debounce(this.editor.onDidFocusEditorText, () => undefined, 500);
            this.toDispose.add(onDidFocusEditorText(() => {
                if (this.editor.hasTextFocus() && this.isVisible && this.ariaLabel && this.configurationService.getValue("accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */)) {
                    (0, aria_1.status)(this.ariaLabel);
                }
            }));
            this.onDidChangeModelContent();
        }
        onDidChangeModelContent() {
            if (!this.editor.getModel()?.getValueLength()) {
                this.editor.addContentWidget(this);
                this.isVisible = true;
            }
            else {
                this.editor.removeContentWidget(this);
                this.isVisible = false;
            }
        }
        getId() {
            return EmptyTextEditorHintContentWidget.ID;
        }
        _getHintInlineChat(providers) {
            const providerName = (providers.length === 1 ? providers[0].label : undefined) ?? this.productService.nameShort;
            const inlineChatId = 'inlineChat.start';
            let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
            const handleClick = () => {
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: 'inlineChat.hintAction',
                    from: 'hint'
                });
                void this.commandService.executeCommand(inlineChatId, { from: 'hint' });
            };
            const hintHandler = {
                disposables: this.toDispose,
                callback: (index, _event) => {
                    switch (index) {
                        case '0':
                            handleClick();
                            break;
                    }
                }
            };
            const hintElement = $('empty-hint-text');
            hintElement.style.display = 'block';
            const keybindingHint = this.keybindingService.lookupKeybinding(inlineChatId);
            const keybindingHintLabel = keybindingHint?.getLabel();
            if (keybindingHint && keybindingHintLabel) {
                const actionPart = (0, nls_1.localize)('emptyHintText', 'Press {0} to ask {1} to do something. ', keybindingHintLabel, providerName);
                const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
                    const hintPart = $('a', undefined, fragment);
                    hintPart.style.fontStyle = 'italic';
                    hintPart.style.cursor = 'pointer';
                    hintPart.onclick = handleClick;
                    return hintPart;
                });
                hintElement.appendChild(before);
                const label = new keybindingLabel_1.KeybindingLabel(hintElement, platform_1.OS);
                label.set(keybindingHint);
                label.element.style.width = 'min-content';
                label.element.style.display = 'inline';
                label.element.style.cursor = 'pointer';
                label.element.onclick = handleClick;
                hintElement.appendChild(after);
                const typeToDismiss = (0, nls_1.localize)('emptyHintTextDismiss', 'Start typing to dismiss.');
                const textHint2 = $('span', undefined, typeToDismiss);
                textHint2.style.fontStyle = 'italic';
                hintElement.appendChild(textHint2);
                ariaLabel = actionPart.concat(typeToDismiss);
            }
            else {
                const hintMsg = (0, nls_1.localize)({
                    key: 'inlineChatHint',
                    comment: [
                        'Preserve double-square brackets and their order',
                    ]
                }, '[[Ask {0} to do something]] or start typing to dismiss.', providerName);
                const rendered = (0, formattedTextRenderer_1.renderFormattedText)(hintMsg, { actionHandler: hintHandler });
                hintElement.appendChild(rendered);
            }
            return { ariaLabel, hintHandler, hintElement };
        }
        _getHintDefault() {
            const hintHandler = {
                disposables: this.toDispose,
                callback: (index, event) => {
                    switch (index) {
                        case '0':
                            languageOnClickOrTap(event.browserEvent);
                            break;
                        case '1':
                            snippetOnClickOrTap(event.browserEvent);
                            break;
                        case '2':
                            chooseEditorOnClickOrTap(event.browserEvent);
                            break;
                        case '3':
                            dontShowOnClickOrTap();
                            break;
                    }
                }
            };
            // the actual command handlers...
            const languageOnClickOrTap = async (e) => {
                e.stopPropagation();
                // Need to focus editor before so current editor becomes active and the command is properly executed
                this.editor.focus();
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: editorStatus_1.ChangeLanguageAction.ID,
                    from: 'hint'
                });
                await this.commandService.executeCommand(editorStatus_1.ChangeLanguageAction.ID, { from: 'hint' });
                this.editor.focus();
            };
            const snippetOnClickOrTap = async (e) => {
                e.stopPropagation();
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: fileTemplateSnippets_1.ApplyFileSnippetAction.Id,
                    from: 'hint'
                });
                await this.commandService.executeCommand(fileTemplateSnippets_1.ApplyFileSnippetAction.Id);
            };
            const chooseEditorOnClickOrTap = async (e) => {
                e.stopPropagation();
                const activeEditorInput = this.editorGroupsService.activeGroup.activeEditor;
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: 'welcome.showNewFileEntries',
                    from: 'hint'
                });
                const newEditorSelected = await this.commandService.executeCommand('welcome.showNewFileEntries', { from: 'hint' });
                // Close the active editor as long as it is untitled (swap the editors out)
                if (newEditorSelected && activeEditorInput !== null && activeEditorInput.resource?.scheme === network_1.Schemas.untitled) {
                    this.editorGroupsService.activeGroup.closeEditor(activeEditorInput, { preserveFocus: true });
                }
            };
            const dontShowOnClickOrTap = () => {
                this.configurationService.updateValue(exports.emptyTextEditorHintSetting, 'hidden');
                this.dispose();
                this.editor.focus();
            };
            const hintMsg = (0, nls_1.localize)({
                key: 'message',
                comment: [
                    'Preserve double-square brackets and their order',
                    'language refers to a programming language'
                ]
            }, '[[Select a language]], or [[fill with template]], or [[open a different editor]] to get started.\nStart typing to dismiss or [[don\'t show]] this again.');
            const hintElement = (0, formattedTextRenderer_1.renderFormattedText)(hintMsg, {
                actionHandler: hintHandler,
                renderCodeSegments: false,
            });
            hintElement.style.fontStyle = 'italic';
            // ugly way to associate keybindings...
            const keybindingsLookup = [editorStatus_1.ChangeLanguageAction.ID, fileTemplateSnippets_1.ApplyFileSnippetAction.Id, 'welcome.showNewFileEntries'];
            const keybindingLabels = keybindingsLookup.map((id) => this.keybindingService.lookupKeybinding(id)?.getLabel() ?? id);
            const ariaLabel = (0, nls_1.localize)('defaultHintAriaLabel', 'Execute {0} to select a language, execute {1} to fill with template, or execute {2} to open a different editor and get started. Start typing to dismiss.', ...keybindingLabels);
            for (const anchor of hintElement.querySelectorAll('a')) {
                anchor.style.cursor = 'pointer';
                const id = keybindingsLookup.shift();
                const title = id && this.keybindingService.lookupKeybinding(id)?.getLabel();
                anchor.title = title ?? '';
            }
            return { hintElement, ariaLabel };
        }
        getDomNode() {
            if (!this.domNode) {
                this.domNode = $('.empty-editor-hint');
                this.domNode.style.width = 'max-content';
                this.domNode.style.paddingLeft = '4px';
                const inlineChatProviders = [...this.inlineChatService.getAllProvider()];
                const { hintElement, ariaLabel } = !inlineChatProviders.length ? this._getHintDefault() : this._getHintInlineChat(inlineChatProviders);
                this.domNode.append(hintElement);
                this.ariaLabel = ariaLabel.concat((0, nls_1.localize)('disableHint', ' Toggle {0} in settings to disable this hint.', "accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */));
                this.toDispose.add(dom.addDisposableListener(this.domNode, 'click', () => {
                    this.editor.focus();
                }));
                this.editor.applyFontInfo(this.domNode);
            }
            return this.domNode;
        }
        getPosition() {
            return {
                position: { lineNumber: 1, column: 1 },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            this.editor.removeContentWidget(this);
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(EmptyTextEditorHintContribution.ID, EmptyTextEditorHintContribution, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to render a help message
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1wdHlUZXh0RWRpdG9ySGludC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9lbXB0eVRleHRFZGl0b3JIaW50L2VtcHR5VGV4dEVkaXRvckhpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0NoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLG9EQUFvRDtJQUNwRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQVUsQ0FBQyxzQkFBc0IsQ0FBQztTQUM3RSwrQkFBK0IsQ0FBQyxDQUFDO1lBQ2pDLEdBQUcsRUFBRSxnQ0FBZ0M7WUFDckMsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxrQ0FBMEIsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQ3ZDLENBQUM7U0FDRjtRQUNEO1lBQ0MsR0FBRyxFQUFFLHNDQUFzQztZQUMzQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQyxrR0FBa0QsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUM1RCxDQUFDO1NBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFUSxRQUFBLDBCQUEwQixHQUFHLDZCQUE2QixDQUFDO0lBQ2pFLElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQStCO2lCQUVwQixPQUFFLEdBQUcsb0NBQW9DLEFBQXZDLENBQXdDO1FBS2pFLFlBQ29CLE1BQW1CLEVBQ0MsbUJBQXlDLEVBQzlDLGNBQStCLEVBQ3ZCLG9CQUEyQyxFQUNoRCxpQkFBcUMsRUFDL0Msd0JBQW1ELEVBQ3ZDLGlCQUFxQyxFQUN4QyxnQkFBbUMsRUFDckMsY0FBK0I7WUFSOUMsV0FBTSxHQUFOLE1BQU0s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