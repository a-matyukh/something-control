class TimelineStore {
    snapshots = $state([])
    add(snapshot) {
        this.snapshots.push(snapshot)
    }
}

let timeline = new TimelineStore()

export { timeline }