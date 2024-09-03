<Timeline />
{#if timeline.snapshots.length > 1} 
    <Detector />
{/if}

<script>
import Timeline from "./ui/Timeline.svelte"
import Detector from "./ui/Detector.svelte"
import { timeline } from "./store.svelte"
</script>