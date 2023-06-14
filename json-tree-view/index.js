import {
  type,
  isNoEmptyObjectOrArray,
  getFirstAncestorByClassName
} from './utils'

class JsonTreeView {
  constructor({
    el,
    expandBtnPosition = 'default',
    showLine = false,
    showExpandBtn = true,
    showHover = true,
    showRowNum = false
  }) {
    this.el = type(el) === 'string' ? document.querySelector(el) : el
    if (!el) throw new Error('请提供容器元素')
    this.expandBtnPosition = expandBtnPosition // 展开收起按钮的位置：default（紧贴括号）、left（统一在左侧）
    this.showLine = showLine // 是否显示竖线
    this.showExpandBtn = showExpandBtn // 是否显示展开收起按钮
    this.showHover = showHover // 是否显示鼠标滑入的高亮效果
    this.showRowNum = showRowNum // 是否显示行数
    this.wrap = null // 总的容器元素
    this.rowWrap = null // 渲染行的容器
    this.treeWrap = null // 渲染json树的容器
    this.uniqueId = 0 // 唯一的id
    this.lastMouseoverEl = null // 上一次鼠标滑入的元素
    this.oneRowHeight = -1 // 一行元素的高度
    this.lastRenderRows = 0 // 上一次渲染的行数
    this.init()
    this.bindEvent()
  }

  // 初始化
  init() {
    // 最外层容器
    this.wrap = document.createElement('div')
    this.wrap.className = `simpleJsonTreeViewContainer_abc123`
    // 行号容器
    if (this.showRowNum) {
      this.rowWrap = document.createElement('div')
      this.rowWrap.className = 'rowWrap'
      this.wrap.appendChild(this.rowWrap)
    }
    // 树容器
    this.treeWrap = document.createElement('div')
    this.treeWrap.className = `treeWrap  ${
      this.expandBtnPosition === 'left' ? 'addPadding' : ''
    }`
    this.wrap.appendChild(this.treeWrap)
    this.el.appendChild(this.wrap)
  }

  // 绑定事件
  bindEvent() {
    this.onClick = this.onClick.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
    this.onMouseout = this.onMouseout.bind(this)
    this.wrap.addEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.addEventListener('mouseover', this.onMouseover)
      this.wrap.addEventListener('mouseout', this.onMouseout)
    }
  }

  // 销毁
  destroy() {
    this.wrap.removeEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.removeEventListener('mouseover', this.onMouseover)
      this.wrap.removeEventListener('mouseout', this.onMouseout)
    }
    this.el.removeChild(this.wrap)
  }

  // 格式化
  stringify(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    this.treeWrap.innerHTML = `<div class="row">${this.stringifyToHtml(
      data
    )}</div>`
    this.renderRows()
  }

  // 将json转换成html字符串
  stringifyToHtml(data, isAsKeyValue = false, isLast = true) {
    const dataType = type(data)
    let str = ''
    let isEmpty = false
    let id = 'simpleJsonTreeViewId_' + this.uniqueId++
    const expandBtnStr = this.showExpandBtn
      ? `<span class="expandBtn expand ${
          this.expandBtnPosition === 'left' ? 'inLeft' : ''
        }" data-id="${id}"></span>`
      : '' // 展开收起按钮
    switch (dataType) {
      case 'object': // 对象
        const keys = Object.keys(data)
        isEmpty = keys.length <= 0
        // 开始的括号
        str +=
          isEmpty || isAsKeyValue
            ? `<span class="brace">${isEmpty ? '' : expandBtnStr}{</span>`
            : `<div class="brace">${expandBtnStr}{</div>`
        if (!isEmpty) {
          // 中间整体
          str += `<div class="object ${
            this.showLine ? 'showLine' : ''
          }" data-fid="${id}">`
          // 中间的每一行
          keys.forEach((key, index) => {
            str += '<div class="row">'
            str += `<span class="key">"${key}"</span><span class="colon">:</span>`
            str += this.stringifyToHtml(
              data[key],
              true,
              index >= keys.length - 1
            )
            // 避免非空对象或数组后面逗号重复
            if (index < keys.length - 1 && !isNoEmptyObjectOrArray(data[key])) {
              str += '<span class="comma">,</span>'
            }
            str += '</div>'
          })
          str += '</div>'
        }
        // 结束的括号
        str += isEmpty
          ? '<span class="brace">}</span>'
          : `<div class="brace">}${
              isLast ? '' : '<span class="comma">,</span>'
            }</div>`
        break
      case 'array': // 数组
        isEmpty = data.length <= 0
        // 开始的括号
        str +=
          isEmpty || isAsKeyValue
            ? `<span class="bracket">${isEmpty ? '' : expandBtnStr}[</span>`
            : `<div class="bracket">${expandBtnStr}[</div>`
        if (!isEmpty) {
          // 中间整体
          str += `<div class="array ${
            this.showLine ? 'showLine' : ''
          }" data-fid="${id}">`
          // 中间的每一行
          data.forEach((item, index) => {
            str += '<div class="row">'
            str += this.stringifyToHtml(item, false, index >= data.length - 1)
            // 避免非空对象或数组后面逗号重复
            if (index < data.length - 1 && !isNoEmptyObjectOrArray(item)) {
              str += '<span class="comma">,</span>'
            }
            str += '</div>'
          })
          str += '</div>'
        }
        // 结束的括号
        str += isEmpty
          ? '<span class="bracket">]</span>'
          : `<div class="bracket">]${
              isLast ? '' : '<span class="comma">,</span>'
            }</div>`
        break
      default: // 其他类型
        let isString = dataType === 'string'
        str += `<span class="${dataType}">${isString ? '"' : ''}${data}${
          isString ? '"' : ''
        }</span>`
        break
    }
    return str
  }

  // 渲染行数
  renderRows() {
    if (!this.showRowNum) return
    // 获取树区域元素的实际高度
    let rect = this.treeWrap.getBoundingClientRect()
    // 获取每一行的高度
    let oneRowHeight = this.getOneRowHeight()
    // 总行数
    let rowNum = rect.height / oneRowHeight
    // 如果新行数比上一次渲染的行数多，那么要创建缺少的行数
    if (rowNum > this.lastRenderRows) {
      let fragment = document.createDocumentFragment()
      for (let i = 0; i < rowNum - this.lastRenderRows; i++) {
        let el = document.createElement('div')
        el.className = 'rowNum'
        el.textContent = this.lastRenderRows + i + 1
        fragment.appendChild(el)
      }
      this.rowWrap.appendChild(fragment)
    } else if (rowNum < this.lastRenderRows) {
      // 如果新行数比上一次渲染的行数少，那么要删除多余的行数
      for (let i = 0; i < this.lastRenderRows - rowNum; i++) {
        let lastChild = this.rowWrap.children[this.rowWrap.children.length - 1]
        this.rowWrap.removeChild(lastChild)
      }
    }
    this.lastRenderRows = rowNum
  }

  // 计算一行元素的大小
  getOneRowHeight() {
    if (this.oneRowHeight !== -1) return this.oneRowHeight
    let el = document.createElement('div')
    el.textContent = 1
    this.treeWrap.appendChild(el)
    let rect = el.getBoundingClientRect()
    this.treeWrap.removeChild(el)
    return (this.oneRowHeight = rect.height)
  }

  // 处理点击事件
  onClick(e) {
    let target = e.target
    // 如果点击的是展开收起按钮
    if (target.classList.contains('expandBtn')) {
      // 当前是否是展开状态
      let isExpand = target.classList.contains('expand')
      // 取出id
      let id = target.getAttribute('data-id')
      // 找到对应的元素
      let el = document.querySelector(`div[data-fid="${id}"]`)
      // 省略号元素
      let ellipsisEl = document.querySelector(`div[data-eid="${id}"]`)
      if (!ellipsisEl) {
        // 如果不存在，则创建一个
        ellipsisEl = document.createElement('div')
        ellipsisEl.className = 'ellipsis'
        ellipsisEl.innerHTML = '···'
        ellipsisEl.setAttribute('data-eid', id)
        ellipsisEl.style.display = 'none'
        el.parentNode.insertBefore(ellipsisEl, el)
      }
      // 根据当前状态切换展开收起按钮的类名、切换整体元素和省略号元素的显示与否
      if (isExpand) {
        target.classList.remove('expand')
        target.classList.add('unExpand')
        el.style.display = 'none'
        ellipsisEl.style.display = 'block'
      } else {
        target.classList.remove('unExpand')
        target.classList.add('expand')
        el.style.display = 'block'
        ellipsisEl.style.display = 'none'
      }
      this.renderRows()
    }
  }

  // 处理鼠标滑入事件
  onMouseover(e) {
    this.clearLastHoverEl()
    let el = getFirstAncestorByClassName(e.target, 'row')
    if (!el) return
    this.lastMouseoverEl = el
    el.classList.add('hover')
  }

  // 处理鼠标滑出事件
  onMouseout() {
    this.clearLastHoverEl()
  }

  // 清除上一次鼠标滑入元素的高亮样式
  clearLastHoverEl() {
    if (this.lastMouseoverEl) {
      this.lastMouseoverEl.classList.remove('hover')
    }
  }
}

export default JsonTreeView
