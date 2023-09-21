/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/sash/sash", "vs/base/common/lifecycle", "vs/base/common/observable"], function (require, exports, sash_1, lifecycle_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$NZ = void 0;
    class $NZ extends lifecycle_1.$kc {
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = (0, observable_1.observableValue)(this, undefined);
            this.sashLeft = (0, observable_1.derived)(this, reader => {
                const ratio = this.a.read(reader) ?? this.f.splitViewDefaultRatio.read(reader);
                return this.j(ratio, reader);
            });
            this.b = this.B(new sash_1.$aR(this.g, {
                getVerticalSashTop: (_sash) => 0,
                getVerticalSashLeft: (_sash) => this.sashLeft.get(),
                getVerticalSashHeight: (_sash) => this.h.height.get(),
            }, { orientation: 0 /* Orientation.VERTICAL */ }));
            this.c = undefined;
            this.B(this.b.onDidStart(() => {
                this.c = this.sashLeft.get();
            }));
            this.B(this.b.onDidChange((e) => {
                const contentWidth = this.h.width.get();
                const sashPosition = this.j((this.c + (e.currentX - e.startX)) / contentWidth, undefined);
                this.a.set(sashPosition / contentWidth, undefined);
            }));
            this.B(this.b.onDidEnd(() => this.b.layout()));
            this.B(this.b.onDidReset(() => this.a.set(undefined, undefined)));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update sash layout */
                const enabled = this.f.enableSplitViewResizing.read(reader);
                this.b.state = enabled ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
                this.sashLeft.read(reader);
                this.b.layout();
            }));
        }
        setBoundarySashes(sashes) {
            this.b.orthogonalEndSash = sashes.bottom;
        }
        j(desiredRatio, reader) {
            const contentWidth = this.h.width.read(reader);
            const midPoint = Math.floor(this.f.splitViewDefaultRatio.read(reader) * contentWidth);
            const sashLeft = this.f.enableSplitViewResizing.read(reader) ? Math.floor(desiredRatio * contentWidth) : midPoint;
            const MINIMUM_EDITOR_WIDTH = 100;
            if (contentWidth <= MINIMUM_EDITOR_WIDTH * 2) {
                return midPoint;
            }
            if (sashLeft < MINIMUM_EDITOR_WIDTH) {
                return MINIMUM_EDITOR_WIDTH;
            }
            if (sashLeft > contentWidth - MINIMUM_EDITOR_WIDTH) {
                return contentWidth - MINIMUM_EDITOR_WIDTH;
            }
            return sashLeft;
        }
    }
    exports.$NZ = $NZ;
});
//# sourceMappingURL=diffEditorSash.js.map