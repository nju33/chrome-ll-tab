import EventEmitter from 'events';
import LLDispatcher from 'dispatchers/ll';
import actionType from 'constants/action-type';
import storage from 'helpers/storage';
import esc from 'lodash.escape';

const ev = new EventEmitter();

let _currentURL = null;

class LLStore {
  static get aliases() {
    return storage.get();
  }

  static get currentURL() {
    return new Promise((resolve) => {
      if (_currentURL) {
        return resolve(_currentURL);
      } else {
        chrome.tabs.query({
          active: true,
          currentWindow: true,
        }, (tabs) => {
          _currentURL = esc(tabs[0].url);
          return resolve(_currentURL);
        });
      }
    });
  }

  static emitAddAlias() {
    ev.emit(actionType.ADD_ALIAS);
  }

  static addAddAliasListener(handle) {
    ev.on(actionType.ADD_ALIAS, handle);
  }

  static emitDeleteAlias(target) {
    ev.emit(actionType.DELETE_ALIAS, target);
  }

  static addDeleteAliasListener(handle) {
    ev.on(actionType.DELETE_ALIAS, handle);
  }

  static emitEndDialog() {
    ev.emit(actionType.END_DIALOG);

    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve();
      }, 161);
    });
  }

  static emitShowDialog(type, msg, handleYes, handleNo) {
    ev.emit(actionType.CONFIRM, type, msg, handleYes, handleNo);
  }

  static addShowDialogListener(handle) {
    ev.on(actionType.CONFIRM, handle);
  }

  static addEndDialogListener(handle) {
    ev.on(actionType.END_DIALOG, handle);
  }
}

LLDispatcher.register((payload) => {
  switch (payload.actionType) {
    case actionType.ADD_ALIAS:
      {
        const {alias, targetIdx} = payload;
        storage.get()
          .then((aliases) => {
            if (~targetIdx) {
              aliases[targetIdx] = alias;
            } else {
              aliases.push(alias);
            }
            return Promise.resolve(aliases);
          })
          .then(storage.set)
          .then(() => LLStore.emitAddAlias())
      }
      break;

    case actionType.DELETE_ALIAS:
      {
        const {index} = payload;
        (async () => {
          const aliases = await storage.get();
          const target = aliases[index]
          aliases.splice(index, 1);
          storage.set(aliases);
          LLStore.emitDeleteAlias(target);
        })();
      }

      break;

    case actionType.CONFIRM:
      {
        const {type, msg, handleYes, handleNo} = payload;
        LLStore.emitShowDialog(type, msg, handleYes, handleNo);
      }
      break;
  }
});

export default LLStore;
