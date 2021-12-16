<template>
  <template v-for="(firstItems, firstIndex) in items" :key="firstItems">
    <div v-if="firstIndex < items.length - 1" :class="firstClassObject()" :style="firstStyleObject(firstItems)">
      <template v-for="(item, secondIndex) in firstItems" :key="item">
        <div v-if="secondIndex < firstItems.length - 1" :class="secondClassObject(item, firstIndex, secondIndex)">
          <div class="slash"></div>
        </div>
      </template>
    </div>
  </template>
</template>

<script>
export default {
  name: "LineLayer",
  props: {
    items: Array
  },
  computed: {
    firstClassObject() {
      return () => {
        return {
          'first-layer': true,
          'd-grid': true,
          'gap-0': true
        }
      }
    },
    firstStyleObject() {
      return (item) => {
        return {
          'grid-template-columns': 'repeat(' + (item.length - 1) + ', 1fr)'
        }
      }
    },
    /*
    * 计算直线和斜线的class
    * */
    secondClassObject() {
      return (item, firstIndex, secondIndex) => {
        let classObject = {
          'second-layer': true
        }
        let topFlag = true
        let bottomFlag = true
        let leftFlag = true
        let rightFlag = true
        let slashFlag = true
        if(firstIndex % 2 === 0) {
          bottomFlag = false
          if(secondIndex % 2 === 0) {
            rightFlag = false
            if(secondIndex + 1 < this.items[firstIndex].length) {
              for (const item of this.items[firstIndex][secondIndex + 1]) {
                if(topFlag && (item.topItem || item.bottomItem)) {
                  topFlag = false
                }
                if(slashFlag && item.bottomItem) {
                  slashFlag = false
                }
              }
            }
            if(firstIndex + 1 < this.items.length) {
              for (const item of this.items[firstIndex + 1][secondIndex]) {
                if(leftFlag && (item.leftItem || item.rightItem)) {
                  leftFlag = false
                }
                if(slashFlag && item.rightItem) {
                  slashFlag = false
                }
              }
            }
          } else {
            leftFlag = false
            if(secondIndex >= 0) {
              for (const item of this.items[firstIndex][secondIndex]) {
                if(topFlag && (item.topItem || item.bottomItem)) {
                  topFlag = false
                }
                if(slashFlag && item.bottomItem) {
                  slashFlag = false
                }
              }
            }
            if(firstIndex + 1 < this.items.length && secondIndex + 1 < this.items[firstIndex].length) {
              for (const item of this.items[firstIndex + 1][secondIndex + 1]) {
                if(slashFlag && item.leftItem) {
                  slashFlag = false
                }
              }
            }
            if(secondIndex + 2 === this.items[firstIndex].length) {
              for (const item of this.items[firstIndex + 1][secondIndex + 1]) {
                if(rightFlag && item.leftItem) {
                  rightFlag = false
                }
              }
            } else {
              rightFlag = false
            }
          }
        } else {
          topFlag = false
          if(secondIndex % 2 === 0) {
            rightFlag = false
            for (const item of this.items[firstIndex][secondIndex]) {
              if(leftFlag && (item.leftItem || item.rightItem)) {
                leftFlag = false
              }
              if(slashFlag && item.rightItem) {
                slashFlag = false
              }
            }
            if(firstIndex + 1 < this.items.length && secondIndex + 1 < this.items[firstIndex].length) {
              for (const item of this.items[firstIndex + 1][secondIndex + 1]) {
                if(slashFlag && item.topItem) {
                  slashFlag = false
                }
              }
            }
            if(firstIndex + 2 === this.items.length && secondIndex + 1 < this.items[firstIndex].length) {
              for (const item of this.items[firstIndex + 1][secondIndex + 1]) {
                if(bottomFlag && item.topItem) {
                  bottomFlag = false
                }
              }
            } else {
              bottomFlag = false
            }
          } else {
            leftFlag = false
            if(firstIndex + 1 < this.items.length) {
              for (const item of this.items[firstIndex + 1][secondIndex]) {
                if(slashFlag && item.topItem) {
                  slashFlag = false
                }
              }
            }
            if(secondIndex + 1 < this.items[firstIndex].length) {
              for (const item of this.items[firstIndex][secondIndex + 1]) {
                if(slashFlag && item.leftItem) {
                  slashFlag = false
                }
              }
            }
            if(firstIndex + 2 === this.items.length) {
              for (const item of this.items[firstIndex + 1][secondIndex]) {
                if(bottomFlag && item.topItem) {
                  bottomFlag = false
                }
              }
            } else {
              bottomFlag = false
            }
            if(secondIndex + 2 === this.items[firstIndex].length) {
              for (const item of this.items[firstIndex][secondIndex + 1]) {
                if(rightFlag && item.leftItem) {
                  rightFlag = false
                }
              }
            } else {
              rightFlag = false
            }
          }
        }
        classObject['top-none'] = topFlag
        classObject['bottom-none'] = bottomFlag
        classObject['left-none'] = leftFlag
        classObject['right-none'] = rightFlag
        classObject['slash-none'] = slashFlag

        return classObject
      }
    }
  }
}
</script>

<style scoped>
.first-layer {
  position: relative;
}
.first-layer:last-child::after {
  content: '';
  position: absolute;
  width: calc(var(--game-border-width) * 3);
  height: calc(var(--game-border-width) * 3);
  right: 0;
  bottom: 0;
  transform: translate(50%, 50%);
  border-radius: 50%;
  background-color: var(--game-border-color);
  z-index: 1;
}
.second-layer {
  position: relative;
  height: 0;
  padding-bottom: calc(100%);
}
.second-layer .slash{
  width: 100%;
  height: 100%;
  position: absolute;
}
/* 直线 */
.second-layer:nth-child(2n - 1)::before {
  content: '';
  position: absolute;
  height: 100%;
  margin-left: calc(var(--game-border-width) * -0.5);
  border-left: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.second-layer:last-child::before {
  content: '';
  position: absolute;
  right: 0;
  height: 100%;
  margin-right: calc(var(--game-border-width) * -0.5);
  border-right: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.first-layer:nth-child(2n - 1) .second-layer::after {
  content: '';
  position: absolute;
  width: 100%;
  margin-top: calc(var(--game-border-width) * -0.5);
  border-top: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.first-layer:last-child .second-layer::after {
  content: '';
  position: absolute;
  width: 100%;
  bottom: 0;
  margin-bottom: calc(var(--game-border-width) * -0.5);
  border-bottom: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.second-layer.left-none::before,
.second-layer.right-none:last-child::before,
.first-layer:nth-child(2n - 1) .second-layer.top-none::after,
.first-layer:last-child .second-layer.bottom-none::after {
  transition: 0.3s border ease;
  --game-border-color: var(--game-border-color-none);
}
/* 斜线 */
.first-layer:nth-child(2n - 1) .second-layer:nth-child(2n - 1) .slash::before,
.first-layer:nth-child(2n) .second-layer:nth-child(2n) .slash::before {
  content: '';
  position: absolute;
  width: 141.42%;
  height: 141.42%;
  top: calc(var(--game-border-width) * -0.5);
  left: calc(var(--game-border-width) * 0.5);
  transform: translate(-50%, 21%) rotate(45deg);
  border-top: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.first-layer:nth-child(2n - 1) .second-layer:nth-child(2n) .slash::after,
.first-layer:nth-child(2n) .second-layer:nth-child(2n - 1) .slash::after {
  content: '';
  position: absolute;
  width: 141.42%;
  height: 141.42%;
  top: calc(var(--game-border-width) * -0.5);
  right: calc(var(--game-border-width) * 0.5);
  transform: translate(50%, 21%) rotate(-45deg);
  border-top: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.first-layer:nth-child(2n - 1) .second-layer.slash-none:nth-child(2n - 1) .slash::before,
.first-layer:nth-child(2n) .second-layer.slash-none:nth-child(2n) .slash::before,
.first-layer:nth-child(2n - 1) .second-layer.slash-none:nth-child(2n) .slash::after,
.first-layer:nth-child(2n) .second-layer.slash-none:nth-child(2n - 1) .slash::after {
  transition: 0.3s border ease;
  --game-border-color: var(--game-border-color-none);
}
/* 点 */
.first-layer:nth-child(2n - 1) .second-layer:nth-child(2n - 1) .slash::after,
.first-layer:nth-child(2n) .second-layer:nth-child(2n) .slash::after {
  content: '';
  position: absolute;
  width: calc(var(--game-border-width) * 3);
  height: calc(var(--game-border-width) * 3);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: var(--game-border-color);
  z-index: 1;
}
.first-layer:nth-child(2n - 1) .second-layer:last-child .slash::before {
  content: '';
  position: absolute;
  width: calc(var(--game-border-width) * 3);
  height: calc(var(--game-border-width) * 3);
  right: 0;
  transform: translate(50%, -50%);
  border-radius: 50%;
  background-color: var(--game-border-color);
  z-index: 1;
}
.first-layer:last-child .second-layer:nth-child(2n - 1) .slash::before {
  content: '';
  position: absolute;
  width: calc(var(--game-border-width) * 3);
  height: calc(var(--game-border-width) * 3);
  bottom: 0;
  transform: translate(-50%, 50%);
  border-radius: 50%;
  background-color: var(--game-border-color);
  z-index: 1;
}
</style>
