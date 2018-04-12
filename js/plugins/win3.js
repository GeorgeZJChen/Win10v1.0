;(function () {
  var Win = function (obj) {
    if (!(this instanceof Win)) throw new Error("Instance required");
    if (!obj) {
      console.log("Win v3.0\n by Zhuojun Chen \n 6/4/2018");
      return;
    }
    this.id = obj.id || this.id;
    this.name = obj.name || this.name || "";
    this.width = obj.width || this.width || 400;
    this.height = obj.height || this.height || 300;
    this.top = obj.top || this.top || 50;
    this.left = obj.left || this.left || 50;
    this.color = obj.color || this.color || "#515c6b";
    this.className = obj.className || this.className || "";
    this.containerId = obj.containerId || "window_container";
    this.minWidth = obj.minWidth || 170;
    this.minHeight = obj.minHeight || 130;
    this.iconHTML = obj.iconHTML; //|| '<span class="icon-window-folder"><span class="icon-window-folder-inner"></span></span>';
    this.contentHTML = obj.contentHTML;

    this.resizable = obj.resizable || this.resizable || true;
    this.draggable = obj.draggable || this.draggable || true;
    this.name = obj.name || this.name;
    this.btnGroup = obj.btnGroup || this.btnGroup || [1, 1, 1];

    var bf = function () {
      return true;
    };
    var cf = function(cb) {
      return cb();
    }
    this.onCreate = obj.onCreate || this.onCreate || bf;
    this.onClose = obj.onClose || this.onClose || cf; //  onClose(close)
    this.afterClose = obj.afterClose || this.afterClose || bf;
    this.onMouseDown = obj.onMouseDown || this.onMouseDown || bf;
    this.onClick = obj.onClick || this.onClick || bf;
    this.onDrag = obj.onDrag || this.onDrag || cf;  //arguments: (event, left, top)
    this.onResize = obj.onResize || this.onResize || cf;
    this.onMaximise = obj.onMaximise || this.onMaximise || cf;
    this.afterMaximise = obj.afterMaximise || this.afterMaximise || bf;
    this.onUndoMaximise = obj.onUndoMaximise || this.onUndoMaximise || cf;
    this.afterUndoMaximise = obj.afterUndoMaximise || this.afterUndoMaximise || bf;
    this.onMinimise = obj.onMinimise || this.onMinimise || cf;
    this.afterMinimise = obj.afterMinimise || this.afterMinimise || bf;
    this.onUndoMinimise = obj.onUndoMinimise || this.onUndoMinimise || cf;
    this.afterUndoMinimise = obj.afterUndoMinimise || this.afterUndoMinimise || bf;
    this.droppedOn = obj.droppedOn || this.droppedOn || bf;

    this._initiate();
  };
  Win.prototype = {
    /**
     * this function should be called once before creating any window object
     * e.g. new Win().container_initiate(document.getElementById("window_container"));
     * @param  {[type]} container [description]
     * @return {[type]}           [description]
     */
    container_initiate: function(container){
      if(container.wins) throw new Error("container is already initiated.");
      // TODO: check if container style is valid;
      if(!container.wins){  // if creating the first window
        //creates an array (group) of windows for the first time creating a window
        //windows within the group are in order, where those of higher indexes will display in front.
        container.wins = [];
        var wins = container.wins;

        //creates a object that stores group variables
        wins.args = {};
        wins.args.count = 1; // current count of windows
        wins.args.z_index = 10000; //initiates the highest z-index among all windows

        //document event
        //when clicking on elsewhere, the current selected window will be deselected
        var self = this;
        var f = function(e) {
          if(!e.__mousedown_on_window__){
            var wins = container.wins;
            if (wins.length === 0) return;
            var win = wins[wins.length - 1];
            self.deselect(win);
          }
        }
        this.addEvent(document, "mousedown", f);

        Win.prototype.browser = this.getBrowser();
      }
    },
    /**
     * Initiation
     * @return {[type]} [description]
     */
    _initiate: function(){
      var id = this.id;
      this._DOM(id, this.iconHTML);  //creates a DOM element
      this._group_initiate();
      this._CSS();
      if (this.draggable) this._drag();
      if (this.resizable) this._resize();
      this._bindEvents();
      this.content = this.$(id + "_content");
      this._contentSelection();
      this.show();
      this.onCreate();
    },
    _DOM: function (id, iconHTML) {
      var html = ''+
        '<div class="label">'+
          '<div class="label-icon" id="'+ id +'_icon">'+ iconHTML +'</div>'+
          '<div class="label-name" id="'+ id +'_name" style="margin-left:27px;'+
          'margin-right:'+(this.btnGroup[0]*46+this.btnGroup[1]*46+this.btnGroup[2]*46+5)+'px;">'+ this.name +'</div>'+
          '<div class="btn-bar">';
        if (this.btnGroup[0])
          html += '<div class="btn btn-minimise" id="' + id + '_minimise"><div class="btn-icon"></div></div>';
        if (this.btnGroup[1])
          html += '<div class="btn btn-maximise" id="' + id + '_maximise"><div class="btn-icon"></div></div>';
        if (this.btnGroup[2])
          html += '<div class="btn btn-close" id="' + id + '_close"><div class="btn-icon"></div></div>';
      html += '</div>'+
        '<div class="dragger" id="' + id + '_dragger"></div></div>';
      if (this.resizable)
        html += '<div class="resize" id="' + id + '_resize">' +
        '<div class="bar left"></div>' +
        '<div class="bar top"></div>' +
        '<div class="bar right"></div>' +
        '<div class="bar bottom"></div>' +
        '<div class="dot left-top"></div>' +
        '<div class="dot right-top"></div>' +
        '<div class="dot right-bottom"></div>' +
        '<div class="dot left-bottom"></div>' +
        '</div>';

      html += '<div class="window-content" id="' + id + '_content">'+
        '<div style="width:100%;height:100%;top:0px;left:0px" class="window-content-selection window-content-grid-view"></div></div>';
      var win = document.createElement("div");
      win.id = id;
      win.className = "window " + this.className;
      this.win = win;
      this.hide(); //hides the window before css is ready
      win.innerHTML = html;
      this.$(this.containerId).appendChild(win);
    },
    /**
     * initiates an array to store windows instances and public variables for the first time
     * and updates variables for each instance added
     */
    _group_initiate: function(){
      var container =this.$(this.containerId),
      zIndex;

      if(!container){
        throw new Error("call Win.");
      }

      else {   //if the group of windows already exists
        var wins = container.wins;
        if (wins.length === 0) {// if there is no window left in the group, it is initiated to be the first one of the group
          wins.args.count = 1;
          wins.args.z_index = 10000;
        } else {
          var preWin = wins[wins.length - 1]; //previous window (currently displaying in the front)
          this.deselect(preWin);//deselects preWin
          ++wins.args.count;
          ++wins.args.z_index;
        }
      }
      this.wins = container.wins; // adds a pointer to the array
      this.wins.push(this);  //adds the new window to the group
    },
    _CSS: function () {
      var style = document.createElement("style");
      style.id = this.id+"_style";
      style.innerHTML = "#"+this.id+"{"+
        "width:"+this.width+"px"+
        ";height:"+this.height+"px"+
        ";top:"+this.top+"px"+
        ";left:"+this.left+"px"+
        ";background-color:"+this.color+
        ";border: 1px solid "+this.color+
        ";z-index:"+this.wins.args.z_index+
      ";}";
      this.win.appendChild(style);
    },
    /**
     * allows user to drag the window
     * @return {[type]} [description]
     */
    _drag: function () {
      var self = this,
        win = this.win;
      // mousedown -> mousemove -> mouseup
      this.addEvent(this.$(this.id + "_dragger"), "mousedown", function (e) {
        e = e || window.event;
        if (e.button == 2) return; // blocks right clicks
        var dragger = self.$(self.id + "_dragger");
        self.addClass(dragger, "dragging"); // a class for cursor
        var d = document,
          x = e.clientX,
          y = e.clientY,
          top = win.offsetTop,
          left = win.offsetLeft,
          moved = false,
          maximised = false,
          max_btn = self.$(self.id + "_maximise");
        if (max_btn && self.hasClass(max_btn, "max")) maximised = true; // checks if the window is maximised
        var dmove = function (e) {  //mousemove, sets the top and left position of the window as the mouse moves
          e = e || window.event;
          if (e.clientX === x && e.clientY === y) return;
          var b = document.body,
            mx = e.clientX,
            my = e.clientY,
            tx = mx - x + left,
            ty = my - y + top;
          if(!moved&&Math.abs(mx-x)<4&&Math.abs(my-y)<4) return;

          self.onDrag(function(){

            if (maximised) { // when it is maximised, it should return to it's former size, but follows the cursor still
              maximised = false;
              self.removeClass(max_btn, "max");
              var t1 = self.width,
              t2 = b.offsetWidth;
              if (x < t1 / 2)
                left = 0;
              else if (x > t2 - t1 / 2)
                left = t2 - t1;
              else
                left = x - t1 / 2;

              self.setCss({
                width: self.width + "px",
                height: self.height + "px",
                top: b.offsetTop + "px",
                left: left + "px"
              });
              self.left = left;
              self.$(self.id + "_resize").style.visibility = "visible";
            } else {
              self.setCss({
                width: self.width + "px",
                height: self.height + "px",
                left: tx + "px",
                top: ty + "px"
              });
            }
            moved = true;
          }, e, tx, ty)

        };
        var dup = function (e) { //mouseup, makes position variables inherent to the window
          e.pageX = e.pageX || e.clientX + document.body.scrollLeft;
          self.removeClass(dragger, "dragging");  //removes class and events when action is done
          self.removeEvent(d, "mousemove", dmove);
          self.removeEvent(d, "mouseup", dup);
          if(!moved) return;
          var _top = win.offsetTop,
            _left = win.offsetLeft;
          if (_top <= -10 && e.pageX > 5 && self.btnGroup[1]) {  //if it's been moved to above the top margin it is to be maximsed
            self.maximise();
          } else if (e.pageX <= 5) {
            if(_top <= -10){
              var b = document.body;
              self.setCss({ //displays on the top-left quarter of the screen
                height: b.offsetHeight/2+"px",
                width: b.offsetWidth/2+"px",
                top: b.offsetTop+"px",
                left: b.offsetLeft+"px"
              });
            }else if(_top > -10){  //displays on the left half of the screen
              var b = document.body;
              self.setCss({
                height: b.offsetHeight+"px",
                width: b.offsetWidth/2+"px",
                top: b.offsetTop+"px",
                left: b.offsetLeft+"px"
              });
            }

          } else if (_top < 0) { // or depending on extent, just to cling on the top edge
            self.setCss({
              top: 0
            });
            self.top = 0;
          } else {
            self.top = _top;
            self.left = _left;
          }
        };
        self.addEvent(d, "mousemove", dmove);
        self.addEvent(d, "mouseup", dup);
      });
    },
    /**
     * allows user to resize the window
     * @return {[type]} [description]
     */
    _resize: function () {
      var self = this,
        win = this.win;
      this.addEvent(this.$(this.id + "_resize"), "mousedown", function (e) { //mousedown -> mousemove -> mouseup
        e = e || window.event;
        if (e.button == 2) return;  // blocks right clicks
        var tg = e.srcElement ? e.srcElement : e.target, // distinguishes each part
          cls = tg.className.split(" ")[1],
          d = document,
          x = e.clientX || e.offsetX,
          y = e.clientY || e.offsetY,
          top = win.offsetTop,
          left = win.offsetLeft,
          width = win.offsetWidth -2,
          height = win.offsetHeight -2,
          style = self.$(self.id+"_style");
        var dmove = function (e) { //mousemove
          e = e || window.event;

          self.onResize(function(){
            var varianceX, varianceY;
            varianceX = e.clientX - x;
            varianceY = e.clientY - y;

            // 8 directions: left, right, top, bottom,
            //left-top or -bottom, right-top or bottom
            if (cls.indexOf("left") != -1) {
              if(varianceX> width -self.minWidth) varianceX = width -self.minWidth;   //css: min-width: 170px;
              self.setCss({
                width: (width - varianceX) + "px",
                left: (left + varianceX) + "px"
              }, style);
            } else if (cls.indexOf("right") != -1) {
              if(varianceX< self.minWidth-width) varianceX = self.minWidth-width;
              self.setCss({
                width: (width + varianceX) + "px",
              }, style);
            }
            if (cls.indexOf("top") != -1) {
              if(varianceY> height -self.minHeight) varianceY = height -self.minHeight; //css: min-height: 130px;
              self.setCss({
                height: (height - varianceY) + "px",
                top: (top + varianceY) + "px"
              }, style);
            } else if (cls.indexOf("bottom") != -1) {
              if(varianceY< self.minHeight - height) varianceY = self.minHeight - height;
              self.setCss({
                height: (height + varianceY) + "px",
              }, style);
            }
          }, e)

        };
        var dup = function () { //mouseup, makes position variables inherent to the window
          self.removeEvent(d, "mousemove", dmove);
          self.removeEvent(d, "mouseup", dup);
          self.width = win.offsetWidth;
          self.height = win.offsetHeight;
          self.top = win.offsetTop;
          self.left = win.offsetLeft;
          if (self.top < -10) { // stretches to maximum height
            var _height = d.body.offsetHeight;
            self.top = 0;
            self.setCss({
              height: _height + "px",
              top: 0
            });
          } else if (self.top < 0) { //makes sure the window doesn't go beyond the top edge of the page
            self.top = 0;
            self.setCss({
              top: 0
            });
          }
        };
      self.addEvent(d, "mousemove", dmove);
      self.addEvent(d, "mouseup", dup);
      });
    },
    /**
     * binds click events
     * @return {[type]} [description]
     */
    _bindEvents: function () {
      var self = this;
      this.$(this.id + "_dragger").ondblclick = function (e) { //maximises the window when double click occurs to dragger
        e = e || window.event;
        if (self.btnGroup[1]) self.maximise();
      };
      if (this.btnGroup[0])
        this.$(this.id + "_minimise").onclick = function (e) {
          e = e || window.event;
          self.minimise();
        };
      if (this.btnGroup[1])
        this.$(this.id + "_maximise").onclick = function (e) {
          e = e || window.event;
          self.maximise();
        };
      if (this.btnGroup[2])
        this.$(this.id + "_close").onclick = function (e) {
          e = e || window.event;
          self.close();
        };
      this.win.onclick = function (e) {
        e = e || window.event;
        self.onClick(e);
      };
      this.win.onmousedown = function (e) {
        e = e || window.event;
        e.__mousedown_on_window__ = true;
        self.onMouseDown(e);
        self.pushToTail();
      };
      this.win.onmouseenter = function (e) {
        e = e || window.event;
        self.wins.__current_mouse_on_window__ = self;
      };
      /// when trying to call droppedOn(), using the variable set above,
      /// set 'wins.__current_mouse_on_window__.__objects_were_dragged_on__ = true',
      /// and then this function runs inside brackets.
      this.win.onmouseup = function(e){
        e = e || window.event;
        if(self.__objects_were_dragged_on__){
          e.drop = self.droppedOn(e, self.__objects_dropped__);
          self.__objects_were_dragged_on__ = false;
        }
      };
      this.addEvent(window, "resize", function(){
        var wins = self.wins;
        for (var i = 0; i < wins.length; i++) {
          var win = wins[i].win;
          if(win.offsetTop<-10){
            wins[i].setCss({
              top: 0 + 'px'
            });
            wins[i].top = 0;
          }
          if(win.offsetLeft > document.body.offsetWidth - 200){
            wins[i].setCss({
              left: document.body.offsetWidth - 200 +'px'
            });
            wins[i].left = document.body.offsetWidth - 200;
          }
          if(win.offsetLeft < -(win.offsetWidth-200)){
            wins[i].setCss({
              left: win.offsetWidth-200 +'px'
            });
            wins[i].left = win.offsetWidth - 200;
          }
          var btn = wins[i].$(wins[i].id+"_maximise");
          if(btn&&wins[i].hasClass(btn, 'max')){
            var b = document.body;
            wins[i].setCss({
              width: b.offsetWidth + "px",
              height: b.offsetHeight + "px",
              top: b.scrollTop + "px",
              left: b.scrollLeft + "px"
            });
          }
        }
      });
    },
    /**
     * maximises the window or undoes maximisation
     * @return {[type]} [description]
     */
    maximise: function () {
      var b = document.body;
      var btn = this.$(this.id + "_maximise");
      var self = this;

      if (!this.hasClass(btn, "max")) { //if is maximisation

        this.onMaximise(function(){

          self.setCss({
            width: b.offsetWidth + "px",
            height: b.offsetHeight + "px",
            top: b.scrollTop + "px",
            left: b.scrollLeft + "px"
          });
          self.addClass(btn, "max");
          self.$(self.id + "_resize").style.visibility = "hidden";
          //makes sure the window doesn't go beyond the top edge of the page
          if (self.top < 0) self.top = 0;
          var t = b.offsetWidth - self.width;
          if (self.left > t) self.left = t + b.scrollLeft;
          t = b.offsetHeight;
          if (self.top > t - 45) self.top = t - 45 + b.scrollTop;

          self.afterMaximise();

        })


      } else { // if not

        this.onUndoMaximise(function(){

          self.setCss({
            width: self.width + "px",
            height: self.height + "px",
            top: self.top + "px",
            left: self.left + "px"
          });
          self.removeClass(btn, "max");
          self.$(self.id + "_resize").style.visibility = "visible";

          self.afterUndoMaximise();

        })
      }
    },
    /**
     * minimises the window
     * @return {[type]} [description]
     */
    minimise: function () {

      var self = this;
      this.onMinimise(function(){

        self.hide();
        self.pushToHead();

        self.afterMinimise();
      })
      return this;
    },
    /**
     * undoes minimisation
     * @return {[type]} [description]
     */
    undoMinimise: function () {
      var self = this;
      this.onUndoMinimise(function(){
        self.show();
        self.pushToTail();

        self.afterUndoMinimise();
      })
      return this;
    },
    /**
     * closes the window
     * @return {[type]} [description]
     */
    close: function () {

      var self = this;

      this.onClose(function(){

        var wins = self.wins;
        self.win.parentNode.removeChild(self.win); //removes it from DOM
        wins.splice(wins.indexOf(self), 1);  //removes it from group
        wins.args.count--;
        if (wins.length > 0) {
          self.select(wins[wins.length - 1]);
        }

        self.afterClose();
      })
      return this;
    },
    _contentSelection: function(){
      var self = this;
      var children = this.$(this.id + "_content").children;
      for (var i = 0; i < children.length; i++) {
        if(this.hasClass(children[i], "window-content-selection")){
          this.addEvent(children[i], "mousedown", function (e){
            e = e || window.event;
            var x = e.clientX || e.offsetX,
            y = e.clientY || e.offsetY,
            sTop = this.offsetTop + this.parentNode.offsetTop + self.win.offsetTop,
            sLeft = this.offsetLeft + this.parentNode.offsetLeft + self.win.offsetLeft,
            selectionContent = this,
            moved = false,
            area;

            var dmove = function (e) { //mousemove
              e = e || window.event;
              var mx = e.clientX;
              var my = e.clientY; //(mx, my), end point
              if(!moved&&Math.abs(mx-x)<5&&Math.abs(my-y)<5) return;
              var width = 0;
              var height = 0;
              var top = y - sTop + selectionContent.scrollTop;
              var left = x - sLeft + selectionContent.scrollLeft;
              if(!moved){
                area = document.createElement('div');
                area.className = 'window-selection-area';
                selectionContent.appendChild(area);
              }
              if(mx-x>0) {
                width = mx-x;
              } else {
                width = x-mx;
                left = x - sLeft - width + selectionContent.scrollLeft;
              }
              if(my-y>0){
                height = my-y;
              } else {
                height = y-my;
                top = y - sTop - height + selectionContent.scrollTop;
              }
              area.style.top = top+'px';
              area.style.left = left+'px';
              area.style.height = height+'px';
              area.style.width = width+'px';
              area.style.zIndex = 10;

              moved = true;
            };
            var dup = function (e) { //mouseup, makes position variables inherent to the window
              self.removeEvent(document, "mousemove", dmove);
              self.removeEvent(document, "mouseup", dup);
              if(!moved) return;
              if(area)selectionContent.removeChild(area);
              selectionContent.style.zIndex = "auto";
            };
            self.addEvent(document, "mousemove", dmove);
            self.addEvent(document, "mouseup", dup);
          });

        }
      }
    },
    /**
     * pushes the window to the tail of the array and displays it on the front and selects the window
     * @return {[type]} [description]
     */
    pushToTail: function () {
      var wins = this.wins;
      var i = wins.indexOf(this);

      if(i == wins.length -1){ //is already the tail
        if (this.hasClass(this.win, "deselected")) {
          this.select();
        }
        return this;
      }

      wins.splice(i, 1); // removes it from the array
      wins.push(this);  // adds it back as the tail
      var preWin = wins[wins.length - 2];
      this.select().deselect(preWin); //selects this and deselects the previous one
      return this;
    },
    /**
     * pushes the window to the head of the array
     * @return {[type]} [description]
     */
    pushToHead: function () {
      var wins =this.wins;
      if (wins.length <= 1) return this;
      var i = wins.indexOf(this);
      for (; i > 0; i--) {
        wins[i] = wins[i - 1];
      }
      wins[0] = this;
      this.setCss({
        z_index: wins[1].win.style.zIndex - 1
      });
      var preWin = wins[wins.length - 1];  // previous window
      this.deselect().select(preWin);
      return this;
    },

    deselect: function (Win) {
      var Win = Win || this;
      if (this.addClass(Win.win, "deselected")) {
        var style = this.$(Win.id+"_style");
        this.setCss({
          background_color: "#fff",
          border: "1px solid #b5b9c0"
        }, style);
      }
      return this;
    },
    select: function (Win) {
      var Win = Win || this,
        color = Win.color;
      this.removeClass(Win.win, "deselected");
      var style = this.$(Win.id+"_style");
      this.setCss({
        background_color: color,
        border: "1px solid " + color,
        z_index: ++(this.wins.args.z_index)
      }, style);
      return this;
    },
    addEvent: function (ele, type, cb) {
      if (ele.addEventListener) {
        ele.addEventListener(type, cb, false);
      } else if (ele.attachEvent) {
        ele.attachEvent('on' + type, cb);
      } else {
        ele['on' + type] = cb;
      }
    },
    removeEvent: function (ele, type, cb) {
      if (ele.removeEventListener) {
        ele.removeEventListener(type, cb, false);
      } else if (ele.detachEvent) {
        ele.detachEvent('on' + type, cb);
      } else {
        ele['on' + type] = null;
      }
    },
    stopPropagation: function (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
    },
    /**
     * sets css
     * @param {[type]} obj   css
     * @param {[type]} style style element
     */
    setCss: function(obj, style){
      var style = style||this.$(this.id+"_style");
      if(this.browser.indexOf('IE')!=-1||this.browser.indexOf('Edge')!=-1){
        var ele = style.parentNode;
        for(var key in obj){
          var value = obj[key];
          var _ = key.indexOf('_');

          if(_!=-1){
            key = key.replace(/_./, key[_+1].toUpperCase());
          }
          var _style = ele.style;
          _style[key] = value;
        }
      }else {
        css = style.innerHTML,
        regs = "";
        for(var key in obj){
          regs = "([;\\{]\\s*"+key.replace("_","-")+"\\s*:\\s*)[^;]*([;\\}]{1,2})";
          css = css.replace(new RegExp(regs), "$1"+obj[key]+"$2");
        }
        style.innerHTML = css;
      }
    },
    /**
     * gets css (unused)
     * @param  {[type]} arr names
     * @return {[type]}     values
     */
    getCss: function(arr){
      var style = this.$(this.id+"_style"),
        css = style.innerHTML,
        regs = "",
        i = 0;
      for(;i<arr.length;i++){
        regs = ".*\\b"+arr[i].replace("_","-")+"\\s*:\\s*([^;]*)[;\\}]";
        var match = css.match(new RegExp(regs));
        if(match)
          arr[i] = match[1];
        else arr[i] = "";
      }
      return arr;
    },
    getStyle: function(element, att){
      if(window.getComputedStyle)
        return window.getComputedStyle(element)[att];
      else
        return element.currentStyle[att];
    },
    hide: function(){
      var win = this.win;
      win.style.visibility = "hidden";
      this.hidden = true;
    },
    show: function(){
      var win = this.win;
      win.style.visibility = "visible";
      this.hidden = false;
    },
    $: function (s) {
      return document.getElementById(s);
    },
    /**
     * adds classname
     * @param {[type]} obj  [description]
     * @param {[type]} cls  [description]
     * @param {[type]} flag when true, adds the class whether or not it already exists
     */
    addClass: function (obj, cls, flag) {
      if (!flag&&this.hasClass(obj, cls)) return false;
      var obj_class = obj.className,
        blank = (obj_class !== '') ? ' ' : '';
      added = obj_class + blank + cls;
      obj.className = added;
      return true;
    },
    removeClass: function (obj, cls) {
      var obj_class = ' ' + obj.className + ' ';
      obj_class = obj_class.replace(/(\s+)/gi, '  ');
      var removed = obj_class.replace(new RegExp("\\s"+cls+"\\s", "g"), ' ');
      removed = removed.replace(/(^\s+)|(\s+$)/g, '');
      obj.className = removed;
    },
    hasClass: function (obj, cls) {
      var classes = obj.className,
        class_lst = classes.split(/\s+/);
      x = 0;
      for (; x < class_lst.length; x++) {
        if (class_lst[x] == cls) {
          return true;
        }
      }
      return false;
    },
    getBrowser: function(){
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
  };
  window.Win = Win;
})();
