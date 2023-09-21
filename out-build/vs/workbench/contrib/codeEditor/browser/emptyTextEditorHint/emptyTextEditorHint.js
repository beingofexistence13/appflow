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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/commands/common/commands", "vs/editor/common/languages/modesRegistry", "vs/base/common/network", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/editor/browser/editorExtensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/browser/formattedTextRenderer", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/inlineChat/browser/inlineChatSession", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/platform/telemetry/common/telemetry", "vs/platform/product/common/productService", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/platform", "vs/base/browser/ui/aria/aria", "vs/platform/registry/common/platform", "vs/workbench/common/configuration", "vs/workbench/services/output/common/output", "vs/workbench/services/search/common/search", "vs/css!./emptyTextEditorHint"], function (require, exports, dom, lifecycle_1, nls_1, editorStatus_1, commands_1, modesRegistry_1, network_1, event_1, configuration_1, editorExtensions_1, keybinding_1, editorGroupsService_1, formattedTextRenderer_1, fileTemplateSnippets_1, inlineChatSession_1, inlineChat_1, telemetry_1, productService_1, keybindingLabel_1, platform_1, aria_1, platform_2, configuration_2, output_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dFb = exports.$cFb = void 0;
    const $ = dom.$;
    // TODO@joyceerhl remove this after a few iterations
    platform_2.$8m.as(configuration_2.$az.ConfigurationMigration)
        .registerConfigurationMigrations([{
            key: 'workbench.editor.untitled.hint',
            migrateFn: (value, _accessor) => ([
                [exports.$cFb, { value }],
            ])
        },
        {
            key: 'accessibility.verbosity.untitledHint',
            migrateFn: (value, _accessor) => ([
                ["accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */, { value }],
            ])
        }]);
    exports.$cFb = 'workbench.editor.empty.hint';
    let $dFb = class $dFb {
        static { this.ID = 'editor.contrib.emptyTextEditorHint'; }
        constructor(c, f, g, h, i, inlineChatSessionService, j, k, l) {
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.a = [];
            this.a.push(this.c.onDidChangeModel(() => this.n()));
            this.a.push(this.c.onDidChangeModelLanguage(() => this.n()));
            this.a.push(this.c.onDidChangeModelDecorations(() => this.n()));
            this.a.push(this.h.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(exports.$cFb)) {
                    this.n();
                }
            }));
            this.a.push(inlineChatSessionService.onWillStartSession(editor => {
                if (this.c === editor) {
                    this.b?.dispose();
                }
            }));
            this.a.push(inlineChatSessionService.onDidEndSession(editor => {
                if (this.c === editor) {
                    this.n();
                }
            }));
        }
        m() {
            const configValue = this.h.getValue(exports.$cFb);
            if (configValue === 'hidden') {
                return false;
            }
            if (this.c.getOption(90 /* EditorOption.readOnly */)) {
                return false;
            }
            const model = this.c.getModel();
            const languageId = model?.getLanguageId();
            if (!model || languageId === output_1.$9I || languageId === output_1.$_I || languageId === search_1.$mI) {
                return false;
            }
            const conflictingDecoration = this.c.getLineDecorations(1)?.find((d) => d.options.beforeContentClassName
                || d.options.afterContentClassName
                || d.options.before?.content
                || d.options.after?.content);
            if (conflictingDecoration) {
                return false;
            }
            const inlineChatProviders = [...this.j.getAllProvider()];
            const shouldRenderDefaultHint = model?.uri.scheme === network_1.Schemas.untitled && languageId === modesRegistry_1.$Yt && !inlineChatProviders.length;
            return inlineChatProviders.length > 0 || shouldRenderDefaultHint;
        }
        n() {
            this.b?.dispose();
            if (this.m()) {
                this.b = new EmptyTextEditorHintContentWidget(this.c, this.f, this.g, this.h, this.i, this.j, this.k, this.l);
            }
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.a);
            this.b?.dispose();
        }
    };
    exports.$dFb = $dFb;
    exports.$dFb = $dFb = __decorate([
        __param(1, editorGroupsService_1.$5C),
        __param(2, commands_1.$Fr),
        __param(3, configuration_1.$8h),
        __param(4, keybinding_1.$2D),
        __param(5, inlineChatSession_1.$bqb),
        __param(6, inlineChat_1.$dz),
        __param(7, telemetry_1.$9k),
        __param(8, productService_1.$kj)
    ], $dFb);
    class EmptyTextEditorHintContentWidget {
        static { this.a = 'editor.widget.emptyHint'; }
        constructor(h, i, j, k, l, m, n, o) {
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.n = n;
            this.o = o;
            this.f = false;
            this.g = '';
            this.c = new lifecycle_1.$jc();
            this.c.add(this.m.onDidChangeProviders(() => this.p()));
            this.c.add(this.h.onDidChangeModelContent(() => this.p()));
            this.c.add(this.h.onDidChangeConfiguration((e) => {
                if (this.b && e.hasChanged(50 /* EditorOption.fontInfo */)) {
                    this.h.applyFontInfo(this.b);
                }
            }));
            const onDidFocusEditorText = event_1.Event.debounce(this.h.onDidFocusEditorText, () => undefined, 500);
            this.c.add(onDidFocusEditorText(() => {
                if (this.h.hasTextFocus() && this.f && this.g && this.k.getValue("accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */)) {
                    (0, aria_1.$_P)(this.g);
                }
            }));
            this.p();
        }
        p() {
            if (!this.h.getModel()?.getValueLength()) {
                this.h.addContentWidget(this);
                this.f = true;
            }
            else {
                this.h.removeContentWidget(this);
                this.f = false;
            }
        }
        getId() {
            return EmptyTextEditorHintContentWidget.a;
        }
        q(providers) {
            const providerName = (providers.length === 1 ? providers[0].label : undefined) ?? this.o.nameShort;
            const inlineChatId = 'inlineChat.start';
            let ariaLabel = `Ask ${providerName} something or start typing to dismiss.`;
            const handleClick = () => {
                this.n.publicLog2('workbenchActionExecuted', {
                    id: 'inlineChat.hintAction',
                    from: 'hint'
                });
                void this.j.executeCommand(inlineChatId, { from: 'hint' });
            };
            const hintHandler = {
                disposables: this.c,
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
            const keybindingHint = this.l.lookupKeybinding(inlineChatId);
            const keybindingHintLabel = keybindingHint?.getLabel();
            if (keybindingHint && keybindingHintLabel) {
                const actionPart = (0, nls_1.localize)(0, null, keybindingHintLabel, providerName);
                const [before, after] = actionPart.split(keybindingHintLabel).map((fragment) => {
                    const hintPart = $('a', undefined, fragment);
                    hintPart.style.fontStyle = 'italic';
                    hintPart.style.cursor = 'pointer';
                    hintPart.onclick = handleClick;
                    return hintPart;
                });
                hintElement.appendChild(before);
                const label = new keybindingLabel_1.$TR(hintElement, platform_1.OS);
                label.set(keybindingHint);
                label.element.style.width = 'min-content';
                label.element.style.display = 'inline';
                label.element.style.cursor = 'pointer';
                label.element.onclick = handleClick;
                hintElement.appendChild(after);
                const typeToDismiss = (0, nls_1.localize)(1, null);
                const textHint2 = $('span', undefined, typeToDismiss);
                textHint2.style.fontStyle = 'italic';
                hintElement.appendChild(textHint2);
                ariaLabel = actionPart.concat(typeToDismiss);
            }
            else {
                const hintMsg = (0, nls_1.localize)(2, null, providerName);





                const rendered = (0, formattedTextRenderer_1.$7P)(hintMsg, { actionHandler: hintHandler });
                hintElement.appendChild(rendered);
            }
            return { ariaLabel, hintHandler, hintElement };
        }
        r() {
            const hintHandler = {
                disposables: this.c,
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
                this.h.focus();
                this.n.publicLog2('workbenchActionExecuted', {
                    id: editorStatus_1.$Nvb.ID,
                    from: 'hint'
                });
                await this.j.executeCommand(editorStatus_1.$Nvb.ID, { from: 'hint' });
                this.h.focus();
            };
            const snippetOnClickOrTap = async (e) => {
                e.stopPropagation();
                this.n.publicLog2('workbenchActionExecuted', {
                    id: fileTemplateSnippets_1.$bFb.Id,
                    from: 'hint'
                });
                await this.j.executeCommand(fileTemplateSnippets_1.$bFb.Id);
            };
            const chooseEditorOnClickOrTap = async (e) => {
                e.stopPropagation();
                const activeEditorInput = this.i.activeGroup.activeEditor;
                this.n.publicLog2('workbenchActionExecuted', {
                    id: 'welcome.showNewFileEntries',
                    from: 'hint'
                });
                const newEditorSelected = await this.j.executeCommand('welcome.showNewFileEntries', { from: 'hint' });
                // Close the active editor as long as it is untitled (swap the editors out)
                if (newEditorSelected && activeEditorInput !== null && activeEditorInput.resource?.scheme === network_1.Schemas.untitled) {
                    this.i.activeGroup.closeEditor(activeEditorInput, { preserveFocus: true });
                }
            };
            const dontShowOnClickOrTap = () => {
                this.k.updateValue(exports.$cFb, 'hidden');
                this.dispose();
                this.h.focus();
            };
            const hintMsg = (0, nls_1.localize)(3, null);






            const hintElement = (0, formattedTextRenderer_1.$7P)(hintMsg, {
                actionHandler: hintHandler,
                renderCodeSegments: false,
            });
            hintElement.style.fontStyle = 'italic';
            // ugly way to associate keybindings...
            const keybindingsLookup = [editorStatus_1.$Nvb.ID, fileTemplateSnippets_1.$bFb.Id, 'welcome.showNewFileEntries'];
            const keybindingLabels = keybindingsLookup.map((id) => this.l.lookupKeybinding(id)?.getLabel() ?? id);
            const ariaLabel = (0, nls_1.localize)(4, null, ...keybindingLabels);
            for (const anchor of hintElement.querySelectorAll('a')) {
                anchor.style.cursor = 'pointer';
                const id = keybindingsLookup.shift();
                const title = id && this.l.lookupKeybinding(id)?.getLabel();
                anchor.title = title ?? '';
            }
            return { hintElement, ariaLabel };
        }
        getDomNode() {
            if (!this.b) {
                this.b = $('.empty-editor-hint');
                this.b.style.width = 'max-content';
                this.b.style.paddingLeft = '4px';
                const inlineChatProviders = [...this.m.getAllProvider()];
                const { hintElement, ariaLabel } = !inlineChatProviders.length ? this.r() : this.q(inlineChatProviders);
                this.b.append(hintElement);
                this.g = ariaLabel.concat((0, nls_1.localize)(5, null, "accessibility.verbosity.emptyEditorHint" /* AccessibilityVerbositySettingId.EmptyEditorHint */));
                this.c.add(dom.$nO(this.b, 'click', () => {
                    this.h.focus();
                }));
                this.h.applyFontInfo(this.b);
            }
            return this.b;
        }
        getPosition() {
            return {
                position: { lineNumber: 1, column: 1 },
                preference: [0 /* ContentWidgetPositionPreference.EXACT */]
            };
        }
        dispose() {
            this.h.removeContentWidget(this);
            (0, lifecycle_1.$fc)(this.c);
        }
    }
    (0, editorExtensions_1.$AV)($dFb.ID, $dFb, 0 /* EditorContributionInstantiation.Eager */); // eager because it needs to render a help message
});
//# sourceMappingURL=emptyTextEditorHint.js.map