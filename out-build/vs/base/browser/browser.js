/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aO = exports.$_N = exports.$$N = exports.$0N = exports.$9N = exports.$8N = exports.$7N = exports.$6N = exports.$5N = exports.$4N = exports.$3N = exports.$2N = exports.$1N = exports.$ZN = exports.$YN = exports.$XN = exports.$WN = exports.$VN = void 0;
    class WindowManager {
        constructor() {
            // --- Zoom Level
            this.a = 0;
            // --- Zoom Factor
            this.b = 1;
            // --- Fullscreen
            this.c = false;
            this.d = new event_1.$fd();
            this.onDidChangeFullscreen = this.d.event;
        }
        static { this.INSTANCE = new WindowManager(); }
        getZoomLevel() {
            return this.a;
        }
        setZoomLevel(zoomLevel) {
            if (this.a === zoomLevel) {
                return;
            }
            this.a = zoomLevel;
        }
        getZoomFactor() {
            return this.b;
        }
        setZoomFactor(zoomFactor) {
            this.b = zoomFactor;
        }
        setFullscreen(fullscreen) {
            if (this.c === fullscreen) {
                return;
            }
            this.c = fullscreen;
            this.d.fire();
        }
        isFullscreen() {
            return this.c;
        }
    }
    /**
     * See https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes
     */
    class DevicePixelRatioMonitor extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = () => this.f(true);
            this.c = null;
            this.f(false);
        }
        f(fireEvent) {
            this.c?.removeEventListener('change', this.b);
            this.c = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
            this.c.addEventListener('change', this.b);
            if (fireEvent) {
                this.a.fire();
            }
        }
    }
    class PixelRatioImpl extends lifecycle_1.$kc {
        get value() {
            return this.b;
        }
        constructor() {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidChange = this.a.event;
            this.b = this.c();
            const dprMonitor = this.B(new DevicePixelRatioMonitor());
            this.B(dprMonitor.onDidChange(() => {
                this.b = this.c();
                this.a.fire(this.b);
            }));
        }
        c() {
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
            this.a = null;
        }
        b() {
            if (!this.a) {
                this.a = (0, lifecycle_1.$dc)(new PixelRatioImpl());
            }
            return this.a;
        }
        /**
         * Get the current value.
         */
        get value() {
            return this.b().value;
        }
        /**
         * Listen for changes.
         */
        get onDidChange() {
            return this.b().onDidChange;
        }
    }
    function $VN(query, callback) {
        if (typeof query === 'string') {
            query = window.matchMedia(query);
        }
        query.addEventListener('change', callback);
    }
    exports.$VN = $VN;
    /**
     * Returns the pixel ratio.
     *
     * This is useful for rendering <canvas> elements at native screen resolution or for being used as
     * a cache key when storing font measurements. Fonts might render differently depending on resolution
     * and any measurements need to be discarded for example when a window is moved from a monitor to another.
     */
    exports.$WN = new PixelRatioFacade();
    /** A zoom index, e.g. 1, 2, 3 */
    function $XN(zoomLevel) {
        WindowManager.INSTANCE.setZoomLevel(zoomLevel);
    }
    exports.$XN = $XN;
    function $YN() {
        return WindowManager.INSTANCE.getZoomLevel();
    }
    exports.$YN = $YN;
    /** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
    function $ZN() {
        return WindowManager.INSTANCE.getZoomFactor();
    }
    exports.$ZN = $ZN;
    function $1N(zoomFactor) {
        WindowManager.INSTANCE.setZoomFactor(zoomFactor);
    }
    exports.$1N = $1N;
    function $2N(fullscreen) {
        WindowManager.INSTANCE.setFullscreen(fullscreen);
    }
    exports.$2N = $2N;
    function $3N() {
        return WindowManager.INSTANCE.isFullscreen();
    }
    exports.$3N = $3N;
    exports.$4N = WindowManager.INSTANCE.onDidChangeFullscreen;
    const userAgent = navigator.userAgent;
    exports.$5N = (userAgent.indexOf('Firefox') >= 0);
    exports.$6N = (userAgent.indexOf('AppleWebKit') >= 0);
    exports.$7N = (userAgent.indexOf('Chrome') >= 0);
    exports.$8N = (!exports.$7N && (userAgent.indexOf('Safari') >= 0));
    exports.$9N = (!exports.$7N && !exports.$8N && exports.$6N);
    exports.$0N = (userAgent.indexOf('Electron/') >= 0);
    exports.$$N = (userAgent.indexOf('Android') >= 0);
    let standalone = false;
    if (window.matchMedia) {
        const standaloneMatchMedia = window.matchMedia('(display-mode: standalone) or (display-mode: window-controls-overlay)');
        const fullScreenMatchMedia = window.matchMedia('(display-mode: fullscreen)');
        standalone = standaloneMatchMedia.matches;
        $VN(standaloneMatchMedia, ({ matches }) => {
            // entering fullscreen would change standaloneMatchMedia.matches to false
            // if standalone is true (running as PWA) and entering fullscreen, skip this change
            if (standalone && fullScreenMatchMedia.matches) {
                return;
            }
            // otherwise update standalone (browser to PWA or PWA to browser)
            standalone = matches;
        });
    }
    function $_N() {
        return standalone;
    }
    exports.$_N = $_N;
    // Visible means that the feature is enabled, not necessarily being rendered
    // e.g. visible is true even in fullscreen mode where the controls are hidden
    // See docs at https://developer.mozilla.org/en-US/docs/Web/API/WindowControlsOverlay/visible
    function $aO() {
        return navigator?.windowControlsOverlay?.visible;
    }
    exports.$aO = $aO;
});
//# sourceMappingURL=browser.js.map