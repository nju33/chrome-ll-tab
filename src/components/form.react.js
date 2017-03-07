import React from 'react';
import LLAction from 'actions/ll';
import LLStore from 'stores/ll'
import esc from 'lodash.escape';

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
    };
  }

  componentDidMount() {
    init.call(this);

    LLStore.addAddAliasListener(() => {
      init.call(this)
        .then(({aliases}) => {
          chrome.runtime.sendMessage({aliases}, () => {});
        });
    });

    LLStore.addDeleteAliasListener((deletedAlias) => {
      init.call(this)
        .then(({aliases}) => {
          chrome.runtime.sendMessage({aliases}, () => {});
          (async () => {
            const url = await LLStore.currentURL;
            if (url === deletedAlias.url) {
              this.refs.alias.value = '';
            }
          })();
        });
    });
  }

  change(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
    return true;
  }

  submit(e) {
    e.preventDefault();

    (async () => {
      const url = esc(this.refs.url.value);
      const alias = this.refs.alias.value;
      const lastEnter = Date.now();

      if (url && alias) {
        LLAction.addAlias({url, alias, lastEnter}, this.state.targetIdx);
        this.state.exists
        ? LLStore.emitShowDialog('alert', `'${alias}' updated`)
        : LLStore.emitShowDialog('alert', `'${alias}' saved`);
      } else {
        LLStore.emitShowDialog('alert', `There is a blank :(`);
      }
    })();
  }

  render() {
    return (
      <form className="form__box" onSubmit={::this.submit}>
        <div className="form__group">
          <label className="form__label" htmlFor="url">URL</label>
          <input className="form__input-text" id="url" name="url"
            type="text" ref="url" value={this.state.url}
            onChange={::this.change} />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="alias">Alias</label>
          <div className="form__input-group">
            <input className="form__input-group-item form__input-text"
              tabIndex={1}  id="alias" type="text" name="alias" ref="alias"
              value={this.state.alias} onChange={::this.change} />
            <input className="form__input-group-item form__btn"
              value={this.state.exists ? 'Update' : 'Save'} type="submit" />
          </div>
        </div>
      </form>
    );
  }
}

export default Form;

function init() {
  return (async () => {
    const url = await LLStore.currentURL;
    const aliases = await LLStore.aliases;
    const targetIdx = aliases.findIndex(aliasData => aliasData.url === url);

    if (~targetIdx) {
      const exists = true
      const {url, alias} = aliases[targetIdx];
      this.setState({exists, url, alias, targetIdx});
    } else {
      const exists = false
      this.setState({exists, url, targetIdx});
    }
    return {url, aliases};
  })();
}
