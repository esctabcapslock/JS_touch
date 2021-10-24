

class Touch_Event extends Event {
    constructor(name,info){
        super(name);
        this.client=info.client;
        this.page=info.page;
        this.screen=info.screen;
        this.offset=info.offset;
        this.identifier = info.identifier;

        this.touch_point_cnt = info.client.length;


    }
}

class Touchdown_Event extends Touch_Event{
    constructor(info){
        super('touchdown',info)
        this.direction = n;
    }
}

class Touchup_Event extends Touch_Event{
    constructor(info){
        super('touchup',info)
        this.direction = n;
    }
}

class Touchover_Event extends Touch_Event{
    constructor(info){
        super('touchover',info)
        this.direction = n;
    }
}


class Touchscroll_Event extends Touch_Event{
    constructor(info){
        super('touchscroll',info)
    }
}
class Touchzoom_Event extends Event{
    constructor(info){
        super('touchzoom',info)
        this.direction = n;

        
        this.deltaAngle
        this.deltaZ
    }
}
class Touchclick_Event extends Event{
    constructor(info){
        super('touchclick',info)
    }
}

class Touchdbclick_Event extends Event{
    constructor(info){
        super('touchdbclick',info)
    }
}








class Touch extends EventTarget{
    constructor(dom){
        super();
        this.dom = dom;
        this.points = {};
        this.last_touched_time = null;

        function tl(temp){
            return new Array(temp.length).fill().map((v,i)=>{v=temp.item(i); return  [v.identifier, [v.clientX, v.clientY]]})
        }

        dom.addEventListener('touchstart',e=>{
            //console.log(`[${e.type}]`,e.timeStamp, this.touch_val, this.val)
            tl(e.changedTouches).map(v=>this.points_set(v[0], e.timeStamp, v[1]));
        })
        
        dom.addEventListener('touchmove',e=>{
            //console.log(`[${e.type}]`,e.timeStamp, tl(e.touches).join(', '),  this.touch_val, this.val)
            tl(e.touches).map(v=>this.points_add(v[0], e.timeStamp, v[1]))
            
        })
        dom.addEventListener('touchend',e=>{
            //console.log(`[${e.type}]`,e.timeStamp, tl(e.changedTouches).length, this.touch_val, this.val)
            tl(e.changedTouches).map(v=>this.points_rmv(v[0], e.timeStamp, v[1]));
        })
    
    }

    points_set(){

        this.dispatchEvent

    }
    points_add(){

    }
    points_rmv(){

    }
}