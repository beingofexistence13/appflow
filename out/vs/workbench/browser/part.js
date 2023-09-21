/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/component", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/types", "vs/css!./media/part"], function (require, exports, component_1, dom_1, event_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Part = void 0;
    /**
     * Parts are layed out in the workbench and have their own layout that
     * arranges an optional title and mandatory content area to show content.
     */
    class Part extends component_1.Component {
        get dimension() { return this._dimension; }
        constructor(id, options, themeService, storageService, layoutService) {
            super(id, themeService, storageService);
            this.options = options;
            this.layoutService = layoutService;
            this._onDidVisibilityChange = this._register(new event_1.Emitter());
            this.onDidVisibilityChange = this._onDidVisibilityChange.event;
            //#region ISerializableView
            this._onDidChange = this._register(new event_1.Emitter());
            layoutService.registerPart(this);
        }
        onThemeChange(theme) {
            // only call if our create() method has been called
            if (this.parent) {
                super.onThemeChange(theme);
            }
        }
        updateStyles() {
            super.updateStyles();
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to create title and content area of the part.
         */
        create(parent, options) {
            this.parent = parent;
            this.titleArea = this.createTitleArea(parent, options);
            this.contentArea = this.createContentArea(parent, options);
            this.partLayout = new PartLayout(this.options, this.contentArea);
            this.updateStyles();
        }
        /**
         * Returns the overall part container.
         */
        getContainer() {
            return this.parent;
        }
        /**
         * Subclasses override to provide a title area implementation.
         */
        createTitleArea(parent, options) {
            return undefined;
        }
        /**
         * Returns the title area container.
         */
        getTitleArea() {
            return this.titleArea;
        }
        /**
         * Subclasses override to provide a content area implementation.
         */
        createContentArea(parent, options) {
            return undefined;
        }
        /**
         * Returns the content area container.
         */
        getContentArea() {
            return this.contentArea;
        }
        /**
         * Layout title and content area in the given dimension.
         */
        layoutContents(width, height) {
            const partLayout = (0, types_1.assertIsDefined)(this.partLayout);
            return partLayout.layout(width, height);
        }
        get onDidChange() { return this._onDidChange.event; }
        layout(width, height, _top, _left) {
            this._dimension = new dom_1.Dimension(width, height);
        }
        setVisible(visible) {
            this._onDidVisibilityChange.fire(visible);
        }
    }
    exports.Part = Part;
    class PartLayout {
        static { this.TITLE_HEIGHT = 35; }
        constructor(options, contentArea) {
            this.options = options;
            this.contentArea = contentArea;
        }
        layout(width, height) {
            // Title Size: Width (Fill), Height (Variable)
            let titleSize;
            if (this.options.hasTitle) {
                titleSize = new dom_1.Dimension(width, Math.min(height, PartLayout.TITLE_HEIGHT));
            }
            else {
                titleSize = dom_1.Dimension.None;
            }
            let contentWidth = width;
            if (this.options && typeof this.options.borderWidth === 'function') {
                contentWidth -= this.options.borderWidth(); // adjust for border size
            }
            // Content Size: Width (Fill), Height (Variable)
            const contentSize = new dom_1.Dimension(contentWidth, height - titleSize.height);
            // Content
            if (this.contentArea) {
                (0, dom_1.size)(this.contentArea, contentSize.width, contentSize.height);
            }
            return { titleSize, contentSize };
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRzs7O09BR0c7SUFDSCxNQUFzQixJQUFLLFNBQVEscUJBQVM7UUFHM0MsSUFBSSxTQUFTLEtBQTRCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFVbEUsWUFDQyxFQUFVLEVBQ0YsT0FBcUIsRUFDN0IsWUFBMkIsRUFDM0IsY0FBK0IsRUFDWixhQUFzQztZQUV6RCxLQUFLLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUxoQyxZQUFPLEdBQVAsT0FBTyxDQUFjO1lBR1Ysa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBYmhELDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVcsQ0FBQyxDQUFDO1lBQ2pFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUEyRm5FLDJCQUEyQjtZQUVqQixpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXlCLENBQUMsQ0FBQztZQTdFN0UsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRWtCLGFBQWEsQ0FBQyxLQUFrQjtZQUVsRCxtREFBbUQ7WUFDbkQsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO1FBQ0YsQ0FBQztRQUVRLFlBQVk7WUFDcEIsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILE1BQU0sQ0FBQyxNQUFtQixFQUFFLE9BQWdCO1lBQzNDLElBQUks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