# json tree view

一个简洁的 json 格式化插件，不依赖任何库和框架。

## 安装

```bash
npm i simple-json-tree-view
```

## 引入

```js
import JsonTreeView from 'simple-json-tree-view'
import 'simple-json-tree-view/themes/default.css'
```

## 使用

```js
new JsonTreeView({
  el: '#container'
})
```

## 主题

默认提供了两个主题：

亮色：

```js
import 'simple-json-tree-view/themes/default.css'
```

暗色：

```js
import 'simple-json-tree-view/themes/oneDarkPro.css'
```

插件的字体、字号、颜色、间距、展开收起按钮的样式等都可以调整，所有类名都可以通过`default.css`找到，你可以选择覆盖某一部分，也可以整个覆盖，也就是不要引入默认的样式文件，直接使用你重写的样式即可。

## API

### 创建实例

```js
import JsonTreeView from 'simple-json-tree-view'
let jsonTreeView = new JsonTreeView(options)
```

### 实例化选项options

一个对象，支持的属性如下：

| 属性  | 说明                               | 类型   | 可选值 | 默认值 |
| ----- | ---------------------------------- | ------ | ------ | ------ |
| el | 必传，容器元素，可以传一个选择器，也可以传dom元素 | HTMLElement | —      |  |
| expandBtnPosition | 展开收起按钮的位置 | String | default（紧贴括号）、left（统一在左侧） | default |
| showLine | 是否显示竖线 | Boolean | —      | false |
| showExpandBtn | 是否显示展开收起按钮 | Boolean | —      | true |
| showHover | 是否显示鼠标滑入的高亮效果 | Boolean | —      | true |
| showRowNum | 是否显示行数 | Boolean | —      | false |
| errorSliceNum | 出错位置前后截取的字符串长度 | Number | —      | 20 |

### 实例方法

#### destroy()

销毁。

#### stringify(data)

- data：json字符串，或json对象

渲染json树。

#### unExpandAll()

收起所有。

#### expandAll()

展开所有。