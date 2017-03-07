import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import LLAction from 'actions/ll';
import LLStore from 'stores/ll';
import actionType from 'constants/action-type';

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      touched: false,
      aliases: [],
    };
  }

  componentDidMount() {
    LLStore.aliases.then(aliases => {
      const touched = aliases.length > 0;
      this.setState({aliases, touched});
    });

    LLStore.addAddAliasListener(() => {
      (async () => {
        const aliases = await LLStore.aliases;
        this.setState({aliases, touched: true});
      })();
    });

    LLStore.addDeleteAliasListener(() => {
      (async () => {
        const aliases = await LLStore.aliases;
        aliases.length || this.setState({visible: false});
      })();
    })
  }

  toggle() {
    this.setState({
      visible: !this.state.visible,
    });
  }

  deleteActionForAlias(e) {
    const {index, alias, type, actionType: _actionType} = e.target.dataset;
    let confirmMsg = null;
    let doneMsg = null;

    switch (_actionType) {
      case actionType.DELETE_ALIAS:
        confirmMsg = `Delete '${alias}' ?`;
        doneMsg = `'${alias}' deleted`;
        break;
    }

    const handleYes = () => {
      LLAction.deleteAlias(index);
      (async () => {
        await LLStore.emitEndDialog();
        const aliases = await LLStore.aliases;
        this.setState({aliases});
        LLStore.emitShowDialog('alert', doneMsg);
      })();
    }
    const handleNo = () => {
      LLStore.emitEndDialog();
    }

    LLAction.confirm(type, confirmMsg, handleYes, handleNo);
  }

  render() {
    const lis = this.state.aliases.map((alias, idx) => {
      return (
        <li className="list__alias" key={alias.alias}>
          <span className="list__alias-name">{alias.alias}</span>
          <small className="list__alias-url">{alias.url}</small>
          <a role="button" className="list__delete-btn icono-cross"
            data-index={idx} data-alias={alias.alias} data-type="confirm"
            data-action-type={actionType.DELETE_ALIAS}
            onClick={::this.deleteActionForAlias}></a>
        </li>
      );
    });

    const list = (() => {
      if (!this.state.visible) {
        return false;
      }

      if (lis.length) {
        return (
          <CSSTransitionGroup component="ul" className="list__aliases"
            key="list" transitionName="list"
            transitionEnterTimeout={160}
            transitionLeaveTimeout={160}
            >{lis}</CSSTransitionGroup>
        );
      } else if (!lis.length && !this.state.touched) {
        return (
          <div key="list" className="list__aliases">
            <div className="list__not-found">Not found yet<br />:'(</div>
          </div>
        );
      }
    })();

    return (
      <div className="list__box">
        <CSSTransitionGroup component="div" transitionName="list"
          transitionEnterTimeout={160}
          transitionLeaveTimeout={160}
          >{list}</CSSTransitionGroup>
        <a className="list__btn list__btn--open" role="button"
          onClick={::this.toggle}>
          {this.state.visible ? 'Hide aliases' : 'Show aliases'}
        </a>
      </div>
    );
  }
}

export default List;
