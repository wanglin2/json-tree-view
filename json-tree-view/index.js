import {
  type,
  isNoEmptyObjectOrArray,
  getFirstAncestorByClassName
} from './utils'
import {
  WRAP_CLASS_NAME,
  EXPAND_BTN_POSITION,
  CLASS_NAMES,
  ATTRIBUTES,
  UID_PREFIX
} from './constants'

class JsonTreeView {
  constructor({
    el,
    expandBtnPosition = EXPAND_BTN_POSITION.DEFAULT,
    showLine = false,
    showExpandBtn = true,
    showHover = true,
    showRowNum = false,
    errorSliceNum = 20
  }) {
    this.el = type(el) === 'string' ? document.querySelector(el) : el
    if (!el) throw new Error('请提供容器元素')
    this.expandBtnPosition = expandBtnPosition // 展开收起按钮的位置：default（紧贴括号）、left（统一在左侧）
    this.showLine = showLine // 是否显示竖线
    this.showExpandBtn = showExpandBtn // 是否显示展开收起按钮
    this.showHover = showHover // 是否显示鼠标滑入的高亮效果
    this.showRowNum = showRowNum // 是否显示行数
    this.errorSliceNum = errorSliceNum // 出错位置前后截取的字符串长度
    this.wrap = null // 总的容器元素
    this.rowWrap = null // 渲染行的容器
    this.treeWrap = null // 渲染json树的容器
    this.errorWrap = null // 错误信息容器
    this.uniqueId = 0 // 唯一的id
    this.lastMouseoverEl = null // 上一次鼠标滑入的元素
    this.oneRowHeight = -1 // 一行元素的高度
    this.lastRenderRows = 0 // 上一次渲染的行数
    this.hasError = false // 是否出现了错误
    this.init()
    this.bindEvent()
  }

  // 初始化
  init() {
    // 最外层容器
    this.wrap = document.createElement('div')
    this.wrap.className = WRAP_CLASS_NAME
    // 行号容器
    if (this.showRowNum) {
      this.rowWrap = document.createElement('div')
      this.rowWrap.className = CLASS_NAMES.ROW_WRAP
      this.wrap.appendChild(this.rowWrap)
    }
    // 树容器
    this.treeWrap = document.createElement('div')
    this.treeWrap.className = `${CLASS_NAMES.TREE_WRAP}  ${
      this.expandBtnPosition === EXPAND_BTN_POSITION.LEFT
        ? CLASS_NAMES.ADD_PADDING
        : ''
    }`
    this.wrap.appendChild(this.treeWrap)
    // 错误信息容器
    this.errorWrap = document.createElement('div')
    this.errorWrap.className = CLASS_NAMES.ERROR_WRAP
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
    try {
      if (typeof data === 'string') {
        if (data.trim()) {
          data = JSON.parse(data)
        } else {
          // 空字符串
          this.treeWrap.innerHTML = ''
          return
        }
      }
      // 如果上一次解析出错了，那么需要删除错误信息
      if (this.hasError) {
        this.hasError = false
        this.treeWrap.removeChild(this.errorWrap)
      }
      this.treeWrap.innerHTML = `<div class="${
        CLASS_NAMES.ROW
      }">${this.stringifyToHtml(data)}</div>`
      this.renderRows()
    } catch (error) {
      // 解析出错，显示错误信息
      let str = ``
      let msg = error.message
      str += `<div class="${CLASS_NAMES.ERROR_MSG}">${msg}</div>`
      // 获取出错位置，截取出前后一段
      let res = msg.match(/position\s+(\d+)/)
      if (res && res[1]) {
        let position = Number(res[1])
        str += `<div class="${CLASS_NAMES.ERROR_STR}">${data.slice(
          position - this.errorSliceNum,
          position
        )}<span class="${CLASS_NAMES.ERROR_POSITION}">${
          data[position]
        }</span>${data.slice(
          position + 1,
          position + this.errorSliceNum
        )}</div>`
      }
      this.hasError = true
      this.treeWrap.innerHTML = ''
      this.errorWrap.innerHTML = str
      this.treeWrap.appendChild(this.errorWrap)
    }
  }

  // 将json转换成html字符串
  stringifyToHtml(data, isAsKeyValue = false, isLast = true) {
    const dataType = type(data)
    let str = ''
    let isEmpty = false
    let id = UID_PREFIX + this.uniqueId++
    const expandBtnStr = this.showExpandBtn
      ? `<span class="${CLASS_NAMES.EXPAND_BTN} ${CLASS_NAMES.EXPAND} ${
          this.expandBtnPosition === EXPAND_BTN_POSITION.LEFT
            ? CLASS_NAMES.IN_LEFT
            : ''
        }" ${ATTRIBUTES.DATA_ID}="${id}"></span>`
      : '' // 展开收起按钮
    switch (dataType) {
      case 'object': // 对象
        const keys = Object.keys(data)
        isEmpty = keys.length <= 0
        // 开始的括号
        str +=
          isEmpty || isAsKeyValue
            ? `<span class="${CLASS_NAMES.BRACE}">${
                isEmpty ? '' : expandBtnStr
              }{</span>`
            : `<div class="${CLASS_NAMES.BRACE}">${expandBtnStr}{</div>`
        if (!isEmpty) {
          // 中间整体
          str += `<div class="${CLASS_NAMES.OBJECT} ${
            this.showLine ? CLASS_NAMES.SHOW_LINE : ''
          }" ${ATTRIBUTES.DATA_FID}="${id}">`
          // 中间的每一行
          keys.forEach((key, index) => {
            str += `<div class="${CLASS_NAMES.ROW}">`
            str += `<span class="${CLASS_NAMES.KEY}">"${key}"</span><span class="${CLASS_NAMES.COLON}">:</span>`
            str += this.stringifyToHtml(
              data[key],
              true,
              index >= keys.length - 1
            )
            // 避免非空对象或数组后面逗号重复
            if (index < keys.length - 1 && !isNoEmptyObjectOrArray(data[key])) {
              str += `<span class="${CLASS_NAMES.COMMA}">,</span>`
            }
            str += '</div>'
          })
          str += '</div>'
        }
        // 结束的括号
        str += isEmpty
          ? `<span class="${CLASS_NAMES.BRACE}">}</span>`
          : `<div class="${CLASS_NAMES.BRACE}">}${
              isLast ? '' : `<span class="${CLASS_NAMES.COMMA}">,</span>`
            }</div>`
        break
      case 'array': // 数组
        isEmpty = data.length <= 0
        // 开始的括号
        str +=
          isEmpty || isAsKeyValue
            ? `<span class="${CLASS_NAMES.BRACKET}">${
                isEmpty ? '' : expandBtnStr
              }[</span>`
            : `<div class="${CLASS_NAMES.BRACKET}">${expandBtnStr}[</div>`
        if (!isEmpty) {
          // 中间整体
          str += `<div class="${CLASS_NAMES.ARRAY} ${
            this.showLine ? CLASS_NAMES.SHOW_LINE : ''
          }" ${ATTRIBUTES.DATA_FID}="${id}">`
          // 中间的每一行
          data.forEach((item, index) => {
            str += `<div class="${CLASS_NAMES.ROW}">`
            str += this.stringifyToHtml(item, false, index >= data.length - 1)
            // 避免非空对象或数组后面逗号重复
            if (index < data.length - 1 && !isNoEmptyObjectOrArray(item)) {
              str += `<span class="${CLASS_NAMES.COMMA}">,</span>`
            }
            str += '</div>'
          })
          str += '</div>'
        }
        // 结束的括号
        str += isEmpty
          ? `<span class="${CLASS_NAMES.BRACKET}">]</span>`
          : `<div class="${CLASS_NAMES.BRACKET}">]${
              isLast ? '' : `<span class="${CLASS_NAMES.COMMA}">,</span>`
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
        el.className = CLASS_NAMES.ROW_NUM
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
    if (target.classList.contains(CLASS_NAMES.EXPAND_BTN)) {
      // 当前是否是展开状态
      let isExpand = target.classList.contains(CLASS_NAMES.EXPAND)
      // 取出id
      let id = target.getAttribute(ATTRIBUTES.DATA_ID)
      // 找到对应的元素
      let el = document.querySelector(`div[${ATTRIBUTES.DATA_FID}="${id}"]`)
      // 省略号元素
      let ellipsisEl = document.querySelector(
        `div[${ATTRIBUTES.DATA_EID}="${id}"]`
      )
      if (!ellipsisEl) {
        // 如果不存在，则创建一个
        ellipsisEl = document.createElement('div')
        ellipsisEl.className = CLASS_NAMES.ELLIPSIS
        ellipsisEl.innerHTML = '···'
        ellipsisEl.setAttribute(ATTRIBUTES.DATA_EID, id)
        ellipsisEl.style.display = 'none'
        el.parentNode.insertBefore(ellipsisEl, el)
      }
      // 根据当前状态切换展开收起按钮的类名、切换整体元素和省略号元素的显示与否
      if (isExpand) {
        target.classList.remove(CLASS_NAMES.EXPAND)
        target.classList.add(CLASS_NAMES.UN_EXPAND)
        el.style.display = 'none'
        ellipsisEl.style.display = 'block'
      } else {
        target.classList.remove(CLASS_NAMES.UN_EXPAND)
        target.classList.add(CLASS_NAMES.EXPAND)
        el.style.display = 'block'
        ellipsisEl.style.display = 'none'
      }
      this.renderRows()
    }
  }

  // 处理鼠标滑入事件
  onMouseover(e) {
    this.clearLastHoverEl()
    let el = getFirstAncestorByClassName(e.target, CLASS_NAMES.ROW)
    if (!el) return
    this.lastMouseoverEl = el
    el.classList.add(CLASS_NAMES.HOVER)
  }

  // 处理鼠标滑出事件
  onMouseout() {
    this.clearLastHoverEl()
  }

  // 清除上一次鼠标滑入元素的高亮样式
  clearLastHoverEl() {
    if (this.lastMouseoverEl) {
      this.lastMouseoverEl.classList.remove(CLASS_NAMES.HOVER)
    }
  }

  // 收起所有
  unExpandAll() {
    this.handleToggleExpandAll(CLASS_NAMES.EXPAND)
  }

  // 展开所有
  expandAll() {
    this.handleToggleExpandAll(CLASS_NAMES.UN_EXPAND)
  }

  // 处理展开所有和收起所有
  handleToggleExpandAll(type) {
    let walk = el => {
      if (
        el.classList.contains(CLASS_NAMES.EXPAND_BTN) &&
        el.classList.contains(type)
      ) {
        this.onClick({
          target: el
        })
      }
      let children = Array.from(el.children)
      children.forEach(item => {
        walk(item)
      })
    }
    walk(this.treeWrap)
  }
}

export default JsonTreeView
