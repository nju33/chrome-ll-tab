import storage from 'helpers/storage';
import esc from 'lodash.escape';
import escRE from 'lodash.escaperegexp';
import unesc from 'lodash.unescape';
import Fuse from 'fuse.js';

// const sample = [
//   {
//     url: esc('https://www.youtube.com/?hl=ja&gl=JP'),
//     alias: 'yt',
//     lastEnter: 0,
//   },
//   {
//     url: esc('https://github.com/totora0155'),
//     alias: 'gh',
//     lastEnter: 0,
//   },
//   {
//     url: 'http://www.netflix.com/browse',
//     alias: 'nf',
//     lastEnter: 0,
//   },
// ]
//

let aliases = null;
let fuse = null;

chrome.omnibox.onInputStarted.addListener(() => {
  storage.get().then(_aliases => {
    aliases = _aliases || [];
    fuse = new Fuse(aliases, {keys: ['alias']})
  })
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (fuse === null) {
    return suggest([]);
  }

  const matches = fuse.search(text)
  const suggestions = matches.map(item => {
    return {
      content: item.url,
      description: `@${item.alias} (${item.url})`,
    };
  });
  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(text => {
  storage.get().then(_aliases => {
    const aliases = _aliases || [];
    const fuse = new Fuse(aliases, {keys: ['alias']});
    const matches = fuse.search(text);
    const target = matches[0];

    if (!target) {
      return;
    }

    chrome.tabs.update({url: target.url});
    target.lastEnter = Date.now();
    storage.set(aliases);
  })
});

chrome.omnibox.onInputCancelled.addListener(() => {
  fuse = null;
});
