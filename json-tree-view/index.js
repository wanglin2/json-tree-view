const type = obj => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

const isNoEmptyObjectOrArray = data => {
  const dataType = type(data)
  switch (dataType) {
    case 'object':
      return Object.keys(data).length > 0
    case 'array':
      return data.length > 0
    default:
      return false
  }
}

// 获取指定类名的第一个祖先节点
const getFirstAncestorByClassName = (el, className) => {
  // 向上找到容器元素就停止
  while (!el.classList.contains('simpleJsonTreeViewContainer_abc123')) {
    if (el.classList.contains(className)) {
      return el
    }
    el = el.parentNode
  }
  return null
}

class JsonTreeView {
  constructor({
    el,
    expandBtnPosition = 'default',
    showLine = false,
    showExpandBtn = true,
    showHover = true
  }) {
    this.el = type(el) === 'string' ? document.querySelector(el) : el
    this.expandBtnPosition = expandBtnPosition // 展开收起按钮的位置：default（紧贴括号）、left（统一在左侧）
    this.showLine = showLine // 是否显示竖线
    this.showExpandBtn = showExpandBtn // 是否显示展开收起按钮
    this.showHover = showHover // 是否显示鼠标滑入的高亮效果
    this.wrap = null
    this.uniqueId = 0
    this.lastMouseoverEl = null
    this.init()
  }

  init() {
    this.wrap = document.createElement('div')
    this.wrap.className = `simpleJsonTreeViewContainer_abc123 ${
      this.expandBtnPosition === 'left' ? 'addPadding' : ''
    }`
    this.el.appendChild(this.wrap)
    this.onClick = this.onClick.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
    this.onMouseout = this.onMouseout.bind(this)
    this.wrap.addEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.addEventListener('mouseover', this.onMouseover)
      this.wrap.addEventListener('mouseout', this.onMouseout)
    }
  }

  destroy() {
    this.wrap.removeEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.removeEventListener('mouseover', this.onMouseover)
      this.wrap.removeEventListener('mouseout', this.onMouseout)
    }
    this.el.removeChild(this.wrap)
  }

  stringify(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    this.wrap.innerHTML = `<div class="row">${this.stringifyToHtml(data)}</div>`
  }

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
    }
  }

  onMouseover(e) {
    this.clearLastHoverEl()
    let el = getFirstAncestorByClassName(e.target, 'row')
    this.lastMouseoverEl = el
    el.classList.add('hover')
  }

  onMouseout() {
    this.clearLastHoverEl()
  }

  clearLastHoverEl() {
    if (this.lastMouseoverEl) {
      this.lastMouseoverEl.classList.remove('hover')
    }
  }
}

export default JsonTreeView
