(function(){

  // return;
  window.onload = function(){

    document.getElementById('login_button').onclick=function(){
      this.style.visibility = 'hidden';
      window.setTimeout(function(){
        document.getElementById('login_loader').style.visibility = 'visible';
      }, 250);

      window.setTimeout(function() {
        ajax({
          url: "DOM/desktop.html",
          success: function(data){
            var html = data;
            var desktopDiv = document.createElement('div');
            desktopDiv.id = "create_desktop";
            desktopDiv.innerHTML = html;
            var script = document.createElement('script');
            script.innerHTML = ''+
              'new Win().container_initiate(document.getElementById("window_container"));'+
              'window.desktop = new Desktop({});';
            desktopDiv.appendChild(script);
            document.body.appendChild(desktopDiv);

            document.getElementById('login_container').className = 'login-container login-container-close';
            window.setTimeout(function() {
              var t = document.getElementById('login_container');
              t.parentNode.removeChild(t);
            },300);



          },
          error: function(data){
            console.error("error");
          }
        });
      }, 2000);

    }

  }






  var browser = getBrowser();
  if(browser.indexOf('IE')!=-1){
    console.log(parseInt(browser.split(' ')[1]));
    if(parseInt(browser.split(' ')[1])<11){
      document.getElementById('login_greetings').innerHTML = "Welcome. Please use IE 11 or other modern browsers.";
      document.getElementById('login_button').parentNode.removeChild(document.getElementById('login_button'));
      document.getElementById('login_loader').style.visibility = 'visible';
    }else {
      document.getElementById('login_greetings').innerHTML = "Welcome. Please be advised to use modern browsers rather than IE.";
    }
  }
  if(navigator.userAgent.match(/(iPhone|iPod|Android|ios|SymbianOS)/i)){
    document.getElementById('login_greetings').innerHTML = "Welcome. Please be advised to use PC browsers.";
    document.getElementById('login_button').parentNode.removeChild(document.getElementById('login_button'));
    document.getElementById('login_loader').style.visibility = 'visible';
  }


  function ajax(){
    var ajaxData = {
      type:arguments[0].type || "GET",
      url:arguments[0].url || "",
      async:arguments[0].async || "true",
      data:arguments[0].data || null,
      dataType:arguments[0].dataType || "text",
      contentType:arguments[0].contentType || "application/x-www-form-urlencoded",
      beforeSend:arguments[0].beforeSend || function(){},
      success:arguments[0].success || function(){},
      error:arguments[0].error || function(){}
    }
    ajaxData.beforeSend();
    var xhr = createxmlHttpRequest();
    xhr.open(ajaxData.type,ajaxData.url,ajaxData.async);
    xhr.responseType=ajaxData.dataType;
    xhr.setRequestHeader("Content-Type",ajaxData.contentType);
    xhr.send(convertData(ajaxData.data));
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if(xhr.status == 200){
          ajaxData.success(xhr.response)
        }else{
          ajaxData.error()
        }
      }
    }
  }
  function createxmlHttpRequest() {
    if (window.ActiveXObject) {
      return new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    }
  }

  function convertData(data){
    if( typeof data === 'object' ){
      var convertResult = "" ;
      for(var c in data){
        convertResult+= c + "=" + data[c] + "&";
      }
      convertResult=convertResult.substring(0,convertResult.length-1)
      return convertResult;
    }else{
      return data;
    }
  }
  function getBrowser(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
      tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
      tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
      if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
  }
})();
