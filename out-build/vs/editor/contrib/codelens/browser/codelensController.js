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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/editorExtensions", "vs/editor/common/config/editorOptions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/codelens/browser/codelens", "vs/editor/contrib/codelens/browser/codeLensCache", "vs/editor/contrib/codelens/browser/codelensWidget", "vs/nls!vs/editor/contrib/codelens/browser/codelensController", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures"], function (require, exports, async_1, errors_1, lifecycle_1, stableEditorScroll_1, editorExtensions_1, editorOptions_1, editorContextKeys_1, codelens_1, codeLensCache_1, codelensWidget_1, nls_1, commands_1, notification_1, quickInput_1, languageFeatureDebounce_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$72 = void 0;
    let $72 = class $72 {
        static { this.ID = 'css.editor.codeLens'; }
        constructor(n, o, debounceService, p, q, r) {
            this.n = n;
            this.o = o;
            this.p = p;
            this.q = q;
            this.r = r;
            this.a = new lifecycle_1.$jc();
            this.b = new lifecycle_1.$jc();
            this.c = [];
            this.j = new lifecycle_1.$jc();
            this.d = debounceService.for(o.codeLensProvider, 'CodeLensProvide', { min: 250 });
            this.f = debounceService.for(o.codeLensProvider, 'CodeLensResolve', { min: 250, salt: 'resolve' });
            this.g = new async_1.$Sg(() => this.z(), this.f.default());
            this.a.add(this.n.onDidChangeModel(() => this.v()));
            this.a.add(this.n.onDidChangeModelLanguage(() => this.v()));
            this.a.add(this.n.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* EditorOption.fontInfo */) || e.hasChanged(19 /* EditorOption.codeLensFontSize */) || e.hasChanged(18 /* EditorOption.codeLensFontFamily */)) {
                    this.t();
                }
                if (e.hasChanged(17 /* EditorOption.codeLens */)) {
                    this.v();
                }
            }));
            this.a.add(o.codeLensProvider.onDidChange(this.v, this));
            this.v();
            this.t();
        }
        dispose() {
            this.u();
            this.a.dispose();
            this.j.dispose();
            this.k?.dispose();
        }
        s() {
            const lineHeightFactor = Math.max(1.3, this.n.getOption(66 /* EditorOption.lineHeight */) / this.n.getOption(52 /* EditorOption.fontSize */));
            let fontSize = this.n.getOption(19 /* EditorOption.codeLensFontSize */);
            if (!fontSize || fontSize < 5) {
                fontSize = (this.n.getOption(52 /* EditorOption.fontSize */) * .9) | 0;
            }
            return {
                fontSize,
                codeLensHeight: (fontSize * lineHeightFactor) | 0,
            };
        }
        t() {
            const { codeLensHeight, fontSize } = this.s();
            const fontFamily = this.n.getOption(18 /* EditorOption.codeLensFontFamily */);
            const editorFontInfo = this.n.getOption(50 /* EditorOption.fontInfo */);
            const { style } = this.n.getContainerDomNode();
            style.setProperty('--vscode-editorCodeLens-lineHeight', `${codeLensHeight}px`);
            style.setProperty('--vscode-editorCodeLens-fontSize', `${fontSize}px`);
            style.setProperty('--vscode-editorCodeLens-fontFeatureSettings', editorFontInfo.fontFeatureSettings);
            if (fontFamily) {
                style.setProperty('--vscode-editorCodeLens-fontFamily', fontFamily);
                style.setProperty('--vscode-editorCodeLens-fontFamilyDefault', editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily);
            }
            //
            this.n.changeViewZones(accessor => {
                for (const lens of this.c) {
                    lens.updateHeight(codeLensHeight, accessor);
                }
            });
        }
        u() {
            this.h?.cancel();
            this.h = undefined;
            this.m?.cancel();
            this.m = undefined;
            this.b.clear();
            this.j.clear();
            this.k?.dispose();
        }
        v() {
            this.u();
            const model = this.n.getModel();
            if (!model) {
                return;
            }
            if (!this.n.getOption(17 /* EditorOption.codeLens */) || model.isTooLargeForTokenization()) {
                return;
            }
            const cachedLenses = this.r.get(model);
            if (cachedLenses) {
                this.x(cachedLenses);
            }
            if (!this.o.codeLensProvider.has(model)) {
                // no provider -> return but check with
                // cached lenses. they expire after 30 seconds
                if (cachedLenses) {
                    this.b.add((0, async_1.$Ig)(() => {
                        const cachedLensesNow = this.r.get(model);
                        if (cachedLenses === cachedLensesNow) {
                            this.r.delete(model);
                            this.v();
                        }
                    }, 30 * 1000));
                }
                return;
            }
            for (const provider of this.o.codeLensProvider.all(model)) {
                if (typeof provider.onDidChange === 'function') {
                    const registration = provider.onDidChange(() => scheduler.schedule());
                    this.b.add(registration);
                }
            }
            const scheduler = new async_1.$Sg(() => {
                const t1 = Date.now();
                this.h?.cancel();
                this.h = (0, async_1.$ug)(token => (0, codelens_1.$Z2)(this.o.codeLensProvider, model, token));
                this.h.then(result => {
                    if (this.k) {
                        this.j.add(this.k);
                    }
                    this.k = result;
                    // cache model to reduce flicker
                    this.r.put(model, result);
                    // update moving average
                    const newDelay = this.d.update(model, Date.now() - t1);
                    scheduler.delay = newDelay;
                    // render lenses
                    this.x(result);
                    // dom.scheduleAtNextAnimationFrame(() => this._resolveCodeLensesInViewport());
                    this.y();
                }, errors_1.$Y);
            }, this.d.get(model));
            this.b.add(scheduler);
            this.b.add((0, lifecycle_1.$ic)(() => this.g.cancel()));
            this.b.add(this.n.onDidChangeModelContent(() => {
                this.n.changeDecorations(decorationsAccessor => {
                    this.n.changeViewZones(viewZonesAccessor => {
                        const toDispose = [];
                        let lastLensLineNumber = -1;
                        this.c.forEach((lens) => {
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
                        const helper = new codelensWidget_1.$32();
                        toDispose.forEach((l) => {
                            l.dispose(helper, viewZonesAccessor);
                            this.c.splice(this.c.indexOf(l), 1);
                        });
                        helper.commit(decorationsAccessor);
                    });
                });
                // Ask for all references again
                scheduler.schedule();
                // Cancel pending and active resolve requests
                this.g.cancel();
                this.m?.cancel();
                this.m = undefined;
            }));
            this.b.add(this.n.onDidFocusEditorWidget(() => {
                scheduler.schedule();
            }));
            this.b.add(this.n.onDidBlurEditorText(() => {
                scheduler.cancel();
            }));
            this.b.add(this.n.onDidScrollChange(e => {
                if (e.scrollTopChanged && this.c.length > 0) {
                    this.y();
                }
            }));
            this.b.add(this.n.onDidLayoutChange(() => {
                this.y();
            }));
            this.b.add((0, lifecycle_1.$ic)(() => {
                if (this.n.getModel()) {
                    const scrollState = stableEditorScroll_1.$TZ.capture(this.n);
                    this.n.changeDecorations(decorationsAccessor => {
                        this.n.changeViewZones(viewZonesAccessor => {
                            this.w(decorationsAccessor, viewZonesAccessor);
                        });
                    });
                    scrollState.restore(this.n);
                }
                else {
                    // No accessors available
                    this.w(undefined, undefined);
                }
            }));
            this.b.add(this.n.onMouseDown(e => {
                if (e.target.type !== 9 /* MouseTargetType.CONTENT_WIDGET */) {
                    return;
                }
                let target = e.target.element;
                if (target?.tagName === 'SPAN') {
                    target = target.parentElement;
                }
                if (target?.tagName === 'A') {
                    for (const lens of this.c) {
                        const command = lens.getCommand(target);
                        if (command) {
                            this.p.executeCommand(command.id, ...(command.arguments || [])).catch(err => this.q.error(err));
                            break;
                        }
                    }
                }
            }));
            scheduler.schedule();
        }
        w(decChangeAccessor, viewZoneChangeAccessor) {
            const helper = new codelensWidget_1.$32();
            for (const lens of this.c) {
                lens.dispose(helper, viewZoneChangeAccessor);
            }
            if (decChangeAccessor) {
                helper.commit(decChangeAccessor);
            }
            this.c.length = 0;
        }
        x(symbols) {
            if (!this.n.hasModel()) {
                return;
            }
            const maxLineNumber = this.n.getModel().getLineCount();
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
            if (!groups.length && !this.c.length) {
                // Nothing to change
                return;
            }
            const scrollState = stableEditorScroll_1.$TZ.capture(this.n);
            const layoutInfo = this.s();
            this.n.changeDecorations(decorationsAccessor => {
                this.n.changeViewZones(viewZoneAccessor => {
                    const helper = new codelensWidget_1.$32();
                    let codeLensIndex = 0;
                    let groupsIndex = 0;
                    while (groupsIndex < groups.length && codeLensIndex < this.c.length) {
                        const symbolsLineNumber = groups[groupsIndex][0].symbol.range.startLineNumber;
                        const codeLensLineNumber = this.c[codeLensIndex].getLineNumber();
                        if (codeLensLineNumber < symbolsLineNumber) {
                            this.c[codeLensIndex].dispose(helper, viewZoneAccessor);
                            this.c.splice(codeLensIndex, 1);
                        }
                        else if (codeLensLineNumber === symbolsLineNumber) {
                            this.c[codeLensIndex].updateCodeLensSymbols(groups[groupsIndex], helper);
                            groupsIndex++;
                            codeLensIndex++;
                        }
                        else {
                            this.c.splice(codeLensIndex, 0, new codelensWidget_1.$42(groups[groupsIndex], this.n, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this.y()));
                            codeLensIndex++;
                            groupsIndex++;
                        }
                    }
                    // Delete extra code lenses
                    while (codeLensIndex < this.c.length) {
                        this.c[codeLensIndex].dispose(helper, viewZoneAccessor);
                        this.c.splice(codeLensIndex, 1);
                    }
                    // Create extra symbols
                    while (groupsIndex < groups.length) {
                        this.c.push(new codelensWidget_1.$42(groups[groupsIndex], this.n, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this.y()));
                        groupsIndex++;
                    }
                    helper.commit(decorationsAccessor);
                });
            });
            scrollState.restore(this.n);
        }
        y() {
            const model = this.n.getModel();
            if (model) {
                this.g.schedule();
            }
        }
        z() {
            this.m?.cancel();
            this.m = undefined;
            const model = this.n.getModel();
            if (!model) {
                return;
            }
            const toResolve = [];
            const lenses = [];
            this.c.forEach((lens) => {
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
            const resolvePromise = (0, async_1.$ug)(token => {
                const promises = toResolve.map((request, i) => {
                    const resolvedSymbols = new Array(request.length);
                    const promises = request.map((request, i) => {
                        if (!request.symbol.command && typeof request.provider.resolveCodeLens === 'function') {
                            return Promise.resolve(request.provider.resolveCodeLens(model, request.symbol, token)).then(symbol => {
                                resolvedSymbols[i] = symbol;
                            }, errors_1.$Z);
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
            this.m = resolvePromise;
            this.m.then(() => {
                // update moving average
                const newDelay = this.f.update(model, Date.now() - t1);
                this.g.delay = newDelay;
                if (this.k) { // update the cached state with new resolved items
                    this.r.put(model, this.k);
                }
                this.j.clear(); // dispose old models once we have updated the UI with the current model
                if (resolvePromise === this.m) {
                    this.m = undefined;
                }
            }, err => {
                (0, errors_1.$Y)(err); // can also be cancellation!
                if (resolvePromise === this.m) {
                    this.m = undefined;
                }
            });
        }
        async getModel() {
            await this.h;
            await this.m;
            return !this.k?.isDisposed
                ? this.k
                : undefined;
        }
    };
    exports.$72 = $72;
    exports.$72 = $72 = __decorate([
        __param(1, languageFeatures_1.$hF),
        __param(2, languageFeatureDebounce_1.$52),
        __param(3, commands_1.$Fr),
        __param(4, notification_1.$Yu),
        __param(5, codeLensCache_1.$12)
    ], $72);
    (0, editorExtensions_1.$AV)($72.ID, $72, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$xV)(class ShowLensesInCurrentLine extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'codelens.showLensesInCurrentLine',
                precondition: editorContextKeys_1.EditorContextKeys.hasCodeLensProvider,
                label: (0, nls_1.localize)(0, null),
                alias: 'Show CodeLens Commands For Current Line',
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const commandService = accessor.get(commands_1.$Fr);
            const notificationService = accessor.get(notification_1.$Yu);
            const lineNumber = editor.getSelection().positionLineNumber;
            const codelensController = editor.getContribution($72.ID);
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
                placeHolder: (0, nls_1.localize)(1, null)
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
//# sourceMappingURL=codelensController.js.map