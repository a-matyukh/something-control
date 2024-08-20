<section>
    <div id="camera" class:enabled={isControl} bind:this={cameraNode}>
        <h3 id="cameraInfo">Camera 001</h3>
        <div id="target"
            style="opacity: {targetOpacity}; left: {targetNodeX}px; top: {targetNodeY}px;"
        >{targetEmoji}</div>
        <div id="trap" class:active={targetIsInZone}></div>
    </div>
    <div id="config">
        <h3 id="controlStarter">
            {!isControl ? "😴" : "🧐"} Control:
            <button onclick={toggleControl}>
                {!isControl ? "Enable" : "Disable"} control
            </button>
        </h3>
        <h3>Detect: <input type="text" bind:value={target}></h3>
        <h3>Max allowed seconds: <input type="number" bind:value={maxAllowedSeconds}></h3>
        <div>
            <h3>Events (states)</h3>
            <p>
                <strong>is detected: </strong>
                <span class="event" class:active={!targetDetected}>the {target} is not detected</span>
                <span> --- </span>
                <span class="event" class:active={targetDetected}>the {target} is detected</span>
            </p>
            <p>
                <strong>is in zone: </strong>
                <span class="event" class:active={!targetIsInZone}>the {target} is not in zone</span>
                <span> --- </span>
                <span class="event" class:active={targetIsInZone}>the {target} is in zone</span>
            </p>
        </div>
    </div>
</section>
<section>
    <h3>Timeline:</h3>
    <ol>
        {#each timeline.snapshots as snapshot}
            <li>{@html snapshot.showSummary()}</li>
        {/each}
    </ol>
</section>
<section>
    <h3>Timer: {accumulatedReport.length}</h3>
    <h3>Reports:</h3>
    {#each reports as report, i}
        <p>The {target} was in zone #{i + 1}: {report[0].timestamp.toLocaleTimeString()} - {report.at(-1).timestamp.toLocaleTimeString()}</p>
    {/each}
</section>

<style>
:global(body) {
    margin: 0;
    display: grid;
    grid-template-columns: 500px 200px auto;
}
#config {
    margin: 10px;
}
#camera {
    display: inline-block;
    width: 480px;
    height: 360px;
    background-color: #f5f5f5;
    opacity: .3;
    position: relative;
}
#camera.enabled {
    opacity: 1;
}
#cameraInfo {
    margin: 0;
    position: fixed;
    top: 10px;
    left: 10px;
    color: gray;
}

#controlStarter {
    position: relative;
    z-index: 99;
}
#trap {
    position: absolute;
    top: 100px;
    left: 100px;
    width: 100px;
    height: 100px;
    outline: 3px solid orange;
}
#trap.active {
    outline: 3px solid red;
}
#target {
    position: fixed;
    width: 30px;
    height: 30px;
    outline: 3px solid blue;
    font-size: 24px;
    cursor: pointer;
}

span.event {
    opacity: .5;
}
span.event.active {
    padding: 5px;
    background-color: blue;
    color: white;
    opacity: 1;
}
:global(span.timestamp) {
    color: gray;
}
</style>
<script lang="ts">
// Camera
let cameraNode = null
let cameraConstraints = {
    minX: 0,
    maxX: 480,
    minY: 0,
    maxY: 360
}

// Target or Detection
let target = $state("hand") // detectionType Label
let targetNodeX = $state(10) // detectionBbox
let targetNodeY = $state(10)
let targetOpacity = $state(0)
let targetEmoji = $state(" ")
$effect(() => {
    switch (target) {
        case "hand":
            targetEmoji = "🖐️"
            break
        case "worker":
            targetEmoji = "👷"
            break
        case "vest":
            targetEmoji = "🦺"
            break
    }
})

// Events
type Events = {
    targetDetected: boolean
    targetIsInZone: boolean
}
let targetDetected = $state(false)
let targetIsInZone = $state(false)

// Control
let isControl = $state(false)
let maxAllowedSeconds = $state(3)
let intervalID = null
function toggleControl() {
    isControl = !isControl
    if (isControl) {
        cameraNode.addEventListener("mousemove", trackTarget)
        intervalID = setInterval(controlTick, 1000)
    } else {
        cameraNode.removeEventListener("mousemove", trackTarget)
        clearInterval(intervalID)
        intervalID = null
    }
}
function trackTarget(e) {
    if (e.target.id === "trap") {
        targetIsInZone = true
    } else {
        targetIsInZone = false
    }
    if (e.x < cameraConstraints.maxX && e.y < cameraConstraints.maxY) {
        targetOpacity = 1
        targetDetected = true
    } else {
        targetOpacity = 0
        targetDetected = false
    }
    targetNodeX = e.pageX - 20
    targetNodeY = e.pageY - 20
}
function controlTick() {
    let events = {
        targetDetected,
        targetIsInZone
    }
    timeline.update(events)

    if (targetIsInZone) {
        accumulatedReport.push(timeline.lastSnapshot())
    } else {
        if (accumulatedReport.length > maxAllowedSeconds) {
            reports.push(accumulatedReport)
        }
        accumulatedReport = []
    }
}

// Reports. Timers, Counters
let accumulatedReport = $state([])
let reports = $state([])

// Timeline
class Snapshot {
    constructor(private timestamp: Date, private events: Events) {}
    showSummary() {
        return `
            <span class='timestamp'>${this.timestamp.toLocaleTimeString()}</span>
            ${this.events.targetDetected ? targetEmoji : ""}  
            ${this.events.targetIsInZone ? "🚨" : ""}`
    }
}
class Timeline {
    public snapshots: Snapshot[] = $state([])
    update(events: Events) {
        const snapshot = new Snapshot(new Date(), events)
        this.snapshots.push(snapshot)
    }
    lastSnapshot() {
        return this.snapshots.at(-1)
    }
}
let timeline = new Timeline()
</script>