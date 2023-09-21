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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/contrib/peekView/browser/peekView", "vs/nls!vs/editor/contrib/gotoError/browser/gotoErrorWidget", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/markers/common/markers", "vs/platform/opener/common/opener", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/css!./media/gotoErrorWidget"], function (require, exports, dom, scrollableElement_1, arrays_1, color_1, event_1, lifecycle_1, resources_1, strings_1, range_1, peekView_1, nls, menuEntryActionViewItem_1, actions_1, contextkey_1, instantiation_1, label_1, markers_1, opener_1, severityIcon_1, colorRegistry_1, themeService_1) {
    "use strict";
    var $c5_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$c5 = void 0;
    class MessageWidget {
        constructor(parent, editor, onRelatedInformation, k, l) {
            this.k = k;
            this.l = l;
            this.a = 0;
            this.b = 0;
            this.h = new WeakMap();
            this.i = new lifecycle_1.$jc();
            this.c = editor;
            const domNode = document.createElement('div');
            domNode.className = 'descriptioncontainer';
            this.d = document.createElement('div');
            this.d.classList.add('message');
            this.d.setAttribute('aria-live', 'assertive');
            this.d.setAttribute('role', 'alert');
            domNode.appendChild(this.d);
            this.f = document.createElement('div');
            domNode.appendChild(this.f);
            this.i.add(dom.$oO(this.f, 'click', event => {
                event.preventDefault();
                const related = this.h.get(event.target);
                if (related) {
                    onRelatedInformation(related);
                }
            }));
            this.g = new scrollableElement_1.$SP(domNode, {
                horizontal: 1 /* ScrollbarVisibility.Auto */,
                vertical: 1 /* ScrollbarVisibility.Auto */,
                useShadows: false,
                horizontalScrollbarSize: 6,
                verticalScrollbarSize: 6
            });
            parent.appendChild(this.g.getDomNode());
            this.i.add(this.g.onScroll(e => {
                domNode.style.left = `-${e.scrollLeft}px`;
                domNode.style.top = `-${e.scrollTop}px`;
            }));
            this.i.add(this.g);
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.i);
        }
        update(marker) {
            const { source, message, relatedInformation, code } = marker;
            let sourceAndCodeLength = (source?.length || 0) + '()'.length;
            if (code) {
                if (typeof code === 'string') {
                    sourceAndCodeLength += code.length;
                }
                else {
                    sourceAndCodeLength += code.value.length;
                }
            }
            const lines = (0, strings_1.$Ae)(message);
            this.a = lines.length;
            this.b = 0;
            for (const line of lines) {
                this.b = Math.max(line.length + sourceAndCodeLength, this.b);
            }
            dom.$lO(this.d);
            this.d.setAttribute('aria-label', this.m(marker));
            this.c.applyFontInfo(this.d);
            let lastLineElement = this.d;
            for (const line of lines) {
                lastLineElement = document.createElement('div');
                lastLineElement.innerText = line;
                if (line === '') {
                    lastLineElement.style.height = this.d.style.lineHeight;
                }
                this.d.appendChild(lastLineElement);
            }
            if (source || code) {
                const detailsElement = document.createElement('span');
                detailsElement.classList.add('details');
                lastLineElement.appendChild(detailsElement);
                if (source) {
                    const sourceElement = document.createElement('span');
                    sourceElement.innerText = source;
                    sourceElement.classList.add('source');
                    detailsElement.appendChild(sourceElement);
                }
                if (code) {
                    if (typeof code === 'string') {
                        const codeElement = document.createElement('span');
                        codeElement.innerText = `(${code})`;
                        codeElement.classList.add('code');
                        detailsElement.appendChild(codeElement);
                    }
                    else {
                        this.j = dom.$('a.code-link');
                        this.j.setAttribute('href', `${code.target.toString()}`);
                        this.j.onclick = (e) => {
                            this.k.open(code.target, { allowCommands: true });
                            e.preventDefault();
                            e.stopPropagation();
                        };
                        const codeElement = dom.$0O(this.j, dom.$('span'));
                        codeElement.innerText = code.value;
                        detailsElement.appendChild(this.j);
                    }
                }
            }
            dom.$lO(this.f);
            this.c.applyFontInfo(this.f);
            if ((0, arrays_1.$Jb)(relatedInformation)) {
                const relatedInformationNode = this.f.appendChild(document.createElement('div'));
                relatedInformationNode.style.paddingTop = `${Math.floor(this.c.getOption(66 /* EditorOption.lineHeight */) * 0.66)}px`;
                this.a += 1;
                for (const related of relatedInformation) {
                    const container = document.createElement('div');
                    const relatedResource = document.createElement('a');
                    relatedResource.classList.add('filename');
                    relatedResource.innerText = `${this.l.getUriBasenameLabel(related.resource)}(${related.startLineNumber}, ${related.startColumn}): `;
                    relatedResource.title = this.l.getUriLabel(related.resource);
                    this.h.set(relatedResource, related);
                    const relatedMessage = document.createElement('span');
                    relatedMessage.innerText = related.message;
                    container.appendChild(relatedResource);
                    container.appendChild(relatedMessage);
                    this.a += 1;
                    relatedInformationNode.appendChild(container);
                }
            }
            const fontInfo = this.c.getOption(50 /* EditorOption.fontInfo */);
            const scrollWidth = Math.ceil(fontInfo.typicalFullwidthCharacterWidth * this.b * 0.75);
            const scrollHeight = fontInfo.lineHeight * this.a;
            this.g.setScrollDimensions({ scrollWidth, scrollHeight });
        }
        layout(height, width) {
            this.g.getDomNode().style.height = `${height}px`;
            this.g.getDomNode().style.width = `${width}px`;
            this.g.setScrollDimensions({ width, height });
        }
        getHeightInLines() {
            return Math.min(17, this.a);
        }
        m(marker) {
            let severityLabel = '';
            switch (marker.severity) {
                case markers_1.MarkerSeverity.Error:
                    severityLabel = nls.localize(0, null);
                    break;
                case markers_1.MarkerSeverity.Warning:
                    severityLabel = nls.localize(1, null);
                    break;
                case markers_1.MarkerSeverity.Info:
                    severityLabel = nls.localize(2, null);
                    break;
                case markers_1.MarkerSeverity.Hint:
                    severityLabel = nls.localize(3, null);
                    break;
            }
            let ariaLabel = nls.localize(4, null, severityLabel, marker.startLineNumber + ':' + marker.startColumn);
            const model = this.c.getModel();
            if (model && (marker.startLineNumber <= model.getLineCount()) && (marker.startLineNumber >= 1)) {
                const lineContent = model.getLineContent(marker.startLineNumber);
                ariaLabel = `${lineContent}, ${ariaLabel}`;
            }
            return ariaLabel;
        }
    }
    let $c5 = class $c5 extends peekView_1.$I3 {
        static { $c5_1 = this; }
        static { this.TitleMenu = new actions_1.$Ru('gotoErrorTitleMenu'); }
        constructor(editor, t, v, T, instantiationService, cb, db) {
            super(editor, { showArrow: true, showFrame: true, isAccessible: true, frameWidth: 1 }, instantiationService);
            this.t = t;
            this.v = v;
            this.T = T;
            this.cb = cb;
            this.db = db;
            this.i = new lifecycle_1.$jc();
            this.p = new event_1.$fd();
            this.onDidSelectRelatedInformation = this.p.event;
            this.l = markers_1.MarkerSeverity.Warning;
            this.m = color_1.$Os.white;
            this.eb(t.getColorTheme());
            this.i.add(t.onDidColorThemeChange(this.eb.bind(this)));
            this.create();
        }
        eb(theme) {
            this.m = theme.getColor(editorMarkerNavigationBackground);
            let colorId = editorMarkerNavigationError;
            let headerBackground = editorMarkerNavigationErrorHeader;
            if (this.l === markers_1.MarkerSeverity.Warning) {
                colorId = editorMarkerNavigationWarning;
                headerBackground = editorMarkerNavigationWarningHeader;
            }
            else if (this.l === markers_1.MarkerSeverity.Info) {
                colorId = editorMarkerNavigationInfo;
                headerBackground = editorMarkerNavigationInfoHeader;
            }
            const frameColor = theme.getColor(colorId);
            const headerBg = theme.getColor(headerBackground);
            this.style({
                arrowColor: frameColor,
                frameColor: frameColor,
                headerBackgroundColor: headerBg,
                primaryHeadingColor: theme.getColor(peekView_1.$K3),
                secondaryHeadingColor: theme.getColor(peekView_1.$L3)
            }); // style() will trigger _applyStyles
        }
        q() {
            if (this.a) {
                this.a.style.backgroundColor = this.m ? this.m.toString() : '';
            }
            super.q();
        }
        dispose() {
            this.i.dispose();
            super.dispose();
        }
        focus() {
            this.a.focus();
        }
        U(container) {
            super.U(container);
            this.o.add(this.O.actionRunner.onWillRun(e => this.editor.focus()));
            const actions = [];
            const menu = this.T.createMenu($c5_1.TitleMenu, this.cb);
            (0, menuEntryActionViewItem_1.$B3)(menu, undefined, actions);
            this.O.push(actions, { label: false, icon: true, index: 0 });
            menu.dispose();
        }
        V(container) {
            this.c = dom.$0O(container, dom.$(''));
        }
        Y(container) {
            this.a = container;
            container.classList.add('marker-widget');
            this.a.tabIndex = 0;
            this.a.setAttribute('role', 'tooltip');
            this.b = document.createElement('div');
            container.appendChild(this.b);
            this.d = new MessageWidget(this.b, this.editor, related => this.p.fire(related), this.v, this.db);
            this.o.add(this.d);
        }
        show() {
            throw new Error('call showAtMarker');
        }
        showAtMarker(marker, markerIdx, markerCount) {
            // update:
            // * title
            // * message
            this.b.classList.remove('stale');
            this.d.update(marker);
            // update frame color (only applied on 'show')
            this.l = marker.severity;
            this.eb(this.t.getColorTheme());
            // show
            const range = range_1.$ks.lift(marker);
            const editorPosition = this.editor.getPosition();
            const position = editorPosition && range.containsPosition(editorPosition) ? editorPosition : range.getStartPosition();
            super.show(position, this.mb());
            const model = this.editor.getModel();
            if (model) {
                const detail = markerCount > 1
                    ? nls.localize(5, null, markerIdx, markerCount)
                    : nls.localize(6, null, markerIdx, markerCount);
                this.setTitle((0, resources_1.$fg)(model.uri), detail);
            }
            this.c.className = `codicon ${severityIcon_1.SeverityIcon.className(markers_1.MarkerSeverity.toSeverity(this.l))}`;
            this.editor.revealPositionNearTop(position, 0 /* ScrollType.Smooth */);
            this.editor.focus();
        }
        updateMarker(marker) {
            this.b.classList.remove('stale');
            this.d.update(marker);
        }
        showStale() {
            this.b.classList.add('stale');
            this.H();
        }
        bb(heightInPixel, widthInPixel) {
            super.bb(heightInPixel, widthInPixel);
            this.r = heightInPixel;
            this.d.layout(heightInPixel, widthInPixel);
            this.b.style.height = `${heightInPixel}px`;
        }
        F(widthInPixel) {
            this.d.layout(this.r, widthInPixel);
        }
        H() {
            super.H(this.mb());
        }
        mb() {
            return 3 + this.d.getHeightInLines();
        }
    };
    exports.$c5 = $c5;
    exports.$c5 = $c5 = $c5_1 = __decorate([
        __param(1, themeService_1.$gv),
        __param(2, opener_1.$NT),
        __param(3, actions_1.$Su),
        __param(4, instantiation_1.$Ah),
        __param(5, contextkey_1.$3i),
        __param(6, label_1.$Vz)
    ], $c5);
    // theming
    const errorDefault = (0, colorRegistry_1.$3y)(colorRegistry_1.$lw, colorRegistry_1.$mw);
    const warningDefault = (0, colorRegistry_1.$3y)(colorRegistry_1.$ow, colorRegistry_1.$pw);
    const infoDefault = (0, colorRegistry_1.$3y)(colorRegistry_1.$rw, colorRegistry_1.$sw);
    const editorMarkerNavigationError = (0, colorRegistry_1.$sv)('editorMarkerNavigationError.background', { dark: errorDefault, light: errorDefault, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(7, null));
    const editorMarkerNavigationErrorHeader = (0, colorRegistry_1.$sv)('editorMarkerNavigationError.headerBackground', { dark: (0, colorRegistry_1.$1y)(editorMarkerNavigationError, .1), light: (0, colorRegistry_1.$1y)(editorMarkerNavigationError, .1), hcDark: null, hcLight: null }, nls.localize(8, null));
    const editorMarkerNavigationWarning = (0, colorRegistry_1.$sv)('editorMarkerNavigationWarning.background', { dark: warningDefault, light: warningDefault, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(9, null));
    const editorMarkerNavigationWarningHeader = (0, colorRegistry_1.$sv)('editorMarkerNavigationWarning.headerBackground', { dark: (0, colorRegistry_1.$1y)(editorMarkerNavigationWarning, .1), light: (0, colorRegistry_1.$1y)(editorMarkerNavigationWarning, .1), hcDark: '#0C141F', hcLight: (0, colorRegistry_1.$1y)(editorMarkerNavigationWarning, .2) }, nls.localize(10, null));
    const editorMarkerNavigationInfo = (0, colorRegistry_1.$sv)('editorMarkerNavigationInfo.background', { dark: infoDefault, light: infoDefault, hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, nls.localize(11, null));
    const editorMarkerNavigationInfoHeader = (0, colorRegistry_1.$sv)('editorMarkerNavigationInfo.headerBackground', { dark: (0, colorRegistry_1.$1y)(editorMarkerNavigationInfo, .1), light: (0, colorRegistry_1.$1y)(editorMarkerNavigationInfo, .1), hcDark: null, hcLight: null }, nls.localize(12, null));
    const editorMarkerNavigationBackground = (0, colorRegistry_1.$sv)('editorMarkerNavigation.background', { dark: colorRegistry_1.$ww, light: colorRegistry_1.$ww, hcDark: colorRegistry_1.$ww, hcLight: colorRegistry_1.$ww }, nls.localize(13, null));
});
//# sourceMappingURL=gotoErrorWidget.js.map