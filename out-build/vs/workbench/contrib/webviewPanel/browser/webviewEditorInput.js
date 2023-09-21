/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/common/editor/editorInput"], function (require, exports, network_1, uri_1, uuid_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cfb = void 0;
    class $cfb extends editorInput_1.$tA {
        static { this.typeId = 'workbench.editors.webviewInput'; }
        get typeId() {
            return $cfb.typeId;
        }
        get editorId() {
            return this.viewType;
        }
        get capabilities() {
            return 2 /* EditorInputCapabilities.Readonly */ | 8 /* EditorInputCapabilities.Singleton */ | 128 /* EditorInputCapabilities.CanDropIntoEditor */;
        }
        get resource() {
            return uri_1.URI.from({
                scheme: network_1.Schemas.webviewPanel,
                path: `webview-panel/webview-${this.c}`
            });
        }
        constructor(init, webview, t) {
            super();
            this.t = t;
            this.c = (0, uuid_1.$4f)();
            this.s = false;
            this.viewType = init.viewType;
            this.providedId = init.providedId;
            this.j = init.name;
            this.r = webview;
        }
        dispose() {
            if (!this.isDisposed()) {
                if (!this.s) {
                    this.r?.dispose();
                }
            }
            super.dispose();
        }
        getName() {
            return this.j;
        }
        getTitle(_verbosity) {
            return this.getName();
        }
        getDescription() {
            return undefined;
        }
        setName(value) {
            this.j = value;
            this.webview.setTitle(value);
            this.b.fire();
        }
        get webview() {
            return this.r;
        }
        get extension() {
            return this.webview.extension;
        }
        get iconPath() {
            return this.m;
        }
        set iconPath(value) {
            this.m = value;
            this.t.setIcons(this.c, value);
        }
        matches(other) {
            return super.matches(other) || other === this;
        }
        get group() {
            return this.n;
        }
        updateGroup(group) {
            this.n = group;
        }
        u(other) {
            if (this.s) {
                return undefined;
            }
            this.s = true;
            other.r = this.r;
            return other;
        }
    }
    exports.$cfb = $cfb;
});
//# sourceMappingURL=webviewEditorInput.js.map