
class PriceDetector {
  constructor() {
    // chrome.storage.local.set({taskList:["btcusdt","htusdt"]});
    chrome.storage.local.get('taskList', (res)=> {
      if(res.taskList){
        this.PriceArr = res.taskList;
        this.initPrice();
      }else {
        this.PriceArr = ["btcusdt","htusdt"];
        this.initPrice();
      }
    })
  }

  getPriceInfo(){
    let self = this;
    chrome.storage.local.get('taskList', function(res) {
          res.taskList.map((item,index)=>{
            let Dom = `<li class="item"><div class="pricebox"><span class="tag">${item.toUpperCase()}</span><span class="nowPrice">Loading</span><span class="icon-de"></span><span class="icon-in"></span></div></li>`
            $('.pricelist').append(Dom);
          });
          let time = setInterval(()=>{
          res.taskList.map((item,index)=>{
            $.ajax({
              type: "GET",
              url: "https://api.huobipro.com/market/history/kline",
              data: {
                symbol:item,
                period:'5min',
                size:1
              },
              success:function(data){
                let res = JSON.parse(data);
                let PriceNode = $('.nowPrice').eq(index);
                let nowPrice = res.data[0].close;
                self.pricecompare(PriceNode,nowPrice);
                $('.nowPrice').eq(index).text(res.data[0].close);
              }
            })
          })
        },2000)
      })
  }

  pricecompare(originNode,NewData){
    if(originNode){
      originNode.removeClass('in de');
      if(NewData >= originNode.text()){
        //increase price
        $(".icon-de").hide();
        $(".icon-in").fadeIn(500);
        // originNode.removeClass('in de').addClass("in");
      }else {
        //decrease price
        $(".icon-in").hide();
        $(".icon-de").fadeIn(500);
        // originNode.removeClass('in de').addClass("de");
      }
    }
  }



  addDom(item){
    let Dom = `<li class="item"><div class="pricebox"><span class="tag">${item.toUpperCase()}</span><span class="nowPrice">重启后加载</span></div></li>`
    $('.pricelist').append(Dom);
  }
  clear(){
    chrome.storage.local.set({taskList:["btcusdt","htusdt"]});
    $('.warn').text('重启后生效').fadeIn(1000);
  }
  init(){
    this.getPriceInfo();
    let self = this;
    $('.clearbtn').on('click',()=>{
      this.clear();
    })
    $('.addbtn').on('click',()=>{
      let userinput = $("input[name='coinname']").val();
      if(!userinput){
        $('.warn').fadeIn(1000);
        return ;
      }else {
        chrome.storage.local.get('taskList', function(res) {
          this.PriceArr = res.taskList;
          for(let item of this.PriceArr){
            console.log(item);
            if(item == userinput){
            $('.warn').text('不可重复添加').fadeIn(1000);
            return false;
           }
         }
         $.ajax({
         type: "GET",
         url: "https://api.huobipro.com/market/history/kline",
         data: {
           symbol:userinput,
           period:'5min',
           size:1
         },
         success:function(data){
           let res = JSON.parse(data);
           chrome.storage.local.get('taskList', function(res) {
           let taskList = res.taskList || []
           taskList.push(userinput);
           chrome.storage.local.set({taskList:taskList});
           self.addDom(userinput);
           chrome.storage.local.get('taskList', function(res){
               console.log('查看当前结果',res.taskList);
             });
         });
         },
         error:function(data){
           $('.warn').text('输入了错误的币名').fadeIn(1000);
           return false;
         }
       })
        })
      }
    })
  }
  initPrice(){
    let self = this;
    chrome.storage.local.get('taskList', function(res) {
          res.taskList.map((item,index)=>{
            $.ajax({
              type: "GET",
              url: "https://api.huobipro.com/market/history/kline",
              data: {
                symbol:item,
                period:'5min',
                size:1
              },
              success:function(data){
                let res = JSON.parse(data);
                let PriceNode = $('.nowPrice').eq(index);
                let nowPrice = res.data[0].close;
                self.pricecompare(PriceNode,nowPrice);
                $('.nowPrice').eq(index).text(res.data[0].close);
              }
            })
          })
        })
  }
}

let price = new PriceDetector();
price.init();