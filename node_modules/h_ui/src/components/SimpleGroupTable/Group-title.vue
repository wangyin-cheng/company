<script>
import Mixin from './mixin';
export default {
    name: 'GroupTitle',
    mixins: [ Mixin ],
    props: {
        rowtitle: String,
        titleRender: Function,
        prefixCls: String,
    },
    render (h) {
        const titleRender = this.titleRender;
        let titleContent;
        if (typeof titleRender === 'function') {
            titleContent = titleRender(h, this.rowtitle);
        } else {
            titleContent = h('span', {
                'class': {
                    [`${this.prefixCls}-cell-title`]: true
                }
            }, [this.rowtitle]);
        }
        return titleContent;
    }

};
</script>

