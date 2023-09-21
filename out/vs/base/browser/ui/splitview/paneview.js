/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "./splitview", "vs/css!./paneview"], function (require, exports, browser_1, dnd_1, dom_1, event_1, keyboardEvent_1, touch_1, color_1, event_2, lifecycle_1, nls_1, splitview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PaneView = exports.DefaultPaneDndController = exports.Pane = void 0;
    /**
     * A Pane is a structured SplitView view.
     *
     * WARNING: You must call `render()` after you construct it.
     * It can't be done automatically at the end of the ctor
     * because of the order of property initialization in TypeScript.
     * Subclasses wouldn't be able to set own properties
     * before the `render()` call, thus forbidding their use.
     */
    class Pane extends lifecycle_1.Disposable {
        static { this.HEADER_SIZE = 22; }
        get ariaHeaderLabel() {
            return this._ariaHeaderLabel;
        }
        set ariaHeaderLabel(newLabel) {
            this._ariaHeaderLabel = newLabel;
            this.header.setAttribute('aria-label', this.ariaHeaderLabel);
        }
        get draggableElement() {
            return this.header;
        }
        get dropTargetElement() {
            return this.element;
        }
        get dropBackground() {
            return this.styles.dropBackground;
        }
        get minimumBodySize() {
            return this._minimumBodySize;
        }
        set minimumBodySize(size) {
            this._minimumBodySize = size;
            this._onDidChange.fire(undefined);
        }
        get maximumBodySize() {
            return this._maximumBodySize;
        }
        set maximumBodySize(size) {
            this._maximumBodySize = size;
            this._onDidChange.fire(undefined);
        }
        get headerSize() {
            return this.headerVisible ? Pane.HEADER_SIZE : 0;
        }
        get minimumSize() {
            const headerSize = this.headerSize;
            const expanded = !this.headerVisible || this.isExpanded();
            const minimumBodySize = expanded ? this.minimumBodySize : 0;
            return headerSize + minimumBodySize;
        }
        get maximumSize() {
            const headerSize = this.headerSize;
            const expanded = !this.headerVisible || this.isExpanded();
            const maximumBodySize = expanded ? this.maximumBodySize : 0;
            return headerSize + maximumBodySize;
        }
        constructor(options) {
            super();
            this.expandedSize = undefined;
            this._headerVisible = true;
            this._bodyRendered = false;
            this.styles = {
                dropBackground: undefined,
                headerBackground: undefined,
                headerBorder: undefined,
                headerForeground: undefined,
                leftBorder: undefined
            };
            this.animationTimer = undefined;
            this._onDidChange = this._register(new event_2.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidChangeExpansionState = this._register(new event_2.Emitter());
            this.onDidChangeExpansionState = this._onDidChangeExpansionState.event;
            this.orthogonalSize = 0;
            this._expanded = typeof options.expanded === 'undefined' ? true : !!options.expanded;
            this._orientation = typeof options.orientation === 'undefined' ? 0 /* Orientation.VERTICAL */ : options.orientation;
            this._ariaHeaderLabel = (0, nls_1.localize)('viewSection', "{0} Section", options.title);
            this._minimumBodySize = typeof options.minimumBodySize === 'number' ? options.minimumBodySize : this._orientation === 1 /* Orientation.HORIZONTAL */ ? 200 : 120;
            this._maximumBodySize = typeof options.maximumBodySize === 'number' ? options.maximumBodySize : Number.POSITIVE_INFINITY;
            this.element = (0, dom_1.$)('.pane');
        }
        isExpanded() {
            return this._expanded;
        }
        setExpanded(expanded) {
            if (this._expanded === !!expanded) {
                return false;
            }
            this.element?.classList.toggle('expanded', expanded);
            this._expanded = !!expanded;
            this.updateHeader();
            if (expanded) {
                if (!this._bodyRendered) {
                    this.renderBody(this.body);
                    this._bodyRendered = true;
                }
                if (typeof this.animationTimer === 'number') {
                    clearTimeout(this.animationTimer);
                }
                (0, dom_1.append)(this.element, this.body);
            }
            else {
                this.animationTimer = window.setTimeout(() => {
                    this.body.remove();
                }, 200);
            }
            this._onDidChangeExpansionState.fire(expanded);
            this._onDidChange.fire(expanded ? this.expandedSize : undefined);
            return true;
        }
        get headerVisible() {
            return this._headerVisible;
        }
        set headerVisible(visible) {
            if (this._headerVisible === !!visible) {
                return;
            }
            this._headerVisible = !!visible;
            this.updateHeader();
            this._onDidChange.fire(undefined);
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(orientation) {
            if (this._orientation === orientation) {
                return;
            }
            this._orientation = orientation;
            if (this.element) {
                this.element.classList.toggle('horizontal', this.orientation === 1 /* Orientation.HORIZONTAL */);
                this.element.classList.toggle('vertical', this.orientation === 0 /* Orientation.VERTICAL */);
            }
            if (this.header) {
                this.updateHeader();
            }
        }
        render() {
            this.element.classList.toggle('expanded', this.isExpanded());
            this.element.classList.toggle('horizontal', this.orientation === 1 /* Orientation.HORIZONTAL */);
            this.element.classList.toggle('vertical', this.orientation === 0 /* Orientation.VERTICAL */);
            this.header = (0, dom_1.$)('.pane-header');
            (0, dom_1.append)(this.element, this.header);
            this.header.setAttribute('tabindex', '0');
            // Use role button so the aria-expanded state gets read https://github.com/microsoft/vscode/issues/95996
            this.header.setAttribute('role', 'button');
            this.header.setAttribute('aria-label', this.ariaHeaderLabel);
            this.renderHeader(this.header);
            const focusTracker = (0, dom_1.trackFocus)(this.header);
            this._register(focusTracker);
            this._register(focusTracker.onDidFocus(() => this.header.classList.add('focused'), null));
            this._register(focusTracker.onDidBlur(() => this.header.classList.remove('focused'), null));
            this.updateHeader();
            const eventDisposables = this._register(new lifecycle_1.DisposableStore());
            const onKeyDown = this._register(new event_1.DomEmitter(this.header, 'keydown'));
            const onHeaderKeyDown = event_2.Event.map(onKeyDown.event, e => new keyboardEvent_1.StandardKeyboardEvent(e), eventDisposables);
            this._register(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */ || e.keyCode === 10 /* KeyCode.Space */, eventDisposables)(() => this.setExpanded(!this.isExpanded()), null));
            this._register(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 15 /* KeyCode.LeftArrow */, eventDisposables)(() => this.setExpanded(false), null));
            this._register(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 17 /* KeyCode.RightArrow */, eventDisposables)(() => this.setExpanded(true), null));
            this._register(touch_1.Gesture.addTarget(this.header));
            [dom_1.EventType.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this._register((0, dom_1.addDisposableListener)(this.header, eventType, e => {
                    if (!e.defaultPrevented) {
                        this.setExpanded(!this.isExpanded());
                    }
                }));
            });
            this.body = (0, dom_1.append)(this.element, (0, dom_1.$)('.pane-body'));
            // Only render the body if it will be visible
            // Otherwise, render it when the pane is expanded
            if (!this._bodyRendered && this.isExpanded()) {
                this.renderBody(this.body);
                this._bodyRendered = true;
            }
            if (!this.isExpanded()) {
                this.body.remove();
            }
        }
        layout(size) {
            const headerSize = this.headerVisible ? Pane.HEADER_SIZE : 0;
            const width = this._orientation === 0 /* Orientation.VERTICAL */ ? this.orthogonalSize : size;
            const height = this._orientation === 0 /* Orientation.VERTICAL */ ? size - headerSize : this.orthogonalSize - headerSize;
            if (this.isExpanded()) {
                this.body.classList.toggle('wide', width >= 600);
                this.layoutBody(height, width);
                this.expandedSize = size;
            }
        }
        style(styles) {
            this.styles = styles;
            if (!this.header) {
                return;
            }
            this.updateHeader();
        }
        updateHeader() {
            const expanded = !this.headerVisible || this.isExpanded();
            this.header.style.lineHeight = `${this.headerSize}px`;
            this.header.classList.toggle('hidden', !this.headerVisible);
            this.header.classList.toggle('expanded', expanded);
            this.header.setAttribute('aria-expanded', String(expanded));
            this.header.style.color = this.styles.headerForeground ?? '';
            this.header.style.backgroundColor = this.styles.headerBackground ?? '';
            this.header.style.borderTop = this.styles.headerBorder && this.orientation === 0 /* Orientation.VERTICAL */ ? `1px solid ${this.styles.headerBorder}` : '';
            this.element.style.borderLeft = this.styles.leftBorder && this.orientation === 1 /* Orientation.HORIZONTAL */ ? `1px solid ${this.styles.leftBorder}` : '';
        }
    }
    exports.Pane = Pane;
    class PaneDraggable extends lifecycle_1.Disposable {
        static { this.DefaultDragOverBackgroundColor = new color_1.Color(new color_1.RGBA(128, 128, 128, 0.5)); }
        constructor(pane, dnd, context) {
            super();
            this.pane = pane;
            this.dnd = dnd;
            this.context = context;
            this.dragOverCounter = 0; // see https://github.com/microsoft/vscode/issues/14470
            this._onDidDrop = this._register(new event_2.Emitter());
            this.onDidDrop = this._onDidDrop.event;
            pane.draggableElement.draggable = true;
            this._register((0, dom_1.addDisposableListener)(pane.draggableElement, 'dragstart', e => this.onDragStart(e)));
            this._register((0, dom_1.addDisposableListener)(pane.dropTargetElement, 'dragenter', e => this.onDragEnter(e)));
            this._register((0, dom_1.addDisposableListener)(pane.dropTargetElement, 'dragleave', e => this.onDragLeave(e)));
            this._register((0, dom_1.addDisposableListener)(pane.dropTargetElement, 'dragend', e => this.onDragEnd(e)));
            this._register((0, dom_1.addDisposableListener)(pane.dropTargetElement, 'drop', e => this.onDrop(e)));
        }
        onDragStart(e) {
            if (!this.dnd.canDrag(this.pane) || !e.dataTransfer) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.dataTransfer.effectAllowed = 'move';
            if (browser_1.isFirefox) {
                // Firefox: requires to set a text data transfer to get going
                e.dataTransfer?.setData(dnd_1.DataTransfers.TEXT, this.pane.draggableElement.textContent || '');
            }
            const dragImage = (0, dom_1.append)(document.body, (0, dom_1.$)('.monaco-drag-image', {}, this.pane.draggableElement.textContent || ''));
            e.dataTransfer.setDragImage(dragImage, -10, -10);
            setTimeout(() => document.body.removeChild(dragImage), 0);
            this.context.draggable = this;
        }
        onDragEnter(e) {
            if (!this.context.draggable || this.context.draggable === this) {
                return;
            }
            if (!this.dnd.canDrop(this.context.draggable.pane, this.pane)) {
                return;
            }
            this.dragOverCounter++;
            this.render();
        }
        onDragLeave(e) {
            if (!this.context.draggable || this.context.draggable === this) {
                return;
            }
            if (!this.dnd.canDrop(this.context.draggable.pane, this.pane)) {
                return;
            }
            this.dragOverCounter--;
            if (this.dragOverCounter === 0) {
                this.render();
            }
        }
        onDragEnd(e) {
            if (!this.context.draggable) {
                return;
            }
            this.dragOverCounter = 0;
            this.render();
            this.context.draggable = null;
        }
        onDrop(e) {
            if (!this.context.draggable) {
                return;
            }
            dom_1.EventHelper.stop(e);
            this.dragOverCounter = 0;
            this.render();
            if (this.dnd.canDrop(this.context.draggable.pane, this.pane) && this.context.draggable !== this) {
                this._onDidDrop.fire({ from: this.context.draggable.pane, to: this.pane });
            }
            this.context.draggable = null;
        }
        render() {
            let backgroundColor = null;
            if (this.dragOverCounter > 0) {
                backgroundColor = this.pane.dropBackground ?? PaneDraggable.DefaultDragOverBackgroundColor.toString();
            }
            this.pane.dropTargetElement.style.backgroundColor = backgroundColor || '';
        }
    }
    class DefaultPaneDndController {
        canDrag(pane) {
            return true;
        }
        canDrop(pane, overPane) {
            return true;
        }
    }
    exports.DefaultPaneDndController = DefaultPaneDndController;
    class PaneView extends lifecycle_1.Disposable {
        constructor(container, options = {}) {
            super();
            this.dndContext = { draggable: null };
            this.paneItems = [];
            this.orthogonalSize = 0;
            this.size = 0;
            this.animationTimer = undefined;
            this._onDidDrop = this._register(new event_2.Emitter());
            this.onDidDrop = this._onDidDrop.event;
            this.dnd = options.dnd;
            this.orientation = options.orientation ?? 0 /* Orientation.VERTICAL */;
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-pane-view'));
            this.splitview = this._register(new splitview_1.SplitView(this.element, { orientation: this.orientation }));
            this.onDidSashReset = this.splitview.onDidSashReset;
            this.onDidSashChange = this.splitview.onDidSashChange;
            this.onDidScroll = this.splitview.onDidScroll;
            const eventDisposables = this._register(new lifecycle_1.DisposableStore());
            const onKeyDown = this._register(new event_1.DomEmitter(this.element, 'keydown'));
            const onHeaderKeyDown = event_2.Event.map(event_2.Event.filter(onKeyDown.event, e => e.target instanceof HTMLElement && e.target.classList.contains('pane-header'), eventDisposables), e => new keyboardEvent_1.StandardKeyboardEvent(e), eventDisposables);
            this._register(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 16 /* KeyCode.UpArrow */, eventDisposables)(() => this.focusPrevious()));
            this._register(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 18 /* KeyCode.DownArrow */, eventDisposables)(() => this.focusNext()));
        }
        addPane(pane, size, index = this.splitview.length) {
            const disposables = new lifecycle_1.DisposableStore();
            pane.onDidChangeExpansionState(this.setupAnimation, this, disposables);
            const paneItem = { pane: pane, disposable: disposables };
            this.paneItems.splice(index, 0, paneItem);
            pane.orientation = this.orientation;
            pane.orthogonalSize = this.orthogonalSize;
            this.splitview.addView(pane, size, index);
            if (this.dnd) {
                const draggable = new PaneDraggable(pane, this.dnd, this.dndContext);
                disposables.add(draggable);
                disposables.add(draggable.onDidDrop(this._onDidDrop.fire, this._onDidDrop));
            }
        }
        removePane(pane) {
            const index = this.paneItems.findIndex(item => item.pane === pane);
            if (index === -1) {
                return;
            }
            this.splitview.removeView(index, pane.isExpanded() ? splitview_1.Sizing.Distribute : undefined);
            const paneItem = this.paneItems.splice(index, 1)[0];
            paneItem.disposable.dispose();
        }
        movePane(from, to) {
            const fromIndex = this.paneItems.findIndex(item => item.pane === from);
            const toIndex = this.paneItems.findIndex(item => item.pane === to);
            if (fromIndex === -1 || toIndex === -1) {
                return;
            }
            const [paneItem] = this.paneItems.splice(fromIndex, 1);
            this.paneItems.splice(toIndex, 0, paneItem);
            this.splitview.moveView(fromIndex, toIndex);
        }
        resizePane(pane, size) {
            const index = this.paneItems.findIndex(item => item.pane === pane);
            if (index === -1) {
                return;
            }
            this.splitview.resizeView(index, size);
        }
        getPaneSize(pane) {
            const index = this.paneItems.findIndex(item => item.pane === pane);
            if (index === -1) {
                return -1;
            }
            return this.splitview.getViewSize(index);
        }
        layout(height, width) {
            this.orthogonalSize = this.orientation === 0 /* Orientation.VERTICAL */ ? width : height;
            this.size = this.orientation === 1 /* Orientation.HORIZONTAL */ ? width : height;
            for (const paneItem of this.paneItems) {
                paneItem.pane.orthogonalSize = this.orthogonalSize;
            }
            this.splitview.layout(this.size);
        }
        setBoundarySashes(sashes) {
            this.boundarySashes = sashes;
            this.updateSplitviewOrthogonalSashes(sashes);
        }
        updateSplitviewOrthogonalSashes(sashes) {
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.splitview.orthogonalStartSash = sashes?.left;
                this.splitview.orthogonalEndSash = sashes?.right;
            }
            else {
                this.splitview.orthogonalEndSash = sashes?.bottom;
            }
        }
        flipOrientation(height, width) {
            this.orientation = this.orientation === 0 /* Orientation.VERTICAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            const paneSizes = this.paneItems.map(pane => this.getPaneSize(pane.pane));
            this.splitview.dispose();
            (0, dom_1.clearNode)(this.element);
            this.splitview = this._register(new splitview_1.SplitView(this.element, { orientation: this.orientation }));
            this.updateSplitviewOrthogonalSashes(this.boundarySashes);
            const newOrthogonalSize = this.orientation === 0 /* Orientation.VERTICAL */ ? width : height;
            const newSize = this.orientation === 1 /* Orientation.HORIZONTAL */ ? width : height;
            this.paneItems.forEach((pane, index) => {
                pane.pane.orthogonalSize = newOrthogonalSize;
                pane.pane.orientation = this.orientation;
                const viewSize = this.size === 0 ? 0 : (newSize * paneSizes[index]) / this.size;
                this.splitview.addView(pane.pane, viewSize, index);
            });
            this.size = newSize;
            this.orthogonalSize = newOrthogonalSize;
            this.splitview.layout(this.size);
        }
        setupAnimation() {
            if (typeof this.animationTimer === 'number') {
                window.clearTimeout(this.animationTimer);
            }
            this.element.classList.add('animated');
            this.animationTimer = window.setTimeout(() => {
                this.animationTimer = undefined;
                this.element.classList.remove('animated');
            }, 200);
        }
        getPaneHeaderElements() {
            return [...this.element.querySelectorAll('.pane-header')];
        }
        focusPrevious() {
            const headers = this.getPaneHeaderElements();
            const index = headers.indexOf(document.activeElement);
            if (index === -1) {
                return;
            }
            headers[Math.max(index - 1, 0)].focus();
        }
        focusNext() {
            const headers = this.getPaneHeaderElements();
            const index = headers.indexOf(document.activeElement);
            if (index === -1) {
                return;
            }
            headers[Math.min(index + 1, headers.length - 1)].focus();
        }
        dispose() {
            super.dispose();
            this.paneItems.forEach(i => i.disposable.dispose());
        }
    }
    exports.PaneView = PaneView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZXZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvc3BsaXR2aWV3L3BhbmV2aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1DaEc7Ozs7Ozs7O09BUUc7SUFDSCxNQUFzQixJQUFLLFNBQVEsc0JBQVU7aUJBRXBCLGdCQUFXLEdBQUcsRUFBRSxBQUFMLENBQU07UUE4QnpDLElBQUksZUFBZTtZQUNsQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixDQUFDO1FBRUQsSUFBSSxlQUFlLENBQUMsUUFBZ0I7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxJQUFJLGdCQUFnQjtZQUNuQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVELElBQUksaUJBQWlCO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRUQsSUFBSSxjQUFjO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksZUFBZTtZQUNsQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixDQUFDO1FBRUQsSUFBSSxlQUFlLENBQUMsSUFBWTtZQUMvQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1lBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxJQUFJLGVBQWU7WUFDbEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQUks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