<script>
    // import { onMount } from 'svelte';
// import Map from './Map.svelte';
import Settings from './Settings.svelte'



	let files, data;

</script>

<main>
	<input type="file" bind:files/>
</main>

{#if files && files[0]}
<p>{files[0].name}</p>
{#await files[0].text() then text}
<Settings data={JSON.parse(text)}/>
{/await}
{/if}

