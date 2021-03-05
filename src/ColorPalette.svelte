<script>
    import { onMount } from 'svelte'; 
    import { remove } from './utils';
    import Colorpicker from "@budibase/colorpicker";
    export let classNames, svg;
    let strokeWidth = 4

//    let remove = (className) =>{
//     let selected = svg.querySelectorAll(`.${className}`)
//     let palette = document.querySelector(`#${className}Palette`)
//     selected.forEach(s => { s.remove();})
//     palette.remove();
//    }

async function ChangeColor(className, newColor, item){
    let selected = await svg.querySelectorAll(`.${className}`)
    selected.forEach(element => {
        element.style.setProperty(item, newColor)
    });
    console.log(newColor);
}

async function ChangeStroke(className){
    let input = await document.querySelector(`${className}input`)
    let selected = await svg.querySelectorAll(`.${className}`)
    selected.forEach(s => { s.style.setProperty('stroke-width', input.value);})
   }

onMount(async ()=> {
    // console.log(await Object.entries(classNames).map(c => Array.from(svg.querySelectorAll(`.${c[1].name}`).length)))
})

</script>
<style>

    .pickers {
    display: grid;

    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(1, 1fr);
    grid-column-gap: 2px;
    grid-row-gap: 2px;
    }

</style>
{#await classNames then cn}
<div id="upload">
<pre>your uploaded data</pre>
    <div class="pickers">
        <div><pre>fill:</pre>
            <Colorpicker
            value='rgba(255,255,255,0)' 
            disableSwatches={true} 
            width="40px" 
            height="40px"
            on:change={selectedColor => {ChangeColor('upload',selectedColor.detail,'fill')}}/> </div>
        <div>
            <pre>stroke:</pre>
            <Colorpicker
            value='rgb(127,255,0)'
            disableSwatches={true} 
            width="40px" 
            height="40px"
            on:change={selectedColor => {ChangeColor('upload',selectedColor.detail,'stroke')}}/> 
        </div>
        <div><pre>stroke weight:</pre><input width="40px" type="number" bind:value={strokeWidth} on:change={val => ChangeColor('upload',strokeWidth, 'stroke-width')}/> </div>
        <!-- <div><pre>remove layer</pre><button on:click={remove('upload')}><pre>are you sure??</pre></button></div> -->
    </div>
</div>
{#each cn as c}
<div id = "{c.name}Palette">
<pre><strong>{c.name}</strong></pre>
<div class ="pickers">
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
             on:change={selectedColor => {ChangeColor(c.name,selectedColor.detail,'stroke')}}/> 
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
    <input id="{c.name}input" width="40px" type="number" value={c.strokeWidth.split('p')[0]} on:change={e => {ChangeStroke(c.name)}}/> 
    </div>
    <div><pre>remove layer</pre><button on:click={remove(svg, c.name)}><pre>are you sure??</pre></button></div>
</div>
</div>
{/each}
{/await}



