export default {
    plugins: {
        autoprefixer: {},
        "postcss-mobile-forever": {
            rootSelector: "#app",
            viewportWidth: 375, //视窗的宽度，对应的是我们设计稿的宽度
            maxDisplayWidth: 600,
            unitPrecision: 3, // 转换之后的精度
            selectorBlackList: ['.ignore'], //指定不转换为视窗单位的类
            exclude: [/node_modules[\\/](?!vant)/], //如果是regexp, 忽略全部匹配文件;如果是数组array, 忽略指定文件.
            border: true, // 是否在桌面端和横屏打开边框
        },
    }
}