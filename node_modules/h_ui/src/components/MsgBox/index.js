import Modal from './confirm';

let modalInstance;

function getModalInstance (render = undefined) {
  modalInstance = modalInstance || Modal.newInstance({
    closable: false,
    maskClosable: false,
    footerHide: true,
    render: render
  });

  return modalInstance;
}

const msgQueue = {
  working: false,
  queue: [],
  push: function (option) {
    this.queue.push(option);
  },
  runNext: function () {
    let option = this.queue.shift();
    if (option) {
      this.working = true;
      confirm(option);
    }
  }
}

function confirm (options) {
  const render = ('render' in options) ? options.render : undefined;
  let instance  = getModalInstance(render);

  options.onRemove = function () {
    modalInstance = null;
    msgQueue.working = false;
    msgQueue.runNext();
  };

  instance.show(options);
}

Modal.info = function (props = {}) {
  props.icon = 'info';
  props.showCancel = false;
  msgQueue.push(props);
  !msgQueue.working && msgQueue.runNext();
};

Modal.success = function (props = {}) {
  props.icon = 'success';
  props.showCancel = false;
  msgQueue.push(props);
  !msgQueue.working && msgQueue.runNext();
};

Modal.warning = function (props = {}) {
  props.icon = 'warning';
  props.showCancel = false;
  msgQueue.push(props);
  !msgQueue.working && msgQueue.runNext();
};

Modal.error = function (props = {}) {
  props.icon = 'error';
  props.showCancel = false;
  msgQueue.push(props);
  !msgQueue.working && msgQueue.runNext();
};

Modal.confirm = function (props = {}) {
  props.icon = 'confirm';
  props.showCancel = true;
  msgQueue.push(props);
  !msgQueue.working && msgQueue.runNext();
};

Modal.remove = function () {
  if (!modalInstance) {   // at loading status, remove after Cancel
    return false;
  }

  const instance = getModalInstance();

  instance.remove();
};

export default Modal;
