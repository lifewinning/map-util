<script>
    import { onMount } from 'svelte';
    import textures from "textures"; 
    import * as d3 from 'd3';
    let svg;
    export let width

let swatches = [
    textures.lines().size(8).strokeWidth(2), textures.lines().size(4).strokeWidth(1), textures.lines().orientation('3/8'),textures.lines().orientation('3/8', '7/8'), textures.lines().orientation('vertical','horizontal').size(4).strokeWidth(1), textures.lines().orientation('diagonal').size(7).strokeWidth(2).background('gray').stroke('white'), textures.circles().heavier(), textures.circles().thicker(), textures.circles().radius(5).fill('transparent').strokeWidth(1), textures.paths().d('hexagons').size(8), textures.paths().d('woven'), textures.paths().d('waves')
]
onMount(async ()=> {
    swatches.map(s => d3.select(svg).call(s))
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

<div id='textures' width={width}>
{#each swatches as swatch}
<span style="margin:1px;">
<svg bind:this={svg}  width=45 height=45>
<circle cx="25" cy="25" r="20" style="stroke:black; stroke-weight:.5px;" fill={swatch.url()}/>  
</svg>
</span>
{/each}
</div>
<!-- Laser Cutter Palette:
 - 255 0 0 (red): cut (no fills!)
 - 0 0 255 (blue): dark engrave
 - 0 0 0 (black): light engrave
 - lines are 0.1px stroke
 - Pattern fills? 
-->

<!-- Axidraw Palette:
- Pattern fills
- lots of outlines
- 
-->