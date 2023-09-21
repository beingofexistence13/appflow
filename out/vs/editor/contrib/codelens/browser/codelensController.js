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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorOptions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/codelens/browser/codelens", "vs/editor/contrib/codelens/browser/codeLensCache", "vs/editor/contrib/codelens/browser/codelensWidget", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures"], function (require, exports, async_1, errors_1, lifecycle_1, stableEditorScroll_1, editorExtensions_1, editorOptions_1, editorContextKeys_1, codelens_1, codeLensCache_1, codelensWidget_1, nls_1, commands_1, notification_1, quickInput_1, languageFeatureDebounce_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeLensContribution = void 0;
    let CodeLensContribution = class CodeLensContribution {
        static { this.ID = 'css.editor.codeLens'; }
        constructor(_editor, _languageFeaturesService, debounceService, _commandService, _notificationService, _codeLensCache) {
            this._editor = _editor;
            this._languageFeaturesService = _languageFeaturesService;
            this._commandService = _commandService;
            this._notificationService = _notificationService;
            this._codeLensCache = _codeLensCache;
            this._disposables = new lifecycle_1.DisposableStore();
            this._localToDispose = new lifecycle_1.DisposableStore();
            this._lenses = [];
            this._oldCodeLensModels = new lifecycle_1.DisposableStore();
            this._provideCodeLensDebounce = debounceService.for(_languageFeaturesService.codeLensProvider, 'CodeLensProvide', { min: 250 });
            this._resolveCodeLensesDebounce = debounceService.for(_languageFeaturesService.codeLensProvider, 'CodeLensResolve', { min: 250, salt: 'resolve' });
            this._resolveCodeLensesScheduler = new async_1.RunOnceScheduler(() => this._resolveCodeLensesInViewport(), this._resolveCodeLensesDebounce.default());
            this._disposables.add(this._editor.onDidChangeModel(() => this._onModelChange()));
            this._disposables.add(this._editor.onDidChangeModelLanguage(() => this._onModelChange()));
            this._disposables.add(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */) || e.hasChanged(19 /* EditorOption.codeLensFontSize */) || e.hasChanged(18 /* EditorOption.codeLensFontFamily */)) {
                    this._updateLensStyle();
                }
                if (e.hasChanged(17 /* EditorOption.codeLens */)) {
                    this._onModelChange();
                }
            }));
            this._disposables.add(_languageFeaturesService.codeLensProvider.onDidChange(this._onModelChange, this));
            this._onModelChange();
            this._updateLensStyle();
        }
        dispose() {
            this._localDispose();
            this._disposables.dispose();
            this._oldCodeLensModels.dispose();
            this._currentCodeLensModel?.dispose();
        }
        _getLayoutInfo() {
            const lineHeightFactor = Math.max(1.3, this._editor.getOption(66 /* EditorOption.lineHeight */) / this._editor.getOption(52 /* EditorOption.fontSize */));
            let fontSize = this._editor.getOption(19 /* EditorOption.codeLensFontSize */);
            if (!fontSize || fontSize < 5) {
                fontSize = (this._editor.getOption(52 /* EditorOption.fontSize */) * .9) | 0;
            }
            return {
                fontSize,
                codeLensHeight: (fontSize * lineHeightFactor) | 0,
            };
        }
        _updateLensStyle() {
            const { codeLensHeight, fontSize } = this._getLayoutInfo();
            const fontFamily = this._editor.getOption(18 /* EditorOption.codeLensFontFamily */);
            const editorFontInfo = this._editor.getOption(50 /* EditorOption.fontInfo */);
            const { style } = this._editor.getContainerDomNode();
            style.setProperty('--vscode-editorCodeLens-lineHeight', `${codeLensHeight}px`);
            style.setProperty('--vscode-editorCodeLens-fontSize', `${fontSize}px`);
            style.setProperty('--vscode-editorCodeLens-fontFeatureSettings', editorFontInfo.fontFeatureSettings);
            if (fontFamily) {
                style.setProperty('--vscode-editorCodeLens-fontFamily', fontFamily);
                style.setProperty('--vscode-editorCodeLens-fontFamilyDefault', editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily);
            }
            //
            this._editor.changeViewZones(accessor => {
                for (const lens of this._lenses) {
                    lens.updateHeight(codeLensHeight, accessor);
                }
            });
        }
        _localDispose() {
            this._getCodeLensModelPromise?.cancel();
            this._getCodeLensModelPromise = undefined;
            this._resolveCodeLensesPromise?.cancel();
            this._resolveCodeLensesPromise = undefined;
            this._localToDispose.clear();
            this._oldCodeLensModels.clear();
            this._currentCodeLensModel?.dispose();
        }
        _onModelChange() {
            this._localDispose();
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            if (!this._editor.getOption(17 /* EditorOption.codeLens */) || model.isTooLargeForTokenization()) {
                return;
            }
            const cachedLenses = this._codeLensCache.get(model);
            if (cachedLenses) {
                this._renderCodeLensSymbols(cachedLenses);
            }
            if (!this._languageFeaturesService.codeLensProvider.has(model)) {
                // no provider -> return but check with
                // cached lenses. they expire after 30 seconds
                if (cachedLenses) {
                    this._localToDispose.add((0, async_1.disposableTimeout)(() => {
                        const cachedLensesNow = this._codeLensCache.get(model);
                        if (cachedLenses === cachedLensesNow) {
                            this._codeLensCache.delete(model);
                            this._onModelChange();
                        }
                    }, 30 * 1000));
                }
                return;
            }
            for (const provider of this._languageFeaturesService.codeLensProvider.all(model)) {
                if (typeof provider.onDidChange === 'function') {
                    const registration = provider.onDidChange(() => scheduler.schedule());
                    this._localToDispose.add(registration);
                }
            }
            const scheduler = new async_1.RunOnceScheduler(() => {
                const t1 = Date.now();
                this._getCodeLensModelPromise?.cancel();
                this._getCodeLensModelPromise = (0, async_1.createCancelablePromise)(token => (0, codelens_1.getCodeLensModel)(this._languageFeaturesService.codeLensProvider, model, token));
                this._getCodeLensModelPromise.then(result => {
                    if (this._currentCodeLensModel) {
                        this._oldCodeLensModels.add(this._currentCodeLensModel);
                    }
                    this._currentCodeLensModel = result;
                    // cache model to reduce flicker
                    this._codeLensCache.put(model, result);
                    // update moving average
                    const newDelay = this._provideCodeLensDebounce.update(model, Date.now() - t1);
                    scheduler.delay = newDelay;
                    // render lenses
                    this._renderCodeLensSymbols(result);
                    // dom.scheduleAtNextAnimationFrame(() => this._resolveCodeLensesInViewport());
                    this._resolveCodeLensesInViewportSoon();
                }, errors_1.onUnexpectedError);
            }, this._provideCodeLensDebounce.get(model));
            this._localToDispose.add(scheduler);
            this._localToDispose.add((0, lifecycle_1.toDisposable)(() => this._resolveCodeLensesScheduler.cancel()));
            this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
                this._editor.changeDecorations(decorationsAccessor => {
                    this._editor.changeViewZones(viewZonesAccessor => {
                        const toDispose = [];
                        let lastLensLineNumber = -1;
                        this._lenses.forEach((lens) => {
                            if (!lens.isValid() || lastLensLineNumber === lens.getLineNumber()) {
                                // invalid -> lens collapsed, attach range doesn't exist anymore
                                // line_number -> lenses should never be on the same line
                                toDispose.push(lens);
                            }
                            else {
                                lens.update(viewZonesAccessor);
                                lastLensLineNumber = lens.getLineNumber();
                            }
                        });
                        const helper = new codelensWidget_1.CodeLensHelper();
                        toDispose.forEach((l) => {
                            l.dispose(helper, viewZonesAccessor);
                            this._lenses.splice(this._lenses.indexOf(l), 1);
                        });
                        helper.commit(decorationsAccessor);
                    });
                });
                // Ask for all references again
                scheduler.schedule();
                // Cancel pending and active resolve requests
                this._resolveCodeLensesScheduler.cancel();
                this._resolveCodeLensesPromise?.cancel();
                this._resolveCodeLensesPromise = undefined;
            }));
            this._localToDispose.add(this._editor.onDidFocusEditorWidget(() => {
                scheduler.schedule();
            }));
            this._localToDispose.add(this._editor.onDidBlurEditorText(() => {
                scheduler.cancel();
            }));
            this._localToDispose.add(this._editor.onDidScrollChange(e => {
                if (e.scrollTopChanged && this._lenses.length > 0) {
                    this._resolveCodeLensesInViewportSoon();
                }
            }));
            this._localToDispose.add(this._editor.onDidLayoutChange(() => {
                this._resolveCodeLensesInViewportSoon();
            }));
            this._localToDispose.add((0, lifecycle_1.toDisposable)(() => {
                if (this._editor.getModel()) {
                    const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editor);
                    this._editor.changeDecorations(decorationsAccessor => {
                        this._editor.changeViewZones(viewZonesAccessor => {
                            this._disposeAllLenses(decorationsAccessor, viewZonesAccessor);
                        });
                    });
                    scrollState.restore(this._editor);
                }
                else {
                    // No accessors available
                    this._disposeAllLenses(undefined, undefined);
                }
            }));
            this._localToDispose.add(this._editor.onMouseDown(e => {
                if (e.target.type !== 9 /* MouseTargetType.CONTENT_WIDGET */) {
                    return;
                }
                let target = e.target.element;
                if (target?.tagName === 'SPAN') {
                    target = target.parentElement;
                }
                if (target?.tagName === 'A') {
                    for (const lens of this._lenses) {
                        const command = lens.getCommand(target);
                        if (command) {
                            this._commandService.executeCommand(command.id, ...(command.arguments || [])).catch(err => this._notificationService.error(err));
                            break;
                        }
                    }
                }
            }));
            scheduler.schedule();
        }
        _disposeAllLenses(decChangeAccessor, viewZoneChangeAccessor) {
            const helper = new codelensWidget_1.CodeLensHelper();
            for (const lens of this._lenses) {
                lens.dispose(helper, viewZoneChangeAccessor);
            }
            if (decChangeAccessor) {
                helper.commit(decChangeAccessor);
            }
            this._lenses.length = 0;
        }
        _renderCodeLensSymbols(symbols) {
            if (!this._editor.hasModel()) {
                return;
            }
            const maxLineNumber = this._editor.getModel().getLineCount();
            const groups = [];
            let lastGroup;
            for (const symbol of symbols.lenses) {
                const line = symbol.symbol.range.startLineNumber;
                if (line < 1 || line > maxLineNumber) {
                    // invalid code lens
                    continue;
                }
                else if (lastGroup && lastGroup[lastGroup.length - 1].symbol.range.startLineNumber === line) {
                    // on same line as previous
                    lastGroup.push(symbol);
                }
                else {
                    // on later line as previous
                    lastGroup = [symbol];
                    groups.push(lastGroup);
                }
            }
            if (!groups.length && !this._lenses.length) {
                // Nothing to change
                return;
            }
            const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editor);
            const layoutInfo = this._getLayoutInfo();
            this._editor.changeDecorations(decorationsAccessor => {
                this._editor.changeViewZones(viewZoneAccessor => {
                    const helper = new codelensWidget_1.CodeLensHelper();
                    let codeLensIndex = 0;
                    let groupsIndex = 0;
                    while (groupsIndex < groups.length && codeLensIndex < this._lenses.length) {
                        const symbolsLineNumber = groups[groupsIndex][0].symbol.range.startLineNumber;
                        const codeLensLineNumber = this._lenses[codeLensIndex].getLineNumber();
                        if (codeLensLineNumber < symbolsLineNumber) {
                            this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
                            this._lenses.splice(codeLensIndex, 1);
                        }
                        else if (codeLensLineNumber === symbolsLineNumber) {
                            this._lenses[codeLensIndex].updateCodeLensSymbols(groups[groupsIndex], helper);
                            groupsIndex++;
                            codeLensIndex++;
                        }
                        else {
                            this._lenses.splice(codeLensIndex, 0, new codelensWidget_1.CodeLensWidget(groups[groupsIndex], this._editor, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
                            codeLensIndex++;
                            groupsIndex++;
                        }
                    }
                    // Delete extra code lenses
                    while (codeLensIndex < this._lenses.length) {
                        this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
                        this._lenses.splice(codeLensIndex, 1);
                    }
                    // Create extra symbols
                    while (groupsIndex < groups.length) {
                        this._lenses.push(new codelensWidget_1.CodeLensWidget(groups[groupsIndex], this._editor, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
                        groupsIndex++;
                    }
                    helper.commit(decorationsAccessor);
                });
            });
            scrollState.restore(this._editor);
        }
        _resolveCodeLensesInViewportSoon() {
            const model = this._editor.getModel();
            if (model) {
                this._resolveCodeLensesScheduler.schedule();
            }
        }
        _resolveCodeLensesInViewport() {
            this._resolveCodeLensesPromise?.cancel();
            this._resolveCodeLensesPromise = undefined;
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            const toResolve = [];
            const lenses = [];
            this._lenses.forEach((lens) => {
                const request = lens.computeIfNecessary(model);
                if (request) {
                    toResolve.push(request);
                    lenses.push(lens);
                }
            });
            if (toResolve.length === 0) {
                return;
            }
            const t1 = Date.now();
            const resolvePromise = (0, async_1.createCancelablePromise)(token => {
                const promises = toResolve.map((request, i) => {
                    const resolvedSymbols = new Array(request.length);
                    const promises = request.map((request, i) => {
                        if (!request.symbol.command && typeof request.provider.resolveCodeLens === 'function') {
                            return Promise.resolve(request.provider.resolveCodeLens(model, request.symbol, token)).then(symbol => {
                                resolvedSymbols[i] = symbol;
                            }, errors_1.onUnexpectedExternalError);
                        }
                        else {
                            resolvedSymbols[i] = request.symbol;
                            return Promise.resolve(undefined);
                        }
                    });
                    return Promise.all(promises).then(() => {
                        if (!token.isCancellationRequested && !lenses[i].isDisposed()) {
                            lenses[i].updateCommands(resolvedSymbols);
                        }
                    });
                });
                return Promise.all(promises);
            });
            this._resolveCodeLensesPromise = resolvePromise;
            this._resolveCodeLensesPromise.then(() => {
                // update moving average
                const newDelay = this._resolveCodeLensesDebounce.update(model, Date.now() - t1);
                this._resolveCodeLensesScheduler.delay = newDelay;
                if (this._currentCodeLensModel) { // update the cached state with new resolved items
                    this._codeLensCache.put(model, this._currentCodeLensModel);
                }
                this._oldCodeLensModels.clear(); // dispose old models once we have updated the UI with the current model
                if (resolvePromise === this._resolveCodeLensesPromise) {
                    this._resolveCodeLensesPromise = undefined;
                }
            }, err => {
                (0, errors_1.onUnexpectedError)(err); // can also be cancellation!
                if (resolvePromise === this._resolveCodeLensesPromise) {
                    this._resolveCodeLensesPromise = undefined;
                }
            });
        }
        async getModel() {
            await this._getCodeLensModelPromise;
            await this._resolveCodeLensesPromise;
            return !this._currentCodeLensModel?.isDisposed
                ? this._currentCodeLensModel
                : undefined;
        }
    };
    exports.CodeLensContribution = CodeLensContribution;
    exports.CodeLensContribution = CodeLensContribution = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(3, commands_1.ICommandService),
        __param(4, notification_1.INotificationService),
        __param(5, codeLensCache_1.ICodeLensCache)
    ], CodeLensContribution);
    (0, editorExtensions_1.registerEditorContribution)(CodeLensContribution.ID, CodeLensContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorAction)(class ShowLensesInCurrentLine extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'codelens.showLensesInCurrentLine',
                precondition: editorContextKeys_1.EditorContextKeys.hasCodeLensProvider,
                label: (0, nls_1.localize)('showLensOnLine', "Show CodeLens Commands For Current Line"),
                alias: 'Show CodeLens Commands For Current Line',
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const commandService = accessor.get(commands_1.ICommandService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const lineNumber = editor.getSelection().positionLineNumber;
            const codelensController = editor.getContribution(CodeLensContribution.ID);
            if (!codelensController) {
                return;
            }
            const model = await codelensController.getModel();
            if (!model) {
                // nothing
                return;
            }
            const items = [];
            for (const lens of model.lenses) {
                if (lens.symbol.command && lens.symbol.range.startLineNumber === lineNumber) {
                    items.push({
                        label: lens.symbol.command.title,
                        command: lens.symbol.command
                    });
                }
            }
            if (items.length === 0) {
                // We dont want an empty picker
                return;
            }
            const item = await quickInputService.pick(items, {
                canPickMany: false,
                placeHolder: (0, nls_1.localize)('placeHolder', "Select a command")
            });
            if (!item) {
                // Nothing picked
                return;
            }
            let command = item.command;
            if (model.isDisposed) {
                // try to find the same command again in-case the model has been re-created in the meantime
                // this is a best attempt approach which shouldn't be needed because eager model re-creates
                // shouldn't happen due to focus in/out anymore
                const newModel = await codelensController.getModel();
                const newLens = newModel?.lenses.find(lens => lens.symbol.range.startLineNumber === lineNumber && lens.symbol.command?.title === command.title);
                if (!newLens || !newLens.symbol.command) {
                    return;
                }
                command = newLens.symbol.command;
            }
            try {
                await commandService.executeCommand(command.id, ...(command.arguments || []));
            }
            catch (err) {
                notificationService.error(err);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWxlbnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvY29kZWxlbnMvYnJvd3Nlci9jb2RlbGVuc0NvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0J6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtpQkFFaEIsT0FBRSxHQUFXLHFCQUFxQixBQUFoQyxDQUFpQztRQWdCbkQsWUFDa0IsT0FBb0IsRUFDWCx3QkFBbUUsRUFDNUQsZUFBZ0QsRUFDaEUsZUFBaUQsRUFDNUMsb0JBQTJELEVBQ2pFLGNBQStDO1lBTDlDLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDTSw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBRTNELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUMzQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2hELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQXBCL0MsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNyQyxvQkFBZSxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRXhDLFlBQU8sR0FBcUIsRUFBRSxDQUFDO1lBTy9CLHVCQUFrQixHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBWTNELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDaEksSUFBSSxDQUFDLDBCQUEwQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUs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