const Game = (() => {
    //默认参数
    let options = {
        //竖排数量 2n+1
        firstNumber: 3,
        //横排数量 2n+1
        secondNumber: 3,
        //几种宝石球颜色，最多7种
        color: 3,
        //最大限制时间（毫秒）
        maxTime: 30000,
        //每生成新棋盘增加的时间（毫秒）
        addTime: 30000,
        //每个方宝石增加时间（毫秒）
        itemAddTime: 1000
    }

    //验证参数
    let validateOptions = (setOptions) => {
        Object.assign(options, setOptions)
        options.firstNumber = parseInt(options.firstNumber)
        if(isNaN(options.firstNumber) || options.firstNumber < 3){
            options.firstNumber = 3
        }
        options.secondNumber = parseInt(options.secondNumber)
        if(isNaN(options.secondNumber) || options.secondNumber < 3){
            options.secondNumber = 3
        }
        options.color = parseInt(options.color)
        if(isNaN(options.color) || options.color < 3){
            options.color = 3
        } else if(options.color > 7) {
            options.color = 7
        }
        options.maxTime = parseInt(options.maxTime)
        if(isNaN(options.maxTime)){
            options.maxTime = 30000
        }
        options.addTime = parseInt(options.addTime)
        if(isNaN(options.addTime)){
            options.addTime = 30000
        }
        options.itemAddTime = parseInt(options.itemAddTime)
        if(isNaN(options.itemAddTime)){
            options.itemAddTime = 3000
        }
    }

    let colorSame = (color1, color2, color3) => {
        let flag = false
        if(color1 === color2 && color1 === color3 && color1 > 0) {
            flag = true
        }
        return flag
    }

    return {
        firstNumber: 3,
        secondNumber: 3,
        items: null,
        score: 0,
        currentCombo: 0,
        maxCombo: 0,
        maxTime: 0,
        time: 0,
        itemAddTime: 0,
        timeCost: 0,
        displayScore: 0,
        displayMaxCombo: 0,
        displayTime: 0,
        displayMaxTime: 0,
        gameOver: false,
        clear: false,
        reload: false,
        routerOther: true,
        sound: true,
        /*
        * 构建每一轮游戏的棋盘
        * @params options {firstNumber, secondNumber, color, maxTime, addTime, itemAddTime}
        * @return object 游戏对象
        * */
        init: function(setOptions = {}) {
            validateOptions(setOptions);
            this.maxTime = options.maxTime
            if(this.time === 0 && !this.clear) {
                this.time = this.maxTime
                this.displayTime = this.maxTime
                this.displayMaxTime = this.maxTime
                this.timeCost = 0
                this.itemAddTime = options.itemAddTime
                this.score = 0
                this.displayScore = 0
                this.currentCombo = 0
                this.maxCombo = 0
                this.displayMaxCombo = 0
            } else {
                this.time = this.time + options.addTime > this.maxTime ? this.maxTime : this.time + options.addTime
            }
            this.firstNumber = options.firstNumber
            this.secondNumber = options.secondNumber
            this.gameOver = false
            this.clear = false
            this.reload = false

            let items = []
            let colorMaxNum = 0
            //构建items
            for(let i = 0; i < options.firstNumber; i++) {
                items.push([]);
                for(let j = 0; j < options.secondNumber; j++) {
                    let item = [];
                    if((i % 2 + j % 2) % 2 === 0) {
                        item.push({
                            type: 'ball',
                            color: 0
                        })
                        colorMaxNum++
                    } else {
                        if(i === 0) {
                            item.push({
                                type: 'item',
                                bottomItem: true
                            })
                        } else if (i === options.firstNumber - 1){
                            item.push({
                                type: 'item',
                                topItem: true
                            })
                        } else if(i % 2 === 0){
                            if(j > 0){
                                item.push({
                                    type: 'item',
                                    topItem: true
                                })
                            }
                            if(j < options.secondNumber - 1){
                                item.push({
                                    type: 'item',
                                    bottomItem: true
                                })
                            }
                        } else {
                            if(j > 0){
                                item.push({
                                    type: 'item',
                                    leftItem: true
                                })
                            }
                            if(j < options.secondNumber - 1){
                                item.push({
                                    type: 'item',
                                    rightItem: true
                                })
                            }
                        }
                    }
                    items[i].push(item);
                }
            }

            //清理每个宝石球的颜色
            let colorClear = () => {
                for(const i in items) {
                    for(const j in items[i]) {
                        if(items[i][j][0].type === 'ball') {
                            items[i][j][0].color = 0;
                        }
                    }
                }
            }

            //检查是否会生成直接有解的棋盘
            let colorCheck = () => {
                let flag = true
                colorCheck:
                for(let i in items) {
                    for(let j in items[i]) {
                        i = Number(i)
                        j = Number(j)
                        if(flag && i < items.length - 1) {
                            if((i % 2 + j % 2) % 2 === 0) {
                                if(i % 2 === 0) {
                                    //检查下左侧三角形
                                    if(flag && j > 0) {
                                        flag = !colorSame(items[i][j][0].color, items[i + 1][j - 1][0].color, items[i + 2][j][0].color)
                                    }
                                    //检查下右侧三角形
                                    if (flag && j + 1 < items[i].length) {
                                        flag = !colorSame(items[i][j][0].color, items[i + 1][j + 1][0].color, items[i + 2][j][0].color)
                                    }
                                    //检查下右上侧三角形
                                    if (flag && j + 2 < items[i].length) {
                                        flag = !colorSame(items[i][j][0].color, items[i + 1][j + 1][0].color, items[i][j + 2][0].color)
                                    }
                                } else {
                                    //检查下侧三角形
                                    flag = !colorSame(items[i][j][0].color, items[i + 1][j - 1][0].color, items[i + 1][j + 1][0].color)
                                }
                            }
                        } else {
                            break colorCheck
                        }
                    }
                }
                return flag
            }

            //初始化宝石球颜色，每种颜色至少3个，多余的舍弃，不够的随机颜色补充
            let colorInit = () => {
                colorClear()
                let colorNum = 0
                colorInit:
                    for(let i = 0; i < options.color; i++) {
                        for(let j = 0; j < 3; j++) {
                            if(colorNum < colorMaxNum) {
                                let firstIndex = Math.floor(Math.random() * options.firstNumber)
                                let secondIndex = Math.floor(Math.random() * options.secondNumber)
                                while (items[firstIndex][secondIndex][0].type !== 'ball' || items[firstIndex][secondIndex][0].color > 0) {
                                    firstIndex = Math.floor(Math.random() * options.firstNumber)
                                    secondIndex = Math.floor(Math.random() * options.secondNumber)
                                }
                                items[firstIndex][secondIndex][0].color = i + 1
                                colorNum++
                            } else {
                                break colorInit
                            }
                        }
                    }

                const check = colorCheck()
                if(!check) {
                    colorInit()
                    return
                }
                let colorRandomNum = 0
                //补齐宝石球颜色
                for(const i in items) {
                    for(const j in items[i]) {
                        if(items[i][j][0].type === 'ball' && items[i][j][0].color === 0) {
                            const colorRandom = () => {
                                items[i][j][0].color = Math.floor(Math.random() * options.color) + 1;
                                const check = colorCheck()
                                if(!check) {
                                    if(colorRandomNum >= 20) {
                                        return false
                                    }
                                    colorRandomNum++
                                    colorRandom()
                                }
                                return true
                            }
                            if(!colorRandom()) {
                                colorInit()
                                return
                            }
                        }
                    }
                }
            }
            colorInit()

            this.items = items
            return this
        },
        /*
        * 松手或时间到时结算
        * */
        itemSettlement: function () {
            let combo = 0
            for(let i in this.items) {
                for(let j in this.items[i]) {
                    i = Number(i)
                    j = Number(j)
                    if(i < this.items.length - 1) {
                        if((i % 2 + j % 2) % 2 === 0) {
                            if(i % 2 === 0) {
                                //检查下左侧三角形
                                if(j > 0 && colorSame(this.items[i][j][0].color, this.items[i + 1][j - 1][0].color, this.items[i + 2][j][0].color)) {
                                    for(const k in this.items[i + 1][j]) {
                                        if(this.items[i + 1][j][k].leftItem === true) {
                                            this.items[i + 1][j][k].leftItem = false
                                            combo++
                                        }
                                    }
                                }
                                //检查下右侧三角形
                                if (j + 1 < this.items[i].length && colorSame(this.items[i][j][0].color, this.items[i + 1][j + 1][0].color, this.items[i + 2][j][0].color)) {
                                    for(const k in this.items[i + 1][j]) {
                                        if(this.items[i + 1][j][k].rightItem === true) {
                                            this.items[i + 1][j][k].rightItem = false
                                            combo++
                                        }
                                    }
                                }
                                //检查下右上侧三角形
                                if (j + 2 < this.items[i].length && colorSame(this.items[i][j][0].color, this.items[i + 1][j + 1][0].color, this.items[i][j + 2][0].color)) {
                                    for(const k in this.items[i][j + 1]) {
                                        if(this.items[i][j + 1][k].bottomItem === true) {
                                            this.items[i][j + 1][k].bottomItem = false
                                            combo++
                                        }
                                    }
                                }
                            } else {
                                //检查下侧三角形
                                if(colorSame(this.items[i][j][0].color, this.items[i + 1][j - 1][0].color, this.items[i + 1][j + 1][0].color)){
                                    for(const k in this.items[i + 1][j]) {
                                        if(this.items[i + 1][j][k].topItem === true) {
                                            this.items[i + 1][j][k].topItem = false
                                            combo++
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //结算赋值
            this.currentCombo = combo
            if(combo > 0) {
                this.itemAddTime = options.itemAddTime
                const score = 100 * (combo + (combo - 1) * 0.5)
                this.score += score
                this.maxCombo = combo > this.maxCombo ? combo : this.maxCombo
                this.time = this.time + this.itemAddTime * combo > this.maxTime ? this.maxTime : this.time + this.itemAddTime * combo
            }
            //判断当前棋盘是否已经通关
            let numCost = 0
            for(const items1 of this.items) {
                for(const items2 of items1) {
                    for(const item of items2) {
                        if(item.type === 'item' && (item.topItem || item.bottomItem || item.leftItem || item.rightItem)) {
                            numCost++
                        }
                    }
                }
            }
            if(numCost === 0) {
                this.clear = true
            } else if(this.time <= 0) {
                this.gameOver = true
            }
        }
    }
})()

module.exports = Game;
