/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/mime"], function (require, exports, dom_1, lifecycle_1, mime_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.applyDragImage = exports.DataTransfers = exports.DelayedDragHandler = void 0;
    /**
     * A helper that will execute a provided function when the provided HTMLElement receives
     *  dragover event for 800ms. If the drag is aborted before, the callback will not be triggered.
     */
    class DelayedDragHandler extends lifecycle_1.Disposable {
        constructor(container, callback) {
            super();
            this._register((0, dom_1.addDisposableListener)(container, 'dragover', e => {
                e.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
                if (!this.timeout) {
                    this.timeout = setTimeout(() => {
                        callback();
                        this.timeout = null;
                    }, 800);
                }
            }));
            ['dragleave', 'drop', 'dragend'].forEach(type => {
                this._register((0, dom_1.addDisposableListener)(container, type, () => {
                    this.clearDragTimeout();
                }));
            });
        }
        clearDragTimeout() {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
        dispose() {
            super.dispose();
            this.clearDragTimeout();
        }
    }
    exports.DelayedDragHandler = DelayedDragHandler;
    // Common data transfers
    exports.DataTransfers = {
        /**
         * Application specific resource transfer type
         */
        RESOURCES: 'ResourceURLs',
        /**
         * Browser specific transfer type to download
         */
        DOWNLOAD_URL: 'DownloadURL',
        /**
         * Browser specific transfer type for files
         */
        FILES: 'Files',
        /**
         * Typically transfer type for copy/paste transfers.
         */
        TEXT: mime_1.Mimes.text,
        /**
         * Internal type used to pass around text/uri-list data.
         *
         * This is needed to work around https://bugs.chromium.org/p/chromium/issues/detail?id=239745.
         */
        INTERNAL_URI_LIST: 'application/vnd.code.uri-list',
    };
    function applyDragImage(event, label, clazz, backgroundColor, foregroundColor) {
        const dragImage = document.createElement('div');
        dragImage.className = clazz;
        dragImage.textContent = label;
        if (foregroundColor) {
            dragImage.style.color = foregroundColor;
        }
        if (backgroundColor) {
            dragImage.style.background = backgroundColor;
        }
        if (event.dataTransfer) {
            document.body.appendChild(dragImage);
            event.dataTransfer.setDragImage(dragImage, -10, -10);
            // Removes the element when the DND operation is done
            setTimeout(() => document.body.removeChild(dragImage), 0);
        }
    }
    exports.applyDragImage = applyDragImage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2RuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEc7OztPQUdHO0lBQ0gsTUFBYSxrQkFBbUIsU0FBUSxzQkFBVTtRQUdqRCxZQUFZLFNBQXNCLEVBQUUsUUFBb0I7WUFDdkQsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDL0QsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMscUhBQXFIO2dCQUV6SSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO3dCQUM5QixRQUFRLEVBQUUsQ0FBQzt3QkFFWCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDckIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUNSO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSwyQkFBcUIsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtvQkFDMUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzthQUNwQjtRQUNGLENBQUM7UUFFUSxPQUFPO1lBQ2YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWhCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pCLENBQUM7S0FDRDtJQXJDRCxnREFxQ0M7SUFFRCx3QkFBd0I7SUFDWCxRQUFBLGFBQWEsR0FBRztRQUU1Qjs7V0FFRztRQUNILFNBQVMsRUFBRSxjQUFjO1FBRXpCOztXQUVHO1FBQ0gsWUFBWSxFQUFFLGFBQWE7UUFFM0I7O1dBRUc7UUFDSCxLQUFLLEVBQUUsT0FBTztRQUVkOztXQUVHO1FBQ0gsSUFBSSxFQUFFLFlBQUssQ0FBQyxJQUFJO1FBRWhCOzs7O1dBSUc7UUFDSCxpQkFBaUIsRUFBRSwrQkFBK0I7S0FDbEQsQ0FBQztJQUVGLFNBQWdCLGNBQWMsQ0FBQyxLQUFnQixFQUFFLEtBQW9CLEVBQUUsS0FBYSxFQUFFLGVBQStCLEVBQUUsZUFBK0I7UUFDckosTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxTQUFTLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztRQUM1QixTQUFTLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztRQUU5QixJQUFJLGVBQWUsRUFBRTtZQUNwQixTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUM7U0FDeEM7UUFFRCxJQUFJLGVBQWUsRUFBRTtZQUNwQixTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUM7U0FDN0M7UUFFRCxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUU7WUFDdkIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckMsS0FBSyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFckQscURBQXFEO1lBQ3JELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMxRDtJQUNGLENBQUM7SUFwQkQsd0NBb0JDIn0=