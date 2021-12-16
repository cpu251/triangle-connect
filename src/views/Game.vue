<template>
  <div class="game-tips container position-relative mb-1">
    <div class="game-time d-flex align-items-center">
      <div class="game-time-remaining" :style="timeStyleObject()"></div>
      <div class="position-relative ms-2" style="z-index: 1">{{ timeRemaining() }}</div>
    </div>
    <div class="game-score-container d-flex align-items-center justify-content-end">
      <div class="game-combo"><span class="small">最大Combo</span> <span style="color: #f52020;font-size: 1.2em;">{{ animatedCombo }}</span></div>
      <div class="game-score"><span class="small">得分</span> {{ animatedScore }}</div>
    </div>
    <div class="position-relative">
      <div class="game-combo-settlement d-flex align-items-center justify-content-center">
        <div class="game-current-combo" :class="comboClass">Combo x{{ game.currentCombo }}</div>
        <div class="game-add-time" :class="itemAddTimeClass">+{{ game.currentCombo * game.itemAddTime / 1000 }}s</div>
      </div>
      <div class="game-over mt-3" :class="gameOverClass">时间到</div>
      <div class="game-sounds d-flex align-items-center justify-content-center" @click="game.sound = !game.sound">
        <div v-if="game.sound">
          <i class="bi bi-volume-up"></i>
          <audio class="d-none" :src="assetSoundChange" ref='soundChange'></audio>
          <audio class="d-none" :src="assetSoundGetItem" ref='soundGetItem'></audio>
          <audio class="d-none" :src="assetSoundCountDown" ref='soundCountDown'></audio>
          <audio class="d-none" :src="assetSoundTimeOver" ref='soundTimeOver'></audio>
        </div>
        <div v-else>
          <i class="bi bi-volume-mute"></i>
        </div>
      </div>
    </div>
  </div>
  <div class="game-container d-flex flex-fill w-100" style="height: 0;">
    <div :class="classObject()" ref='container'>
      <div class="game-row" :style="rowStyleObject" ref='gameRow'>
        <div class="game-line">
          <LineLayer :items="game.items"/>
        </div>
        <Point :items="game.items"/>
      </div>
    </div>
  </div>
</template>

<script>
import {inject, provide, ref} from 'vue'
import _ from 'lodash';
import LineLayer from '@/components/game/LineLayer.vue'
import Point from '@/components/game/Point.vue'
import gsap from 'gsap';

import assetSoundChange from '@/assets/sounds/change.wav'
import assetSoundGetItem from '@/assets/sounds/get-item.mp3'
import assetSoundCountDown from '@/assets/sounds/count-down.wav'
import assetSoundTimeOver from '@/assets/sounds/time-over.mp3'

export default {
  name: "Game",
  components: {
    LineLayer,
    Point
  },
  data() {
    return {
      rowStyleObject: {
        width: '',
        '--game-point-size': '8vw',
        '--game-border-width': '3px'
      },
      comboClass: {
        animated: false
      },
      itemAddTimeClass: {
        animated: false
      },
      gameOverClass: {
        animated: false
      },
      gameClear: false,
      gameReload: false,
      gameBack: false,
      option: null,
      assetSoundChange: assetSoundChange,
      assetSoundGetItem: assetSoundGetItem,
      assetSoundCountDown: assetSoundCountDown,
      assetSoundTimeOver: assetSoundTimeOver
    }
  },
  methods: {
    /*
    * 游戏尺寸、分辨率改变时的处理
    * */
    gameResize() {
      if(this.$refs.container) {
        const width = this.$refs.container.offsetHeight * (this.game.items[0].length - 1) / (this.game.items.length - 1);
        this.rowStyleObject['max-width'] = width + 'px'
        let pointSize
        if(this.game.items[0].length < 5) {
          pointSize = width / ((this.game.items[0].length - 1) * 3)
        } else if(this.game.items[0].length < 7) {
          pointSize = width / ((this.game.items[0].length - 1) * 2)
        } else {
          pointSize = width / ((this.game.items[0].length - 1) * 1.7)
        }
        if(pointSize > 90) {
          pointSize = 90
        }
        this.rowStyleObject['--game-point-size'] = pointSize + 'px'
        setTimeout(() => {
          let pointSize
          if(this.game.items[0].length < 5) {
            pointSize = this.$refs.gameRow.offsetWidth / ((this.game.items[0].length - 1) * 3)
          } else if(this.game.items[0].length < 7) {
            pointSize = this.$refs.gameRow.offsetWidth / ((this.game.items[0].length - 1) * 2)
          } else {
            pointSize = this.$refs.gameRow.offsetWidth / ((this.game.items[0].length - 1) * 1.7)
          }
          if(pointSize > 90) {
            pointSize = 90
          }
          this.rowStyleObject['--game-point-size'] = pointSize + 'px'
          if(this.$refs.gameRow.offsetWidth > 600) {
            this.rowStyleObject['--game-border-width'] = '5px'
          } else if(this.$refs.gameRow.offsetWidth > 400) {
            this.rowStyleObject['--game-border-width'] = '4px'
          } else {
            this.rowStyleObject['--game-border-width'] = '3px'
          }
        }, 1)
      } else {
        setTimeout(this.gameResize, 50)
      }
    }
  },
  created() {
    this.$watch('game.score', (newVal) => {
      gsap.to(this.game, { duration: 0.5, displayScore: newVal })
    })
    this.$watch('game.maxCombo', (newVal) => {
      gsap.to(this.game, { duration: 0.5, displayMaxCombo: newVal })
    })
    this.$watch('game.currentCombo', () => {
      if(this.game.currentCombo > 1) {
        this.comboClass.animated = true
        this.itemAddTimeClass.animated = true
        setTimeout(() => {
          this.comboClass.animated = false
          this.itemAddTimeClass.animated = false
        }, 1000)
      } else if(this.game.currentCombo > 0) {
        this.itemAddTimeClass.animated = true
        setTimeout(() => {
          this.itemAddTimeClass.animated = false
        }, 1000)
      }
    })
    //完成一局后的处理
    this.$watch('game.clear', () => {
      if(this.game.clear) {
        if(this.option === null) {
          this.option = this.gameOptions.options[this.gameOptions.index]
        }
        if(this.gameOptions.index < this.gameOptions.options.length - 1) {
          this.option = this.gameOptions.options[++this.gameOptions.index]
        } else {
          if(this.option.firstNumber > this.option.secondNumber) {
            this.option.secondNumber = this.option.firstNumber
          } else {
            this.option.firstNumber += 2
          }
        }
        this.gameClear = true
        setTimeout(() => {
          this.game.init(this.option)
          gsap.to(this.game, { duration: 0.5, displayTime: this.game.time })
          gsap.to(this.game, { duration: 0.5, displayMaxTime: this.game.maxTime })
          setTimeout(this.gameResize, 50)
          setTimeout(() => {
            this.gameClear = false
          }, 500)
        }, 500)
      }
    })
    //游戏结束时的处理
    this.$watch('game.gameOver', () => {
      if(this.game.gameOver) {
        setTimeout(() => {
          this.gameOverFilter = true
          this.gameModal.show()
        }, 1000)
        this.gameOverClass.animated = true
        setTimeout(() => {
          this.gameOverClass.animated = false
        }, 2000)
      }
    })
    //重新开始游戏
    this.$watch('game.reload', () => {
      if(this.game.reload) {
        this.gameModal.hide()
        this.gameOptions.index = 0
        this.gameOverFilter = false

        this.gameReload = true
        setTimeout(() => {
          this.game.init(this.gameOptions.options[this.gameOptions.index])
          setTimeout(this.gameResize, 50)
          setTimeout(() => {
            this.gameReload = false
          }, 300)
        }, 200)
      }
    })
  },
  mounted() {
    this.gameSound = {
      soundChange: this.$refs.soundChange,
      soundGetItem: this.$refs.soundGetItem,
      soundCountDown: this.$refs.soundCountDown,
      soundTimeOver: this.$refs.soundTimeOver
    }
    this.$nextTick(function () {
      this.gameResize()
      window.addEventListener('resize', _.debounce(this.gameResize, 500))
    })
  },
  setup() {
    const game = inject('game')
    const gameOptions = inject('gameOptions')
    const gameModal = inject('gameModal')
    const gameOverFilter = inject('gameOverFilter')

    const gameSound = ref(null)

    provide('gameSound', gameSound)

    return {
      game,
      gameOptions,
      gameModal,
      gameOverFilter,
      gameSound
    }
  },
  computed: {
    animatedScore() {
      return this.game.displayScore.toFixed(0)
    },
    animatedCombo() {
      return this.game.displayMaxCombo.toFixed(0)
    },
    classObject() {
      return () => {
        return {
          'd-flex': true,
          'justify-content-center': true,
          'w-100': true,
          'game-clear': this.gameClear,
          'game-reload': this.gameReload,
          'game-back': this.gameBack
        }
      }
    },
    timeStyleObject() {
      return () => {
        let style = {}
        style.width = (this.game.displayTime * 100 / this.game.displayMaxTime) + '%'
        return style
      }
    },
    timeRemaining() {
      return () => {
        const second = Math.round(this.game.displayTime / 1000) % 60
        const minute = Math.round((this.game.displayTime - second * 1000) / 60000) % 60
        return (minute < 10 ? '0' : '') + minute + ' : ' + (second < 10 ? '0' : '') + second
      }
    }
  }
}
</script>

<style>
:root{
  --game-border-color: #c793e7;
  --game-border-style: solid;
  --game-border-width: 3px;
  --game-border-color-none: #935bff;
  --game-background-color: rgba(255, 255, 255, 0.16);
  --game-point-size: 8vw;
  --game-point-margin-top: 100%;
  --game-font-size: 1rem;
  --shadow-color: #ffffff;
}
@media (min-width: 576px) {
  :root{
    --game-font-size: 1.2rem;
  }
}
@media (min-width: 768px) {
  :root{
    --game-font-size: 1.5rem;
  }
}
</style>

<style scoped>
.game-tips {
  touch-action: none;
  user-select:none;
}
.game-container {
  padding: 2rem 3rem 3rem 3rem;
  touch-action: none;
  user-select:none;
}
@media (min-width: 576px) {
  .game-container {
    padding: 3rem;
  }
}
@keyframes game-clear {
  0%   {
    opacity: 1;
  }
  50%  {
    opacity: 0;
  }
  90%  {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.game-clear {
  animation: game-clear 1s;
}
@keyframes game-reload {
  0%   {
    opacity: 1;
  }
  40%  {
    opacity: 0;
  }
  60%  {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.game-reload {
  animation: game-reload 0.5s;
}
.game-row {
  min-width: 200px;
  position: relative;
  width: 100%;
}
.game-row:after {
  content: '';
  display: block;
  margin-top: 100%;
}
.game-line {
  background-color: var(--game-background-color);
}
.game-time {
  position: relative;
  color: #ff5e00;
  height: calc(var(--game-font-size) * 2);
  font-size: var(--game-font-size);
  font-weight: 600;
  border: #ffffff var(--game-border-style) var(--game-border-width);
  background-color: rgba(255, 255, 255, 0.3);
  --shadow-color: rgba(255, 255 ,255, 0.44);
  text-shadow: 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color);
}
.game-time-remaining {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #ffbe08;
}
.game-score-container {
  position: relative;
  z-index: 1;
  font-size: var(--game-font-size);
  text-align: right;
  margin-right: calc(var(--game-font-size) * 0.5);
  margin-top: calc(var(--game-font-size) * -1);
  color: #342738;
  font-weight: 600;
  text-shadow: 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color);
}
.game-score {
  width: calc(var(--game-font-size) * 8);
}
.game-combo-settlement {
  --shadow-color: #ffffff;
  color: #ffcb0e;
  line-height: 1;
  height: calc(var(--game-font-size) * 1);
  margin-top: calc(var(--game-font-size) * 1);
  font-size: calc(var(--game-font-size) * 1.5);
  font-weight: 600;
  text-align: center;
  text-shadow: 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color);
}
@keyframes game-current-combo {
  0%   {
    opacity: 0;
  }
  50%  {
    transform: scale(2, 2);
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.game-combo-settlement .game-current-combo, .game-combo-settlement .game-add-time {
  opacity: 0;
  position: absolute;
  width: 100%;
}
.game-combo-settlement .game-add-time {
  color: #0ec7ff;
  margin-left: calc(var(--game-font-size) * 17);
  z-index: 1;
}
.game-current-combo.animated {
  animation: game-current-combo 1s;
}
@keyframes game-add-time {
  0%   {
    opacity: 0;
  }
  50%  {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(0, -150%);
  }
}
.game-add-time.animated {
  animation: game-add-time 1s;
}
.game-over {
  opacity: 0;
  position: absolute;
  top: 100%;
  width: 100%;
  --shadow-color: #ffffff;
  color: #ffcb0e;
  font-size: calc(var(--game-font-size) * 1.5);
  line-height: 1;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color), 0 0 2px var(--shadow-color);
}
@keyframes game-over {
  0%   {
    opacity: 0;
  }
  40%  {
    transform: scale(2, 2);
    opacity: 1;
  }
  100% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
}
.game-over.animated {
  animation: game-over 2s;
  z-index: 4;
}
.game-sounds {
  position: absolute;
  top: calc(var(--game-font-size) * -1);
  font-size: calc(var(--game-font-size) * 1.5);
  width: calc(var(--game-font-size) * 2.2);
  height: calc(var(--game-font-size) * 2.2);
  color: var(--game-border-color);
  border-radius: 50%;
  border: var(--game-border-color) var(--game-border-style) var(--game-border-width);
}
</style>
