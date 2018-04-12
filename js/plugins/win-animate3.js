/**
 * CSS3动画
 * @type {[type]}
 */
;(function(){
  var AnimateWin = function(obj){

    if (!window.Win) throw new Error("'Win' not found.");
    var bf = function(){
      return true;
    };
    var cf = function(cb) {
      return cb();
    }
    this.anWinOnClose = obj.onClose|| this.anWinOnClose ||bf;
    this.anWinOnDrag = obj.onDrag|| this.anWinOnDrag ||cf;
    this.anWinOnMaximise = obj.onMaximise|| this.anWinOnMaximise ||cf;
    this.anWinOnUndoMaximise = obj.onUndoMaximise|| this.anWinOnUndoMaximise ||cf;
    this.anWinOnMinimise = obj.onMinimise|| this.anWinOnMinimise ||cf;
    this.onUndoMinimise = obj.onUndoMinimise|| this.onUndoMinimise ||cf;
    this.undoMinimise = obj.undoMinimise|| this.undoMinimise ||bf;
    obj.onClose = null;
    obj.onDrag = null;
    obj.onMaximise = null;
    obj.onUndoMaximise = null;
    obj.onMinimise = null;
    obj.onUndoMinimise = null;
    obj.undoMinimise = null;

    this.COVERING = false;
    if(obj.className)
      this.className = "window-animate "+obj.className;
    else
      this.className = "window-animate";
    Win.call(this, obj);
    this._initiate_AnimateWin();
  };
  if(!Object.create){
    Object.create = function(proto){
      function F(){}
      F.prototype = proto;
      return new F();
    };
  }
  if (!window.Win) throw new Error("'Win' not found.");
  AnimateWin.prototype = Object.create(Win.prototype);
  /**
   * initiates
   * @return {[type]} [description]
   */
  AnimateWin.prototype._initiate_AnimateWin = function(){
    var style = document.createElement("style");
    style.id = this.id+"_style_animation";
    this.win.appendChild(style);
    this._style_node_reset(style);
  };
  /**
   * empties all the classes
   * @param {[type]} style [description]
   */
  AnimateWin.prototype._style_node_reset = function(style){
    var style = style || this.$(this.id+"_style_animation");
    style.innerHTML = "";
    this.addCssClass("close", style);
    this.addCssClass("maximise", style);
    this.addCssClass("undo-maximise", style);
    this.addCssClass("minimise", style);
    this.addCssClass("undo-minimise-prior", style);
    this.addCssClass("undo-minimise", style);
  };
  /**
   * when the window touches the edges of the screen, a layer that covers the area
   * in which the window will be placed appears
   * @param  {[type]}   e    event object from parent
   * @param  {[type]}   left left position of the window
   * @param  {[type]}   top  top position of the window
   * @return {[type]}        [description]
   */
  AnimateWin.prototype.onDrag = function(move, e, left, top){

    this.anWinOnDrag(move);
    this._onDrag(e, left, top);
    return this;
  };
  AnimateWin.prototype._onDrag = function(e, left, top){
    e.pageX = e.pageX || e.clientX+document.body.scrollLeft;
    e.pageY = e.pageY || e.clientY+document.body.scrollTop;
    if((top<=-10||e.pageX<=5)&&!this.COVERING){// shows the cover
      var cover = document.createElement("div");
      var css = ".window-animate-appendix.maximise-cover-box{"+
        "z-index:"+(this.wins.args.z_index-1)+
        ";left:"+e.pageX+"px"+
        ";top:"+e.pageY+"px"+
      ";}";
      cover.innerHTML = '<style id="maximise_cover_style">'+ css +'</style>'+
        '<div class="window-animate-appendix maximise-cover"><div class="cover-inner"></div></div>';
      cover.id = "window_maximise_cover";
      cover.className = "window-animate-appendix maximise-cover-box";
      this.$(this.containerId).appendChild(cover);
      this.COVERING = true;
      var self = this;
      if(top<=-10&&e.pageX<=5){
        //this delay ensures the animation works, perhaps by leaving time for the previous renderings
        setTimeout(function(){
          self.addClass(cover, "show quarter-left-top");
        }, 30);
      }else if(top<=-10){
        setTimeout(function(){
          self.addClass(cover, "show full");
        }, 30);
      }else if(e.pageX<=5){
        setTimeout(function(){
          self.addClass(cover, "show half-left");
        }, 30);
      }
      var mup =function(){
        var _cover = document.getElementById("window_maximise_cover");
        var callee = arguments.callee;
        if(_cover){
          self.fadeOut(_cover, 150, 0, function(){
            if(_cover && _cover.parentNode) _cover.parentNode.removeChild(_cover);
          })
          self.COVERING = false;
        }
        self.removeEvent(document, "mouseup", callee);
      };
      this.addEvent(document, "mouseup", mup);//mouseup, deletes the cover
    }else if (this.COVERING) {//changes the shape of the cover
      if(e.pageX>5&&top>-10){
        var _cover = document.getElementById("window_maximise_cover");
        this.fadeOut(_cover, 150, 0, function(){
          if(_cover && _cover.parentNode) _cover.parentNode.removeChild(_cover);
        })
        this.COVERING = false;
      }else {
        if(top<=-10&&e.pageX<=5){ //top-left
          var self = this;
          var cover = document.getElementById("window_maximise_cover");
          setTimeout(function(){
            self.addClass(cover, "quarter-left-top");
            self.removeClass(cover, "full");
            self.removeClass(cover, "half-left");
          }, 30);
        }else if(top<=-10){ //full screen
          var self = this;
          var cover = document.getElementById("window_maximise_cover");
          setTimeout(function(){
            self.addClass(cover, "full");
            self.removeClass(cover, "quarter-left-top");
            self.removeClass(cover, "half-left");
          }, 30);
        }else if(e.pageX<=5){ //left half
          var self = this;
          var cover = document.getElementById("window_maximise_cover");
          setTimeout(function(){
            self.addClass(cover, "half-left");
            self.removeClass(cover, "quarter-left-top");
            self.removeClass(cover, "full");
          }, 30);
        }
      }
    }
  };
  /**
   * onClose animation
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  AnimateWin.prototype.onClose = function(close){
    if(!this.anWinOnClose()) return;

    var lasting = 150;
    var css = this.crossBrowser("transition-duration:"+ lasting/1000 +"s").join(";");
    this.removeClass(this.win, "maximise");
    this.addClass(this.win, "close");
    this.addCssToClass("close", css);

    var self = this;
    setTimeout(function(){
      close();
    }, lasting);

    return this;
  };
  /**
   * onMaximise
   * @return {[type]} [description]
   */
  AnimateWin.prototype.onMaximise = function(maximise){

    var self = this;
    this.anWinOnMaximise(function(){
      var win = self.win;
      var lasting = 150;
      self.addClass(win, "maximise-prior");
      self.setCss({
        width:document.body.offsetWidth + 'px', height: document.body.offsetHeight + 'px',
        top: 0, left: 0
      });

      //this delay ensures the animation works, perhaps by leaving time for the previous renderings
      setTimeout(function(){
        var css = self.crossBrowser("transition-duration:"+ lasting/1000 +"s").join(";");
        self.addCssToClass("maximise", css);
        self.addClass(win, "maximise");
        self.removeClass(win, "maximise-prior");
      }, 50);

      setTimeout(function(){
        maximise();
        self.removeClass(win, "maximise");
        self._style_node_reset();
      }, lasting+50);
    })
    return this;
  };
  /**
   * onUndoMaximise
   * @param  {Function} undoMaximise call this function as callback to finish the process
   * @return {[type]}        [description]
   */
  AnimateWin.prototype.onUndoMaximise = function(undoMaximise){
    var self = this;
    this.anWinOnUndoMaximise(function(){
      var win = self.win;
      var lasting = 150;
      var css = self.crossBrowser("transition-duration:"+ lasting/1000 +"s").join(";");
      self.removeClass(win, "maximise");
      self.addCssToClass("undo-maximise", css);
      self.addClass(win, "undo-maximise-prior");
      self.setCss({
        height: self.height+"px",
        width: self.width+"px",
        top: self.top+"px",
        left: self.left+"px",
      });
      //this delay ensures the animation works, perhaps by leaving time for the previous renderings
      setTimeout(function(){
        self.addClass(win, "undo-maximise");
        self.removeClass(win, "undo-maximise-prior");
      }, 50);
      setTimeout(function(){
        self.removeClass(win, "undo-maximise");
        self._style_node_reset();
        undoMaximise();
      }, lasting+50);
    });

    return this;
  };
  /**
   * onMinimise
   * @param  {Function} minimise to be called as callback
   * @return {[type]}        [description]
   */
  AnimateWin.prototype.onMinimise = function(minimise){
    var self = this;
    self.anWinOnMinimise(function(){
      var win = self.win;
      var lasting = 300;
      //goes to an aim position
      var original_pos = [win.offsetLeft+win.offsetWidth*0.5, win.offsetTop+win.offsetHeight*0.5];
      var aim_pos = self.minimise_coordinate || [150, document.body.offsetHeight];//[x, y], represents the position where the (left-bottom point of) window is going to place
      var k = (original_pos[1]-aim_pos[1])/(original_pos[0]-aim_pos[0]); //slope
      k = k*(1+0.3*1/Math.abs(k)); //adjusted slope
      var varianceX = original_pos[0]-aim_pos[0] - (original_pos[1]-aim_pos[1])/k;
      aim_pos[0] += varianceX;

      var to_left = aim_pos[0] - win.offsetWidth*0.25 -40;
      var to_top = aim_pos[1] - win.offsetHeight*0.75;

      var duration = self.crossBrowser("transition-duration:"+ lasting/1000 +"s").join(";");
      var animation = "";//self.crossBrowser("animation:minimise "+ lasting/1000 +"s forwards linear").join(";");
      var btn = self.$(self.id+"_maximise");
      if(btn&&self.hasClass(btn, "max")){
        to_top = self.height/2-50;
        to_left = 0;
      }
      var css = duration +";"+ animation + ";top:"+
        to_top+"px;left:"+
        to_left+"px;opacity:0;transform:scale(0.5);";
        // console.log(to_left+', '+ to_top);
      self.addCssToClass("minimise", css);
      //this delay ensures the animation works, perhaps by leaving time for the previous renderings
      setTimeout(function() {
        self.addClass(win, "minimise");
      }, 50);
      setTimeout(function(){
        self.removeClass(win, "minimise");
        self._style_node_reset();
        minimise();
      }, lasting+50);
    });

    return this;
  };
  /**
   * override undoMinimise so as to add animation
   * @return {[type]} [description]
   */
  AnimateWin.prototype.undoMinimise = function(){
    var self = this;
    if(!self.hidden) {
      console.warn("window (id: "+ self.id +") is on display.");
      return;
    }
    this.onUndoMinimise(function(){
      self.pushToTail();
      var btn = self.$(self.id+"_maximise");
      var win = self.win;
      var b = document.body;
      var bw = b.offsetWidth;
      var bh = b.offsetHeight;
      //pops from where
      var fromLeft = bw*0.1;
      var fromBottom = 0;
      var lasting = 200;
      var height = self.height;
      var width = self.width;
      var left = self.left;
      var top = self.top;
      var y = bh -height -top -fromBottom;
      var x = left -fromLeft;
      var _x = Math.pow(2, -0.004*Math.abs(x)) *x;
      var _y = Math.pow(2, -0.004*Math.abs(y)) *y;
      if(btn&&self.hasClass(btn, "max")){
        height = bh;
        width = bw;
        left = 0;
        top = 0;
        _x = -bw*0.08;
        _y = 20;
        self.setCss({
          width: b.offsetWidth + "px",
          height: b.offsetHeight + "px",
          top: b.scrollTop + "px",
          left: b.scrollLeft + "px"
        });
      }
      var css = "height:"+ height*0.85 + "px;width:" + width*0.85 +
        "px;left:" + (left-_x) + "px;top:" + (top+_y+height*0.15) + "px;opacity:0;"+ self.crossBrowser("transform:scale(0.85)").join(";");
      self.addCssToClass("undo-minimise-prior", css);
      self.addClass(self.win, "undo-minimise-prior");

      self.show();

      var duration = self.crossBrowser("transition-duration:"+ lasting/1000 +"s").join(";");
      var scale = self.crossBrowser("transform:scale(1)").join(";");
      css = "height:"+ height + "px;width:" + width +
        "px;left:" + left + "px;top:" + top + "px;opacity:1;"+ scale +";"+duration;
      self.addCssToClass("undo-minimise", css);
      setTimeout(function(){
        self.addClass(win, "undo-minimise");
      }, 50);
      setTimeout(function(){
        self.removeClass(win, "undo-minimise-prior");
        self.removeClass(win, "undo-minimise");
        self._style_node_reset();

        self.afterUndoMinimise();
      }, lasting+50);
    })

  };
  /**
   * adds classname{} to style node
   * @param {[type]} cls   [description]
   * @param {[type]} style [description]
   * @param {[type]} front [when true, adds to the front]
   */
  AnimateWin.prototype.addCssClass = function(cls, style, front){
    var style = style||document.getElementById(this.id+"_style_animation");
    if(front){
      style.innerHTML = "#"+this.id+".window-animate."+ cls+"{}" + style.innerHTML;
    }else {
      style.innerHTML += "#"+this.id+".window-animate."+ cls+"{}";
    }
    return this;
  };
  /**
   * sets css attributes to a class (unused)
   * @param {[type]} cls classname
   * @param {[type]} obj attributes; uses '_' instead of '-'
   * @param {[type]} style
   */
  AnimateWin.prototype.setCssToClass = function(cls, obj, style){
    var style = style||document.getElementById(this.id+"_style_animation");
    if(arguments.length===1){
      style.innerHTML = arguments[0];
    } else {
      var css = style.innerHTML;
      for(var key in obj){
        regs = "(\\."+ cls +"((\\s+|[#\\.\\{:>])[^\\{]*\\{|\\s*\\{)[^\\}]*"+ key.replace("_","-") +"\\s*:\\s*)[^;]*([;\\}]{1,2})";
        css = css.replace(new RegExp(regs), "$1"+obj[key]+"$4");
      }
      style.innerHTML = css;
    }
    return this;
  };
  /**
   * addCssToClass
   * @param {[type]} cls   classname
   * @param {[type]} str   attributes in string form
   * @param {[type]} style node
   */
  AnimateWin.prototype.addCssToClass = function(cls, str, style){
    var style = style||this.$(this.id+"_style_animation"),
      css = style.innerHTML,
      regs = "(\\."+ cls +"(([#\\.:>\\s+][^\\{]*\\{)|\\{)[^\\{]*)\\}";
    style.innerHTML = css.replace(new RegExp(regs), "$1;"+str+";}");
  };
  /**
   * crossBrowser prefix
   * @param  {[type]}     arguments: attributes names
   * @return {[type]}
   */
  AnimateWin.prototype.crossBrowser = function(){
    var arg = arguments, i = 0, arr=[], s;
    for(;i<arg.length;i++){
      s = arg[i];
      arr.push("-webkit-"+s, "-moz-"+s, "-ms-"+s, "-o-"+s, s);
    }
    return arr;
  };
  /**
   * setOpacity
   * @param {[type]} ev [description]
   * @param {[type]} v  [description]
   */
  AnimateWin.prototype.setOpacity = function(ev, v){
    ev.filters ? ev.style.filter = 'alpha(opacity=' + v*100 + ')' : ev.style.opacity = v;
  };
  /**
   * getOpacity
   * @param  {[type]} elem [description]
   * @return {[type]}      [description]
   */
  AnimateWin.prototype.getOpacity = function(elem){
    if(elem.filters) {
      var f = elem.style.filter;
      if(f==="")
        return 1;
      return +f.match(/opacity=(\d{1,3})[),]/)[1]/100;
    }
    (o=(elem.style.opacity))==="" ? o=1 : o=+o;
    return o;
  };
  /**
   * fade in
   * @param  {[type]}   elem     [description]
   * @param  {[type]}   lasting  [description]
   * @param  {[type]}   opacity  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  AnimateWin.prototype.fadeIn = function(elem, lasting, opacity, callback){
    var self = this;
    lasting = lasting || 300;
    opacity = opacity || 1;
    elem.style.display = '';
    var now_op = self.getOpacity(elem);
    if(opacity<=now_op){
      if(opacity!=now_op&&self.fadeOut)self.fadeOut(elem, lasting, opacity);
      return;
    }
    if(lasting<20){
      self.setOpacity(elem, opacity);
      return;
    }
    var val = now_op,
      frameLast = 20,
      various = (opacity-val)*frameLast/lasting;
    if(opacity!=1&&various>1-opacity){
      if(opacity>=0.96)opacity=0.96;
      various = (1-opacity)-0.01;
      frameLast = various*lasting/(val-opacity);
    }
    val += various;
    ;(function(){
      self.setOpacity(elem, val);
      val += various;
      if (val <= opacity) {
        window.setTimeout(arguments.callee, frameLast);
      }else {
        self.setOpacity(elem, opacity);
        if(callback)callback();
      }
    })();
  };
  /**
   * fade outs
   * @param  {[type]}   elem     [description]
   * @param  {[type]}   lasting  millisecond
   * @param  {[type]}   opacity  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  AnimateWin.prototype.fadeOut = function(elem, lasting, opacity, callback){
    var self=this;
    lasting = lasting || 300;
    opacity = opacity || 0;
    var now_op = self.getOpacity(elem);
    if(opacity>=now_op){
      if(opacity!=now_op&&self.fadeIn) self.fadeIn(elem, lasting, opacity);
      return;
    }
    if(lasting<20){
      self.setOpacity(elem, opacity);
      return;
    }
    var val = now_op,
      frameLast = 20,
      various = (val-opacity)*frameLast/lasting;
    if(opacity!=0&&various>opacity) {
      if(opacity<=0.03)opacity=0.03;
      various = opacity-0.01;
      frameLast = various*lasting/(val-opacity);
    }
    val -= various;
    ;(function(){
      self.setOpacity(elem, val);
      val -= various;
      if (val >= opacity) {
          window.setTimeout(arguments.callee, frameLast);
      }else if (val <= 0) {
        self.setOpacity(elem, 0);
        elem.style.display = 'none';
        if(callback)callback();
      }else {
        self.setOpacity(elem, opacity);
        if(callback)callback();
      }
    })();
  };
  window.AnimateWin = AnimateWin;
})();
