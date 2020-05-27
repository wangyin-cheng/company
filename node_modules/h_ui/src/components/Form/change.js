let obarr = []; //定义一个需要监听变化的数组
//copy一份数组原型方法，防止污染原型数组
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto)//根据原生对象创造一个新对象
//把arrayMethods上的push()转化为观察者对象
// Object.defineProperty(arrayMethods,'push',{
//   value: function mutator(){
//     //缓存原生方法，之后调用
//    const original = arrayProto['push'];
//    console.log('obarr.push会走这里')
      // let args = Array.from(arguments);方法从一个类似数组或可迭代对象中创建一个新的数组实例。
      // original.apply(this,args)劫持另外一个对象的方法，继承另外一个对象的属性.将原生对象属性给到现有对象属性
      // console.log(obarr) .call(obj,params)
//   }
// })
// 此时arrayMethods定义了一个push的新属性，那么我们应该把它和 let obarr = [] 绑定起来
// obarr.__proto__ = arrayMethods; //使用arrayMethods覆盖obarr的原型
// Object.defineProperty(obarr,'push',{
//   value:arrayMethods.push
// })

// 上面实现了push方法，其他的方法同理，我们只需要把所有需要实现的方法循环遍历执行即可，升级后代码如下：

[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(item=>{
  Object.defineProperty(arrayMethods,item,{
      value:function mutator(){
        //缓存原生方法，之后调用
        const original = arrayProto[item] 
        let args = Array.from(arguments)
        original.apply(this,args)
      },
  })
})
function protoAugment (target,src) {
  target.__proto__ = src
}
// 调用
let obarr = []
protoAugment(obarr, arrayMethods)
obarr.push(0);

// 下面来简单的实现Vue对数组的依赖收集和通知更新
// 实现Vue的数据双向绑定有3大核心：Observer,Dep,Watcher,来个简单实现
// 首先来实现dep,dep主要负责依赖的收集,get时触发收集，set时通知watcher通信：

//获得arrayMethods对象上所有属性的数组
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)// Object.getOwnPropertyNames(obj)返回对象自己的属性名称而非原型

class Dep{
  constructor(){
    //存放所有的监听watcher
    this.subs = [];
  },
  //添加一个观察者对象
  addSub(Watcher){
    this.subs.push(Watcher);
  },
  //依赖收集
  depend(){
    //Dep.target 作用只有需要的才会手机依赖
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  },
  // 调用依赖收集的Watcher更新
  notify () {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// 为Dep.target 赋值
function pushTarget (Watcher) {
  Dep.target = Watcher
}
class Watcher{
  constructor(vm,expOrFn,cb,options){
    //传进来的对象 例如Vue
    this.vm = vm
    //在Vue中cb是更新视图的核心，调用diff并更新视图的过程
    this.cb = cb
    //收集Deps，用于移除监听
    this.newDeps = []
    this.getter = expOrFn
    //设置Dep.target的值，依赖收集时的watcher对象
    this.value =this.get()
  },
  get(){
    //设置Dep.target值，用以依赖收集
      pushTarget(this)
      const vm = this.vm
      let value = this.getter.call(vm, vm)
      return value
  },
  //添加依赖
  addDep (dep) {
    // 这里简单处理，在Vue中做了重复筛选，即依赖只收集一次，不重复收集依赖
    this.newDeps.push(dep)
    dep.addSub(this)
  },
  //更新
  update () {
    this.run()
  },
  //更新视图
  run(){
    //这里只做简单的console.log 处理，在Vue中会调用diff过程从而更新视图
    console.log(`这里会去执行Vue的diff相关方法，进而更新数据`)
  }
}
//获得arrayMethods对象上所有属性的数组
class Observer{
  constructor(value){
    this.value = value;
    // 增加dep属性（处理数组时可以直接调用）
    this.dep = new Dep();
    //将Observer实例绑定到data的__ob__属性上面去，后期如果oberve时直接使用，不需要从新Observer,
    //处理数组是也可直接获取Observer对象
    def(value,'__ob__',this);
    if(Array.isArray(value)){
      //处理数组
      const augment = value.__proto__ ? protoAugment : copyAugment  
      //此处的 arrayMethods 就是上面使用Object.defineProperty处理过
      augment(value, arrayMethods, arrayKeys)
      // 循环遍历数组children进行oberve
      this.observeArray(value)
    }else{
      //处理对象
      this.walk(value);
    }
  },
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      //此处我做了拦截处理，防止死循环，Vue中在oberve函数中进行的处理
      if(keys[i]=='__ob__') return;
        defineReactive(obj, keys[i], obj[keys[i]])
    }
  },
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}