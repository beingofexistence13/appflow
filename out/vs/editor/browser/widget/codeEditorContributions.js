/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle"], function (require, exports, async_1, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeEditorContributions = void 0;
    class CodeEditorContributions extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._editor = null;
            this._instantiationService = null;
            /**
             * Contains all instantiated contributions.
             */
            this._instances = this._register(new lifecycle_1.DisposableMap());
            /**
             * Contains contributions which are not yet instantiated.
             */
            this._pending = new Map();
            /**
             * Tracks which instantiation kinds are still left in `_pending`.
             */
            this._finishedInstantiation = [];
            this._finishedInstantiation[0 /* EditorContributionInstantiation.Eager */] = false;
            this._finishedInstantiation[1 /* EditorContributionInstantiation.AfterFirstRender */] = false;
            this._finishedInstantiation[2 /* EditorContributionInstantiation.BeforeFirstInteraction */] = false;
            this._finishedInstantiation[3 /* EditorContributionInstantiation.Eventually */] = false;
        }
        initialize(editor, contributions, instantiationService) {
            this._editor = editor;
            this._instantiationService = instantiationService;
            for (const desc of contributions) {
                if (this._pending.has(desc.id)) {
                    (0, errors_1.onUnexpectedError)(new Error(`Cannot have two contributions with the same id ${desc.id}`));
                    continue;
                }
                this._pending.set(desc.id, desc);
            }
            this._instantiateSome(0 /* EditorContributionInstantiation.Eager */);
            // AfterFirstRender
            // - these extensions will be instantiated at the latest 50ms after the first render.
            // - but if there is idle time, we will instantiate them sooner.
            this._register((0, async_1.runWhenIdle)(() => {
                this._instantiateSome(1 /* EditorContributionInstantiation.AfterFirstRender */);
            }));
            // BeforeFirstInteraction
            // - these extensions will be instantiated at the latest before a mouse or a keyboard event.
            // - but if there is idle time, we will instantiate them sooner.
            this._register((0, async_1.runWhenIdle)(() => {
                this._instantiateSome(2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
            }));
            // Eventually
            // - these extensions will only be instantiated when there is idle time.
            // - since there is no guarantee that there will ever be idle time, we set a timeout of 5s here.
            this._register((0, async_1.runWhenIdle)(() => {
                this._instantiateSome(3 /* EditorContributionInstantiation.Eventually */);
            }, 5000));
        }
        saveViewState() {
            const contributionsState = {};
            for (const [id, contribution] of this._instances) {
                if (typeof contribution.saveViewState === 'function') {
                    contributionsState[id] = contribution.saveViewState();
                }
            }
            return contributionsState;
        }
        restoreViewState(contributionsState) {
            for (const [id, contribution] of this._instances) {
                if (typeof contribution.restoreViewState === 'function') {
                    contribution.restoreViewState(contributionsState[id]);
                }
            }
        }
        get(id) {
            this._instantiateById(id);
            return this._instances.get(id) || null;
        }
        /**
         * used by tests
         */
        set(id, value) {
            this._instances.set(id, value);
        }
        onBeforeInteractionEvent() {
            // this method is called very often by the editor!
            this._instantiateSome(2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
        }
        onAfterModelAttached() {
            this._register((0, async_1.runWhenIdle)(() => {
                this._instantiateSome(1 /* EditorContributionInstantiation.AfterFirstRender */);
            }, 50));
        }
        _instantiateSome(instantiation) {
            if (this._finishedInstantiation[instantiation]) {
                // already done with this instantiation!
                return;
            }
            this._finishedInstantiation[instantiation] = true;
            const contribs = this._findPendingContributionsByInstantiation(instantiation);
            for (const contrib of contribs) {
                this._instantiateById(contrib.id);
            }
        }
        _findPendingContributionsByInstantiation(instantiation) {
            const result = [];
            for (const [, desc] of this._pending) {
                if (desc.instantiation === instantiation) {
                    result.push(desc);
                }
            }
            return result;
        }
        _instantiateById(id) {
            const desc = this._pending.get(id);
            if (!desc) {
                return;
            }
            this._pending.delete(id);
            if (!this._instantiationService || !this._editor) {
                throw new Error(`Cannot instantiate contributions before being initialized!`);
            }
            try {
                const instance = this._instantiationService.createInstance(desc.ctor, this._editor);
                this._instances.set(desc.id, instance);
                if (typeof instance.restoreViewState === 'function' && desc.instantiation !== 0 /* EditorContributionInstantiation.Eager */) {
                    console.warn(`Editor contribution '${desc.id}' should be eager instantiated because it uses saveViewState / restoreViewState.`);
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
        }
    }
    exports.CodeEditorContributions = CodeEditorContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUVkaXRvckNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci93aWRnZXQvY29kZUVkaXRvckNvbnRyaWJ1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsdUJBQXdCLFNBQVEsc0JBQVU7UUFrQnREO1lBR0MsS0FBSyxFQUFFLENBQUM7WUFuQkQsWUFBTyxHQUF1QixJQUFJLENBQUM7WUFDbkMsMEJBQXFCLEdBQWlDLElBQUksQ0FBQztZQUVuRTs7ZUFFRztZQUNjLGVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBK0IsQ0FBQyxDQUFDO1lBQy9GOztlQUVHO1lBQ2MsYUFBUSxHQUFHLElBQUksR0FBRyxFQUEwQyxDQUFDO1lBQzlFOztlQUVHO1lBQ2MsMkJBQXNCLEdBQWMsRUFBRSxDQUFDO1lBT3ZELElBQUksQ0FBQyxzQkFBc0IsK0NBQXVDLEdBQUcsS0FBSyxDQUFDO1lBQzNFLElBQUksQ0FBQyxzQkFBc0IsMERBQWtELEdBQUcsS0FBSyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxzQkFBc0IsZ0VBQXdELEdBQUcsS0FBSyxDQUFDO1lBQzVGLElBQUksQ0FBQyxzQkFBc0Isb0RBQTRDLEdBQUcsS0FBSyxDQUFDO1FBQ2pGLENBQUM7UUFFTSxVQUFVLENBQUMsTUFBbUIsRUFBRSxhQUErQyxFQUFFLG9CQUEyQztZQUNsSSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7WUFFbEQsS0FBSyxNQUFNLElBQUksSUFBSSxhQUFhLEVBQUU7Z0JBQ2pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUMvQixJQUFB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