<template>
  <template v-for="(items, firstIndex) in items" :key="items">
    <div v-if="firstIndex < items.length - 1" :class="firstClassObject()" :style="firstStyleObject(items)">
      <template v-for="(item, secondIndex) in items" :key="item">
        <div v-if="secondIndex < items.length - 1" :class="secondClassObject(item)" :style="secondStyleObject()">
          <div class="slash"></div>
        </div>
      </template>
    </div>
  </template>
</template>

<script>
export default {
  name: "FirstLayer",
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
    secondClassObject() {
      return (item) => {
        return {
          'second-layer': true,
          [item[0].type]: true
        }
      }
    },
    secondStyleObject() {
      return () => {
        return {

        }
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
/* 斜线 */
.first-layer:nth-child(2n - 1) .second-layer:nth-child(2n - 1) .slash::before, .first-layer:nth-child(2n) .second-layer:nth-child(2n) .slash::before {
  content: '';
  position: absolute;
  width: 141.42%;
  height: 141.42%;
  top: calc(var(--game-border-width) * -0.5);
  left: calc(var(--game-border-width) * 0.5);
  transform: translate(-50%, 21%) rotate(45deg);
  border-top: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
.first-layer:nth-child(2n - 1) .second-layer:nth-child(2n) .slash::after, .first-layer:nth-child(2n) .second-layer:nth-child(2n - 1) .slash::after {
  content: '';
  position: absolute;
  width: 141.42%;
  height: 141.42%;
  top: calc(var(--game-border-width) * -0.5);
  right: calc(var(--game-border-width) * 0.5);
  transform: translate(50%, 21%) rotate(-45deg);
  border-top: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
/* 点 */
.first-layer:nth-child(2n - 1) .second-layer:nth-child(2n - 1) .slash::after, .first-layer:nth-child(2n) .second-layer:nth-child(2n) .slash::after {
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
