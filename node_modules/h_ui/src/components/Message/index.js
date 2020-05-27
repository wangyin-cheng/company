import Notification from '../Notice/Notification';

const prefixCls = 'h-message';
const iconPrefixCls = 'h-icon';
const prefixKey = 'h_message_key_';

let defaultDuration = 1.5;
let top;
let messageInstance;
let name = 1;
let successTop,infoTop,errorTop,warningTop;
let infoDuration, successDuration, errorDuration, warningDuration;
let defaultTop;

const iconTypes = {
  'info': 'prompt_fill',
  'success': 'success_fill',
  'warning': 'warning_fill',
  'error': 'delete_fill',
  'loading': 'load-c'
};

function getMessageInstance (type) {
  switch(type){
    case 'info':defaultTop=infoTop||top
      break;
    case 'success':defaultTop=successTop||top
      break;
    case 'error':defaultTop=errorTop||top
      break;
    case 'warning':defaultTop=warningTop||top
      break;
    default:defaultTop = top;
  }
  messageInstance = messageInstance || Notification.newInstance({
      prefixCls: prefixCls,
      styles: {
        top: `${defaultTop}px`
      }
    });
  return messageInstance;
}
function getMessageDuration(type,duration) {
  let msgDuration;
  switch (type) {
    case 'info':
      msgDuration = infoDuration >=0 ? infoDuration:duration;
      break;
    case 'success':
      msgDuration = successDuration >=0 ? successDuration:duration;
      break;
    case 'error':
      msgDuration = errorDuration >=0 ? errorDuration:duration;
      break;
    case 'warning':
    msgDuration = warningDuration >=0 ? warningDuration:duration;
      break;
    default:
      msgDuration = duration;
  }
  return msgDuration;
}
function notice (content = '', duration = defaultDuration, type, onClose = function () {}, closable = false) {
  const iconType = iconTypes[type];

  // if loading
  const loadCls = type === 'loading' ? ' h-load-loop' : '';

  let instance = getMessageInstance(type);
  let noticeDuration=getMessageDuration(type,duration);
  instance.notice({
    name: `${prefixKey}${name}`,
    duration: noticeDuration,
    styles: {
      top: `${defaultTop}px`
    },
    transitionName: 'move-up',
    content: `
      <div class="${prefixCls}-custom-content ${prefixCls}-${type}">
        <i class="iconfont icon-${iconType}${loadCls} ${iconPrefixCls} ${iconPrefixCls}-${iconType}"></i>
        <span>${content}</span>
      </div>
    `,
    onClose: onClose,
    closable: closable,
    type: 'message'
  });

  // 用于手动消除
  return (function () {
    let target = name++;

    return function () {
      instance.remove(`${prefixKey}${target}`);
    };
  })();
}

export default {
  info (options) {
    const type = typeof options;
    if (type === 'string') {
      options = {
        content: options
      };
    }
    return notice(options.content, options.duration, 'info', options.onClose, options.closable);
  },
  success (options) {
    const type = typeof options;
    if (type === 'string') {
      options = {
        content: options
      };
    }
    return notice(options.content, options.duration, 'success', options.onClose, options.closable);
  },
  warning (options) {
    const type = typeof options;
    if (type === 'string') {
      options = {
        content: options
      };
    }
    return notice(options.content, options.duration, 'warning', options.onClose, options.closable);
  },
  error (options) {
    const type = typeof options;
    if (type === 'string') {
      options = {
        content: options
      };
    }
    return notice(options.content, options.duration, 'error', options.onClose, options.closable);
  },
  loading (options) {
    const type = typeof options;
    if (type === 'string') {
      options = {
        content: options
      };
    }
    return notice(options.content, options.duration, 'loading', options.onClose, options.closable);
  },
  config (options) {
    if (options.top || options.top === 0) {
      top = options.top;
    }
    if (options.duration || options.duration === 0) {
      defaultDuration = options.duration;
    }
    if (options.infoTop || options.infoTop === 0) {
      infoTop = options.infoTop;
    }
    if (options.errorTop || options.errorTop === 0) {
      errorTop = options.errorTop;
    }
    if (options.warningTop || options.warningTop === 0) {
      warningTop = options.warningTop;
    }
    if (options.successTop || options.successTop === 0) {
      successTop = options.successTop;
    }
    infoDuration=options.infoDuration||options.infoDuration>=0?options.infoDuration:defaultDuration;
    successDuration=options.successDuration||options.successDuration>=0?options.successDuration:defaultDuration; 
    errorDuration=options.errorDuration||options.errorDuration>=0?options.errorDuration:defaultDuration; 
    warningDuration=options.warningDuration||options.warningDuration>=0?options.warningDuration:defaultDuration;   
  },
  destroy () {
    let instance = getMessageInstance();
    messageInstance = null;
    instance.destroy('h-message');
  }
};