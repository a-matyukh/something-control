class TimelineStore {
    snapshots = $state([])
    currentDetectingSnapshotIndex = $state(0)
    add(snapshot) {
        this.snapshots.push(snapshot)
    }
}

let timeline = new TimelineStore()

export { timeline }