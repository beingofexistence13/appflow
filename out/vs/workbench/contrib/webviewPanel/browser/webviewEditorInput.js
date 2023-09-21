/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/common/editor/editorInput"], function (require, exports, network_1, uri_1, uuid_1, editorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewInput = void 0;
    class WebviewInput extends editorInput_1.EditorInput {
        static { this.typeId = 'workbench.editors.webviewInput'; }
        get typeId() {
            return WebviewInput.typeId;
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
                path: `webview-panel/webview-${this._resourceId}`
            });
        }
        constructor(init, webview, _iconManager) {
            super();
            this._iconManager = _iconManager;
            this._resourceId = (0, uuid_1.generateUuid)();
            this._hasTransfered = false;
            this.viewType = init.viewType;
            this.providedId = init.providedId;
            this._name = init.name;
            this._webview = webview;
        }
        dispose() {
            if (!this.isDisposed()) {
                if (!this._hasTransfered) {
                    this._webview?.dispose();
                }
            }
            super.dispose();
        }
        getName() {
            return this._name;
        }
        getTitle(_verbosity) {
            return this.getName();
        }
        getDescription() {
            return undefined;
        }
        setName(value) {
            this._name = value;
            this.webview.setTitle(value);
            this._onDidChangeLabel.fire();
        }
        get webview() {
            return this._webview;
        }
        get extension() {
            return this.webview.extension;
        }
        get iconPath() {
            return this._iconPath;
        }
        set iconPath(value) {
            this._iconPath = value;
            this._iconManager.setIcons(this._resourceId, value);
        }
        matches(other) {
            return super.matches(other) || other === this;
        }
        get group() {
            return this._group;
        }
        updateGroup(group) {
            this._group = group;
        }
        transfer(other) {
            if (this._hasTransfered) {
                return undefined;
            }
            this._hasTransfered = true;
            other._webview = this._webview;
            return other;
        }
    }
    exports.WebviewInput = WebviewInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld0VkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlld1BhbmVsL2Jyb3dzZXIvd2Vidmlld0VkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdCaEcsTUFBYSxZQUFhLFNBQVEseUJBQVc7aUJBRTlCLFdBQU0sR0FBRyxnQ0FBZ0MsQUFBbkMsQ0FBb0M7UUFFeEQsSUFBb0IsTUFBTTtZQUN6QixPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDNUIsQ0FBQztRQUVELElBQW9CLFFBQVE7WUFDM0IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFvQixZQUFZO1lBQy9CLE9BQU8sb0ZBQW9FLHNEQUE0QyxDQUFDO1FBQ3pILENBQUM7UUFZRCxJQUFJLFFBQVE7WUFDWCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsTUFBTSxFQUFFLGlCQUFPLENBQUMsWUFBWTtnQkFDNUIsSUFBSSxFQUFFLHlCQUF5QixJQUFJLENBQUMsV0FBVyxFQUFFO2FBQ2pELENBQUMsQ0FBQztRQUNKLENBQUM7UUFLRCxZQUNDLElBQTBCLEVBQzFCLE9BQXdCLEVBQ1AsWUFBZ0M7WUFFakQsS0FBSyxFQUFFLENBQUM7WUFGUyxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7WUF2QmpDLGdCQUFXLEdBQUcsSUFBQSxtQkFBWSxHQUFFLENBQUM7WUFRdEMsbUJBQWMsR0FBRyxLQUFLLENBQUM7WUFtQjlCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFFbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLENBQUM7UUFFUSxPQUFPO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3pCLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUM7aUJBQ3pCO2FBQ0Q7WUFDRCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVlLE9BQU87WUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFZSxRQUFRLENBQUMsVUFBc0I7WUFDOUMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVlLGNBQWM7WUFDN0IsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLE9BQU8sQ0FBQyxLQUFhO1lBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBVyxPQUFPO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN0QixDQUFDO1FBRUQsSUFBVyxTQUFTO1lBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQVcsUUFBUTtZQUNsQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQVcsUUFBUSxDQUFDLEtBQStCO1lBQ2xELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVlLE9BQU8sQ0FBQyxLQUF3QztZQUMvRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQztRQUMvQyxDQUFDO1FBRUQsSUFBVyxLQUFLO1lBQ2YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFTSxXQUFXLENBQUMsS0FBc0I7WUFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUVTLFFBQVEsQ0FBQyxLQUFtQjtZQUNyQyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3hCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDM0IsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQzs7SUFqSEYsb0NBa0hDIn0=