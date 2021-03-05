<script>
import { onMount } from 'svelte'; 
import textures from "textures"; 
import * as d3 from 'd3';
let palette;
export let classNames, svg;

let swatches = [
    textures.lines().size(8).strokeWidth(2), 
    textures.lines().size(4).strokeWidth(1), 
    textures.lines().orientation('3/8'),
    textures.lines().orientation('3/8', '7/8'), 
    textures.lines().orientation('vertical','horizontal').size(4).strokeWidth(1), 
    textures.lines().orientation('diagonal').size(7).strokeWidth(2).background('gray').stroke('white'), 
    textures.circles().heavier().radius(3), textures.circles().thicker(), textures.circles().radius(3).fill('transparent').strokeWidth(1), textures.paths().d('hexagons').size(5), textures.paths().d('woven'), textures.paths().d('waves')
]

let addPattern = async (className, newPattern) => {
    d3.select(svg).call(newPattern);
    let selected = await svg.querySelectorAll(`.${className}`)
    selected.forEach(element => {
        element.style.setProperty('fill', newPattern.url())
    });
}

onMount(async ()=> {
    swatches.map(s => d3.select(palette).call(s))
    //classNames = Array.from(svg.querySelectorAll('path')).map(m=> m.classList)
})

</script>

<style>
#textures {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 2px;
    grid-row-gap: 2px;
 }

</style>
{#await classNames then cn}
{#each cn as c}
<div><pre><strong>{c.name}</strong></pre>
    {#each swatches as swatch}
    <span style="margin:1px;">
    <svg width=45 height=45 bind:this={palette}>
    <circle cx="25" cy="25" r="20" style="stroke:black; stroke-weight:.5px;" fill={swatch.url()} on:click={addPattern(c.name,swatch)}/>  
    </svg>
    </span>
    {/each}
</div>
{/each}
{/await}
<div id='textures'>

</div>