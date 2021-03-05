<script>
    import ColorPalette from './ColorPalette.svelte';
    import Laser from './Laser.svelte';
    import Patterns from './Patterns.svelte';
    let seePalette = false;
    let seeLaserPalette = false;
    let seePatternPalette = false;
    export let c, svg;
</script>

{#await c then classNames}
<button on:click={() => seePalette = !seePalette}>Color Palette</button>
<button on:click={() => seePatternPalette = !seePatternPalette}>Pattern Palette</button>
<button on:click={() => seeLaserPalette = !seeLaserPalette}>Laser Cutter Palette</button>

{#if seePalette == true}
<ColorPalette classNames = {classNames} svg={svg}/>
{/if}
{#if seeLaserPalette == true}
<Laser classNames = {classNames} svg={svg}/>
{/if}
{#if seePatternPalette == true}
<Patterns classNames = {classNames} svg = {svg} />
{/if}
{/await}