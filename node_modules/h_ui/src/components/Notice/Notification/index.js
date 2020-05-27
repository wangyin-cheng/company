import Vue from 'vue';
import Notification from './Notification.vue';
import { camelcaseToHyphen } from '../../../util/tools';

Notification.newInstance = properties => {
    const _props = properties || {};
    const Instance = new Vue({
        data: _props,
        render (h) {
            return h(Notification, {
                props: _props
            });
        }
    });
    const component = Instance.$mount();
    document.body.appendChild(component.$el);
    const notification = Instance.$children[0];

    // let props = '';
    // Object.keys(_props).forEach(prop => {
    //     props += ' :' + camelcaseToHyphen(prop) + '=' + prop;
    // });

    // const div = document.createElement('div');
    // div.innerHTML = `<notification${props}></notification>`;
    // document.body.appendChild(div);
    // const notification = new Vue({
    //     el: div,
    //     data: _props,
    //     components: { Notification }
    // }).$children[0];

    return {
        notice (noticeProps) {            
            notification.add(noticeProps);
        },
        remove (name) {
            notification.close(name);
        },
        component: notification,
        destroy (element) {
            notification.closeAll();
            setTimeout(function() {
                document.body.removeChild(document.getElementsByClassName(element)[0]);
            }, 500);
        }
    };
};

export default Notification;
