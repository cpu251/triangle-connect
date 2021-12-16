<template>
  <div class="game-point" ref='gamePoint' :style="styleGamePoint()">
    <template v-for="(items, firstIndex) in items" :key="items">
      <template v-for="(items, secondIndex) in items" :key="items">
        <div
            v-for="(item, thirdIndex) in items"
            :key="item"
            :class="classObject(item)"
            :style="styleObject(item, firstIndex, secondIndex)"
            @[triggerEvent].stop.prevent="moveStart(firstIndex, secondIndex, thirdIndex, $event)"
        >
          <div class="kernel"></div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import {inject, watchEffect} from 'vue';
import gsap from 'gsap';

export default {
  name: "Point",
  data() {
    return {
      moveFlag: true,
      settlementFlag: false,
      x: 0,
      y: 0,
      actionItem: null,
      time: 0,
      soundCountDownTime: 0,
      isPC: !('ontouchend' in document),
      triggerEvent: !('ontouchend' in document) ? 'mousedown' : 'touchstart'
    }
  },
  props: {
    items: Array
  },
  setup() {
    const game = inject('game')
    const gameSound = inject('gameSound')

    return {
      game,
      gameSound
    }
  },
  methods: {
    /*
    * 移动开始后，时间的处理
    * */
    moveTime() {
      if(!this.game.clear && this.game.time > 0) {
        const time = new Date().getTime()
        this.game.time -= time - this.time
        this.game.time = this.game.time < 0 ? 0 : this.game.time
        this.game.displayTime = this.game.time
        this.game.timeCost += time - this.time

        this.time = time
        if(this.game.time <= 0) {
          if(this.game.sound) {
            this.gameSound.soundTimeOver.play()
          }
          this.moveEnd(true)
          return
        }

        if(this.game.sound && this.game.time < 5000) {
          if(this.soundCountDownTime > this.game.time) {
            this.soundCountDownTime = Math.floor(this.game.time / 1000) * 1000
            this.gameSound.soundCountDown.play()
          }
        } else {
          this.soundCountDownTime = 5000
        }

        requestAnimationFrame(this.moveTime);
      }
    },
    /*
    * 移动开始的处理
    * */
    moveStart(firstIndex, secondIndex, thirdIndex, e) {
      if(!this.settlementFlag && this.moveFlag && this.game.time > 0 && this.game.items[firstIndex][secondIndex][thirdIndex].type === 'ball') {
        this.moveFlag = false

        if('targetTouches' in e) {
          this.x = e.targetTouches[0].screenX
          this.y = e.targetTouches[0].screenY
        } else {
          this.x = e.screenX
          this.y = e.screenY
        }
        this.actionItem = this.game.items[firstIndex][secondIndex][thirdIndex]
        this.actionItem.zIndex = 3

        this.time = new Date().getTime()
        requestAnimationFrame(this.moveTime);
      }
    },
    /*
    * 移动结束的处理
    * @params flag bool 是否强制处理
    * */
    moveEnd(flag = false) {
      if(flag || (!this.settlementFlag && !this.moveFlag)) {
        this.moveFlag = true
        this.actionItem.zIndex = 2
        this.actionItem.marginTop = 0
        this.actionItem.marginLeft = 0
        gsap.to(this.actionItem, { duration: 0.1, styleMarginLeft: 0 })
        gsap.to(this.actionItem, { duration: 0.1, styleMarginTop: 0 })

        this.settlementFlag = true
        //处理items的数据
        const stop = watchEffect(() => {
          const tempItems = [];
          this.game.items.forEach(function(items, firstIndex) {
            items.forEach(function(item, secondIndex) {
              if(item[0].type === 'ball' && (item[0].firstIndex !== firstIndex || item[0].secondIndex !== secondIndex)){
                tempItems.push({
                  item: item,
                  firstIndex: firstIndex,
                  secondIndex: secondIndex
                })
              }
            })
          })
          for(const item of tempItems) {
            this.game.items[item.item[0].firstIndex].splice(item.item[0].secondIndex, 1, item.item)
          }
          this.game.itemSettlement()
          gsap.to(this.game, { duration: 0.5, displayTime: this.game.time })
          this.settlementFlag = false

          if(this.game.sound && this.game.currentCombo > 0) {
            this.gameSound.soundGetItem.play()
          }
        })
        stop()
      }
    },
    /*
    * 移动时的处理
    * */
    move(e) {
      if(!this.settlementFlag && !this.moveFlag) {
        let x = 0;
        let y = 0;
        if('targetTouches' in e) {
          x = e.targetTouches[0].screenX - this.x
          y = e.targetTouches[0].screenY - this.y
        } else {
          x = e.screenX - this.x
          y = e.screenY - this.y
        }
        let minX = this.$refs.gamePoint.offsetWidth / (this.game.items[0].length - 1)
        let minY = this.$refs.gamePoint.offsetHeight / (this.game.items.length - 1)

        //切换移动路径
        if(Math.abs(x) * Math.abs(x) + Math.abs(y) * Math.abs(y) <= minY * minX * 0.25) {
          if(this.actionItem.firstIndex % 2 === 0) {
            if(Math.abs(Math.abs(x) - Math.abs(y)) < minX * 0.2) {
              y = x * y >= 0 ? x : -x;
            } else if(Math.abs(x) > Math.abs(y)) {
              y = 0
            } else if(Math.abs(x) < Math.abs(y)) {
              x = 0
            }
          } else {
            if(Math.abs(x) > Math.abs(y)) {
              y = x * y > 0 ? x : -x;
            } else if(Math.abs(x) < Math.abs(y)) {
              x = x * y > 0 ? y : -y;
            }
          }
        } else {
          if(this.actionItem.firstIndex % 2 === 0) {
            if(Math.abs(x) < minX * 0.3 || Math.abs(y) < minY * 0.3) {
              if(Math.abs(x) >= Math.abs(y)) {
                y = 0
                if(Math.abs(x) > minX * 2) {
                  x = (x >= 0 ? minX * 2 : - minX * 2)
                }
              } else {
                x = 0
                if(Math.abs(y) > minY * 2) {
                  y = y >= 0 ? minY * 2 : - minY * 2
                }
              }
            } else if(Math.abs(this.actionItem.marginLeft) === Math.abs(this.actionItem.marginTop)) {
              if(Math.abs(x) > Math.abs(y)) {
                x = x * y > 0 ? y : -y;
              } else if(Math.abs(x) < Math.abs(y)) {
                y = x * y > 0 ? x : -x;
              }
            } else {
              if(this.actionItem.marginLeft === 0) {
                x = 0
              } else if(this.actionItem.marginTop === 0) {
                y = 0
              }
            }
          } else {
            if(Math.abs(x) > Math.abs(y)) {
              x = x * y > 0 ? y : -y;
            } else if(Math.abs(x) < Math.abs(y)) {
              y = x * y > 0 ? x : -x;
            }
          }
        }
        //移动超过棋盘的处理
        if(x > this.$refs.gamePoint.offsetWidth - this.actionItem.left * this.$refs.gamePoint.offsetWidth / 100) {
          x = this.$refs.gamePoint.offsetWidth - this.actionItem.left * this.$refs.gamePoint.offsetWidth / 100
        } else if(x < - this.actionItem.left * this.$refs.gamePoint.offsetWidth / 100){
          x = - this.actionItem.left * this.$refs.gamePoint.offsetWidth / 100
        }
        if(y > this.$refs.gamePoint.offsetHeight - this.actionItem.top * this.$refs.gamePoint.offsetHeight / 100) {
          y = this.$refs.gamePoint.offsetHeight - this.actionItem.top * this.$refs.gamePoint.offsetHeight / 100
        } else if(y < - this.actionItem.top * this.$refs.gamePoint.offsetHeight / 100){
          y = - this.actionItem.top * this.$refs.gamePoint.offsetHeight / 100
        }

        this.actionItem.marginLeft = x
        this.actionItem.marginTop = y
        gsap.to(this.actionItem, { duration: 0.1, styleMarginLeft: x })
        gsap.to(this.actionItem, { duration: 0.1, styleMarginTop: y })

        //宝石球交换时，位置的处理
        if(
            (Math.abs(x) > minX * 0.2 && (Math.abs(x % minX) < minX * 0.2 || minX - Math.abs(x % minX) < minX * 0.2))
            || (Math.abs(y) > minY * 0.2 && (Math.abs(y % minY) < minY * 0.2 || minY - Math.abs(y % minY) < minY * 0.2))
        ) {
          const firstIndex = Math.round(((this.actionItem.top * this.$refs.gamePoint.offsetHeight * 0.01 + y) / minY))
          const secondIndex = Math.round(((this.actionItem.left * this.$refs.gamePoint.offsetWidth * 0.01 + x) / minX))
          if(this.game.items[firstIndex][secondIndex][0].type === 'ball') {
            this.x = this.x - (this.actionItem.secondIndex - secondIndex) * minX
            this.y = this.y - (this.actionItem.firstIndex - firstIndex) * minY
            this.actionItem.marginLeft = 0
            this.actionItem.marginTop = 0
            this.actionItem.styleMarginLeft = 0
            this.actionItem.styleMarginTop = 0
            gsap.to(this.actionItem, { duration: 0.1, styleMarginLeft: 0 })
            gsap.to(this.actionItem, { duration: 0.1, styleMarginTop: 0 })

            let changeFirstIndex
            let changeSecondIndex
            each:
                for(const i in this.game.items) {
                  for(const j in this.game.items[i]) {
                    if(this.game.items[i][j][0].type === 'ball' && this.game.items[i][j][0].firstIndex === firstIndex && this.game.items[i][j][0].secondIndex === secondIndex) {
                      changeFirstIndex = i
                      changeSecondIndex = j
                      break each
                    }
                  }
                }
            const changeItem = this.game.items[changeFirstIndex][changeSecondIndex];

            const changeTop = changeItem[0].top
            const changeLeft = changeItem[0].left
            gsap.to(changeItem[0], { duration: 0.3, styleTop: this.actionItem.top })
            gsap.to(changeItem[0], { duration: 0.3, styleLeft: this.actionItem.left })
            changeItem[0].top = this.actionItem.top
            changeItem[0].left = this.actionItem.left
            changeItem[0].firstIndex = this.actionItem.firstIndex
            changeItem[0].secondIndex = this.actionItem.secondIndex
            this.actionItem.top = changeTop
            this.actionItem.left = changeLeft
            gsap.to(this.actionItem, { duration: 0.1, styleTop: changeTop })
            gsap.to(this.actionItem, { duration: 0.1, styleLeft: changeLeft })
            this.actionItem.firstIndex = firstIndex
            this.actionItem.secondIndex = secondIndex

            if(this.game.sound) {
              this.gameSound.soundChange.play()
            }
          }
        }
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      if(this.isPC) {
        document.addEventListener('mouseup', this.moveEnd)
        document.addEventListener('mousemove', this.move)
      } else {
        document.addEventListener('touchend', this.moveEnd)
        document.addEventListener('touchmove', this.move)
      }
    })
  },
  computed: {
    classObject() {
      return (item) => {
        const classObject = {}
        classObject.point = true
        classObject[item.type] = true

        if(item.type === 'ball') {
          classObject['color' + item.color] = true
          classObject['active'] = item.zIndex === 3
        } else if(item.type === 'item') {
          if(item.display !== false) {
            classObject['disappear'] = !(item.leftItem || item.rightItem || item.topItem || item.bottomItem)
            if(classObject['disappear'] && !item.setDisplay) {
              item.setDisplay = true
              setTimeout(() => {
                item.display = false
              }, 1000)
            }
          } else {
            classObject['d-none'] = true
          }
        }

        return classObject
      }
    },
    styleObject() {
      return (item, firstIndex, secondIndex) => {
        let zIndex = 1
        let top = 0
        let left = 0
        let marginTop = 0
        let marginLeft = 0
        if(item.top !== undefined && item.left !== undefined) {
          zIndex = item.zIndex
          top = item.styleTop
          left = item.styleLeft
          marginTop = item.styleMarginTop
          marginLeft = item.styleMarginLeft
        } else {
          let itemWidth = 100 / (this.items[firstIndex].length - 1);
          let itemHeight = 100 / (this.items.length - 1);
          if(item.type === 'item') {
            zIndex = 1
            if(item.topItem || item.bottomItem) {
              left = secondIndex * itemWidth
              if(item.topItem) {
                top = firstIndex * itemHeight - itemHeight * 0.4
              } else {
                top = firstIndex * itemHeight + itemHeight * 0.4
              }
            } else if(item.leftItem || item.rightItem) {
              top = firstIndex * itemHeight
              if(item.leftItem) {
                left = secondIndex * itemWidth - itemWidth * 0.4
              } else {
                left = secondIndex * itemWidth + itemWidth * 0.4
              }
            }
          } else {
            zIndex = 2
            top = firstIndex * itemHeight
            left= secondIndex * itemWidth
          }
          item.zIndex = zIndex
          item.top = top
          item.left = left
          item.styleTop = top
          item.styleLeft = left
          item.marginTop = marginTop
          item.marginLeft = marginLeft
          item.styleMarginTop = marginTop
          item.styleMarginLeft = marginLeft
          item.firstIndex = firstIndex
          item.secondIndex = secondIndex
        }
        return {
          top: top + '%',
          left: left + '%',
          'z-index': zIndex,
          'margin-top': marginTop ? marginTop + 'px' : '',
          'margin-left': marginLeft ? marginLeft + 'px' : ''
        }
      }
    },
    styleGamePoint() {
      return () => {
        return {
          '--game-point-margin-top': ((this.game.items.length - 1) * 100 / (this.game.items[0].length - 1)) + '%'
        }
      }
    }
  }
}
</script>

<style scoped>
.game-point {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.game-point:after {
  content: '';
  display: block;
  margin-top: var(--game-point-margin-top);
}
.point {
  position: absolute;
  width: var(--game-point-size);
  height: var(--game-point-size);
  transform: translate(-50%, -50%);
}
.point.ball {
  border-radius: 50%;
  cursor: pointer;
  /*background: radial-gradient(circle at 50% 120%, #323232, #0a0a0a 80%, #000000 100%);*/
  background-color: #FFFFFF;
  box-shadow: calc(var(--game-point-size) / 20) calc(var(--game-point-size) / 20) calc(var(--game-point-size) / 40) rgba(0, 0, 0, 0.2);
}
.point.ball.active {
  transition: 0.2s transform ease;
  transform: translate(-50%, -50%) scale(1.3, 1.3);
}
.point.ball .kernel {
  position: absolute;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-radius: 50%;
  background-color: #000000;
}
.point.ball.color1 .kernel {
  background-color: #f00d0d;
}
.point.ball.color2 .kernel {
  background-color: #11d74e;
}
.point.ball.color3 .kernel {
  background-color: #ffbe08;
}
.point.ball.color4 .kernel {
  background-color: #5743ff;
}
.point.ball.color5 .kernel {
  background-color: #d21eff;
}
.point.ball.color6 .kernel {
  background-color: #0ee5db;
}
.point.ball.color7 .kernel {
  background-color: #c9c9c9;
}
.point.ball .kernel:before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  left: 7%;
  top: 1%;
  border-right: calc(var(--game-point-size) / 2.9) solid transparent;
  border-left: calc(var(--game-point-size) / 2.9) solid transparent;
  border-bottom: calc(var(--game-point-size) / 1.65) solid rgba(255, 255, 255, 0.3);
}
.point.ball .kernel:after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  left: 7%;
  top: 24%;
  border-right: calc(var(--game-point-size) / 2.9) solid transparent;
  border-left: calc(var(--game-point-size) / 2.9) solid transparent;
  border-top: calc(var(--game-point-size) / 1.65) solid rgba(255, 255, 255, 0.3);
}
.point.item {
  width: calc(var(--game-point-size) / 2);
  height: calc(var(--game-point-size) / 2);
  background-color: #0999ff;
  transform: translate(-50%, -50%) rotate(45deg);
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2));
}
.point.item .kernel {
  content: '';
  position: absolute;
  width: calc(var(--game-point-size) / 2);
  height: calc(var(--game-point-size) / 2);
  border: calc(var(--game-point-size) * 0.12) solid;
  border-color: rgba(0, 0, 0, 0.2) rgba(255, 255, 255, 0.15) rgba(0, 0, 0, 0.25) rgba(255, 255, 255, 0.4);
  background-image: linear-gradient(to top, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.15));
}
@keyframes item-disappear {
  0%   {
    opacity: 1;
  }
  10%  {
    background-color: #84CCFF;
    transform: translate(-50%, -50%) scale(2, 2) rotate(45deg);
  }
  50%  {
    opacity: 1;
    background-color: #0999ff;
    transform: translate(-50%, -50%) rotate(45deg);
  }
  70%  {
    transform: translate(-50%, -300%) rotate(189deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 500%) rotate(405deg);
  }
}
.point.item.disappear {
  opacity: 0;
  animation: item-disappear 1s;
}
@keyframes item-disappear-kernel {
  0%   {
    opacity: 1;
  }
  10% {
    opacity: 0.3;
  }
  50%  {
    opacity: 1;
  }
}
.point.item.disappear .kernel {
  animation: item-disappear-kernel 1s;
}
</style>