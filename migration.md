# 迁移

下面是一些对 rem+js 移动端适配做 mobile-forever 迁移的说明。

## amfe-flexible 2.0 & postcss-px2rem

使用这两个工具进行适配的时候，[amfe-flexible](https://github.com/amfe/lib-flexible?tab=readme-ov-file) 会被直接导入到项目中，它会为页面添加根元素的动态 `font-size`，值是浏览器宽度的十分之一，[postcss-px2rem](https://github.com/cuth/postcss-pxtorem) 的配置会出现在 PostCSS 配置文件中，例如：

```javascript
const autoprefixer = require("autoprefixer");
const px2rem = require("postcss-pxtorem");

module.exports = {
  plugins: [
    autoprefixer(),
    px2rem({ rootValue: 37.5, propList: ["*"] })
  ]
};

```

上面的配置代表了，正在开发的项目的理想宽度是 `375px`，编译阶段，`width: 75px` 会编译成 `width: 2rem`，这样，用户在 375px 宽度的设备上访问时，`width: 2rem` 又会结合根元素的 `font-size: 37.5px`，转换回 `width: 75px`。

如果你的项目是上面的开发流程，可以按照下面的步骤，从 rem 转向 vw。

首先移除 amfe-flexible：

```diff
- import "amfe-flexible/index.js"
```

如果是通过 npm 安装的 amfe-flexible，执行 `npm uninstall amfe-flexible`。

接着移除 postcss-px2rem：

```diff
const autoprefixer = require("autoprefixer");
- const px2rem = require("postcss-pxtorem");

module.exports = {
  plugins: [
    autoprefixer(),
-     px2rem({ rootValue: 37.5, propList: ["*"] })
  ]
};
```

最后使用 npm 安装 postcss-mobile-forever，并按照文档添加配置，项目中具体样式的尺寸大小无需改变。