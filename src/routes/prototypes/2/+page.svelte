<Timeline />
{#if timeline.snapshots.length > 1} 
    <Detector />
{/if}

<style>
:global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    display: grid;
    grid-template-columns: 1fr 300px;
    border-bottom: 1px solid #ccc;
}
:global(hr) {
    border: none;
    border-bottom: 1px solid #ccc;
    margin: 0;
}
:global(button) {
    background: #f5f5f5;
    border: none;
    padding: 10px;
}
</style>
<script>
import Timeline from "./ui/Timeline.svelte"
import Detector from "./ui/Detector.svelte"
import { timeline } from "./store.svelte"
</script>