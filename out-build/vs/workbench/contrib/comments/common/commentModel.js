/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/arrays", "vs/nls!vs/workbench/contrib/comments/common/commentModel"], function (require, exports, uri_1, arrays_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Flb = exports.$Elb = exports.$Dlb = void 0;
    class $Dlb {
        constructor(owner, threadId, resource, comment, range, threadState) {
            this.replies = [];
            this.owner = owner;
            this.threadId = threadId;
            this.comment = comment;
            this.resource = resource;
            this.range = range;
            this.isRoot = false;
            this.threadState = threadState;
        }
        hasReply() {
            return this.replies && this.replies.length !== 0;
        }
    }
    exports.$Dlb = $Dlb;
    class $Elb {
        constructor(owner, resource, commentThreads) {
            this.owner = owner;
            this.id = resource.toString();
            this.resource = resource;
            this.commentThreads = commentThreads.filter(thread => thread.comments && thread.comments.length).map(thread => $Elb.createCommentNode(owner, resource, thread));
        }
        static createCommentNode(owner, resource, commentThread) {
            const { threadId, comments, range } = commentThread;
            const commentNodes = comments.map(comment => new $Dlb(owner, threadId, resource, comment, range, commentThread.state));
            if (commentNodes.length > 1) {
                commentNodes[0].replies = commentNodes.slice(1, commentNodes.length);
            }
            commentNodes[0].isRoot = true;
            return commentNodes[0];
        }
    }
    exports.$Elb = $Elb;
    class $Flb {
        constructor() {
            this.resourceCommentThreads = [];
            this.commentThreadsMap = new Map();
        }
        c() {
            this.resourceCommentThreads = [...this.commentThreadsMap.values()].flat();
            this.resourceCommentThreads.sort((a, b) => {
                return a.resource.toString() > b.resource.toString() ? 1 : -1;
            });
        }
        setCommentThreads(owner, commentThreads) {
            this.commentThreadsMap.set(owner, this.d(owner, commentThreads));
            this.c();
        }
        deleteCommentsByOwner(owner) {
            if (owner) {
                this.commentThreadsMap.set(owner, []);
            }
            else {
                this.commentThreadsMap.clear();
            }
            this.c();
        }
        updateCommentThreads(event) {
            const { owner, removed, changed, added } = event;
            const threadsForOwner = this.commentThreadsMap.get(owner) || [];
            removed.forEach(thread => {
                // Find resource that has the comment thread
                const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
                const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : undefined;
                // Find comment node on resource that is that thread and remove it
                const index = matchingResourceData?.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId) ?? 0;
                if (index >= 0) {
                    matchingResourceData?.commentThreads.splice(index, 1);
                }
                // If the comment thread was the last thread for a resource, remove that resource from the list
                if (matchingResourceData?.commentThreads.length === 0) {
                    threadsForOwner.splice(matchingResourceIndex, 1);
                }
            });
            changed.forEach(thread => {
                // Find resource that has the comment thread
                const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
                const matchingResourceData = threadsForOwner[matchingResourceIndex];
                // Find comment node on resource that is that thread and replace it
                const index = matchingResourceData.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId);
                if (index >= 0) {
                    matchingResourceData.commentThreads[index] = $Elb.createCommentNode(owner, uri_1.URI.parse(matchingResourceData.id), thread);
                }
                else if (thread.comments && thread.comments.length) {
                    matchingResourceData.commentThreads.push($Elb.createCommentNode(owner, uri_1.URI.parse(matchingResourceData.id), thread));
                }
            });
            added.forEach(thread => {
                const existingResource = threadsForOwner.filter(resourceWithThreads => resourceWithThreads.resource.toString() === thread.resource);
                if (existingResource.length) {
                    const resource = existingResource[0];
                    if (thread.comments && thread.comments.length) {
                        resource.commentThreads.push($Elb.createCommentNode(owner, resource.resource, thread));
                    }
                }
                else {
                    threadsForOwner.push(new $Elb(owner, uri_1.URI.parse(thread.resource), [thread]));
                }
            });
            this.commentThreadsMap.set(owner, threadsForOwner);
            this.c();
            return removed.length > 0 || changed.length > 0 || added.length > 0;
        }
        hasCommentThreads() {
            return !!this.resourceCommentThreads.length;
        }
        getMessage() {
            if (!this.resourceCommentThreads.length) {
                return (0, nls_1.localize)(0, null);
            }
            else {
                return '';
            }
        }
        d(owner, commentThreads) {
            const resourceCommentThreads = [];
            const commentThreadsByResource = new Map();
            for (const group of (0, arrays_1.$xb)(commentThreads, $Flb.e)) {
                commentThreadsByResource.set(group[0].resource, new $Elb(owner, uri_1.URI.parse(group[0].resource), group));
            }
            commentThreadsByResource.forEach((v, i, m) => {
                resourceCommentThreads.push(v);
            });
            return resourceCommentThreads;
        }
        static e(a, b) {
            const resourceA = a.resource.toString();
            const resourceB = b.resource.toString();
            if (resourceA < resourceB) {
                return -1;
            }
            else if (resourceA > resourceB) {
                return 1;
            }
            else {
                return 0;
            }
        }
    }
    exports.$Flb = $Flb;
});
//# sourceMappingURL=commentModel.js.map