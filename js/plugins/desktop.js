(function(){

  var Desktop = function(obj){
    if (!window.Win) throw new Error("'Win' not found.");

    this.color = obj.color || this.color || "#515c6b";
    this.id = obj.id || this.id || "desktop";
    this.windowContainerId = "window_container";

    this.__current_mouse_on__ = "DESKTOP";

    this._initiate();

    this.browser = this.getBrowser();
  }
  Desktop.prototype = {

    itemParameters: {
      interval: [76, 110],
      column: 0,  //column, row
      row: 0,
      selectedColumns: [-1, -1], //[left column number, right column number] selectedColumns are from left No. to the number before right No.
      width: 72,
      lattice: [], //lattice[column][row] two dimension array
    },

    _initiate: function(){
      this.wins = document.getElementById(this.windowContainerId).wins;

      document.body.style.height = document.getElementById('height_keeper').offsetHeight-40 + 'px';
      this._DOM();
      this._initiateLattice();
      this._bindEvents();
      var self = this;
      this.addEvent(window, "resize", function(e){
        self._onScreenResize(e);
      });
      // close the menu when clicking on elsewhere
      var checkbox = document.getElementById('start_menu_switch');
      var self = this;
      this.addEvent(checkbox, "click", function(){
        if(checkbox.checked){
          var tf = function(e){
            if(e.target == checkbox || e.__mousedown_on_start_menu__ || e.__mousedown_on_taskbar__) return;
            e.__mousedown_on_start_menu__ = false;
            e.__mousedown_on_taskbar__ = false;
            checkbox.checked = false;
            self.removeEvent(self.desktop, 'mousedown', tf);
            self.removeEvent(checkbox, 'click', tf);
          }
          self.addEvent(self.desktop, 'mousedown', tf);
          self.addEvent(checkbox, 'click', tf);
        }
      });

      this.addNewDesktopItem("Newest Folder: I am a new folder", "test_folder1", 0, 0, true);
      this.addNewDesktopItem("Workspace", "test_folder2", 1, 0, true);
      this.addNewDesktopItem("2018.02.39 Module specification - Available to students Jan 2018", "test_folder3", 2, 0, true);
      this.addNewDesktopItem("Added item 1", "test_id_1", 0, 2, true);
      this.addNewDesktopItem("Added item 2", "test_id_2", 4, 3, true);
      this.addNewDesktopItem("Added item 1", "test_id_3", 2, 2, true);
      this.addNewDesktopItem("Added item 2", "test_id_4", 8, 1, true);
      this.addNewDesktopItem("Added item 3", "test_id_5", 8, 2, true);
    },
    _DOM: function(){
      this.desktop = document.getElementById('desktop');

    },
    _bindEvents: function(){
      var self = this;
      document.getElementById('start_menu').onmousedown = function (e) {
        e = e || window.event;
        e.__mousedown_on_start_menu__ = true;
      };
      document.getElementById('taskbar').onmousedown = function (e) {
        e = e || window.event;
        e.__mousedown_on_taskbar__ = true;
      }
      this.addEvent(this.desktop, "mousedown", function (e) {
        e = e || window.event;
        if(!e.__mousedown_on_selected_items__){
          var input = self.getCheckedItemInput()
          if(input&&e.target!=input) input.checked = false;
          self._deselectLattice();
        }
      });
      this.desktop.onclick = function (e) {
        e = e || window.event;
      };
      this.addEvent(document.getElementById("desktop_selection_container"), "mouseenter", function (e) {
        e = e || window.event;
        self.__current_mouse_on__ = "DESKTOP";
      });
      this.addEvent(document.getElementById("desktop_items_container"), "mouseover", function (e) {
        e = e || window.event;
        self.__current_mouse_on__ = "DESKTOPITEMS";
        self.__current_mouse_on_item__ = e.target.parentNode;
      });
      this.addEvent(document.getElementById(this.windowContainerId), "mouseenter", function (e) {
        e = e || window.event;
        self.__current_mouse_on__ = "WINDOWS";
      });
      this.addEvent(document.getElementById("taskbar"), "mouseenter", function (e) {
        e = e || window.event;
        self.__current_mouse_on__ = "TASKBAR";
      });
      this.addEvent(document.getElementById("start_menu"), "mouseenter", function (e) {
        e = e || window.event;
        self.__current_mouse_on__ = "STARTMENU";
      });
      this._selectItemsOnDesktop();
    },
    _selectItemsOnDesktop: function(){
      var container = document.getElementById("desktop_selection_container");
      var self = this;
      /**
       * Selection area
       * @type {[type]}
       */
      this.addEvent(container, 'mousedown', function(e){
        e = e || window.event;
        var x = e.clientX;  //(x, y), start point
        var y = e.clientY;
        var moved = false;

        var dmove = function(e){
          e = e || window.event;
          var mx = e.clientX;
          var my = e.clientY; //(mx, my), end point

          if(!moved&&Math.abs(mx-x)<5&&Math.abs(my-y)<5) return;

          var width = 0;
          var height = 0;
          var top = y;
          var left = x;
          var max_height = "none";
          var area = document.getElementById('selection_area');
          var style = document.getElementById('selection_area_style');
          if(!area){
            area = document.createElement('div');
            area.id = 'selection_area';
            var style = document.createElement('style');
            style.id = 'selection_area_style'
            style.innerHTML ="#selection_area{"+
            "width:"+0+"px"+
            ";height:"+0+"px"+
            ";top:"+0+"px"+
            ";left:"+0+"px"+
            ";}";
            area.appendChild(style);
            container.appendChild(area);

            self._deselectLattice();
          }
          if(mx-x>0) {
            width = mx-x;
          } else {
            width = x-mx;
            left = x-width;
          }
          if(my-y>0){
            height = my-y;
            var ch = container.offsetHeight;
            if(height>=ch-y) height=ch-y;
          } else {
            height = y-my;
            if(height >= y) height = y;
            top = y-height;
          }
          self.setCss({
            top: top+'px',
            left: left+'px',
            height: height+'px',
            width: width+'px'
          }, style);
          container.style.zIndex = 10;

          var input = self.getCheckedItemInput();
          if(input) input.checked = false;

          self._selectColumns(x, mx);
          self._selectRows(y, my);

          moved = true;
        };
        var dup = function(e){
          self.removeEvent(document, 'mousemove', dmove);
          self.removeEvent(document, 'mouseup', dup);
          if(!moved) return;
          var area = document.getElementById('selection_area');
          if(area)container.removeChild(area);
          container.style.zIndex = "auto";
        };
        self.addEvent(document, 'mousemove', dmove);
        self.addEvent(document, 'mouseup', dup);
      });
    },
    _selectColumns: function(x, mx){
      var p = this.itemParameters;
      var intervalX = p.interval[0];
      var left = Math.max(Math.min(x, mx)-0.75*p.width, -1);
      var left_n = Math.floor(left/intervalX) +1;
      var right = Math.max(x, mx) +0.75*p.width;
      var right_n = Math.floor(right/intervalX)-1;
      var selectedColumns = p.selectedColumns;
      if(selectedColumns[0] == left_n && selectedColumns[1] == right_n) return;
      //columns newly deselected
      //if the mouse moves in normal speed, count should be 1
      //but if the mouse moves fast it may stride across several columns
      var deselected =-1;

      var old_selected = [];
      for (var j=0, i = selectedColumns[0]; i <= selectedColumns[1]; i++, j++) {
        old_selected[j] = i;
      }
      var new_selected = [];
      for (var j=0, i = left_n; i <= right_n; i++, j++) {
        new_selected[j] = i;
      }
      Array.prototype.minus = function (arr) {
        var result = new Array();
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
            obj[arr[i]] = 1;
        }
        for (var j = 0; j < this.length; j++) {
            if (!obj[this[j]])
            {
                obj[this[j]] = 1;
                result.push(this[j]);
            }
        }
        return result;
      };
      deselected = old_selected.minus(new_selected);
      var columns_deselected = [];

      for (var i = 0; i < deselected.length; i++) {
        columns_deselected.push(p.lattice[deselected[i]]);
      }

      for (var i = 0; i < columns_deselected.length; i++) {
        column = columns_deselected[i];
        if(!column) continue;
        for (var j = 0; j < column.length; j++) {
          var item = column[j];
          if(!item) continue;
          this.removeClass(item, "desktop-item-selected");
          item.selected = false;
        }
      }
      selectedColumns[0] = left_n;
      selectedColumns[1] = right_n;
    },
    _selectRows: function(y, my){
      var p = this.itemParameters;
      var lattice = p.lattice;
      var self = this;
      var select = function(item, column, row){
        self.addClass(item, "desktop-item-selected");
        item.selected = true;
      };
      var deselect = function(item, column, row){
        self.removeClass(item, "desktop-item-selected");
        item.selected = false;
      }
      var column = [];
      for (var k = p.selectedColumns[0]; k <= p.selectedColumns[1]; k++) {
        //since height of an item is unfixed, all items above bottom edge of the area within the column need to be computed
        column = p.lattice[k];
        if(!column) continue;
        for (var i = 0; i<column.length; i++) {
          var item = column[i];
          if(!item) continue;
          var item_select_top = item.offsetTop+item.offsetHeight*0.25;
          var item_select_bottom = item.offsetTop+item.offsetHeight*0.75;
          if(my>y){
            if((item_select_top>=y&&item_select_top<=my)||(item_select_bottom>=y&&item_select_bottom<=my)
                  ||(item_select_bottom>my&&item_select_top<y)){
              if(!item.selected)select(item, k, i);
            }else {
              if(item.selected)deselect(item, k, i);
            }
          }else {
            if((item_select_top>=my&&item_select_top<=y)||(item_select_bottom>=my&&item_select_bottom<=y)
                  ||(item_select_bottom>y&&item_select_top<my)){
              if(!item.selected)select(item, k, i);
            }else {
              if(item.selected)deselect(item, k, i);
            }
          }
        }
      }
    },
    _deselectLattice: function(){
      var p = this.itemParameters;
      var columns = p.lattice;
      var column = [];
      for (var i = 0; i <= p.column; i++) {
        column = columns[i]; if(!column) continue;
        for (var j = 0; j < column.length; j++) {
          var item = column[j];
          if(!item) continue
          if(!item.selected) continue;
          this.removeClass(item, "desktop-item-selected");
          item.selected = false;
        }
      }
      p.selectedColumns[0] = -1;
      p.selectedColumns[1] = -1;
    },
    getSelectedItems: function(){
      var p = this.itemParameters;
      var items = [];
      for (var i = 0; i <= p.column; i++) {
        for (var j = 0; j <= p.row; j++) {
          var item = p.lattice[i][j];
          if(item&&item.selected) items.push(item);
        }
      }
      return items;
    },
    getCheckedItemInput: function(){
      var inputs = document.getElementsByName('desktop-item-check');
      var checkedOne;
      for(var i=0; i<inputs.length; i++){
        if(inputs[i].checked) {
          checkedOne = inputs[i];
          return checkedOne;
        }
      }
    },
    addNewDesktopItem: function(name, id, column, row, assert){
      if(!this.checkAvailablePosition(column, row, assert)) return false;
      var item = document.createElement('div');

      item.className = 'desktop-item';
      item.id = id;
      item.data = {};
      item.data.name = name;
      item.data.droppable = true;
      var html = ''+
        '<div class="item-icon">'+
          '<span class="icon-window-folder"><span class="icon-window-folder-inner"></span></span>'+
        '</div>'+
        '<input type="radio" ondblclick="desktop.createWindow(this);this.checked=false" name="desktop-item-check" class="item-check" onblur="this.parentNode.style.zIndex=\'auto\';" onfocus="this.parentNode.style.zIndex=1;">'+
        '<div class="item-background"></div>'+
        '<div class="item-text" data-title="${name}"></div>';

      html = html.replace("${name}", name);

      item.style.left = column *this.itemParameters.interval[0] +'px';
      item.style.top = row *this.itemParameters.interval[1] +'px';
      item.innerHTML = html;
      item.column = column;
      item.row = row;
      var self = this;
      this.addEvent(item, "click", function(e){
        if(!self.__mouseup_from_dragging_items__){
          if(item.selected) self._deselectLattice();
        }else {
          delete self.__mouseup_from_dragging_items__;
        }
      });

      this.addEvent(item, "mousedown", function(e){
        if(this.selected) e.__mousedown_on_selected_items__ = true; //select
        else e.__mousedown_on_selected_items__ = false;

        var children = item.children;
        for (var i = 0; i < children.length; i++) {
          if(children[i].tagName.toUpperCase() == "INPUT")
          children[i].checked = true;
        }

        // if(this.droppable&&this.parentNode.id=='desktop_items_container'){
        //   self.__current_mouse_on__ = "DROPPABLEITEM";
        // }

        self._dragItem(e, this);  //drag
      });
      this.itemParameters.lattice[column][row] = item;
      var container = document.getElementById('desktop_items_container');
      container.appendChild(item);
      return true;
    },
    _dragItem: function(e, item){ //dragging selected items
      e = e || window.event;
      var x = e.clientX;
      var y = e.clientY;
      var moved = false;

      var draggingItems = [];
      var self = this;
      var dmove = function(e){
        e = e || window.event;
        var mx = e.clientX;
        var my = e.clientY;
        if(!moved&&Math.abs(mx-x)<5&&Math.abs(my-y)<5) return;

        if(!moved){  //first move
          var dc = document.createElement('div');

          var opacity = 0.63;
          var origin = [item.column, item.row];
          draggingItems = self.getSelectedItems();
          if(draggingItems.length>0){
            for (var i = 0; i < draggingItems.length; i++) {
              var _item = draggingItems[i];
              var copyItem = _item.cloneNode(true);
              _item.dragging = true;
              if(_item == item){
                copyItem.style.opacity = opacity;
                var children = copyItem.children;
                for (var j = 0; j < children.length; j++) {
                  if(children[j].tagName.toUpperCase() == "INPUT"){
                    children[j].checked = false;
                  }
                }
              }else {
                var position = [_item.column, _item.row];
                var distance = Math.sqrt(Math.pow((position[0]-origin[0]),2)+Math.pow((position[1]-origin[1]),2));
                var ac = 1/((Math.pow(1.1*(distance),2)+2) *0.5);//attenuation coefficient
                copyItem.style.opacity = ac *opacity;
              }
              self.addClass(copyItem, "desktop-item-dragging-shawdow");
              copyItem.id = item.id + "__XCRJGqbCPSFO";
              dc.appendChild(copyItem);
            }
          }else {
            var copyItem = item.cloneNode(true);
            item.dragging = true;
            var children = copyItem.children;
            for (var i = 0; i < children.length; i++){
              if(children[i].tagName.toUpperCase() == "INPUT"){
                children[i].checked = false;
              }
            }
            self.addClass(copyItem, "desktop-item-dragging-shawdow");
            copyItem.style.opacity = opacity;
            copyItem.id = item.id + "__XCRJGqbCPSFO";
            dc.appendChild(copyItem);
            draggingItems[0] = item;
          }
          dc.id = "__XCRJGqbCPSFO"
          dc.style.height = '100%';
          dc.style.width = '100%';
          dc.style.zIndex = '9999999';
          dc.style.position = 'fixed';
          dc.style.top = my-y +'px';
          dc.style.left = mx-x +'px';
          dc.style.pointerEvents = "none"; //penetration

          var tag = document.createElement('div');
          tag.id = "__XCRJGqbCPSFO1";
          tag.className = "desktop-item-dragging-tag";
          tag.style.height = 20 +'px';
          tag.style.zIndex = 2;
          tag.style.overflow = "hidden";
          tag.style.maxWidth = "330px";
          tag.style.visibility = "hidden";
          dc.appendChild(tag);
          self.desktop.appendChild(dc);
        }else { //moving
          var dc = document.getElementById('__XCRJGqbCPSFO');
          var tag = document.getElementById('__XCRJGqbCPSFO1');
          var tagDOM = function(action, aim){
            tag.style.visibility = "visible";
            tag.innerHTML = ""+
                "<p class='desktop-item-dragging-tag-p'>"+
                "<span class='desktop-item-dragging-tag-action'>"+ action +"</span>"+
                "<span class='desktop-item-dragging-tag-aim'>"+ aim +"</span></p>";
            tag.style.top = Math.min(my+12, document.body.offsetHeight+20) +'px';
            tag.style.left = Math.min(mx+13, document.body.offsetWidth-tag.offsetWidth) +'px';
          }
          switch (self.__current_mouse_on__) {
            case "DESKTOP":
              tag.style.visibility = "hidden";
            break;
            case "WINDOWS":
              var Win = self.wins.__current_mouse_on_window__;
              tagDOM("Move to: ", Win.name);
              Win.__objects_were_dragged_on__ = true;
              for (var i = 0; i < self.wins.length; i++) {
                if(self.wins[i]!=Win) self.wins[i].__objects_were_dragged_on__ = false;
              }
              Win.__objects_dropped__ = {items: draggingItems};
            break;
            case "DESKTOPITEMS":
              var onItem = self.__current_mouse_on_item__;
              if(!onItem.dragging&&onItem.data.droppable) tagDOM("Move to: ", onItem.data.name);
              else{
                self.__current_mouse_on__ = "DESKTOP";
                tag.style.visibility = "hidden";
              }
              break;
            default:
            tag.style.visibility = "hidden";
          }
          dc.style.top = my-y +'px';
          dc.style.left = mx-x +'px';
        }
        moved = true;
      };
      var dup = function(e){
        e = e || window.event;
        var dc = document.getElementById('__XCRJGqbCPSFO');
        if(dc) self.desktop.removeChild(dc);
        self.removeEvent(document, 'mousemove', dmove);
        self.removeEvent(document, 'mouseup', dup);
        if(!moved) return;
        if(self.__current_mouse_on__ == "DESKTOP"){
          var ux = e.clientX;
          var uy = e.clientY;
          var p = self.itemParameters;
          var mousePos = [];
          mousePos[0] = Math.max(Math.min(Math.floor(ux/p.interval[0]), p.column), 0);
          mousePos[1] = Math.max(Math.min(Math.floor(uy/p.interval[1]), p.row), 0);
          var Sx = mousePos[0] -item.column;
          var Sy = mousePos[1] -item.row;
          var customInsert = function(item, column, row, force){
            if(column>p.column) column = p.column;
            if(row>p.row) row = p.row;
            if(column<0) column = 0;
            if(row<0) row = 0;
            var _column, _row;
            if(self.checkAvailablePosition(column, row)){  //inserts the item to the the position if it's vacant
              _column = column;
              _row = row;
            }else if(row<=p.row){ //inserts to the position below
              _column = column;
              _row = row;
            }else if (force&&mousePos[1]+1>p.row) { //inserts to bottom-right corner
              _column = column;
              if(_column++<=p.column)
                _row = 0;
              else {
                _column = p.column;
                _row = p.row;
              }
            }
            if(_row!=undefined)
              return self.insertDesktopItemTo(item, [_column, _row]);
          }
          if(Sx || Sy){
            var reverseColumns = function(draggingItems, reverseRows){ //reverse column order
              var obj = {};
              var columns = [];
              for (var i = draggingItems.length-1; i >= 0; i--) {
                var column_n = draggingItems[i].column;
                if(!obj[column_n]) obj[column_n] = [];
                obj[column_n].push(draggingItems[i]);
                if(columns.length>0){
                  if(column_n!=columns[columns.length-1]) //new column numbeer
                    columns.push(column_n);
                }else {
                  columns.push(column_n);
                }
              }
              var reversedDraggingItems = [];
              for (var i = 0; i < columns.length; i++) {
                var column = obj[columns[i]];
                if(!reverseRows)
                  for (var j = column.length-1; j >=0; j--) {
                    reversedDraggingItems.push(column[j]);
                  }
                else
                  for (var j = 0; j <column.length; j++) {
                    reversedDraggingItems.push(column[j]);
                  }
              }
              return reversedDraggingItems;
            };

            if(Sx>0){
              draggingItems = reverseColumns(draggingItems);
            }
            if(Sx==0&&Sy>0){
              draggingItems = reverseColumns(draggingItems, true);
            }
            for (var i = 0; i < draggingItems.length; i++) {
              var _item = draggingItems[i];
              self.popDesktopItemFrom(_item.column, _item.row);
              if(!customInsert(_item, _item.column+Sx, _item.row+Sy))
                self.putDesktopItemTo(_item, _item.column, _item.row);
            }
          }else {
            self.__mouseup_from_dragging_items__ = true;
          }
        }
        for (var i = 0; i < draggingItems.length; i++) {
          delete draggingItems[i].dragging;
        }
      };
      self.addEvent(document, 'mousemove', dmove);
      self.addEvent(document, 'mouseup', dup);
    },
    _initiateLattice: function(){
      var p = this.itemParameters;
      var container = document.getElementById('desktop_container');
      var containerHeight = container.offsetHeight -6;  //minus margins
      var containerWidth = container.offsetWidth -1;
      var row = Math.floor(containerHeight/p.interval[1]) -1;
      var column = Math.floor(containerWidth/p.interval[0]) -1;
      p.lattice = new Array(column+1);
      for (var i = 0; i < column+1; i++) {
        p.lattice[i] = new Array(row+1);
      }
      p.column = column;
      p.row = row;
    },
    _resetLattice: function(){
      var p = this.itemParameters;
      var container = document.getElementById('desktop_container');
      var containerHeight = container.offsetHeight -6;  //minus margins
      var containerWidth = container.offsetWidth -1;
      var row = Math.floor(containerHeight/p.interval[1]) -1;
      var column = Math.floor(containerWidth/p.interval[0]) -1;
      if(row == p.row && column == p.column) return;  //nothing changes
      if(column>p.column){ //adds columns
        for (var i = p.column+1; i <= column; i++) {
          p.lattice[i] = new Array(row+1);
        }
      } else if(column < p.column){ //reduces columns
        var outcasts = [];
        for(var i=p.column; i>column; i--){
          for (var j = 0; j<=p.row; j++) {
            var item = p.lattice[i][j];
            if(item){
              outcasts.push(item);
            }
          }
        }
        outcasts.reverse();
        p.lattice.splice(column+1, p.column-column);
        var round = outcasts.length;
        for (var i = 0; i < round; i++){  //puts outcast items from reduced columns on the right side
          var found = false;                            //find next available stall,
          for (var j = column; j >=0 && !found; j--) {   // from top to bottom, right to left
            for (var k = 0; k <= row && !found; k++) {
              if(this.checkAvailablePosition(j, k, false)){ //could be false
                var item = outcasts.pop();
                this.putDesktopItemTo(item, j, k)
                found = true;
              }
            }
          }
          if(!found){
            for (var i = 0; i < outcasts.length; i++) {
              outcasts[i].style.display = "none";
            }
            console.warn(outcasts.length+" column outcasts remain");
            break;
          }
        }
      }
      var minCol = Math.min(column, p.column);
      if(row > p.row){
        for (var i = 0; i < minCol; i++) { //adds rows
          for (var j = p.row+1; j <= row; j++) {
            p.lattice[i][j] = undefined;
          }
        }
      }
      else if(row < p.row){
        var outcasts = [];
        for(var i=0; i<=minCol; i++){
          for (var j = row+1; j<=p.row; j++) {
            var item = p.lattice[i][j];
            if(item){
              outcasts.push(item);
            }
          }
          p.lattice[i].splice(row+1, p.row-row);
        }
        outcasts.reverse();
        var round = outcasts.length;
        for (var i = 0; i < round; i++){  //puts outcast items from reduced rows to the left side
          var found = false;                            //find next available stall,
          for (var j = 0; j <=column && !found; j++) {   // from top to bottom, left to right
            for (var k = 0; k <= row && !found; k++) {
              if(this.checkAvailablePosition(j, k, false)){ //could be false
                var item = outcasts.pop();
                this.putDesktopItemTo(item, j, k)
                found = true;
              }
            }
          }
          if(!found){
            for (var i = 0; i < outcasts.length; i++) {
              outcasts[i].style.display = "none";
            }
            console.warn(outcasts.length+" row outcasts remain");
            break;
          }
        }
      }
      p.column = column;
      p.row = row;
    },
    insertDesktopItemTo: function(item, to){
      var p = this.itemParameters;
      var oriPos = [to[0], to[1]];
      var getPreviousPos = function(prePos){
        if(prePos[1]==0){
          prePos[1] = p.row;
          prePos[0]--;
        }else {
          prePos[1]--;
        }
      };
      if(this.checkAvailablePosition(to[0], to[1])){
        // insert directly
        this.putDesktopItemTo(item, to[0], to[1]);
        return true;
      }
      var avaPos = this.nextAvailablePosition(to);
      if(avaPos){ //available on right side
        var prePos = [avaPos[0], avaPos[1]];
        do {
          if(prePos[1]==0){
            prePos[1] = p.row;
            prePos[0]--;
          }else {
            prePos[1]--;
          }
          this.moveDesktopItemTo(prePos, avaPos, true);
          avaPos = [prePos[0], prePos[1]];
        } while (!(avaPos[0]==to[0]&&avaPos[1]==to[1]));
        this.putDesktopItemTo(item, to[0], to[1]);
        return true;
      }else { //searches left
        avaPos = this.nextAvailablePosition(to, true);
        var prePos = [avaPos[0], avaPos[1]];
        if(avaPos){
          do {
            if(prePos[1]==p.row){
              prePos[1] = 0;
              prePos[0]++;
            }else {
              prePos[1]++;
            }
            this.moveDesktopItemTo(prePos, avaPos, true);
            avaPos = [prePos[0], prePos[1]];
          } while (!(avaPos[0]==to[0]&&avaPos[1]==to[1]));
          this.putDesktopItemTo(item, to[0], to[1]);
          return true;
        }else {
          console.warn("Insert failed: no available position");
          return false
        }
      }
    },
    moveDesktopItemTo: function(from, to, assert){
      var lattice = this.itemParameters.lattice;
      if(this.checkAvailablePosition(to[0], to[1], assert)){
        var item = lattice[from[0]][from[1]];
        if(!item){
          console.warn("Item in position ["+from[0]+", "+from[1]+"] does not exist.");
        }else {
          this.putDesktopItemTo(item, to[0], to[1]);
          lattice[from[0]][from[1]] = undefined;
          return true;
        }
      }
      return false;
    },
    popDesktopItemFrom: function(column, row){
      var lattice = this.itemParameters.lattice;
      var item = lattice[column][row];
      lattice[column][row] = undefined;
      return item;
    },
    putDesktopItemTo: function(item, column, row){
      var p = this.itemParameters;
      item.style.left = column *p.interval[0] +'px';
      item.style.top = row *p.interval[1] +'px';
      item.column = column;
      item.row = row;
      p.lattice[column][row] = item;
    },
    getDesktopItems: function(ids){
      var items = document.getElementById('desktop_items_container').children;
      var arr = [];
      if(ids)
      for (var i = 0; i < items.length; i++) {
        for (var j = 0; j < ids.length; j++) {
          if(items[i].id == ids[j])
            arr.push(items[i]);
        }
      }
      else arr = items;
      return arr;
    },
    nextAvailablePosition: function(pos, leftwards){
      var _pos = [pos[0], pos[1]];
      var p = this.itemParameters;
      if(leftwards){
        while(!this.checkAvailablePosition(_pos[0], _pos[1], false)){
          _pos[1]--;
          if(_pos[1]<0&&_pos[0]>0){
            _pos[0]--;
            _pos[1] = p.row;
          }else if (_pos[1]<0&&_pos[0]==0) {
            return false;
          }
        }
      }else {
        while(!this.checkAvailablePosition(_pos[0], _pos[1], false)){
          _pos[1]++;
          if(_pos[1]>p.row&&_pos[0]<p.column){
            _pos[0]++;
            _pos[1] = 0;
          }else if (_pos[1]>p.row&&_pos[0]==p.column) {
            return false;
          }
        }
      }
      return _pos;
    },
    /**
     * [checkAvailablePosition description]
     * @param  {[type]} column [description]
     * @param  {[type]} row    [description]
     * @param  {[type]} assert if assert=true, warning message will print; if assert=false, warning message will not print
     * @return {[type]}        [description]
     */
    checkAvailablePosition: function(column, row, assert){
      var p = this.itemParameters;
      if (column>p.column||row>p.row||column<0||row<0) {
        if(assert) console.warn("Failed to add item, Column or row out of range");
        return false;
      }
      if (p.lattice[column][row]) {
        if(assert) console.warn("Failed to put item into position ("+column+', '+row+'),  stall occupied');
        return false;
      }
      return true;
    },
    _onScreenResize: function(){
      document.body.style.height = document.getElementById('height_keeper').offsetHeight-40 + 'px';
      this._resetLattice();

    },
    closeMenu: function(){
      var checkbox = document.getElementById('start_menu_switch');
      if(checkbox.checked) checkbox.click();
      else console.warn('function closeMenu: menu is close already');
    },
    openMenu: function(){
      var checkbox = document.getElementById('start_menu_switch');
      if(!checkbox.checked) checkbox.click();
      else console.warn('function closeMenu: menu is open already');
    },
    createWindow: function(target){
      var JSONurl = target.getAttribute('data-url');
      if(JSONurl==null||JSONurl==undefined){
        var color, name;
        if(this.hasClass(target, "box")) color = window.getComputedStyle(target).backgroundColor;
        if(target.tagName == 'INPUT'){
          name = target.parentNode.data.name;
        }
        this.addWindow({color: color, name: name});
        this.closeMenu();
        return;
      }
      var self = this;
      this.ajax({
        url: JSONurl,
        success: function(data){
          try {
            var obj = JSON.parse(data);
          } catch (e) {
            console.warn("JSON.parse failed. Please check data format.");
            return;
          }
          self.addWindow({
            name: obj.name,
            iconHTML: obj.iconHTML,
            color: obj.color
          });
          self.closeMenu();
        },
        error: function(){
          console.warn("Cannot get "+JSONurl);
        }
      })
    },
    reopenAllWindows: function(){
      var container = document.getElementById(this.windowContainerId);
      if(!container.wins) return;
      if (container.wins.length==0) return;
      var wins = container.wins,
        callee = arguments.callee;
      if(wins[0].hidden){
        wins[0].undoMinimise();
        var self = this;
        window.setTimeout(function(){
          callee.call(self);
        },200);
      }
      else return;
    },
    addWindow: function(obj){
      var t=0, i = 1,
        wins,
        win,
        b = document.body,
        scWidth = b.clientWidth,
        scHeight = b.clientHeight,
        width, height, top, left, color;
      wins = document.getElementById(this.windowContainerId).wins;
      width = obj.width || 600;
      height = obj.height || 400;
      top = scHeight/2-height/2-20;
      left = scWidth/2-width/2;
      color = obj.color || this.color;
      var iconHTML = obj.iconHTML ||'<span class="icon-window-folder" style="transform: translate(-26%, -30%) scale(0.34);">'+
        '<span class="icon-window-folder-inner"></span></span>';
      var droppedOn = function(e, obj){
        console.log(obj.items);

        for (var i = 0; i < obj.items.length; i++) {
          var copyItem = obj.items[i].cloneNode(true);
          copyItem.id = "";
          copyItem.className = "window-item";
          copyItem.setAttribute("style", "");
          copyItem.getElementsByClassName('item-check')[0].name = "Noname";
          this.$(this.id+'_content').getElementsByClassName('window-content-selection')[0].appendChild(copyItem);
        }
      }
      var afterMinimise = function(){
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.bottom = 0;
        div.style.background = '#fff';
        div.style.color = '#000';
        div.style.fontSize = '13px';
        div.style.maxWidth = '190px';
        div.innerHTML = "Click this little <span style='color:#00009d'>ring</span> to reopen the window<span style='color:#83c'>↓</span>";
        document.body.appendChild(div);
        var self = this;
        setTimeout(function(){
          self.fadeOut(div, 500, 0, function(){
            if(div) div.parentNode.removeChild(div);
          });
        }, 2000);
      }
      if(top<-10) top=0;
      if(left>scWidth-width +10) left = scWidth-width;
      if(!this.window_id_keeper){ //if no window has been added
        this.window_id_keeper = 1;
        var name = obj.name || "new window " + 1;
        new AnimateWin({id:"window_"+1, containerId: this.windowContainerId, name: name,
          iconHTML: iconHTML, color: color, top: top, left:left, width:width, height:height,
          droppedOn: droppedOn, afterMinimise: afterMinimise
        });
        return;
      }
      id = ++this.window_id_keeper;
      win = wins[wins.length-1];

      if(wins.length!=0 && Math.abs(win.left-(scWidth-width)/2)<100){
        top = win.top + 25;
        left = win.left + 25;
      }
      if(top+height>scHeight-10||left+width>scWidth-10){
        var r1 = Math.random(),
          r2 = Math.random(),
          rangeX = scWidth - width - 200,
          rangeY = scHeight - height,
          x;
        if(rangeX<0) rangeX = scWidth - width;
        x = rangeX*r1;
        if(x<left-125) left = x;
        else left = x + 200;
        top = rangeY*r2;
        if(top<0)top=0;
        if(left<0)left=0;
      }
      if(id===3&&!obj.color) color = "#379cd0";
      if(top<-10) top=0;
      if(left>scWidth-width +10) left = scWidth-width;
      var name = obj.name || "new window " + id;
      new AnimateWin({id:"window_"+id, containerId: this.windowContainerId, name: name,
        iconHTML: iconHTML, color: color, top: top, left:left, width:width, height:height,
        droppedOn: droppedOn, afterMinimise: afterMinimise
      });
      return;
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
    /**
     * sets css
     * @param {[type]} obj   css
     * @param {[type]} style style element
     */
    setCss: function(obj, style){
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
        var css = style.innerHTML,
        regs = "";
        for(var key in obj){
          regs = "([;\\{]\\s*"+key.replace("_","-")+"\\s*:\\s*)[^;]*([;\\}]{1,2})";
          css = css.replace(new RegExp(regs), "$1"+obj[key]+"$2");
        }
        style.innerHTML = css;
      }
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
    stopPropagation: function (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
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
    },
    ajax: function(){
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
      var xhr = this._createxmlHttpRequest();
      xhr.open(ajaxData.type,ajaxData.url,ajaxData.async);
      xhr.responseType=ajaxData.dataType;
      xhr.setRequestHeader("Content-Type",ajaxData.contentType);
      xhr.send(this._convertData(ajaxData.data));
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if(xhr.status == 200){
            ajaxData.success(xhr.response)
          }else{
            ajaxData.error()
          }
        }
      }
    },
    _createxmlHttpRequest: function() {
      if (window.ActiveXObject) {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } else if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
      }
    },

    _convertData: function(data){
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
  }

  window.Desktop = Desktop;
})();
