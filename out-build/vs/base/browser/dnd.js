/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/mime"], function (require, exports, dom_1, lifecycle_1, mime_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DP = exports.$CP = exports.$BP = void 0;
    /**
     * A helper that will execute a provided function when the provided HTMLElement receives
     *  dragover event for 800ms. If the drag is aborted before, the callback will not be triggered.
     */
    class $BP extends lifecycle_1.$kc {
        constructor(container, callback) {
            super();
            this.B((0, dom_1.$nO)(container, 'dragover', e => {
                e.preventDefault(); // needed so that the drop event fires (https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome)
                if (!this.a) {
                    this.a = setTimeout(() => {
                        callback();
                        this.a = null;
                    }, 800);
                }
            }));
            ['dragleave', 'drop', 'dragend'].forEach(type => {
                this.B((0, dom_1.$nO)(container, type, () => {
                    this.b();
                }));
            });
        }
        b() {
            if (this.a) {
                clearTimeout(this.a);
                this.a = null;
            }
        }
        dispose() {
            super.dispose();
            this.b();
        }
    }
    exports.$BP = $BP;
    // Common data transfers
    exports.$CP = {
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
        TEXT: mime_1.$Hr.text,
        /**
         * Internal type used to pass around text/uri-list data.
         *
         * This is needed to work around https://bugs.chromium.org/p/chromium/issues/detail?id=239745.
         */
        INTERNAL_URI_LIST: 'application/vnd.code.uri-list',
    };
    function $DP(event, label, clazz, backgroundColor, foregroundColor) {
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
    exports.$DP = $DP;
});
//# sourceMappingURL=dnd.js.map