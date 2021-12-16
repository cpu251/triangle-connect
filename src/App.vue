<template>
  <div class="d-flex flex-column align-items-center vh-100" :style="styleObject()">
    <nav class="navbar navbar-expand navbar-dark bg-dark w-100 mb-3">
      <div class="container">
        <a class="navbar-brand">{{ document.title }}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarColor01">
          <ul class="navbar-nav me-auto ms-1">
            <li class="nav-item">
              <router-link class="nav-link" to="/">{{ mainName() }}</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">游戏玩法</router-link>
            </li>
            <li class="nav-item" v-if="gameReloadBtn">
              <button type="button" class="btn btn-success" @click="gameReload()">重新开始</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="d-flex flex-column flex-fill w-100" :class="{'router-change': routerChange}">
      <router-view/>
    </div>
  </div>
  <div class="modal game-settlement fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref='gameModalDom'>
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="staticBackdropLabel">游戏结束</h5>
        </div>
        <div class="modal-body">
          <div>得分：{{ game.score }}</div>
          <div>最大Combo：{{ game.maxCombo }}</div>
          <div class="mb-2">用时：{{ timeCost() }}</div>
          <div>历史最大得分：{{ gameHistory.maxScore }}</div>
          <div>历史最大Combo：{{ gameHistory.maxCombo }}</div>
        </div>
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-primary" @click="gameBack()">返回</button>
          <button type="button" class="btn btn-success" @click="gameReload()">重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { provide, ref, unref } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min'
import 'bootstrap-icons/font/bootstrap-icons.css'

import Game from '@/components/game/Game'
import GameOptions from '@/components/game/GameOptions'

export default {
  name: 'App',
  data() {
    return {
      document: document,
      gameReloadBtn: false,
      routerChange: false,
      gameHistory: {
        maxScore: 0,
        maxCombo: 0
      }
    }
  },
  created() {
    //记录和读取最大得分和Combo的缓存
    const gameHistory = localStorage.getItem('gameHistory')
    if(gameHistory) {
      this.gameHistory = JSON.parse(gameHistory)
    }
    this.$watch('game.gameOver', () => {
      if(this.game.gameOver) {
        let saveFlag = false
        if(this.gameHistory.maxScore < this.game.score) {
          this.gameHistory.maxScore = unref(this.game.score)
          saveFlag = true
        }
        if(this.gameHistory.maxCombo < this.game.maxCombo) {
          this.gameHistory.maxCombo = unref(this.game.maxCombo)
          saveFlag = true
        }
        if(saveFlag) {
          localStorage.setItem('gameHistory', JSON.stringify(this.gameHistory))
        }
      }
    })
    //导航切换时的处理
    this.$watch('$router.currentRoute.value.name', (newVal) => {
      if(newVal === 'Game') {
        this.routerChange = true
        setTimeout(() => {
          if(this.routerChange) {
            this.routerChange = false
          }
        }, 300)
      }
    })
  },
  mounted() {
    this.gameModal = new bootstrap.Modal(this.$refs.gameModalDom, {})
  },
  setup() {
    const gameOptions = ref(GameOptions)
    const game = ref(Game.init(GameOptions.options[GameOptions.index]))
    const gameModal = ref(null)
    const gameOverFilter = ref(false)

    provide('game', game)
    provide('gameOptions', gameOptions)
    provide('gameModal', gameModal)
    provide('gameOverFilter', gameOverFilter)

    return {
      game,
      gameOptions,
      gameModal,
      gameOverFilter
    }
  },
  methods: {
    gameReload() {
      this.game.reload = true
      this.gameReloadBtn = false
    },
    gameBack() {
      this.gameModal.hide()
      this.gameReloadBtn = true
    },
    mainName() {
      if(this.$router.currentRoute.value.name === 'Game') {
        if(this.game.gameOver) {
          this.gameReloadBtn = true
        }
        return '开始游戏'
      } else {
        this.gameReloadBtn = false
        return '继续游戏'
      }
    }
  },
  computed: {
    styleObject() {
      return () => {
        return {
          'overflow' : this.$router.currentRoute.value.name === 'Game' ? 'hidden' : '',
          'transition': '0.5s filter ease',
          'filter': this.gameOverFilter && !this.gameReloadBtn && this.$router.currentRoute.value.name === 'Game' ? 'blur(3px)' : ''
        }
      }
    },
    timeCost() {
      return () => {
        const second = Math.floor(this.game.timeCost / 1000) % 60
        const minute = Math.floor((this.game.timeCost - second * 1000) / 60000) % 60
        return (minute < 10 ? '0' : '') + minute + ' : ' + (second < 10 ? '0' : '') + second
      }
    }
  }
}
</script>

<style>
body {
  background-image: linear-gradient(90deg, #5c268b, #36196e, #342738);
}
</style>

<style scoped>
.game-settlement .modal-content {
  background-color: rgb(209, 193, 255, 0.85);;
}
.game-settlement .modal-header {
  border-color: var(--game-border-color);
}
.game-settlement .modal-footer {
  border-color: var(--game-border-color);
}
@keyframes router-change {
  0%   {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.router-change {
  animation: router-change 0.3s;
}
</style>
