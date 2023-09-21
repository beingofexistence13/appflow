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
define(["require", "exports", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls!vs/workbench/contrib/format/browser/formatActionsMultiple", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/format/browser/format", "vs/editor/common/core/range", "vs/platform/telemetry/common/telemetry", "vs/platform/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contributions", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/editor/common/languages/language", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/editor/common/config/editorConfigurationSchema", "vs/platform/dialogs/common/dialogs", "vs/editor/common/services/languageFeatures", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/base/common/uuid"], function (require, exports, editorBrowser_1, editorExtensions_1, editorContextKeys_1, nls, contextkey_1, quickInput_1, cancellation_1, instantiation_1, format_1, range_1, telemetry_1, extensions_1, platform_1, configurationRegistry_1, contributions_1, extensions_2, lifecycle_1, configuration_1, notification_1, language_1, extensionManagement_1, editorConfigurationSchema_1, dialogs_1, languageFeatures_1, languageStatusService_1, editorService_1, commands_1, uuid_1) {
    "use strict";
    var DefaultFormatter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let DefaultFormatter = class DefaultFormatter extends lifecycle_1.$kc {
        static { DefaultFormatter_1 = this; }
        static { this.configName = 'editor.defaultFormatter'; }
        static { this.extensionIds = []; }
        static { this.extensionItemLabels = []; }
        static { this.extensionDescriptions = []; }
        constructor(f, g, h, j, m, n, r, t, u, w) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.t = t;
            this.u = u;
            this.w = w;
            this.c = this.q.add(new lifecycle_1.$jc());
            this.q.add(this.f.onDidChangeExtensions(this.y, this));
            this.q.add(format_1.$E8.setFormatterSelector((formatter, document, mode) => this.C(formatter, document, mode)));
            this.q.add(w.onDidActiveEditorChange(this.F, this));
            this.q.add(t.documentFormattingEditProvider.onDidChange(this.F, this));
            this.q.add(t.documentRangeFormattingEditProvider.onDidChange(this.F, this));
            this.q.add(h.onDidChangeConfiguration(e => e.affectsConfiguration(DefaultFormatter_1.configName) && this.F()));
            this.y();
        }
        async y() {
            await this.f.whenInstalledExtensionsRegistered();
            let extensions = [...this.f.extensions];
            extensions = extensions.sort((a, b) => {
                const boostA = a.categories?.find(cat => cat === 'Formatters' || cat === 'Programming Languages');
                const boostB = b.categories?.find(cat => cat === 'Formatters' || cat === 'Programming Languages');
                if (boostA && !boostB) {
                    return -1;
                }
                else if (!boostA && boostB) {
                    return 1;
                }
                else {
                    return a.name.localeCompare(b.name);
                }
            });
            DefaultFormatter_1.extensionIds.length = 0;
            DefaultFormatter_1.extensionItemLabels.length = 0;
            DefaultFormatter_1.extensionDescriptions.length = 0;
            DefaultFormatter_1.extensionIds.push(null);
            DefaultFormatter_1.extensionItemLabels.push(nls.localize(0, null));
            DefaultFormatter_1.extensionDescriptions.push(nls.localize(1, null));
            for (const extension of extensions) {
                if (extension.main || extension.browser) {
                    DefaultFormatter_1.extensionIds.push(extension.identifier.value);
                    DefaultFormatter_1.extensionItemLabels.push(extension.displayName ?? '');
                    DefaultFormatter_1.extensionDescriptions.push(extension.description ?? '');
                }
            }
        }
        static _maybeQuotes(s) {
            return s.match(/\s/) ? `'${s}'` : s;
        }
        async z(formatter, document) {
            const defaultFormatterId = this.h.getValue(DefaultFormatter_1.configName, {
                resource: document.uri,
                overrideIdentifier: document.getLanguageId()
            });
            if (defaultFormatterId) {
                // good -> formatter configured
                const defaultFormatter = formatter.find(formatter => extensions_1.$Vl.equals(formatter.extensionId, defaultFormatterId));
                if (defaultFormatter) {
                    // formatter available
                    return defaultFormatter;
                }
                // bad -> formatter gone
                const extension = await this.f.getExtension(defaultFormatterId);
                if (extension && this.g.isEnabled((0, extensions_2.$TF)(extension))) {
                    // formatter does not target this file
                    const langName = this.r.getLanguageName(document.getLanguageId()) || document.getLanguageId();
                    const detail = nls.localize(2, null, extension.displayName || extension.name, langName);
                    return detail;
                }
            }
            else if (formatter.length === 1) {
                // ok -> nothing configured but only one formatter available
                return formatter[0];
            }
            const langName = this.r.getLanguageName(document.getLanguageId()) || document.getLanguageId();
            const message = !defaultFormatterId
                ? nls.localize(3, null, DefaultFormatter_1._maybeQuotes(langName))
                : nls.localize(4, null, defaultFormatterId);
            return message;
        }
        async C(formatter, document, mode) {
            const formatterOrMessage = await this.z(formatter, document);
            if (typeof formatterOrMessage !== 'string') {
                return formatterOrMessage;
            }
            if (mode !== 2 /* FormattingMode.Silent */) {
                // running from a user action -> show modal dialog so that users configure
                // a default formatter
                const { confirmed } = await this.m.confirm({
                    message: nls.localize(5, null),
                    detail: formatterOrMessage,
                    primaryButton: nls.localize(6, null)
                });
                if (confirmed) {
                    return this.D(formatter, document);
                }
            }
            else {
                // no user action -> show a silent notification and proceed
                this.j.prompt(notification_1.Severity.Info, formatterOrMessage, [{ label: nls.localize(7, null), run: () => this.D(formatter, document) }], { priority: notification_1.NotificationPriority.SILENT });
            }
            return undefined;
        }
        async D(formatter, document) {
            const picks = formatter.map((formatter, index) => {
                return {
                    index,
                    label: formatter.displayName || (formatter.extensionId ? formatter.extensionId.value : '?'),
                    description: formatter.extensionId && formatter.extensionId.value
                };
            });
            const langName = this.r.getLanguageName(document.getLanguageId()) || document.getLanguageId();
            const pick = await this.n.pick(picks, { placeHolder: nls.localize(8, null, DefaultFormatter_1._maybeQuotes(langName)) });
            if (!pick || !formatter[pick.index].extensionId) {
                return undefined;
            }
            this.h.updateValue(DefaultFormatter_1.configName, formatter[pick.index].extensionId.value, {
                resource: document.uri,
                overrideIdentifier: document.getLanguageId()
            });
            return formatter[pick.index];
        }
        // --- status item
        F() {
            this.c.clear();
            const editor = (0, editorBrowser_1.$lV)(this.w.activeTextEditorControl);
            if (!editor || !editor.hasModel()) {
                return;
            }
            const document = editor.getModel();
            const formatter = (0, format_1.$D8)(this.t.documentFormattingEditProvider, this.t.documentRangeFormattingEditProvider, document);
            if (formatter.length === 0) {
                return;
            }
            const cts = new cancellation_1.$pd();
            this.c.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
            this.z(formatter, document).then(result => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                if (typeof result !== 'string') {
                    return;
                }
                const command = { id: `formatter/configure/dfl/${(0, uuid_1.$4f)()}`, title: nls.localize(9, null) };
                this.c.add(commands_1.$Gr.registerCommand(command.id, () => this.D(formatter, document)));
                this.c.add(this.u.addStatus({
                    id: 'formatter.conflict',
                    name: nls.localize(10, null),
                    selector: { language: document.getLanguageId(), pattern: document.uri.fsPath },
                    severity: notification_1.Severity.Error,
                    label: nls.localize(11, null),
                    detail: result,
                    busy: false,
                    source: '',
                    command,
                    accessibilityInfo: undefined
                }));
            });
        }
    };
    DefaultFormatter = DefaultFormatter_1 = __decorate([
        __param(0, extensions_2.$MF),
        __param(1, extensionManagement_1.$icb),
        __param(2, configuration_1.$8h),
        __param(3, notification_1.$Yu),
        __param(4, dialogs_1.$oA),
        __param(5, quickInput_1.$Gq),
        __param(6, language_1.$ct),
        __param(7, languageFeatures_1.$hF),
        __param(8, languageStatusService_1.$6I),
        __param(9, editorService_1.$9C)
    ], DefaultFormatter);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DefaultFormatter, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.$k1,
        properties: {
            [DefaultFormatter.configName]: {
                description: nls.localize(12, null),
                type: ['string', 'null'],
                default: null,
                enum: DefaultFormatter.extensionIds,
                enumItemLabels: DefaultFormatter.extensionItemLabels,
                markdownEnumDescriptions: DefaultFormatter.extensionDescriptions
            }
        }
    });
    function logFormatterTelemetry(telemetryService, mode, options, pick) {
        function extKey(obj) {
            return obj.extensionId ? extensions_1.$Vl.toKey(obj.extensionId) : 'unknown';
        }
        telemetryService.publicLog2('formatterpick', {
            mode,
            extensions: options.map(extKey),
            pick: pick ? extKey(pick) : 'none'
        });
    }
    async function showFormatterPick(accessor, model, formatters) {
        const quickPickService = accessor.get(quickInput_1.$Gq);
        const configService = accessor.get(configuration_1.$8h);
        const languageService = accessor.get(language_1.$ct);
        const overrides = { resource: model.uri, overrideIdentifier: model.getLanguageId() };
        const defaultFormatter = configService.getValue(DefaultFormatter.configName, overrides);
        let defaultFormatterPick;
        const picks = formatters.map((provider, index) => {
            const isDefault = extensions_1.$Vl.equals(provider.extensionId, defaultFormatter);
            const pick = {
                index,
                label: provider.displayName || '',
                description: isDefault ? nls.localize(13, null) : undefined,
            };
            if (isDefault) {
                // autofocus default pick
                defaultFormatterPick = pick;
            }
            return pick;
        });
        const configurePick = {
            label: nls.localize(14, null)
        };
        const pick = await quickPickService.pick([...picks, { type: 'separator' }, configurePick], {
            placeHolder: nls.localize(15, null),
            activeItem: defaultFormatterPick
        });
        if (!pick) {
            // dismissed
            return undefined;
        }
        else if (pick === configurePick) {
            // config default
            const langName = languageService.getLanguageName(model.getLanguageId()) || model.getLanguageId();
            const pick = await quickPickService.pick(picks, { placeHolder: nls.localize(16, null, DefaultFormatter._maybeQuotes(langName)) });
            if (pick && formatters[pick.index].extensionId) {
                configService.updateValue(DefaultFormatter.configName, formatters[pick.index].extensionId.value, overrides);
            }
            return undefined;
        }
        else {
            // picked one
            return pick.index;
        }
    }
    (0, editorExtensions_1.$xV)(class FormatDocumentMultipleAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.formatDocument.multiple',
                label: nls.localize(17, null),
                alias: 'Format Document...',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasMultipleDocumentFormattingProvider),
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.3
                }
            });
        }
        async run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.$Ah);
            const telemetryService = accessor.get(telemetry_1.$9k);
            const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
            const model = editor.getModel();
            const provider = (0, format_1.$D8)(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
            const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
            if (typeof pick === 'number') {
                await instaService.invokeFunction(format_1.$I8, provider[pick], editor, 1 /* FormattingMode.Explicit */, cancellation_1.CancellationToken.None);
            }
            logFormatterTelemetry(telemetryService, 'document', provider, typeof pick === 'number' && provider[pick] || undefined);
        }
    });
    (0, editorExtensions_1.$xV)(class FormatSelectionMultipleAction extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.formatSelection.multiple',
                label: nls.localize(18, null),
                alias: 'Format Code...',
                precondition: contextkey_1.$Ii.and(contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable), editorContextKeys_1.EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider),
                contextMenuOpts: {
                    when: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection),
                    group: '1_modification',
                    order: 1.31
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.$Ah);
            const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
            const telemetryService = accessor.get(telemetry_1.$9k);
            const model = editor.getModel();
            let range = editor.getSelection();
            if (range.isEmpty()) {
                range = new range_1.$ks(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber));
            }
            const provider = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
            const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
            if (typeof pick === 'number') {
                await instaService.invokeFunction(format_1.$G8, provider[pick], editor, range, cancellation_1.CancellationToken.None);
            }
            logFormatterTelemetry(telemetryService, 'range', provider, typeof pick === 'number' && provider[pick] || undefined);
        }
    });
});
//# sourceMappingURL=formatActionsMultiple.js.map