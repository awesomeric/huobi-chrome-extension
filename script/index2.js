
class PriceDetector {
  constructor() {
    // chrome.storage.local.set({taskList:["btcusdt","htusdt"]});
    let time = null;
    this.getChromeLS().then(res=>{
      if(res){
        this.PriceArr = res.taskList;
      }else {
          this.PriceArr = ["btcusdt","htusdt"];
          this.setChromeLS();
          chrome.storage.local.set({taskList:this.PriceArr});
      }
      this.initPrice();
    })
  }
  getChromeLS(){
    return new Promise((resolve,reject)=>{
      chrome.storage.local.get('taskList', (res)=> {
        resolve(res.taskList)
      });
    });
  }

  createPriceDom(){
    this.getChromeLS().then(res=>{
      //create domlist
      res.map((item,index)=>{
        let Dom = `<li class="item">
        <div class="pricebox">
        <span class="tag">${item.toUpperCase()}</span>
        <span class="nowPrice">
        <i class="loading"/>
        </span>
        <span class="icon-de"></span>
        <span class="icon-in"></span>
        <span class="openprice"></span>
        </div>
        </li>`
        $('.pricelist').append(Dom);
      });
      this.time = this.intervalPrice(res);
    })
  }

  intervalPrice(arr){
    let self = this;
    return setInterval(()=>{
    arr.map((item,index)=>{
      $.ajax({
        type: "GET",
        url: "https://api.huobipro.com/market/history/kline",
        data: {
          symbol:item,
          period:'5min',
          size:1
        },
        timeout:3000,
        success:function(data){
          let res = JSON.parse(data);
          let PriceNode = $('.nowPrice').eq(index);
          let closePrice = res.data[0].close;
          let openPrice = res.data[0].low;
          self.pricecompare(closePrice,openPrice);
          $('.nowPrice').eq(index).text(closePrice);
          $('.openprice').eq(index).text(openPrice);
        },
        complete:function(XMLHttpRequest, Status){
          if(Status == 'timeout'){
            clearInterval(self.time)
            $('.no-network').fadeIn(1500);
          }
        }
      })
    })
  },2000)
 }

  addDom(item){
    let Dom = `<li class="item"><div class="pricebox"><span class="tag">${item.toUpperCase()}</span><span class="nowPrice"><i class="loading"></i></span></div></li>`
    $('.pricelist').append(Dom);
    clearInterval(this.time);
    this.getChromeLS().then(res=>{
        this.time = this.intervalPrice(res);
    })
  }
  clear(){
    chrome.storage.local.set({taskList:["btcusdt","htusdt"]});
    $('.warn').text('重启后生效').fadeIn(1000);
  }
  init(){
    let self = this;
    this.createPriceDom();
    $('.clearbtn').on('click',()=>{
      this.clear();
    });

    $("input[name='coinname']").keydown(function(e){
      if(e.keyCode == 13)
      {
        $(".addbtn").trigger("click");
      }
    });

    $('.addbtn').on('click',()=>{
      let userinput = $("input[name='coinname']").val();
      if(!userinput){
        $('.warn').fadeIn(1000);
        return ;
      }else {
        this.getChromeLS().then(res=>{
          this.PriceArr = res;
          for(let item of this.PriceArr){
            if(item == userinput){
            $('.warn').text('不可重复添加!').fadeIn(1000);
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
    this.getChromeLS().then(res=>{
      res.map((item,index)=>{
        $.ajax({
          type: "GET",
          url: "https://api.huobipro.com/market/history/kline",
          data: {
            symbol:item,
            period:'5min',
            size:1
          },
          timeout:3000,
          success:function(data){
            let res = JSON.parse(data);
            let PriceNode = $('.nowPrice').eq(index);
            let closePrice = res.data[0].close;
            let openPrice = res.data[0].low;
            self.pricecompare(closePrice,openPrice);
            $('.nowPrice').eq(index).text(closePrice);
            $('.openprice').eq(index).text(openPrice);
          },
          complete:function(XMLHttpRequest, Status){
            if(Status == 'timeout'){
              clearInterval(self.time);
              $('.no-network').fadeIn(1500);
            }
          }
        })
      })
    })
  }
  pricecompare(closePrice,openPrice){
      if(closePrice >= openPrice){
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

let price = new PriceDetector();
price.init();