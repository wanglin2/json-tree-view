<template>
  <div class="jsonTreeViewContainer">
    <div class="jsonTreeViewInputBox">
      <textarea class="jsonTreeViewInput" v-model="jsonStr"></textarea>
    </div>
    <div class="jsonTreeViewOutputBox" ref="output"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import JsonTreeView from 'simple-json-tree-view'
import 'simple-json-tree-view/themes/default.css'
// import 'simple-json-tree-view/themes/oneDarkPro.css'
import testData from './test.json'

const jsonStr = ref(JSON.stringify(testData))
const output = ref(null)
let jsonTreeView = null
let timer = null

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

onMounted(() => {
  jsonTreeView = new JsonTreeView({
    el: output.value,
    expandBtnPosition: 'default', // left
    showLine: true,
    showExpandBtn: true,
    showHover: true,
    showRowNum: false
  })
  jsonTreeView.stringify(jsonStr.value)
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
  padding: 10px;
  overflow: auto;
}
</style>
