
let HTnode = document.getElementById('htusdtprice');
let BTCnode = document.getElementById('btcusdtprice');
let ETHnode = document.getElementById('ethusdtprice');



function httpRequest(url, callback){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = ()=> {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(xhr.responseText);
          }
    }
    xhr.send();
}

function pricecompare(originNode,NewData){
  if(originNode){
    originNode.classList.remove('in','de');
    if(NewData >= originNode.innerText){
      originNode.classList.add("in");
    }else {
      originNode.classList.add("de");
    }
    originNode.innerText = NewData;
  }
}

function GetNowPrice(){
  httpRequest("https://api.huobipro.com/market/history/kline?symbol=htusdt&period=5min&size=1", (origin)=>{
    res = JSON.parse(origin);
    if(1){
      pricecompare(HTnode,res.data[0].close);
  }
  });
  httpRequest("https://api.huobipro.com/market/history/kline?symbol=btcusdt&period=5min&size=1", (origin)=>{
    res = JSON.parse(origin);
    if(1){
      pricecompare(BTCnode,res.data[0].close);
  }
  });
  httpRequest("https://api.huobipro.com/market/history/kline?symbol=ethusdt&period=5min&size=1", (origin)=>{
    res = JSON.parse(origin);
    if(1){
      pricecompare(ETHnode,res.data[0].close);
  }
  });
}

GetNowPrice();

let status = this.setInterval(function(){
  GetNowPrice();
},1500);


