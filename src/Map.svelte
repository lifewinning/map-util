<script>
import { onMount } from 'svelte';
import Palette from './Palette.svelte';
import * as d3 from 'd3';
import { projections, getTiles, sortTileData, tilePromise } from './utils'
export let data, height, width, proj;
let projection, path, tile, svg, z;
let arr = [];
let classes=[]
let seePalette = false;

// to do: "cache" tiles, drag and zoom
let m = { x: 0, y: 0};
let sphere = ({type: "Sphere"})

async function tiles() {
       return tilePromise(getTiles(projection, width, height)).then(t => sortTileData(t, arr))
    }

onMount(async () => {
  let classSet = new Set();
  await tiles().then(t => t.map(ti => classSet.add(ti.class)))


  classes = [...classSet].map(c => {
    let el = document.querySelector(`.${c}`)
    if (el){ 
      let style = getComputedStyle(el)
      let obj = ({
      name : c,
      group: el.dataset.group,
      fill: style.fill,
      stroke: style.stroke, 
      strokeWidth: style.strokeWidth
      })
    return obj; 
    }
  })

  if (document.querySelector('#sphere')) {
    let el = document.querySelector(`.ocean`)
    if (el){ 
      let style = getComputedStyle(el)
      let obj = ({
      name : 'ocean',
      group: 'water',
      fill: style.fill,
      stroke: style.stroke, 
      strokeWidth: style.strokeWidth
      })
    classes.push(obj)
    }
  }

  
})  

  const makeSVG = (svg, classes)=>{
      const styles = classes
      const groups = {}
      let copySVG = document.createElement('svg')

      copySVG.width=width
      copySVG.height=height
      
      styles.forEach(element => {
        let selected = Array.from(svg.querySelectorAll(`.${element.name}`)).filter(s => s.getAttribute('d') != null)
        if (typeof(selected[0]) != undefined && selected[0] != null){
            let sample = selected[0]
            let className = element.name
            let getStyle = getComputedStyle(sample)
            let groupName = selected[0].dataset.group
            if (groupName != undefined && className != undefined){
            selected.forEach(select =>{
              // console.log(selected[0].dataset.group)
              // console.log(select.dataset.group)
              if (!groups[groupName]){
                groups[groupName] = {};
              } 
              if (!groups[groupName][className]){

              groups[groupName][className] = []
              groups[groupName][className].push(`<path d=${select.getAttribute('d')} fill="${getStyle.fill}" stroke="${getStyle.stroke}"  stroke-width="${getStyle.strokeWidth}"></path>`)
            
            } else{
              groups[groupName][className].push(`<path d=${select.getAttribute('d')} fill="${getStyle.fill}" stroke="${getStyle.stroke}"  stroke-width="${getStyle.strokeWidth}"></path>`)
            }
          })
            }
          
        }
          });
      console.log(Object.entries(groups))

      Object.entries(groups).forEach(g =>{
        console.log(g[1])
        console.log(Object.entries(g[1]))
        copySVG.insertAdjacentHTML('afterbegin', 
        `<g id=${g[0]}>

        ${Object.entries(g[1]).map(c => `<g id = ${c[0]}> ${c[1].join(' ')} </g>`)}  
        </g>`)
      })
      let upload = svg.querySelector('.upload')
      let style = getComputedStyle(upload)
      if (typeof(upload) != undefined && upload != null){   
        let uploaded = `<g id ="uploaded"><path d="${upload.getAttribute('d')}" fill ="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"></path></g>` 
        copySVG.insertAdjacentHTML('beforeend', uploaded);
      }
      
      let globe = svg.querySelector('#sphere')
      if (globe){
        const sphere = `<g id ="globe"><path class = "sphere" d="${path({type: "Sphere"})}" fill = "${getComputedStyle(globe).fill}" stroke="${getComputedStyle(globe).stroke}" stroke-width="${getComputedStyle(globe).strokeWidth}"/></g>` 
      copySVG.insertAdjacentHTML('afterbegin', sphere);
      }

      return copySVG.innerHTML
 }

const download = (svgFile) => {
      const svgText = `<svg xmlns="http://www.w3.org/2000/svg">${svgFile}</svg>`;
      const blob = new Blob([svgText], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'map.svg')
      link.click()
    }


$: {
  arr = []
  projection = projections(data,width,height).map(p => Object.entries(p)).filter(m => m[0][0] == proj)[0][0][1]
  path = d3.geoPath().projection(projection)
  tile = tiles()
  z = getTiles(projection, width, height);

}

</script>

<style>
    div { margin: 2px; }
    svg { border: 1px dotted;}
#basemap{
  stroke-width: none;
  fill:none;
}
.upload {
  fill: var(--upload-fill, none);
  stroke: var(--upload-stroke, chartreuse);
  stroke-width: 4px;
}
.building{
  fill:rgb(165, 139, 139);}

.water,.ocean, .riverbank  {
  fill: var(--water-fill, gray);
}
.oceanboundary, .riverbankboundary, .waterboundary{
  fill: none;
  stroke: gray;
  stroke-width: 0.5px;
}

.river, .stream, .canal {
  fill: none;
  stroke: gray;
  stroke-width: 1.5px;
}
.earth, .urbanarea {
  fill: var(--earth-fill, white);
  stroke: var(--earth-stroke, none);
}
.park,.naturereserve,.wood, .protectedarea, .forest, .wetland, .golfcourse, .grasslands, .grassland {
  fill: #88D18A;
  stroke: #88D18A;
  stroke-width: 0.5px;
}

.majorroad {
  stroke: rgb(57, 57, 57);
  stroke-width: 1px;
  fill:none;
}

.minorroad, .path {
  stroke: #999;
  stroke-width: 0.5px;
  fill:none;
}

.highway {
  stroke: black;
  stroke-width: 1.5px;
  fill:none;
}

.pier {
  fill: #fff;
  stroke: #fff;
  stroke-width: 0.5px;
}

.aeroway, .aerodrome {
  fill: pink;
  fill-opacity: 0.2;
}

.military{
    fill: rgb(25, 80, 80);
  fill-opacity: 0.5;
}

.rail, .ferry {
  stroke: #ebc1fc;
  stroke-width: 0.5px;
  fill:none;
}
.cemetery{
  fill: #ccc;
}
.hospital, .university, .recreationground{
  fill: papayawhip;
}
</style>
<div width = {width}>
<svg bind:this={svg} width = {width} height ={height} on:mousemove="{e => m = { x: e.clientX, y: e.clientY }}" on:>
    {#if z[0]}
    {#if z[0].z <= 5}
    <g id = "water">
    <path class = "ocean" id= "sphere" d = { path(sphere) }  /> 
    </g>
    {/if}  
    {/if}
    {#await tile then t}
    <g id = 'basemap'>
    {#each t as paths}
    <path d = {path(paths.data)} data-group={paths.group} class={paths.class}/>
    {/each}
    </g>
    {/await}
    <path d = {path(data)} class="upload"/>
</svg>
<hr>

<button on:click={() => seePalette = !seePalette}>Color Palette</button>
{#await classes then c}
<button on:click={()=> download(makeSVG(svg,c))}>download SVG</button>
{#if seePalette == true}
<Palette classNames = {c} svg={svg}/>
{/if}
{/await}

<!-- todo! -->

<!-- <button>svg (axidraw)</button> <button>svg (PW laser)</button><button>svg (print)</button> -->
</div>
