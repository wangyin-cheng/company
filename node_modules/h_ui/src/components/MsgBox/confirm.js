import Vue from 'vue'
import Modal from './MsgBox.vue'
import Icon from '../Icon/Icon.vue'
import Button from '../Button/Button.vue'
import Locale from '../../mixins/locale'

const prefixCls = 'h-modal-confirm'

Modal.newInstance = properties => {
  const _props = properties || {}
  const Instance = new Vue({
    name: 'Msgbox-js',
    mixins: [ Locale ],
    data: Object.assign({}, _props, {
      visible: false,
      width: 416,
      title: '',
      zIndex:1000,
      body: '',
      iconType: '',
      iconName: '',
      okText: undefined,
      cancelText: undefined,
      cancelType:'text',
      showCancel: false,
      loading: false,
      buttonLoading: false,
      scrollable: false,
      closable: false,
      height: undefined,
      maxHeight:undefined,
      isOkLeft: false,
      cancleIcon: '',
      okIcon: '',
      top: 100,
      maskClosable: false,
      maximize: false,
      styles: {},
      className: '',
      transitionNames: ['ease', 'fade'],
      disableTabEvent: false,
      maskTop: null,
      maskLeft: null
    }),
    render(h) {
      let footerVNodes = []
      if (this.showCancel && !this.isOkLeft) {
        footerVNodes.push(h(Button, {
          props: {
            type: this.cancelType,
            size: 'large',
            icon: this.cancleIcon
          },
          on: {
            click: this.cancel
          }
        }, this.localeCancelText))
      }
      footerVNodes.push(h(Button, {
        props: {
          type: 'primary',
          size: 'large',
          loading: this.buttonLoading,
          icon: this.okIcon
        },
        on: {
          click: this.ok
        }
      }, this.localeOkText))
      if (this.showCancel && this.isOkLeft) {
        footerVNodes.push(h(Button, {
          props: {
            type: this.cancelType,
            size: 'large',
            icon: this.cancelIcon
          },
          on: {
            click: this.cancel
          }
        }, this.localeCancelText))
      }
      // render content
      let body_render
      if (this.render) {
        body_render = h('div', {
          attrs: {
            class: `${prefixCls}-body ${prefixCls}-body-render`
          },
          style: {
            height: this.height + 'px',
            overflowY: this.height ? 'auto' : ''
          }

        }, [this.render(h)])
      } else {
        body_render = h('div', {
          attrs: {
            class: `${prefixCls}-body`
          },
          style: {
            height: this.height + 'px',
            overflowY: this.height|| this.maxHeight? 'auto' : '',
            maxHeight:this.maxHeight+'px'
          }
        }, [
          //   h('div', {
          //       class: this.iconTypeCls
          //   }, [
          //       h('i', {
          //           class: this.iconNameCls
          //       })
          //   ]),
          h('div', {
            domProps: {
              innerHTML: this.body
            }
          })
        ])
      }

      return h(Modal, {
        props: Object.assign({}, _props, {
          width: this.width,
          scrollable: this.scrollable,
          closable: this.closable,
          maskClosable: this.maskClosable,
          zIndex:this.zIndex,
          top: this.top,
          maximize: this.maximize,
          styles: this.styles,
          className: this.className,
          transitionNames: this.transitionNames,
          disableTabEvent: this.disableTabEvent,
          maskTop: this.maskTop,
          maskLeft: this.maskLeft
        }),
        domProps: {
          value: this.visible
        },
        on: {
          input: (status) => {
            this.visible = status
          }
        }
      }, [
        h('div', {
          attrs: {
            class: prefixCls
          }
        }, [
          h('div', {
            attrs: {
              class: `${prefixCls}-head`
            }
          }, [
            h('div', {
              class: this.iconTypeCls
            }, [
              h('i', {
                class: this.iconNameCls
              })
            ]),
            h('div', {
              attrs: {
                class: `${prefixCls}-head-title`
              },
              domProps: {
                innerHTML: this.title
              }
            })
          ]),
          body_render,
          h('div', {
            attrs: {
              class: `${prefixCls}-footer`
            }
          }, footerVNodes)
        ])
      ])
    },
    computed: {
      iconTypeCls() {
        return [
          `${prefixCls}-head-icon`,
          `${prefixCls}-head-icon-${this.iconType}`
        ]
      },
      iconNameCls() {
        return [
          'h-icon',
          'iconfont',
          `icon-${this.iconName}`
        ]
      },
      localeOkText() {
        if (this.okText) {
          return this.okText
        } else {
          return this.t('i.modal.okText')
        }
      },
      localeCancelText() {
        if (this.cancelText) {
          return this.cancelText
        } else {
          return this.t('i.modal.cancelText')
        }
      }
    },
    methods: {
      cancel() {
        this.$children[0].visible = false
        this.buttonLoading = false
        this.onCancel()
        this.remove()
      },
      ok() {
        if (this.loading) {
          this.buttonLoading = true
        } else {
          this.$children[0].visible = false
          this.remove()
        }
        this.onOk()
      },
      remove() {
        setTimeout(() => {
          this.destroy()
        }, 300)
      },
      destroy() {
        this.$destroy()
        document.body.removeChild(this.$el)
        this.onRemove()
      },
      onOk() {},
      onCancel() {},
      onRemove() {}
    }
  })

  const component = Instance.$mount()
  document.body.appendChild(component.$el)
  const modal = Instance.$children[0]

  return {
    show(props) {
      modal.$parent.showCancel = props.showCancel
      modal.$parent.iconType = props.icon

      switch (props.icon) {
        case 'info':
          modal.$parent.iconName = 'prompt'
          break
        case 'success':
          modal.$parent.iconName = 'success'
          break
        case 'warning':
          modal.$parent.iconName = 'warning'
          break
        case 'error':
          modal.$parent.iconName = 'delete'
          break
        case 'confirm':
          modal.$parent.iconName = 'feedback'
          break
      }

      if ('width' in props) {
        modal.$parent.width = props.width
      }else{
        modal.$parent.width = Instance.width
      }

      if ('title' in props) {
        modal.$parent.title = props.title
      }

      if ('content' in props) {
        modal.$parent.body = props.content
      }

      if ('okText' in props) {
        modal.$parent.okText = props.okText
      }

      if ('cancelText' in props) {
        modal.$parent.cancelText = props.cancelText
      }
      if ('cancelType' in props) {
        modal.$parent.cancelType = props.cancelType
      }
      if ('onCancel' in props) {
        modal.$parent.onCancel = props.onCancel
      }

      if ('onOk' in props) {
        modal.$parent.onOk = props.onOk
      }

      // async for ok
      if ('loading' in props) {
        modal.$parent.loading = props.loading
      }

      if ('scrollable' in props) {
        modal.$parent.scrollable = props.scrollable
      }
      if ('height' in props) {
        modal.$parent.height = props.height
      }
      if ('maxHeight' in props) {
        modal.$parent.maxHeight = props.maxHeight
      }
      if ('zIndex' in props) {
        modal.$parent.zIndex = props.zIndex
      }
      if ('isOkLeft' in props) {
        modal.$parent.isOkLeft= props.isOkLeft
      }
      if('cancelIcon' in props){
        modal.$parent.cancelIcon= props.cancelIcon
      }
      if('okIcon' in props){
        modal.$parent.okIcon= props.okIcon
      }
      if ('closable' in props) {
        modal.$parent.closable = props.closable
      }
      if ('maskClosable' in props) {
        modal.$parent.maskClosable = props.maskClosable
      }
      if ('top' in props) {
        modal.$parent.top = props.top
      }
      if ('maximize' in props) {
        modal.$parent.maximize = props.maximize
      }
      if ('styles' in props) {
        modal.$parent.styles = props.styles
      }
      if ('className' in props) {
        modal.$parent.className = props.className
      }
      if ('transitionNames' in props) {
        modal.$parent.transitionNames = props.transitionNames
      }
      if ('disableTabEvent' in props) {
        modal.$parent.disableTabEvent = props.disableTabEvent
      }
      if ('maskTop' in props) {
        modal.$parent.maskTop = props.maskTop
      }
      if ('maskLeft' in props) {
        modal.$parent.maskLeft = props.maskLeft
      }

      // notice when component destroy
      modal.$parent.onRemove = props.onRemove

      modal.visible = true
    },
    remove() {
      modal.visible = false
      modal.$parent.buttonLoading = false
      modal.$parent.remove()
    },
    component: modal
  }
}

export default Modal
