
function add(a,b){return a.map&&a.map((v,i)=>v+b[i])}
function minus(a,b){return a.map&&a.map((v,i)=>v-b[i])}
function mul(a,b){return a.map&&a.map(v=>v*b[i])}
function pf(a,n){return a.map&&a.map(v=>v**n)}
function scalar(k,a){return a.map&&a.map(v=>v*k)}
function dis(a,b){return pf(minus(a,b),2).reduce((a,b)=>a+b,0)**0.5} //console.log('dis',a,b,minus(a,b)); 
function unit(a){let d = pf(a,2).reduce((a,b)=>a+b,0)**0.5; return d?scalar(1/d,a):a}
function det(a,b){return a[0]*b[1]-a[1]*b[0]}
const min = Math.min;

class Drow{

    constructor(svg) {
        //const svg = document.getElementsByTagName('svg')[0]
        this.svg = svg;
        svg.style.width = screen.availWidth+'px'
        svg.style.height = screen.availHeight+'px'

        svg.innerHTML=`
            <g id='paths_dorw'></g>
            <g id='paths'></g>
            <g id='circles'></g>
        `
        const div = document.createElement('div')
        div.id = 'set';
        div.innerHTML =`
        <div id='set'>
            <button id='drow_btn'>그리기</button>
            <button id='remv_btn'>지우기</button>
            <input type="color" id='color_sel'>
        </div>`

        svg.parentNode.append(div);

        this.paths_dorw = svg.querySelector('#paths_dorw');
        this.paths = document.querySelector('#paths');
        this.points = {}
        this.path_list = {}
        this.path_cross = []
        this.path_cnt = 0
        this.drow = true;
        this.path_color = 'black'

        // 이벤트리스너 추가.

                
        //e.targetTouches : 대상 내부
        //e.touches : 대상 내외부
        const tthis = this;
                
        svg.addEventListener("touchstart", e=>{
            e.preventDefault()
            e.returnValue=false;
            //console.log(`[${e.type}]`,e.timeStamp,'\nchangedTouches',this.tl_print(e.changedTouches),'\ntargetTouches',this.tl_print(e.changedTouches),',\ntouches', this.tl_print(e.touches) )
            this.tl_print(e.changedTouches).map(v=>this.point_set(v[0], e.timeStamp,[v[1],v[2]]))
            //this.print_point()
        },{ passive: false });
        svg.addEventListener("touchend", e=>{
            this.tl_print(e.changedTouches).map(v=>this.point_end(v[0], e.timeStamp, [v[1],v[2]]))
            //console.log(`[${e.type}]`,e.timeStamp, this.tl_print(e.changedTouches).join(', '))
        });
        svg.addEventListener("touchcancel", console.log);
        svg.addEventListener("touchmove", e=>{
            //console.log(e)
            this.tl_print(e.touches).map(v=>this.point_push(v[0],e.timeStamp, [v[1],v[2]]))
            this.cross_check()
            
        });

        
        svg.parentNode.querySelector('#drow_btn').addEventListener('click',()=>{
            tthis.drow = true;
        })
        svg.parentNode.querySelector('#remv_btn').addEventListener('click',()=>{
            tthis.drow = false;
        })
        svg.parentNode.querySelector('#color_sel').addEventListener('change',()=>{
            tthis.path_color = svg.parentNode.querySelector('#color_sel').value
        })
    } 


    tl_print(temp){
        return new Array(temp.length).fill().map((v,i)=>{v=temp.item(i); return  [v.identifier, v.clientX, v.clientY]})
    }

    tl(temp){
        return new Array(temp.length).fill().map((v,i)=>temp.item(i));
    }

cross_check(){
    if(this.drow) return;

    
    for(let id in this.points){
        const list = this.points[id];
        if(list.length<=1) continue; //점 1개면 계산못함.

        const a=list[list.length-1][1], b=list[list.length-2][1];
        
        const alpha = minus(a,b);
        if(!dis(alpha,new Array(alpha.length).fill(0))) continue; //점 이동이 없음..

        //console.log('alpha',alpha,)
        
        for(let id in this.path_list){
            const seps = this.path_list[id].value;
            const max = this.path_list[id].max;
            const min = this.path_list[id].min;
           
            if(
                (max[1]<a[1]&&max[1]<b[1]) || (min[1]>a[1]&&min[1]>b[1]) ||
                (max[1]<a[1]&&max[1]<b[1]) || (min[1]>a[1]&&min[1]>b[1])
            ) continue; //만나지 않음!

            for(let i=0; i<seps.length-1; i++){
                const x = seps[i], y = seps[i+1];
                const beta = minus(y,x);
                const gamma = minus(y,b);

                const [r,t] = [det(gamma,beta)/det(alpha, beta), det(alpha, gamma)/det(alpha, beta)]
                if(r<0 || r>1 || t<0 || t>1) continue;

                console.log('cross',r,t,id);
                if(isNaN(r)||isNaN(t)) console.log('nan',alpha,beta, gamma)
                delete this.path_list[id];
                const ele = document.getElementById(id)
                if(ele) ele.remove()
                document.getElementById('circles').innerHTML=''

            }
        }
    }
    
}


point_set(id,time,cold){
    this.points[id]=[[time, cold]];
    
    //점 그리기
    this.dorw_circle(cold)
    
    //그리기 아니면 취소
    if(!this.drow) return

    //path 만들기.
    const d = `M${cold}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path')
    path.id = 'pd'+id;
    path.setAttributeNS(null, 'd', d);
    path.setAttributeNS(null, 'stroke', this.path_color);
    path.setAttributeNS(null, 'stroke-width', "1px");
    path.setAttributeNS(null, 'fill', "none");
    this.paths_dorw.appendChild(path)
}

point_push(id, time, cold){
    if(!this.points[id]) return;// {console.error('!'); return;}

    const ar =  this.points[id]
    const a = ar[ar.length-3]
    const b = ar[ar.length-2]
    const c = ar[ar.length-1]

    const sep = dis(cold, c[1]);
    if(0<sep && sep<=3) return;

    ar.push([time, cold]);
    this.dorw_circle(cold)

    //그리기 아니면 취소
    if(!this.drow) return

    //그리기!
    let d=''
    if(ar.length<3) return;

    const len = dis(b[1], c[1]);
    if(!len) d=`M${c[1]}`
    else{
        const cp2 = add( 
            c[1],
            scalar(
                -0.5*len,
                unit(add(
                    unit(minus(cold, c[1])),
                    unit(minus(c[1],b[1])),
                ))
            )
        )
        this.dorw_circle(cp2,'green')

        if(ar.length==3) d=`C${cp2} ${cp2} ${c[1]}` //b,c,cold
        else{
            //a,b,c,cold
            const cp1 = add(
                b[1],
                scalar(
                    0.5*len,
                    unit(add(
                        unit(minus(c[1], b[1])),
                        unit(minus(b[1], a[1])),
                    ))
                )
            );
            this.dorw_circle(cp1,'blue')
            d=`C${cp1} ${cp2} ${c[1]}`
        }
    }
    //console.log('pd'+id)
    document.getElementById('pd'+id).attributes['d'].value+='\n'+d
    //추가
}

point_end(id,time, cold){
    const list  = this.points[id];
    if(!list) return;
    const top = list[list.length-1]
    const d = `S${top[1]} ${cold}`
    delete this.points[id];
    const path =  document.getElementById('pd'+id)
    if(!path) return;
    path.attributes['d'].value+='\n'+d; 
    path.remove()
    const new_id = 'p'+this.path_cnt++;
    path.id = new_id
    paths.append(path)
    
    const value = list.map(v=>v[1])
    value.push(cold);

    const x = value.map(v=>v[0])
    const y = value.map(v=>v[1])
    const max = [Math.max(...x), Math.max(...y)]
    const min = [Math.min(...x), Math.min(...y)]

    this.path_list[new_id]={max,min,value}
}

print_point(){
    const out=[];
    for(let id in this.points) out.push(id)
    console.log('[print_point]',out)
    
}



dorw_circle(cold,color){
    //return;
    const circles = document.getElementById('circles');
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle')
    
    circle.setAttributeNS(null, 'cx', cold[0]);
    circle.setAttributeNS(null, 'cy', cold[1]);
    circle.setAttributeNS(null, 'r', color?0.5:0.3);
    // circle.setAttributeNS(null, 'stroke', "none");
    // circle.setAttributeNS(null, 'stroke-width', "none");
    circle.setAttributeNS(null, 'fill', color?color:"red");
    circles.append(circle)
}


cp_list=[]
// function dorw_path(id){
//     const paths = document.getElementById('paths_dorw');
//     //console.log(id,points[id])
//     const d = points[id].map((v,i,ar)=>{
//         const vv = v[1];
//         if(!i || !dis(ar[i-1][1], vv)) return `M${vv}`
//         //return `S${ar[i-1]} ${v}`
//         //if(i==ar.length-1) return `S${ar[i-1]} ${v}`
        
//         //ar[i+1]&&ar[i-1]&&console.log(minus(ar[i+1], ar[i-1]))
        
//         const len = dis(ar[i][1],ar[i-1][1]);
        
//         const cp1 = i>1 ? add(
//             ar[i-1][1],
//             scalar(
//                 0.3*len,
//                 unit(add(
//                     (minus(ar[i-1][1], ar[i-2][1])),
//                     (minus(ar[i][1], ar[i-1][1])),
//                 ))
//             )
//         ): vv;

//         // scalar(ar[i][0]-ar[i-1][0]+1, minus(ar[i-1][1], ar[i-2][1])),
//         // scalar(ar[i-1][0]-ar[i-2][0]+1, minus(ar[i][1], ar[i-1][1])),

//         const cp2 = i<ar.length-1 ? add( 
//             vv,
//             scalar(
//                 -0.3*len,
//                 unit(add(
//                     (minus(ar[i][1], ar[i-1][1])),
//                     (minus(ar[i+1][1], ar[i][1])),
//                 ))
//             )
//         ): vv;


//         //unit(minus(ar[i+1][1], ar[i-1][1]))
//         // scalar(ar[i+1][0]-ar[i][0]+1, minus(ar[i][1], ar[i-1][1])),
//         // scalar(ar[i][0]-ar[i-1][0]+1, minus(ar[i+1][1], ar[i][1])),

//         //if(!cp_list.includes(vv.join())) dorw_circle(v)^cp_list.push(vv.join())
//         if(1||!cp_list.includes(cp1.join())) dorw_circle(cp1,'blue')^cp_list.push(cp1.join())
//         if(1||!cp_list.includes(cp2.join())) dorw_circle(cp2,'green')^cp_list.push(cp2.join())

//         //console.log(cp1, cp2)
//         if(i>1)return `C${cp1} ${cp2} ${vv}`
//         return `S${cp2} ${vv}`
//     }).join('\n');

//     const ele_id = 'pd'+id;
    
//     //console.log('paths',paths, id, points[id])
//     const path = document.getElementById(ele_id)||document.createElementNS('http://www.w3.org/2000/svg','path')
//     path.id = ele_id
//     path.setAttributeNS(null, 'd', d);
//     path.setAttributeNS(null, 'stroke', "black");
//     path.setAttributeNS(null, 'stroke-width', "1px");
//     path.setAttributeNS(null, 'fill', "none");
//     paths.appendChild(path)
// }\



// points[1]=[[1,[100,100]],[2,[200,100]],[3,[200,200]],[4,[300,200]]];
// dorw_path(1)

}