import React from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import LLStore from 'stores/ll';

class Dialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      msg: null,
      handleYes: null,
      handleNo: null,
      visible: null,
    };
  }

  componentDidMount() {
    LLStore.addShowDialogListener((type, msg, handleYes, handleNo) => {
      const visible = true;
      let _timeout = null;

      if (this.state.visible) {
        if (_timeout) {
          clearTimeout(_timeout);
          _timeout = null;
        }

        (async () => {
          await LLStore.emitEndDialog();
          this.setState({type, msg, handleYes, handleNo, visible});
          if (type === 'alert') {
            handleAlert.call(this);
          }
        })();
      } else {
        this.setState({type, msg, handleYes, handleNo, visible});
        if (type === 'alert') {
          handleAlert.call(this);
        }
      }

      function handleAlert() {
        _timeout = setTimeout(() => {
          this.setState({
            type: null,
            msg: null,
            handleYes: null,
            handleNo: null,
            visible: null,
          });
        }, 3000);
      }
    });

    LLStore.addEndDialogListener(() => {
      this.setState({
        type: null,
        msg: null,
        handleYes: null,
        handleNo: null,
        visible: null,
      });
    });
  }

  render() {
    const choices = (
      <div className="dialog__btns">
        <a role="button" className="dialog__btn dialog__no-btn"
          onClick={this.state.handleNo}>No</a>
        <a role="button" className="dialog__btn dialog__yes-btn"
          onClick={this.state.handleYes}>Yes</a>
      </div>
    );
    const dialog = (() => {
      if (this.state.visible) {
        return (
          <div key="dialog" className="dialog__box">
            <span className="dialog__msg">{this.state.msg}</span>
            {this.state.type === 'confirm' && choices}
          </div>
        )
      }
    })();

    return (
      <div>
        <CSSTransitionGroup component="div" transitionName="dialog"
          transitionEnterTimeout={this.state.visible ? 160 : 0}
          transitionLeaveTimeout={this.state.visible ? 0 : 160}
          >{dialog}</CSSTransitionGroup>
      </div>
    );
  }
}

export default Dialog;
