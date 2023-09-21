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
define(["require", "exports", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/format/browser/format", "vs/editor/common/core/range", "vs/platform/telemetry/common/telemetry", "vs/platform/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contributions", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/editor/common/languages/language", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/editor/common/config/editorConfigurationSchema", "vs/platform/dialogs/common/dialogs", "vs/editor/common/services/languageFeatures", "vs/workbench/services/languageStatus/common/languageStatusService", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/base/common/uuid"], function (require, exports, editorBrowser_1, editorExtensions_1, editorContextKeys_1, nls, contextkey_1, quickInput_1, cancellation_1, instantiation_1, format_1, range_1, telemetry_1, extensions_1, platform_1, configurationRegistry_1, contributions_1, extensions_2, lifecycle_1, configuration_1, notification_1, language_1, extensionManagement_1, editorConfigurationSchema_1, dialogs_1, languageFeatures_1, languageStatusService_1, editorService_1, commands_1, uuid_1) {
    "use strict";
    var DefaultFormatter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let DefaultFormatter = class DefaultFormatter extends lifecycle_1.Disposable {
        static { DefaultFormatter_1 = this; }
        static { this.configName = 'editor.defaultFormatter'; }
        static { this.extensionIds = []; }
        static { this.extensionItemLabels = []; }
        static { this.extensionDescriptions = []; }
        constructor(_extensionService, _extensionEnablementService, _configService, _notificationService, _dialogService, _quickInputService, _languageService, _languageFeaturesService, _languageStatusService, _editorService) {
            super();
            this._extensionService = _extensionService;
            this._extensionEnablementService = _extensionEnablementService;
            this._configService = _configService;
            this._notificationService = _notificationService;
            this._dialogService = _dialogService;
            this._quickInputService = _quickInputService;
            this._languageService = _languageService;
            this._languageFeaturesService = _languageFeaturesService;
            this._languageStatusService = _languageStatusService;
            this._editorService = _editorService;
            this._languageStatusStore = this._store.add(new lifecycle_1.DisposableStore());
            this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
            this._store.add(format_1.FormattingConflicts.setFormatterSelector((formatter, document, mode) => this._selectFormatter(formatter, document, mode)));
            this._store.add(_editorService.onDidActiveEditorChange(this._updateStatus, this));
            this._store.add(_languageFeaturesService.documentFormattingEditProvider.onDidChange(this._updateStatus, this));
            this._store.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._updateStatus, this));
            this._store.add(_configService.onDidChangeConfiguration(e => e.affectsConfiguration(DefaultFormatter_1.configName) && this._updateStatus()));
            this._updateConfigValues();
        }
        async _updateConfigValues() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            let extensions = [...this._extensionService.extensions];
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
            DefaultFormatter_1.extensionItemLabels.push(nls.localize('null', 'None'));
            DefaultFormatter_1.extensionDescriptions.push(nls.localize('nullFormatterDescription', "None"));
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
        async _analyzeFormatter(formatter, document) {
            const defaultFormatterId = this._configService.getValue(DefaultFormatter_1.configName, {
                resource: document.uri,
                overrideIdentifier: document.getLanguageId()
            });
            if (defaultFormatterId) {
                // good -> formatter configured
                const defaultFormatter = formatter.find(formatter => extensions_1.ExtensionIdentifier.equals(formatter.extensionId, defaultFormatterId));
                if (defaultFormatter) {
                    // formatter available
                    return defaultFormatter;
                }
                // bad -> formatter gone
                const extension = await this._extensionService.getExtension(defaultFormatterId);
                if (extension && this._extensionEnablementService.isEnabled((0, extensions_2.toExtension)(extension))) {
                    // formatter does not target this file
                    const langName = this._languageService.getLanguageName(document.getLanguageId()) || document.getLanguageId();
                    const detail = nls.localize('miss', "Extension '{0}' is configured as formatter but it cannot format '{1}'-files", extension.displayName || extension.name, langName);
                    return detail;
                }
            }
            else if (formatter.length === 1) {
                // ok -> nothing configured but only one formatter available
                return formatter[0];
            }
            const langName = this._languageService.getLanguageName(document.getLanguageId()) || document.getLanguageId();
            const message = !defaultFormatterId
                ? nls.localize('config.needed', "There are multiple formatters for '{0}' files. One of them should be configured as default formatter.", DefaultFormatter_1._maybeQuotes(langName))
                : nls.localize('config.bad', "Extension '{0}' is configured as formatter but not available. Select a different default formatter to continue.", defaultFormatterId);
            return message;
        }
        async _selectFormatter(formatter, document, mode) {
            const formatterOrMessage = await this._analyzeFormatter(formatter, document);
            if (typeof formatterOrMessage !== 'string') {
                return formatterOrMessage;
            }
            if (mode !== 2 /* FormattingMode.Silent */) {
                // running from a user action -> show modal dialog so that users configure
                // a default formatter
                const { confirmed } = await this._dialogService.confirm({
                    message: nls.localize('miss.1', "Configure Default Formatter"),
                    detail: formatterOrMessage,
                    primaryButton: nls.localize({ key: 'do.config', comment: ['&& denotes a mnemonic'] }, "&&Configure...")
                });
                if (confirmed) {
                    return this._pickAndPersistDefaultFormatter(formatter, document);
                }
            }
            else {
                // no user action -> show a silent notification and proceed
                this._notificationService.prompt(notification_1.Severity.Info, formatterOrMessage, [{ label: nls.localize('do.config.notification', "Configure..."), run: () => this._pickAndPersistDefaultFormatter(formatter, document) }], { priority: notification_1.NotificationPriority.SILENT });
            }
            return undefined;
        }
        async _pickAndPersistDefaultFormatter(formatter, document) {
            const picks = formatter.map((formatter, index) => {
                return {
                    index,
                    label: formatter.displayName || (formatter.extensionId ? formatter.extensionId.value : '?'),
                    description: formatter.extensionId && formatter.extensionId.value
                };
            });
            const langName = this._languageService.getLanguageName(document.getLanguageId()) || document.getLanguageId();
            const pick = await this._quickInputService.pick(picks, { placeHolder: nls.localize('select', "Select a default formatter for '{0}' files", DefaultFormatter_1._maybeQuotes(langName)) });
            if (!pick || !formatter[pick.index].extensionId) {
                return undefined;
            }
            this._configService.updateValue(DefaultFormatter_1.configName, formatter[pick.index].extensionId.value, {
                resource: document.uri,
                overrideIdentifier: document.getLanguageId()
            });
            return formatter[pick.index];
        }
        // --- status item
        _updateStatus() {
            this._languageStatusStore.clear();
            const editor = (0, editorBrowser_1.getCodeEditor)(this._editorService.activeTextEditorControl);
            if (!editor || !editor.hasModel()) {
                return;
            }
            const document = editor.getModel();
            const formatter = (0, format_1.getRealAndSyntheticDocumentFormattersOrdered)(this._languageFeaturesService.documentFormattingEditProvider, this._languageFeaturesService.documentRangeFormattingEditProvider, document);
            if (formatter.length === 0) {
                return;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            this._languageStatusStore.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            this._analyzeFormatter(formatter, document).then(result => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                if (typeof result !== 'string') {
                    return;
                }
                const command = { id: `formatter/configure/dfl/${(0, uuid_1.generateUuid)()}`, title: nls.localize('do.config.command', "Configure...") };
                this._languageStatusStore.add(commands_1.CommandsRegistry.registerCommand(command.id, () => this._pickAndPersistDefaultFormatter(formatter, document)));
                this._languageStatusStore.add(this._languageStatusService.addStatus({
                    id: 'formatter.conflict',
                    name: nls.localize('summary', "Formatter Conflicts"),
                    selector: { language: document.getLanguageId(), pattern: document.uri.fsPath },
                    severity: notification_1.Severity.Error,
                    label: nls.localize('formatter', "Formatting"),
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
        __param(0, extensions_2.IExtensionService),
        __param(1, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, dialogs_1.IDialogService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, language_1.ILanguageService),
        __param(7, languageFeatures_1.ILanguageFeaturesService),
        __param(8, languageStatusService_1.ILanguageStatusService),
        __param(9, editorService_1.IEditorService)
    ], DefaultFormatter);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DefaultFormatter, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            [DefaultFormatter.configName]: {
                description: nls.localize('formatter.default', "Defines a default formatter which takes precedence over all other formatter settings. Must be the identifier of an extension contributing a formatter."),
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
            return obj.extensionId ? extensions_1.ExtensionIdentifier.toKey(obj.extensionId) : 'unknown';
        }
        telemetryService.publicLog2('formatterpick', {
            mode,
            extensions: options.map(extKey),
            pick: pick ? extKey(pick) : 'none'
        });
    }
    async function showFormatterPick(accessor, model, formatters) {
        const quickPickService = accessor.get(quickInput_1.IQuickInputService);
        const configService = accessor.get(configuration_1.IConfigurationService);
        const languageService = accessor.get(language_1.ILanguageService);
        const overrides = { resource: model.uri, overrideIdentifier: model.getLanguageId() };
        const defaultFormatter = configService.getValue(DefaultFormatter.configName, overrides);
        let defaultFormatterPick;
        const picks = formatters.map((provider, index) => {
            const isDefault = extensions_1.ExtensionIdentifier.equals(provider.extensionId, defaultFormatter);
            const pick = {
                index,
                label: provider.displayName || '',
                description: isDefault ? nls.localize('def', "(default)") : undefined,
            };
            if (isDefault) {
                // autofocus default pick
                defaultFormatterPick = pick;
            }
            return pick;
        });
        const configurePick = {
            label: nls.localize('config', "Configure Default Formatter...")
        };
        const pick = await quickPickService.pick([...picks, { type: 'separator' }, configurePick], {
            placeHolder: nls.localize('format.placeHolder', "Select a formatter"),
            activeItem: defaultFormatterPick
        });
        if (!pick) {
            // dismissed
            return undefined;
        }
        else if (pick === configurePick) {
            // config default
            const langName = languageService.getLanguageName(model.getLanguageId()) || model.getLanguageId();
            const pick = await quickPickService.pick(picks, { placeHolder: nls.localize('select', "Select a default formatter for '{0}' files", DefaultFormatter._maybeQuotes(langName)) });
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
    (0, editorExtensions_1.registerEditorAction)(class FormatDocumentMultipleAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatDocument.multiple',
                label: nls.localize('formatDocument.label.multiple', "Format Document With..."),
                alias: 'Format Document...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasMultipleDocumentFormattingProvider),
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
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            const model = editor.getModel();
            const provider = (0, format_1.getRealAndSyntheticDocumentFormattersOrdered)(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
            const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
            if (typeof pick === 'number') {
                await instaService.invokeFunction(format_1.formatDocumentWithProvider, provider[pick], editor, 1 /* FormattingMode.Explicit */, cancellation_1.CancellationToken.None);
            }
            logFormatterTelemetry(telemetryService, 'document', provider, typeof pick === 'number' && provider[pick] || undefined);
        }
    });
    (0, editorExtensions_1.registerEditorAction)(class FormatSelectionMultipleAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatSelection.multiple',
                label: nls.localize('formatSelection.label.multiple', "Format Selection With..."),
                alias: 'Format Code...',
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable), editorContextKeys_1.EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider),
                contextMenuOpts: {
                    when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection),
                    group: '1_modification',
                    order: 1.31
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const languageFeaturesService = accessor.get(languageFeatures_1.ILanguageFeaturesService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const model = editor.getModel();
            let range = editor.getSelection();
            if (range.isEmpty()) {
                range = new range_1.Range(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber));
            }
            const provider = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
            const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
            if (typeof pick === 'number') {
                await instaService.invokeFunction(format_1.formatDocumentRangesWithProvider, provider[pick], editor, range, cancellation_1.CancellationToken.None);
            }
            logFormatterTelemetry(telemetryService, 'range', provider, typeof pick === 'number' && provider[pick] || undefined);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0QWN0aW9uc011bHRpcGxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZm9ybWF0L2Jyb3dzZXIvZm9ybWF0QWN0aW9uc011bHRpcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9DaEcsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxzQkFBVTs7aUJBRXhCLGVBQVUsR0FBRyx5QkFBeUIsQUFBNUIsQ0FBNkI7aUJBRWhELGlCQUFZLEdBQXNCLEVBQUUsQUFBeEIsQ0FBeUI7aUJBQ3JDLHdCQUFtQixHQUFhLEVBQUUsQUFBZixDQUFnQjtpQkFDbkMsMEJBQXFCLEdBQWEsRUFBRSxBQUFmLENBQWdCO1FBSTVDLFlBQ29CLGlCQUFxRCxFQUNsQywyQkFBa0YsRUFDakcsY0FBc0QsRUFDdkQsb0JBQTJELEVBQ2pFLGNBQStDLEVBQzNDLGtCQUF1RCxFQUN6RCxnQkFBbUQsRUFDM0Msd0JBQW1FLEVBQ3JFLHNCQUErRCxFQUN2RSxjQUErQztZQUUvRCxLQUFLLEVBQUUsQ0FBQztZQVg0QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ2pCLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBc0M7WUFDaEYsbUJBQWMsR0FBZCxjQUFjLENBQXVCO1lBQ3RDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDaEQsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDeEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUMxQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ3BELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFDdEQsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBWi9DLHlCQUFvQixHQUFHLElBQUksQ0FBQyxN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