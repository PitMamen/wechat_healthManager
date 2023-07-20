// 节流函数
export const throttle = function (func, wait) {
  let previousTime = 0;
  return function () {
    const now = Date.now();
    const context = this;
    const args = [...arguments];
    if (now - previousTime > wait) {
      func.apply(context, args);
      previousTime = now;
    }
  };
};

// 获取小程序配置
export const tabBarConfig = function () {
  // eslint-disable-next-line no-undef
  return __wxConfig;
};

// 当前是否是 tabBar 页面
export const isTabBarPage = function () {
  if (!tabBarConfig().tabBar) return false;
  const tabBar =  tabBarConfig().tabBar.list || [];
  const tabBarList = tabBar.map(obj => obj.pagePath);
  const currentPage = `${getRoute()}.html`;
  return tabBarList.indexOf(currentPage) !== -1;
};

// 获取当前的页面地址
export const getRoute = function () {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return currentPage.route;
};
