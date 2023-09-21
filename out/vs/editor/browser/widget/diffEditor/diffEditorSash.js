/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/sash/sash", "vs/base/common/lifecycle", "vs/base/common/observable"], function (require, exports, sash_1, lifecycle_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorSash = void 0;
    class DiffEditorSash extends lifecycle_1.Disposable {
        constructor(_options, _domNode, _dimensions) {
            super();
            this._options = _options;
            this._domNode = _domNode;
            this._dimensions = _dimensions;
            this._sashRatio = (0, observable_1.observableValue)(this, undefined);
            this.sashLeft = (0, observable_1.derived)(this, reader => {
                const ratio = this._sashRatio.read(reader) ?? this._options.splitViewDefaultRatio.read(reader);
                return this._computeSashLeft(ratio, reader);
            });
            this._sash = this._register(new sash_1.Sash(this._domNode, {
                getVerticalSashTop: (_sash) => 0,
                getVerticalSashLeft: (_sash) => this.sashLeft.get(),
                getVerticalSashHeight: (_sash) => this._dimensions.height.get(),
            }, { orientation: 0 /* Orientation.VERTICAL */ }));
            this._startSashPosition = undefined;
            this._register(this._sash.onDidStart(() => {
                this._startSashPosition = this.sashLeft.get();
            }));
            this._register(this._sash.onDidChange((e) => {
                const contentWidth = this._dimensions.width.get();
                const sashPosition = this._computeSashLeft((this._startSashPosition + (e.currentX - e.startX)) / contentWidth, undefined);
                this._sashRatio.set(sashPosition / contentWidth, undefined);
            }));
            this._register(this._sash.onDidEnd(() => this._sash.layout()));
            this._register(this._sash.onDidReset(() => this._sashRatio.set(undefined, undefined)));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update sash layout */
                const enabled = this._options.enableSplitViewResizing.read(reader);
                this._sash.state = enabled ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
                this.sashLeft.read(reader);
                this._sash.layout();
            }));
        }
        setBoundarySashes(sashes) {
            this._sash.orthogonalEndSash = sashes.bottom;
        }
        _computeSashLeft(desiredRatio, reader) {
            const contentWidth = this._dimensions.width.read(reader);
            const midPoint = Math.floor(this._options.splitViewDefaultRatio.read(reader) * contentWidth);
            const sashLeft = this._options.enableSplitViewResizing.read(reader) ? Math.floor(desiredRatio * contentWidth) : midPoint;
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
    exports.DiffEditorSash = DiffEditorSash;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvclNhc2guanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvZGlmZkVkaXRvci9kaWZmRWRpdG9yU2FzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBYSxjQUFlLFNBQVEsc0JBQVU7UUFnQjdDLFlBQ2tCLFFBQTJCLEVBQzNCLFFBQXFCLEVBQ3JCLFdBQXdFO1lBRXpGLEtBQUssRUFBRSxDQUFDO1lBSlMsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7WUFDM0IsYUFBUSxHQUFSLFFBQVEsQ0FBYTtZQUNyQixnQkFBVyxHQUFYLFdBQVcsQ0FBNkQ7WUFsQnpFLGVBQVUsR0FBRyxJQUFBLDRCQUFlLEVBQXFCLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVuRSxhQUFRLEdBQUcsSUFBQSxvQkFBTyxFQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDakQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQy9GLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztZQUVjLFVBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksV0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQy9ELGtCQUFrQixFQUFFLENBQUMsS0FBVyxFQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxtQkFBbUIsRUFBRSxDQUFDLEtBQVcsRUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pFLHFCQUFxQixFQUFFLENB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