/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/arrays", "vs/nls"], function (require, exports, uri_1, arrays_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentsModel = exports.ResourceWithCommentThreads = exports.CommentNode = void 0;
    class CommentNode {
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
    exports.CommentNode = CommentNode;
    class ResourceWithCommentThreads {
        constructor(owner, resource, commentThreads) {
            this.owner = owner;
            this.id = resource.toString();
            this.resource = resource;
            this.commentThreads = commentThreads.filter(thread => thread.comments && thread.comments.length).map(thread => ResourceWithCommentThreads.createCommentNode(owner, resource, thread));
        }
        static createCommentNode(owner, resource, commentThread) {
            const { threadId, comments, range } = commentThread;
            const commentNodes = comments.map(comment => new CommentNode(owner, threadId, resource, comment, range, commentThread.state));
            if (commentNodes.length > 1) {
                commentNodes[0].replies = commentNodes.slice(1, commentNodes.length);
            }
            commentNodes[0].isRoot = true;
            return commentNodes[0];
        }
    }
    exports.ResourceWithCommentThreads = ResourceWithCommentThreads;
    class CommentsModel {
        constructor() {
            this.resourceCommentThreads = [];
            this.commentThreadsMap = new Map();
        }
        updateResourceCommentThreads() {
            this.resourceCommentThreads = [...this.commentThreadsMap.values()].flat();
            this.resourceCommentThreads.sort((a, b) => {
                return a.resource.toString() > b.resource.toString() ? 1 : -1;
            });
        }
        setCommentThreads(owner, commentThreads) {
            this.commentThreadsMap.set(owner, this.groupByResource(owner, commentThreads));
            this.updateResourceCommentThreads();
        }
        deleteCommentsByOwner(owner) {
            if (owner) {
                this.commentThreadsMap.set(owner, []);
            }
            else {
                this.commentThreadsMap.clear();
            }
            this.updateResourceCommentThreads();
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
                    matchingResourceData.commentThreads[index] = ResourceWithCommentThreads.createCommentNode(owner, uri_1.URI.parse(matchingResourceData.id), thread);
                }
                else if (thread.comments && thread.comments.length) {
                    matchingResourceData.commentThreads.push(ResourceWithCommentThreads.createCommentNode(owner, uri_1.URI.parse(matchingResourceData.id), thread));
                }
            });
            added.forEach(thread => {
                const existingResource = threadsForOwner.filter(resourceWithThreads => resourceWithThreads.resource.toString() === thread.resource);
                if (existingResource.length) {
                    const resource = existingResource[0];
                    if (thread.comments && thread.comments.length) {
                        resource.commentThreads.push(ResourceWithCommentThreads.createCommentNode(owner, resource.resource, thread));
                    }
                }
                else {
                    threadsForOwner.push(new ResourceWithCommentThreads(owner, uri_1.URI.parse(thread.resource), [thread]));
                }
            });
            this.commentThreadsMap.set(owner, threadsForOwner);
            this.updateResourceCommentThreads();
            return removed.length > 0 || changed.length > 0 || added.length > 0;
        }
        hasCommentThreads() {
            return !!this.resourceCommentThreads.length;
        }
        getMessage() {
            if (!this.resourceCommentThreads.length) {
                return (0, nls_1.localize)('noComments', "There are no comments in this workspace yet.");
            }
            else {
                return '';
            }
        }
        groupByResource(owner, commentThreads) {
            const resourceCommentThreads = [];
            const commentThreadsByResource = new Map();
            for (const group of (0, arrays_1.groupBy)(commentThreads, CommentsModel._compareURIs)) {
                commentThreadsByResource.set(group[0].resource, new ResourceWithCommentThreads(owner, uri_1.URI.parse(group[0].resource), group));
            }
            commentThreadsByResource.forEach((v, i, m) => {
                resourceCommentThreads.push(v);
            });
            return resourceCommentThreads;
        }
        static _compareURIs(a, b) {
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
    exports.CommentsModel = CommentsModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudE1vZGVsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29tbWVudHMvY29tbW9uL2NvbW1lbnRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFZaEcsTUFBYSxXQUFXO1FBVXZCLFlBQVksS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBYSxFQUFFLE9BQWdCLEVBQUUsS0FBeUIsRUFBRSxXQUEyQztZQUxwSixZQUFPLEdBQWtCLEVBQUUsQ0FBQztZQU0zQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUNoQyxDQUFDO1FBRUQsUUFBUTtZQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUNEO0lBdkJELGtDQXVCQztJQUVELE1BQWEsMEJBQTBCO1FBTXRDLFlBQVksS0FBYSxFQUFFLFFBQWEsRUFBRSxjQUErQjtZQUN4RSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMs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