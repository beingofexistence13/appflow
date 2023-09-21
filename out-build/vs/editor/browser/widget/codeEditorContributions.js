/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle"], function (require, exports, async_1, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tY = void 0;
    class $tY extends lifecycle_1.$kc {
        constructor() {
            super();
            this.a = null;
            this.b = null;
            /**
             * Contains all instantiated contributions.
             */
            this.c = this.B(new lifecycle_1.$sc());
            /**
             * Contains contributions which are not yet instantiated.
             */
            this.f = new Map();
            /**
             * Tracks which instantiation kinds are still left in `_pending`.
             */
            this.g = [];
            this.g[0 /* EditorContributionInstantiation.Eager */] = false;
            this.g[1 /* EditorContributionInstantiation.AfterFirstRender */] = false;
            this.g[2 /* EditorContributionInstantiation.BeforeFirstInteraction */] = false;
            this.g[3 /* EditorContributionInstantiation.Eventually */] = false;
        }
        initialize(editor, contributions, instantiationService) {
            this.a = editor;
            this.b = instantiationService;
            for (const desc of contributions) {
                if (this.f.has(desc.id)) {
                    (0, errors_1.$Y)(new Error(`Cannot have two contributions with the same id ${desc.id}`));
                    continue;
                }
                this.f.set(desc.id, desc);
            }
            this.h(0 /* EditorContributionInstantiation.Eager */);
            // AfterFirstRender
            // - these extensions will be instantiated at the latest 50ms after the first render.
            // - but if there is idle time, we will instantiate them sooner.
            this.B((0, async_1.$Wg)(() => {
                this.h(1 /* EditorContributionInstantiation.AfterFirstRender */);
            }));
            // BeforeFirstInteraction
            // - these extensions will be instantiated at the latest before a mouse or a keyboard event.
            // - but if there is idle time, we will instantiate them sooner.
            this.B((0, async_1.$Wg)(() => {
                this.h(2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
            }));
            // Eventually
            // - these extensions will only be instantiated when there is idle time.
            // - since there is no guarantee that there will ever be idle time, we set a timeout of 5s here.
            this.B((0, async_1.$Wg)(() => {
                this.h(3 /* EditorContributionInstantiation.Eventually */);
            }, 5000));
        }
        saveViewState() {
            const contributionsState = {};
            for (const [id, contribution] of this.c) {
                if (typeof contribution.saveViewState === 'function') {
                    contributionsState[id] = contribution.saveViewState();
                }
            }
            return contributionsState;
        }
        restoreViewState(contributionsState) {
            for (const [id, contribution] of this.c) {
                if (typeof contribution.restoreViewState === 'function') {
                    contribution.restoreViewState(contributionsState[id]);
                }
            }
        }
        get(id) {
            this.m(id);
            return this.c.get(id) || null;
        }
        /**
         * used by tests
         */
        set(id, value) {
            this.c.set(id, value);
        }
        onBeforeInteractionEvent() {
            // this method is called very often by the editor!
            this.h(2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
        }
        onAfterModelAttached() {
            this.B((0, async_1.$Wg)(() => {
                this.h(1 /* EditorContributionInstantiation.AfterFirstRender */);
            }, 50));
        }
        h(instantiation) {
            if (this.g[instantiation]) {
                // already done with this instantiation!
                return;
            }
            this.g[instantiation] = true;
            const contribs = this.j(instantiation);
            for (const contrib of contribs) {
                this.m(contrib.id);
            }
        }
        j(instantiation) {
            const result = [];
            for (const [, desc] of this.f) {
                if (desc.instantiation === instantiation) {
                    result.push(desc);
                }
            }
            return result;
        }
        m(id) {
            const desc = this.f.get(id);
            if (!desc) {
                return;
            }
            this.f.delete(id);
            if (!this.b || !this.a) {
                throw new Error(`Cannot instantiate contributions before being initialized!`);
            }
            try {
                const instance = this.b.createInstance(desc.ctor, this.a);
                this.c.set(desc.id, instance);
                if (typeof instance.restoreViewState === 'function' && desc.instantiation !== 0 /* EditorContributionInstantiation.Eager */) {
                    console.warn(`Editor contribution '${desc.id}' should be eager instantiated because it uses saveViewState / restoreViewState.`);
                }
            }
            catch (err) {
                (0, errors_1.$Y)(err);
            }
        }
    }
    exports.$tY = $tY;
});
//# sourceMappingURL=codeEditorContributions.js.map