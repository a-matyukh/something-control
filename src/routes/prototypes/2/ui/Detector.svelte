<p><img width="400" src="/bird.jpeg" alt=""></p>
<hr>
<p>Model: Florence-2</p>
{#if !status}
    <p><button onclick={load}>load</button></p>
{:else if status === "loading"}
    <p>loadingMessage: {loadingMessage}</p>
    <div>
        {#each progressItems as { file, progress, total }}
            <p>{file}: ({progress?.toFixed(2)}%{isNaN(total) ? '' : ` of ${formatBytes(total)}`})</p>
        {/each}
    </div>
{:else}
    <p>Prompt: <input type="text" bind:value={text}></p>
    <p><button onclick={detect} disabled={status === 'running'}>detect</button></p>
    {#if result}
        <p>Result: {JSON.stringify(result)}</p>
        <p>Execution time: {time.toFixed(2)} ms</p>
    {/if}

{/if}



<script>
let IS_WEBGPU_AVAILABLE = $state(null)

let worker = $state({});
let status = $state(null)

let loadingMessage = $state("")
let progressItems = $state([])

let task = $state("<CAPTION_TO_PHRASE_GROUNDING>")
let text = $state("bird")

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
            break
    }
}

// select another for detection
function onChange() {
    worker.current.postMessage({ type: 'reset' })
    // setResult(null)
    // setImage(result)
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