const {injectBabelPlugin} = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');


module.exports = function override(config, env) {
    config = injectBabelPlugin(['import', {libraryName: 'antd', style: true}], config);
    config = rewireLess.withLoaderOptions({
        modifyVars: {
            //设置主题色
            //"@primary-color": "#1DA57A",
            // 修改图标库为本地离线，而不是阿里云CDN上的图标资源
            '@icon-url': '"/iconfont/iconfont"'
        },
    })(config, env);
    return config;
};
