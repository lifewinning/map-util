<script>
    import { onMount } from 'svelte'; 
    import Colorpicker from "@budibase/colorpicker";
    import textures from "textures"; 
    import * as d3 from 'd3';
   export let classNames, svg;


// helper functions for making styles

async function ChangeColor(className, newColor, item){
    let selected = await svg.querySelectorAll(`.${className}`)
    selected.forEach(element => {
        element.style.setProperty('fill', newColor)
        console.log(element)
    });
}

onMount(async ()=> {
    // console.log(await Object.entries(classNames).map(c => Array.from(svg.querySelectorAll(`.${c[1].name}`).length)))
})

</script>
<style>

    #pickers {
    display: grid;

    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(1, 1fr);
    grid-column-gap: 2px;
    grid-row-gap: 2px;
    }

</style>
{#await classNames then cn}
{#each cn as c}
<pre><em>{c.name}</em></pre>
<div id ="pickers">
    <div>
       <pre>fill:</pre>
{#if c.fill == 'none'}
<Colorpicker
      value='rgba(255,255,255,0)' 
      disableSwatches={true} 
      width="40px" 
      height="40px"
      on:change={selectedColor => {}}/> 
{:else}
        <Colorpicker
            value={c.fill} 
            disableSwatches={true} 
            width="40px" 
            height="40px"
            on:change={selectedColor => {ChangeColor(c.name,selectedColor.detail,'fill')}}/> 
        {/if}
    </div>
    <div>
       <pre>stroke:</pre>
       {#if c.stroke == 'none'}
       <Colorpicker
             value='rgba(255,255,255,0)' 
             disableSwatches={true} 
             width="40px" 
             height="40px"
             on:change={selectedColor => {}}/> 
       {:else}
       <Colorpicker
             value={c.stroke} 
             disableSwatches={true} 
             width="40px" 
             height="40px"
             on:change={selectedColor => {}}/> 
       {/if}
    </div>
    <div>
       <pre>stroke weight:</pre>
    <input width="40px" type="number" value={c.strokeWidth.split('p')[0]}/> 
    </div>
</div>
{/each}
{/await}



