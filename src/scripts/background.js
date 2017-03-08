import Fuse from 'fuse.js';
import Fisea from 'fisea';
import flatten from 'lodash/flatten';
import escapeRegExp from 'lodash/escapeRegExp';
import union from 'lodash/union';
import compact from 'lodash/compact';
import intersectionWith from 'lodash/intersectionWith';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

const fisea = new Fisea(['title', 'url']);

function getWindow() {
  return new Promise(resolve => {
    chrome.windows.getCurrent(win => {
      return resolve(win);
    });
  });
}

function getTabs(win) {
  return new Promise(resolve => {
    chrome.tabs.query({windowId: win.id}, tabs => resolve(tabs));
  });
}

function getTabsInCurrentWindow() {
  return getWindow().then(win => getTabs(win));
}

function searchTabs(text) {
  const parsed = fisea.parse(text);

  return new Promise(resolve => {
    getTabsInCurrentWindow()
      .then(tabs => {
        const fuseForTitle = new Fuse(tabs, {
          keys: ['title'],
          caseSensitive: true
        });
        const fuseForURL = new Fuse(tabs, {keys: ['url']});

        const titleQueries = union(
          get(parsed, '_', []), get(parsed, 'title', [])
        );

        const titleMatches = compact(titleQueries)
          .reduce((result, query) => {
            const matches = fuseForTitle.search(query);
            result = result.concat(matches);
            return result;
          }, []);

        const urlMatches = compact(get(parsed, 'url', []))
          .reduce((result, query) => {
            const matches = fuseForURL.search(query);
            result = result.concat(matches);
            return result;
          }, []);

        let targetTabs = [];

        if (titleMatches.length > 0 && urlMatches.length > 0) {
          targetTabs = intersectionWith(titleMatches, urlMatches, isEqual);
        } else if (titleMatches.length > 0 && urlMatches.length === 0) {
          targetTabs = titleMatches;
        } else if (titleMatches.length === 0 && urlMatches.length > 0) {
          targetTabs = urlMatches;
        }

        resolve(targetTabs);
      });
  });
}

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (!text) {
    return suggest([]);
  }

  searchTabs(text).then(tabs => {
    if (tabs.length === 0) {
      return suggest([]);
    }

    suggest(tabs.map(tab => {
      return {
        content: tab.title,
        description: tab.title
      };
    }));
  });
});

chrome.omnibox.onInputEntered.addListener(text => {
  searchTabs(text).then(tabs => {
    if (tabs.length === 0) {
      return;
    }

    chrome.tabs.update(tabs[0].id, {active: true});
  });
});
