import Login from '@frame/views/login';
export const constantRouterMap = [
  {
    path: '/login',
    component: Login,
    hidden: true,
    meta: {
      id: 'login'
    }
  }
]
