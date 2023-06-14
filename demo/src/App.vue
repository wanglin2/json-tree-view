<template>
  <div class="jsonTreeViewContainer">
    <div class="jsonTreeViewInputBox">
      <textarea class="jsonTreeViewInput" v-model="jsonStr"></textarea>
    </div>
    <div class="jsonTreeViewOutputBox">
      <div class="jsonTreeViewOutputToolbar">
        <button @click="toggleShowRowNum">
          {{ showRowNum ? '隐藏行号' : '显示行号' }}
        </button>
        <button @click="toggleShowLine">
          {{ showLine ? '隐藏竖线' : '显示竖线' }}
        </button>
        <button @click="expandAll">展开所有</button>
        <button @click="unExpandAll">收起所有</button>
        <button @click="toggleShowExpandBtn">
          {{ showExpandBtn ? '隐藏显示展开收起按钮' : '显示显示展开收起按钮' }}
        </button>
        <button @click="toggleExpandBtnPosition">
          {{
            expandBtnPosition === 'default'
              ? '展开收起按钮显示在左侧'
              : '展开收起按钮显示在括号旁边'
          }}
        </button>
        <button @click="toggleShowHover">
          {{ showHover ? '关闭鼠标滑过效果' : '开启鼠标滑过效果' }}
        </button>
      </div>
      <div class="jsonTreeViewOutput" ref="output"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import JsonTreeView from 'simple-json-tree-view'
import 'simple-json-tree-view/themes/default.css'
// import 'simple-json-tree-view/themes/oneDarkPro.css'
import testData from './test.js'

const jsonStr = ref(testData)
const output = ref(null)
let jsonTreeView = null
let timer = null
const showRowNum = ref(false)
const showLine = ref(true)
const showExpandBtn = ref(true)
const expandBtnPosition = ref('default')
const showHover = ref(true)

watch(
  () => {
    return jsonStr.value
  },
  () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      jsonTreeView.stringify(jsonStr.value)
    }, 300)
  }
)

const init = () => {
  if (jsonTreeView) {
    jsonTreeView.destroy()
  }
  jsonTreeView = new JsonTreeView({
    el: output.value,
    expandBtnPosition: expandBtnPosition.value,
    showLine: showLine.value,
    showExpandBtn: showExpandBtn.value,
    showHover: showHover.value,
    showRowNum: showRowNum.value
  })
  jsonTreeView.stringify(jsonStr.value)
}

const toggleShowRowNum = () => {
  showRowNum.value = !showRowNum.value
  init()
}

const toggleShowLine = () => {
  showLine.value = !showLine.value
  init()
}

const expandAll = () => {
  jsonTreeView.expandAll()
}

const unExpandAll = () => {
  jsonTreeView.unExpandAll()
}

const toggleShowExpandBtn = () => {
  showExpandBtn.value = !showExpandBtn.value
  init()
}

const toggleExpandBtnPosition = () => {
  expandBtnPosition.value =
    expandBtnPosition.value === 'default' ? 'left' : 'default'
  init()
}

const toggleShowHover = () => {
  showHover.value = !showHover.value
  init()
}

onMounted(() => {
  init()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<style scoped>
.jsonTreeViewContainer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}

.jsonTreeViewInputBox,
.jsonTreeViewOutputBox {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.jsonTreeViewInputBox {
  border-right: 1px solid #d0d7de;
}

.jsonTreeViewInput {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 10px;
}

.jsonTreeViewOutputBox {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.jsonTreeViewOutputToolbar {
  height: 30px;
  flex-shrink: 0;
  border-bottom: 1px solid #d0d7de;
  display: flex;
  align-items: center;
}

.jsonTreeViewOutputToolbar button {
  margin-right: 10px;
}

.jsonTreeViewOutput {
  overflow: auto;
}
</style>
