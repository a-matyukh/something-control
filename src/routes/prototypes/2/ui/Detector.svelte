<div>
    <p>Model: Florence-2</p>
    {#if !status}
        <p><button onclick={load}>load</button></p>
    {:else if status === "loading"}
        <p>loadingMessage: {loadingMessage}</p>
        <section>
            {#each progressItems as { file, progress, total }}
                <p>{file}: ({progress?.toFixed(2)}%{isNaN(total) ? '' : ` of ${formatBytes(total)}`})</p>
            {/each}
        </section>
    {:else}
        <p>Prompt: <input type="text" bind:value={text} disabled={isBatchDetecting}></p>
        <button onclick={detectSnapshots} disabled={isBatchDetecting}>detectSnapshots</button>
    {/if}
</div>

<style>
div {
    padding: 10px;
    border-left: 1px solid #ccc;
}
</style>

<script>
let IS_WEBGPU_AVAILABLE = $state(null)

let worker = $state({});
let status = $state(null)

let loadingMessage = $state("")
let progressItems = $state([])

let task = $state("<CAPTION_TO_PHRASE_GROUNDING>")
let text = $state("")

let image = $state('/bird.jpeg')
let result = $state(null)
let time = $state(null)

function load() {
    status = 'loading'
    worker.current.postMessage({ type: 'load' })
}

const detect = () => {
    status = 'running'
    worker.current.postMessage({
        type: 'run', data: { text, url: image, task }
    })
}
function clear() {
    worker.current.postMessage({ type: 'reset' })
    result = null
    image = null
}

import { timeline } from "../store.svelte"
let snapshotsSize = $derived(timeline.snapshots.length)
let isBatchDetecting = $state(false)
function detectSnapshots() {
    if (timeline.currentDetectingSnapshotIndex < snapshotsSize) {
        isBatchDetecting = true
        clear()
        image = timeline.snapshots[timeline.currentDetectingSnapshotIndex].buffer
        detect()
    } else {
        isBatchDetecting = false
    }
}

const onMessageReceived = (e) => {
    switch (e.data.status) {
        case 'loading':
            status = 'loading'
            loadingMessage = e.data.data
            break
        case 'initiate':
            progressItems = [...progressItems, e.data]
            break
        case 'progress':
            progressItems = progressItems.map(item => {
                if (item.file === e.data.file) {
                    return { ...item, ...e.data }
                }
                return item
            })
            break
        case 'done':
            progressItems = progressItems.filter(item => item.file !== e.data.file)
            break
        case 'ready':
            status = 'ready'
            break
        case 'complete':
            result = e.data.result
            time = e.data.time
            status = 'ready'
            if (isBatchDetecting) {
                timeline.snapshots[timeline.currentDetectingSnapshotIndex].detections = e.data.result["<CAPTION_TO_PHRASE_GROUNDING>"]
                timeline.snapshots[timeline.currentDetectingSnapshotIndex].detectionTime = e.data.time.toFixed(2)
                timeline.currentDetectingSnapshotIndex++
                detectSnapshots()
            }
            break
    }
}

function formatBytes(size) {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

$effect(() => {
    IS_WEBGPU_AVAILABLE = !!navigator.gpu
    if (!worker.current) {
        worker.current = new Worker(new URL('../worker.js', import.meta.url), {
            type: 'module'
        })
    }
    worker.current.addEventListener('message', onMessageReceived)
})

</script>