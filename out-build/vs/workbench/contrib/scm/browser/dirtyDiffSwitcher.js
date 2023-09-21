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
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/dirtyDiffSwitcher", "vs/base/common/actions", "vs/platform/contextview/browser/contextView", "vs/base/browser/ui/actionbar/actionViewItems", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/themeService", "vs/editor/contrib/peekView/browser/peekView", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls, actions_1, contextView_1, actionViewItems_1, defaultStyles_1, themeService_1, peekView_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ceb = exports.$beb = void 0;
    let $beb = class $beb extends actionViewItems_1.$OQ {
        constructor(action, providers, selected, contextViewService, themeService) {
            const items = providers.map(provider => ({ provider, text: provider }));
            let startingSelection = providers.indexOf(selected);
            if (startingSelection === -1) {
                startingSelection = 0;
            }
            const styles = { ...defaultStyles_1.$B2 };
            const theme = themeService.getColorTheme();
            const editorBackgroundColor = theme.getColor(colorRegistry_1.$ww);
            const peekTitleColor = theme.getColor(peekView_1.$J3);
            const opaqueTitleColor = peekTitleColor?.makeOpaque(editorBackgroundColor) ?? editorBackgroundColor;
            styles.selectBackground = opaqueTitleColor.lighten(.6).toString();
            super(null, action, items, startingSelection, contextViewService, styles, { ariaLabel: nls.localize(0, null) });
            this.a = items;
        }
        setSelection(provider) {
            const index = this.a.findIndex(item => item.provider === provider);
            this.select(index);
        }
        r(_, index) {
            return this.a[index];
        }
        render(container) {
            super.render(container);
            this.setFocusable(true);
        }
    };
    exports.$beb = $beb;
    exports.$beb = $beb = __decorate([
        __param(3, contextView_1.$VZ),
        __param(4, themeService_1.$gv)
    ], $beb);
    class $ceb extends actions_1.$gi {
        static { this.ID = 'quickDiff.base.switch'; }
        static { this.LABEL = nls.localize(1, null); }
        constructor(a) {
            super($ceb.ID, $ceb.LABEL, undefined, undefined);
            this.a = a;
        }
        async run(event) {
            return this.a(event);
        }
    }
    exports.$ceb = $ceb;
});
//# sourceMappingURL=dirtyDiffSwitcher.js.map