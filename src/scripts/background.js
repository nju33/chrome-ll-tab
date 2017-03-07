import storage from 'helpers/storage';
import esc from 'lodash.escape';
import escRE from 'lodash.escaperegexp';
import unesc from 'lodash.unescape';
import Fuse from 'fuse.js';
import Fisea from 'fisea';
import flatten from 'lodash/flatten';
import escapeRegExp from 'lodash/escapeRegExp';

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
        const matches = tabs.filter(tab => {
          const bools = [];
          if ('_' in parsed) {
            bools.push(parsed._.some(text => {
              return new RegExp(escapeRegExp(text), 'i').test(tab.title);
            }));
          }

          if ('title' in parsed) {
            bools.push(parsed.title.some(text => {
              return new RegExp(escapeRegExp(text), 'i').test(tab.title);
            }));
          }

          if ('url' in parsed) {
            bools.push(parsed.url.some(text => {
              return new RegExp(escapeRegExp(text)).test(tab.url);
            }));
          }

          return bools.every(b => b);
        });

        resolve(matches);
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
        content: tab.url,
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
