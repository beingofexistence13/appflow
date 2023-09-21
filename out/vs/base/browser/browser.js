/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWCOEnabled = exports.isStandalone = exports.isAndroid = exports.isElectron = exports.isWebkitWebView = exports.isSafari = exports.isChrome = exports.isWebKit = exports.isFirefox = exports.onDidChangeFullscreen = exports.isFullscreen = exports.setFullscreen = exports.setZoomFactor = exports.getZoomFactor = exports.getZoomLevel = exports.setZoomLevel = exports.PixelRatio = exports.addMatchMediaChangeListener = void 0;
    class WindowManager {
        constructor() {
            // --- Zoom Level
            this._zoomLevel = 0;
            // --- Zoom Factor
            this._zoomFactor = 1;
            // --- Fullscreen
            this._fullscreen = false;
            this._onDidChangeFullscreen = new event_1.Emitter();
            this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
        }
        static { this.INSTANCE = new WindowManager(); }
        getZoomLevel() {
            return this._zoomLevel;
        }
        setZoomLevel(zoomLevel) {
            if (this._zoomLevel === zoomLevel) {
                return;
            }
            this._zoomLevel = zoomLevel;
        }
        getZoomFactor() {
            return this._zoomFactor;
        }
        setZoomFactor(zoomFactor) {
            this._zoomFactor = zoomFactor;
        }
        setFullscreen(fullscreen) {
            if (this._fullscreen === fullscreen) {
                return;
            }
            this._fullscreen = fullscreen;
            this._onDidChangeFullscreen.fire();
        }
        isFullscreen() {
            return this._fullscreen;
        }
    }
    /**
     * See https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
     */
    class DevicePixelRatioMonitor extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._listener = () => this._handleChange(true);
            this._mediaQueryList = null;
            this._handleChange(false);
        }
        _handleChange(fireEvent) {
            this._mediaQueryList?.removeEventListener('change', this._listener);
            this._mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            this._mediaQueryList.addEventListener('change', this._listener);
            if (fireEvent) {
                this._onDidChange.fire();
            }
        }
    }
    class PixelRatioImpl extends lifecycle_1.Disposable {
        get value() {
            return this._value;
        }
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._value = this._getPixelRatio();
            const dprMonitor = this._register(new DevicePixelRatioMonitor());
            this._register(dprMonitor.onDidChange(() => {
                this._value = this._getPixelRatio();
                this._onDidChange.fire(this._value);
            }));
        }
        _getPixelRatio() {
            const ctx = document.createElement('canvas').getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
            return dpr / bsr;
        }
    }
    class PixelRatioFacade {
        constructor() {
            this._pixelRatioMonitor = null;
        }
        _getOrCreatePixelRatioMonitor() {
            if (!this._pixelRatioMonitor) {
                this._pixelRatioMonitor = (0, lifecycle_1.markAsSingleton)(new PixelRatioImpl());
            }
            return this._pixelRatioMonitor;
        }
        /**
         * Get the current value.
         */
        get value() {
            return this._getOrCreatePixelRatioMonitor().value;
        }
        /**
         * Listen for changes.
         */
        get onDidChange() {
            return this._getOrCreatePixelRatioMonitor().onDidChange;
        }
    }
    function addMatchMediaChangeListener(query, callback) {
        if (typeof query === 'string') {
            query = window.matchMedia(query);
        }
        query.addEventListener('change', callback);
    }
    exports.addMatchMediaChangeListener = addMatchMediaChangeListener;
    /**
     * Returns the pixel ratio.
     *
     * This is useful for rendering <canvas> elements at native screen resolution or for being used as
     * a cache key when storing font measurements. Fonts might render differently depending on resolution
     * and any measurements need to be discarded for example when a window is moved from a monitor to another.
     */
    exports.PixelRatio = new PixelRatioFacade();
    /** A zoom index, e.g. 1, 2, 3 */
    function setZoomLevel(zoomLevel) {
        WindowManager.INSTANCE.setZoomLevel(zoomLevel);
    }
    exports.setZoomLevel = setZoomLevel;
    function getZoomLevel() {
        return WindowManager.INSTANCE.getZoomLevel();
    }
    exports.getZoomLevel = getZoomLevel;
    /** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
    function getZoomFactor() {
        return WindowManager.INSTANCE.getZoomFactor();
    }
    exports.getZoomFactor = getZoomFactor;
    function setZoomFactor(zoomFactor) {
        WindowManager.INSTANCE.setZoomFactor(zoomFactor);
    }
    exports.setZoomFactor = setZoomFactor;
    function setFullscreen(fullscreen) {
        WindowManager.INSTANCE.setFullscreen(fullscreen);
    }
    exports.setFullscreen = setFullscreen;
    function isFullscreen() {
        return WindowManager.INSTANCE.isFullscreen();
    }
    exports.isFullscreen = isFullscreen;
    exports.onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
    const userAgent = navigator.userAgent;
    exports.isFirefox = (userAgent.indexOf('Firefox') >= 0);
    exports.isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
    exports.isChrome = (userAgent.indexOf('Chrome') >= 0);
    exports.isSafari = (!exports.isChrome && (userAgent.indexOf('Safari') >= 0));
    exports.isWebkitWebView = (!exports.isChrome && !exports.isSafari && exports.isWebKit);
    exports.isElectron = (userAgent.indexOf('Electron/') >= 0);
    exports.isAndroid = (userAgent.indexOf('Android') >= 0);
    let standalone = false;
    if (window.matchMedia) {
        const standaloneMatchMedia = window.matchMedia('(display-mode: standalone) or (display-mode: window-controls-overlay)');
        const fullScreenMatchMedia = window.matchMedia('(display-mode: fullscreen)');
        standalone = standaloneMatchMedia.matches;
        addMatchMediaChangeListener(standaloneMatchMedia, ({ matches }) => {
            // entering fullscreen would change standaloneMatchMedia.matches to false
            // if standalone is true (running as PWA) and entering fullscreen, skip this change
            if (standalone && fullScreenMatchMedia.matches) {
                return;
            }
            // otherwise update standalone (browser to PWA or PWA to browser)
            standalone = matches;
        });
    }
    function isStandalone() {
        return standalone;
    }
    exports.isStandalone = isStandalone;
    // Visible means that the feature is enabled, not necessarily being rendered
    // e.g. visible is true even in fullscreen mode where the controls are hidden
    // See docs at https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay/visible
    function isWCOEnabled() {
        return navigator?.windowControlsOverlay?.visible;
    }
    exports.isWCOEnabled = isWCOEnabled;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9icm93c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFNLGFBQWE7UUFBbkI7WUFJQyxpQkFBaUI7WUFDVCxlQUFVLEdBQVcsQ0FBQyxDQUFDO1lBWS9CLGtCQUFrQjtZQUNWLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1lBU2hDLGlCQUFpQjtZQUNULGdCQUFXLEdBQVksS0FBSyxDQUFDO1lBQ3BCLDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFFOUMsMEJBQXFCLEdBQWdCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7UUFZeEYsQ0FBQztpQkF6Q3VCLGFBQVEsR0FBRyxJQUFJLGFBQWEsRUFBRSxBQUF0QixDQUF1QjtRQUsvQyxZQUFZO1lBQ2xCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN4QixDQUFDO1FBQ00sWUFBWSxDQUFDLFNBQWlCO1lBQ3BDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQ2xDLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzdCLENBQUM7UUFLTSxhQUFhO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBQ00sYUFBYSxDQUFDLFVBQWtCO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQy9CLENBQUM7UUFPTSxhQUFhLENBQUMsVUFBbUI7WUFDdkMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFVBQVUsRUFBRTtnQkFDcEMsT0FBTzthQUNQO1lBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7WUFDOUIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxDQUFDO1FB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