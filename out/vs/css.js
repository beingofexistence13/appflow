/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.load = void 0;
    /**
     * Invoked by the loader at run-time
     *
     * @skipMangle
     */
    function load(name, req, load, config) {
        config = config || {};
        const cssConfig = (config['vs/css'] || {});
        if (cssConfig.disabled) {
            // the plugin is asked to not create any style sheets
            load({});
            return;
        }
        const cssUrl = req.toUrl(name + '.css');
        loadCSS(name, cssUrl, () => {
            load({});
        }, (err) => {
            if (typeof load.error === 'function') {
                load.error('Could not find ' + cssUrl + '.');
            }
        });
    }
    exports.load = load;
    function loadCSS(name, cssUrl, callback, errorback) {
        if (linkTagExists(name, cssUrl)) {
            callback();
            return;
        }
        createLinkTag(name, cssUrl, callback, errorback);
    }
    function linkTagExists(name, cssUrl) {
        const links = document.getElementsByTagName('link');
        for (let i = 0, len = links.length; i < len; i++) {
            const nameAttr = links[i].getAttribute('data-name');
            const hrefAttr = links[i].getAttribute('href');
            if (nameAttr === name || hrefAttr === cssUrl) {
                return true;
            }
        }
        return false;
    }
    function createLinkTag(name, cssUrl, callback, errorback) {
        const linkNode = document.createElement('link');
        linkNode.setAttribute('rel', 'stylesheet');
        linkNode.setAttribute('type', 'text/css');
        linkNode.setAttribute('data-name', name);
        attachListeners(name, linkNode, callback, errorback);
        linkNode.setAttribute('href', cssUrl);
        const head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(linkNode);
    }
    function attachListeners(name, linkNode, callback, errorback) {
        const unbind = () => {
            linkNode.removeEventListener('load', loadEventListener);
            linkNode.removeEventListener('error', errorEventListener);
        };
        const loadEventListener = (e) => {
            unbind();
            callback();
        };
        const errorEventListener = (e) => {
            unbind();
            errorback(e);
        };
        linkNode.addEventListener('load', loadEventListener);
        linkNode.addEventListener('error', errorEventListener);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRzs7OztPQUlHO0lBQ0gsU0FBZ0IsSUFBSSxDQUFDLElBQVksRUFBRSxHQUErQixFQUFFLElBQW1DLEVBQUUsTUFBdUM7UUFDL0ksTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDdEIsTUFBTSxTQUFTLEdBQXFCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTdELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUN2QixxREFBcUQ7WUFDckQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ1QsT0FBTztTQUNQO1FBRUQsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1lBQzFCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNWLENBQUMsRUFBRSxDQUFDLEdBQVEsRUFBRSxFQUFFO1lBQ2YsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssVUFBVSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQzthQUM3QztRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWxCRCxvQkFrQkM7SUFFRCxTQUFTLE9BQU8sQ0FBQyxJQUFZLEVBQUUsTUFBYyxFQUFFLFFBQW9CLEVBQUUsU0FBNkI7UUFDakcsSUFBSSxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ2hDLFFBQVEsRUFBRSxDQUFDO1lBQ1gsT0FBTztTQUNQO1FBQ0QsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFZLEVBQUUsTUFBYztRQUNsRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNqRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7Z0JBQzdDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7U0FDRDtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLElBQVksRUFBRSxNQUFjLEVBQUUsUUFBb0IsRUFBRSxTQUE2QjtRQUN2RyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXpDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNyRCxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxTQUFTLGVBQWUsQ0FBQyxJQUFZLEVBQUUsUUFBeUIsRUFBRSxRQUFvQixFQUFFLFNBQTZCO1FBQ3BILE1BQU0sTUFBTSxHQUFHLEdBQUcsRUFBRTtZQUNuQixRQUFRLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDeEQsUUFBUSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQztRQUNGLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRTtZQUNwQyxNQUFNLEVBQUUsQ0FBQztZQUNULFFBQVEsRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDO1FBQ0YsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFO1lBQ3JDLE1BQU0sRUFBRSxDQUFDO1lBQ1QsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsQ0FBQyxDQUFDO1FBQ0YsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUN4RCxDQUFDIn0=