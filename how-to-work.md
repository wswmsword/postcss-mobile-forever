# 原理

下面会介绍关于媒体查询、限制最大宽度和 fixed 定位时的计算这三个主题。

---

本插件会创建可以代表桌面端和移动端横屏的两个媒体查询，然后找到所有的 px 值进行转换，默认情况会把原值转换成两个经过比例计算后的新 px 值，分别对应桌面端和移动端横屏。

媒体查询中有两个重要因素，分别是“屏幕宽度（X）”和“屏幕高度（Y）”，分别对应了屏幕的高低（高度）变化，以及屏幕的宽窄（宽度）变化。下面是媒体查询断点的具体情况，以及和每种情况等效的端口（默认 X 是 640px，Y 是 600px，可通过参数调整）：

- 宽于 X（600）
	- 高于 Y（640），使用桌面宽度（平板、笔记本、桌面端）
	- 低于 Y，使用移动端横屏宽度（移动端横屏）
- 窄于 X
	- 横屏
		- 宽于 landscapeWidth（425），使用移动端横屏宽度（移动端横屏）
		- 窄于 landscapeWidth，使用设计图宽度（穿戴设备）
	- 纵屏，使用设计图宽度（移动端竖屏）

桌面端媒体查询类似于：

```css
@media (min-width: 600px) and (min-height: 640px) { /* ... */ }
```

移动端横屏媒体查询类似于：

```css
@media (min-width: 600px) and (max-height: 640px), (max-width: 600px) and (min-width: 425px) and (orientation: landscape) { /* ... */ }
```

---

怎样限制视口单位的最大宽度：
- 使用 CSS 函数 `min()` 或 `max()`；
- 举例，当前配置为 `{ viewportWidth: 750, maxDisplayWidth: 600 }`，
	- 转换前，`width: 75px;`，
	- 转换后，`width: min(10vw, 60px);`。

---

当需要把竖屏视图居中展示时，fixed 定位的元素需要重新计算，让元素回到视图中，而不是左右的空白区域。例如 `position: fixed; left: 0;` 在宽屏上，应该处于居中的视图中，而不是屏幕最左侧。

如果元素的长度单位是百分比，那么这个百分比是基于[包含块](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Containing_block)计算的。大部分情况，元素的包含块是它的父级元素，因此插件不需要进行转换，但是当元素处于 fixed 定位时，元素的包含块就可能是根元素 `<html>`（visual viewport），这时的宽度是浏览器宽度，所以插件需要把此时依赖浏览器宽度的属性进行转换，这样不管浏览器宽度怎么变化，视图才能始终居中。下面是具体的计算方法（fixed 定位的元素，其百分比宽度大部分情况依赖浏览器宽度，但也存在特殊情况，请查看“注意事项”一节来应对特殊情况）：
- 属性是除了 left 和 right 的属性，单位使用 vw 或百分号（%），
	- 计算方式为 `(idealClientWidth / 100 * number)px`；
- 属性是除了 left 和 right 的属性，单位使用 px，
	- 计算方式为 `(idealClientWidth / viewportWidth * number)px`；
- 属性为 left 或 right，单位使用 vw 或百分号，
	- 计算方式为 `calc(50% - (idealClientWidth / 2 - idealClientWidth / 100 * number)px)`；
- 属性为 left 或 right，单位使用 px，
	- 计算方式为 `calc(50% - (idealClientWidth / 2 - number * idealClientWidth / viewportWidth)px)`。

<details>
<summary>查看关于上述包含块内单位转换的更多解释。</summary>

- idealClientWidth（理想客户端宽度）是属性表中的 desktopWidth 或 landscapeWidth；
- viewportWidth 即属性表中的 viewportWidth；
- number 即属性值里的长度数字；
- 对于包含块，“未考虑的其它情况”请查看“注意事项”一节，例如 `position: fixed; left: 0;` 的另一种可能是使元素处于某祖先元素的最左侧，而不是根元素（浏览器窗口）最左侧；
- 对于包含块，会有 `position: fixed;` 和 `left: 0;` 不在同一选择器的情况，这种情况仍然需要计算 `left`，但默认由于未在同一选择器中检测到 `fixed`，因此不会重新计算，应对方法请查看“注意事项”一节；
- 包含块宽度影响的属性，请查看“其它”一节；
- 以上值的重新计算，目的是保证每个端口的视图完全一致。

</details>