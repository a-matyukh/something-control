<!-- processing -->
{#if isVideoUploaded && !isVideoProcessed}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video width="640" id="video-tag" bind:this={videoTag}>
        <source id="video-source" bind:this={videoSrc}>
    </video>
    <br>
    <canvas id="canvas" hidden></canvas>
    <p>Snapshots getted: {timeline.snapshots.length} from {videoDuration}</p>
{:else}
    <!-- upload -->
    Upload video: <input type="file" accept="video/*" bind:this={inputTag} />
    <hr>
{/if}

<!-- Timeline/Snapshots -->
{#if timeline.snapshots.length > 0}
    <hr>
    {#each timeline.snapshots as snapshot, i}
        <!-- SnapshotCell -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img class:selected={snapshot === selectedSnapshot} width={30 * zoom} src={URL.createObjectURL(snapshot.buffer)} alt="" onclick={() => selectSnapshot(i)}>
    {/each}
    <hr>
{/if}


{#if isVideoProcessed}
    <!-- selectedSnapshot / SnapshotPreview -->
    {#if selectedSnapshot}
        <div>
            <img width="300" src={URL.createObjectURL(selectedSnapshot.buffer)} alt="">
        </div>
    {/if}
    <!-- Zoom -->
    <div>
        Zoom: 
        <input type="range" min="0.1" max="5" step="0.1" bind:value={zoom} oninput={e => changeZoom(e.target.value)}>
        {zoom}
    </div>
    <!-- Player -->
    <div>
        <button onclick={play}>Play</button>
        <button onclick={stop}>Stop</button>
        {selectedSnapshotIndex} - {isPlaying}
    </div>
{/if}

<style>
img.selected {
    outline: 3px solid orange;
}
</style>

<script>
import { timeline } from "../store.svelte"

let inputTag = $state(null)
$effect(() => inputTag?.addEventListener('change',  uploadVideo))
let isVideoUploaded = $state(false)
let isVideoProcessed = $state(false)
let videoTag = $state(null)
let videoSrc = $state(null)
let videoDuration = $state(0)

function uploadVideo(event) {
    if (event.target.files && event.target.files[0]) {
        isVideoUploaded = true
        isVideoProcessed = false
        timeline.snapshots = []
        var reader = new FileReader()
        reader.onload = function(e) {
            videoSrc.src = e.target.result
            videoTag.load()
            videoTag.onloadeddata = () => {
                videoDuration = Math.floor(videoTag.duration)
                getSnapshots()
            }
            
        }
        reader.readAsDataURL(event.target.files[0]);
    }
}

function getSnapshots() {

    let canvas = document.getElementById("canvas")
    let video = document.querySelector("video")

    video.ontimeupdate = () => {
        if (!video.duration || video.currentTime < Math.floor(video.duration)) {
            getSnapshots()
        } else {
            isVideoProcessed = true
            selectSnapshot(0)
        }
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
    canvas.toBlob((blob) => {if (blob && blob.size > 30000) timeline.snapshots.push(new Snapshot(blob))})
    video.currentTime += 1

}

// Timeline
class Snapshot {
    constructor(buffer) {
        this.buffer = buffer
        this.detections = {}
        this.detectionTime = null
    }
}

// SelectedSnapshot
let selectedSnapshot = $state(null)
let selectedSnapshotIndex = $state(0)
function selectSnapshot(snapshotIndex) {
    selectedSnapshotIndex = snapshotIndex
    selectedSnapshot = timeline.snapshots[selectedSnapshotIndex]
}

// Player
let timerId = null, isPlaying = $state(false)
function play() {
    isPlaying = true
    timerId = setInterval(() => {
        if (selectedSnapshotIndex < timeline.snapshots.length) {
            selectSnapshot(selectedSnapshotIndex)
            selectedSnapshotIndex++
        } else {
            stop()
        }
    }, 1000)
}
function stop() {
    clearInterval(timerId)
    isPlaying = false
}

// Zoom
let zoom = $state(1)
function changeZoom(newValue) {
    zoom = newValue
}

</script>