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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/editor/contrib/gotoSymbol/browser/peek/referencesTree", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/platform/undoRedo/common/undoRedo", "../referencesModel", "vs/css!./referencesWidget"], function (require, exports, dom, splitview_1, color_1, event_1, lifecycle_1, network_1, resources_1, embeddedCodeEditorWidget_1, range_1, textModel_1, languageConfigurationRegistry_1, modesRegistry_1, language_1, resolverService_1, referencesTree_1, peekView, nls, instantiation_1, keybinding_1, label_1, listService_1, themeService_1, undoRedo_1, referencesModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$K4 = exports.$J4 = void 0;
    class DecorationsManager {
        static { this.a = textModel_1.$RC.register({
            description: 'reference-decoration',
            stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */,
            className: 'reference-decoration'
        }); }
        constructor(g, h) {
            this.g = g;
            this.h = h;
            this.b = new Map();
            this.c = new Set();
            this.d = new lifecycle_1.$jc();
            this.f = new lifecycle_1.$jc();
            this.d.add(this.g.onDidChangeModel(() => this.j()));
            this.j();
        }
        dispose() {
            this.f.dispose();
            this.d.dispose();
            this.removeDecorations();
        }
        j() {
            this.f.clear();
            const model = this.g.getModel();
            if (!model) {
                return;
            }
            for (const ref of this.h.references) {
                if (ref.uri.toString() === model.uri.toString()) {
                    this.k(ref.parent);
                    return;
                }
            }
        }
        k(reference) {
            if (!this.g.hasModel()) {
                return;
            }
            this.f.add(this.g.getModel().onDidChangeDecorations(() => this.l()));
            const newDecorations = [];
            const newDecorationsActualIndex = [];
            for (let i = 0, len = reference.children.length; i < len; i++) {
                const oneReference = reference.children[i];
                if (this.c.has(oneReference.id)) {
                    continue;
                }
                if (oneReference.uri.toString() !== this.g.getModel().uri.toString()) {
                    continue;
                }
                newDecorations.push({
                    range: oneReference.range,
                    options: DecorationsManager.a
                });
                newDecorationsActualIndex.push(i);
            }
            this.g.changeDecorations((changeAccessor) => {
                const decorations = changeAccessor.deltaDecorations([], newDecorations);
                for (let i = 0; i < decorations.length; i++) {
                    this.b.set(decorations[i], reference.children[newDecorationsActualIndex[i]]);
                }
            });
        }
        l() {
            const toRemove = [];
            const model = this.g.getModel();
            if (!model) {
                return;
            }
            for (const [decorationId, reference] of this.b) {
                const newRange = model.getDecorationRange(decorationId);
                if (!newRange) {
                    continue;
                }
                let ignore = false;
                if (range_1.$ks.equalsRange(newRange, reference.range)) {
                    continue;
                }
                if (range_1.$ks.spansMultipleLines(newRange)) {
                    ignore = true;
                }
                else {
                    const lineLength = reference.range.endColumn - reference.range.startColumn;
                    const newLineLength = newRange.endColumn - newRange.startColumn;
                    if (lineLength !== newLineLength) {
                        ignore = true;
                    }
                }
                if (ignore) {
                    this.c.add(reference.id);
                    toRemove.push(decorationId);
                }
                else {
                    reference.range = newRange;
                }
            }
            for (let i = 0, len = toRemove.length; i < len; i++) {
                this.b.delete(toRemove[i]);
            }
            this.g.removeDecorations(toRemove);
        }
        removeDecorations() {
            this.g.removeDecorations([...this.b.keys()]);
            this.b.clear();
        }
    }
    class $J4 {
        constructor() {
            this.ratio = 0.7;
            this.heightInLines = 18;
        }
        static fromJSON(raw) {
            let ratio;
            let heightInLines;
            try {
                const data = JSON.parse(raw);
                ratio = data.ratio;
                heightInLines = data.heightInLines;
            }
            catch {
                //
            }
            return {
                ratio: ratio || 0.7,
                heightInLines: heightInLines || 18
            };
        }
    }
    exports.$J4 = $J4;
    class ReferencesTree extends listService_1.$w4 {
    }
    /**
     * ZoneWidget that is shown inside the editor
     */
    let $K4 = class $K4 extends peekView.$I3 {
        constructor(editor, fb, layoutData, themeService, gb, hb, ib, jb, kb, lb, mb, nb) {
            super(editor, { showFrame: false, showArrow: true, isResizeable: true, isAccessible: true, supportOnTitleClick: true }, hb);
            this.fb = fb;
            this.layoutData = layoutData;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.c = new lifecycle_1.$jc();
            this.d = new lifecycle_1.$jc();
            this.l = new event_1.$fd();
            this.onDidSelectReference = this.l.event;
            this.eb = new dom.$BO(0, 0);
            this.ob(themeService.getColorTheme());
            this.d.add(themeService.onDidColorThemeChange(this.ob.bind(this)));
            this.ib.addExclusiveWidget(editor, this);
            this.create();
        }
        dispose() {
            this.setModel(undefined);
            this.d.dispose();
            this.c.dispose();
            (0, lifecycle_1.$fc)(this.t);
            (0, lifecycle_1.$fc)(this.T);
            (0, lifecycle_1.$fc)(this.m);
            (0, lifecycle_1.$fc)(this.v);
            this.r.dispose();
            super.dispose();
        }
        ob(theme) {
            const borderColor = theme.getColor(peekView.$M3) || color_1.$Os.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView.$J3) || color_1.$Os.transparent,
                primaryHeadingColor: theme.getColor(peekView.$K3),
                secondaryHeadingColor: theme.getColor(peekView.$L3)
            });
        }
        show(where) {
            super.show(where, this.layoutData.heightInLines || 18);
        }
        focusOnReferenceTree() {
            this.m.domFocus();
        }
        focusOnPreviewEditor() {
            this.t.focus();
        }
        isPreviewEditorFocused() {
            return this.t.hasTextFocus();
        }
        X(e) {
            if (this.t && this.t.getModel()) {
                this.l.fire({
                    element: this.ub(),
                    kind: e.ctrlKey || e.metaKey || e.altKey ? 'side' : 'open',
                    source: 'title'
                });
            }
        }
        Y(containerElement) {
            this.D('reference-zone-widget');
            // message pane
            this.db = dom.$0O(containerElement, dom.$('div.messages'));
            dom.$eP(this.db);
            this.r = new splitview_1.$bR(containerElement, { orientation: 1 /* Orientation.HORIZONTAL */ });
            // editor
            this.cb = dom.$0O(containerElement, dom.$('div.preview.inline'));
            const options = {
                scrollBeyondLastLine: false,
                scrollbar: {
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    alwaysConsumeMouseWheel: true
                },
                overviewRulerLanes: 2,
                fixedOverflowWidgets: true,
                minimap: {
                    enabled: false
                }
            };
            this.t = this.hb.createInstance(embeddedCodeEditorWidget_1.$w3, this.cb, options, {}, this.editor);
            dom.$eP(this.cb);
            this.T = new textModel_1.$MC(nls.localize(0, null), modesRegistry_1.$Yt, textModel_1.$MC.DEFAULT_CREATION_OPTIONS, null, this.kb, this.mb, this.nb);
            // tree
            this.p = dom.$0O(containerElement, dom.$('div.ref-tree.inline'));
            const treeOptions = {
                keyboardSupport: this.fb,
                accessibilityProvider: new referencesTree_1.$I4(),
                keyboardNavigationLabelProvider: this.hb.createInstance(referencesTree_1.$E4),
                identityProvider: new referencesTree_1.$F4(),
                openOnSingleClick: true,
                selectionNavigation: true,
                overrideStyles: {
                    listBackground: peekView.$N3
                }
            };
            if (this.fb) {
                // the tree will consume `Escape` and prevent the widget from closing
                this.d.add(dom.$oO(this.p, 'keydown', (e) => {
                    if (e.equals(9 /* KeyCode.Escape */)) {
                        this.lb.dispatchEvent(e, e.target);
                        e.stopPropagation();
                    }
                }, true));
            }
            this.m = this.hb.createInstance(ReferencesTree, 'ReferencesWidget', this.p, new referencesTree_1.$D4(), [
                this.hb.createInstance(referencesTree_1.$G4),
                this.hb.createInstance(referencesTree_1.$H4),
            ], this.hb.createInstance(referencesTree_1.$C4), treeOptions);
            // split stuff
            this.r.addView({
                onDidChange: event_1.Event.None,
                element: this.cb,
                minimumSize: 200,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    this.t.layout({ height: this.eb.height, width });
                }
            }, splitview_1.Sizing.Distribute);
            this.r.addView({
                onDidChange: event_1.Event.None,
                element: this.p,
                minimumSize: 100,
                maximumSize: Number.MAX_VALUE,
                layout: (width) => {
                    this.p.style.height = `${this.eb.height}px`;
                    this.p.style.width = `${width}px`;
                    this.m.layout(this.eb.height, width);
                }
            }, splitview_1.Sizing.Distribute);
            this.o.add(this.r.onDidSashChange(() => {
                if (this.eb.width) {
                    this.layoutData.ratio = this.r.getViewSize(0) / this.eb.width;
                }
            }, undefined));
            // listen on selection and focus
            const onEvent = (element, kind) => {
                if (element instanceof referencesModel_1.$y4) {
                    if (kind === 'show') {
                        this.wb(element, false);
                    }
                    this.l.fire({ element, kind, source: 'tree' });
                }
            };
            this.m.onDidOpen(e => {
                if (e.sideBySide) {
                    onEvent(e.element, 'side');
                }
                else if (e.editorOptions.pinned) {
                    onEvent(e.element, 'goto');
                }
                else {
                    onEvent(e.element, 'show');
                }
            });
            dom.$eP(this.p);
        }
        F(width) {
            if (this.eb) {
                this.bb(this.eb.height, width);
            }
        }
        bb(heightInPixel, widthInPixel) {
            super.bb(heightInPixel, widthInPixel);
            this.eb = new dom.$BO(widthInPixel, heightInPixel);
            this.layoutData.heightInLines = this.n ? this.n.heightInLines : this.layoutData.heightInLines;
            this.r.layout(widthInPixel);
            this.r.resizeView(0, widthInPixel * this.layoutData.ratio);
        }
        setSelection(selection) {
            return this.wb(selection, true).then(() => {
                if (!this.a) {
                    // disposed
                    return;
                }
                // show in tree
                this.m.setSelection([selection]);
                this.m.setFocus([selection]);
            });
        }
        setModel(newModel) {
            // clean up
            this.c.clear();
            this.a = newModel;
            if (this.a) {
                return this.tb();
            }
            return Promise.resolve();
        }
        tb() {
            if (!this.a) {
                return Promise.resolve(undefined);
            }
            if (this.a.isEmpty) {
                this.setTitle('');
                this.db.innerText = nls.localize(1, null);
                dom.$dP(this.db);
                return Promise.resolve(undefined);
            }
            dom.$eP(this.db);
            this.b = new DecorationsManager(this.t, this.a);
            this.c.add(this.b);
            // listen on model changes
            this.c.add(this.a.onDidChangeReferenceRange(reference => this.m.rerender(reference)));
            // listen on editor
            this.c.add(this.t.onMouseDown(e => {
                const { event, target } = e;
                if (event.detail !== 2) {
                    return;
                }
                const element = this.ub();
                if (!element) {
                    return;
                }
                this.l.fire({
                    element: { uri: element.uri, range: target.range },
                    kind: (event.ctrlKey || event.metaKey || event.altKey) ? 'side' : 'open',
                    source: 'editor'
                });
            }));
            // make sure things are rendered
            this.container.classList.add('results-loaded');
            dom.$dP(this.p);
            dom.$dP(this.cb);
            this.r.layout(this.eb.width);
            this.focusOnReferenceTree();
            // pick input and a reference to begin with
            return this.m.setInput(this.a.groups.length === 1 ? this.a.groups[0] : this.a);
        }
        ub() {
            const [element] = this.m.getFocus();
            if (element instanceof referencesModel_1.$y4) {
                return element;
            }
            else if (element instanceof referencesModel_1.$A4) {
                if (element.children.length > 0) {
                    return element.children[0];
                }
            }
            return undefined;
        }
        async revealReference(reference) {
            await this.wb(reference, false);
            this.l.fire({ element: reference, kind: 'goto', source: 'tree' });
        }
        async wb(reference, revealParent) {
            // check if there is anything to do...
            if (this.vb === reference) {
                return;
            }
            this.vb = reference;
            // Update widget header
            if (reference.uri.scheme !== network_1.Schemas.inMemory) {
                this.setTitle((0, resources_1.$eg)(reference.uri), this.jb.getUriLabel((0, resources_1.$hg)(reference.uri)));
            }
            else {
                this.setTitle(nls.localize(2, null));
            }
            const promise = this.gb.createModelReference(reference.uri);
            if (this.m.getInput() === reference.parent) {
                this.m.reveal(reference);
            }
            else {
                if (revealParent) {
                    this.m.reveal(reference.parent);
                }
                await this.m.expand(reference.parent);
                this.m.reveal(reference);
            }
            const ref = await promise;
            if (!this.a) {
                // disposed
                ref.dispose();
                return;
            }
            (0, lifecycle_1.$fc)(this.v);
            // show in editor
            const model = ref.object;
            if (model) {
                const scrollType = this.t.getModel() === model.textEditorModel ? 0 /* ScrollType.Smooth */ : 1 /* ScrollType.Immediate */;
                const sel = range_1.$ks.lift(reference.range).collapseToStart();
                this.v = ref;
                this.t.setModel(model.textEditorModel);
                this.t.setSelection(sel);
                this.t.revealRangeInCenter(sel, scrollType);
            }
            else {
                this.t.setModel(this.T);
                ref.dispose();
            }
        }
    };
    exports.$K4 = $K4;
    exports.$K4 = $K4 = __decorate([
        __param(3, themeService_1.$gv),
        __param(4, resolverService_1.$uA),
        __param(5, instantiation_1.$Ah),
        __param(6, peekView.$G3),
        __param(7, label_1.$Vz),
        __param(8, undoRedo_1.$wu),
        __param(9, keybinding_1.$2D),
        __param(10, language_1.$ct),
        __param(11, languageConfigurationRegistry_1.$2t)
    ], $K4);
});
//# sourceMappingURL=referencesWidget.js.map