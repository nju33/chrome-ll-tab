import LLDispatcher from 'dispatchers/ll';
import actionType from 'constants/action-type';

class LLAction {
  static addAlias(alias, targetIdx) {
    LLDispatcher.dispatch({
      actionType: actionType.ADD_ALIAS,
      alias,
      targetIdx,
    });
  }

  static confirm(type, msg, handleYes, handleNo) {
    LLDispatcher.dispatch({
      actionType: actionType.CONFIRM,
      type, 
      msg,
      handleYes,
      handleNo,
    });
  }

  static deleteAlias(index) {
    LLDispatcher.dispatch({
      actionType: actionType.DELETE_ALIAS,
      index,
    });
  }
}

export default LLAction;
