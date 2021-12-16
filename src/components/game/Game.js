export default {
    items: null,
    init(firstNumber = 5, secondNumber = 5) {
        firstNumber = parseInt(firstNumber)
        if(isNaN(firstNumber)){
            firstNumber = 3
        }
        secondNumber = parseInt(secondNumber)
        if(isNaN(secondNumber)){
            secondNumber = 3
        }

        let items = []
        for(let i = 0; i < firstNumber; i++) {
            items.push([]);
            for(let j = 0; j < secondNumber; j++) {
                let item = [];
                if((i % 2 + j % 2) % 2 === 0) {
                    item.push({
                        type: 'ball',
                        color: Math.floor(Math.random() * 7)
                    })
                    console.log(item[0].color)
                } else {
                    item.push({
                        type: 'item'
                    })
                }
                items[i].push(item);
            }
        }
        this.items = items
        console.log(this.items)
    }
}