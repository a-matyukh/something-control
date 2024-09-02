<Timeline />



<!-- Detection -->

    <!-- <p>Model: Florence-2</p>
    <p>Prompt: <input type="text" bind:value={prompt}></p>
    <p><img width="400" src="/bird.jpeg" alt=""></p>
    <p><button onclick={handleClick}>detect</button></p>
    <p>
        {IS_WEBGPU_AVAILABLE}
    </p>
    <p>{loadingMessage}</p>
    <p>{JSON.stringify(result)}</p> -->


    <!-- {status === 'loading' && (
        <div className="flex justify-center items-center fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] top-0 left-0">
          <div className="w-[500px]">
            <p className="text-center mb-1 text-white text-md">{loadingMessage}</p>
            {progressItems.map(({ file, progress, total }, i) => (
              <Progress key={i} text={file} percentage={progress} total={total} />
            ))}
          </div>
        </div>
      )} -->

    <!-- <span className="text-sm mb-0.5">Task</span>
    <select
      className="border rounded-md p-1"
      value={task}
      onChange={(e) => setTask(e.target.value)}
    >
      <option value="<CAPTION>">Caption</option>
      <option value="<DETAILED_CAPTION>">Detailed Caption</option>
      <option value="<MORE_DETAILED_CAPTION>">More Detailed Caption</option>
      <option value="<OCR>">OCR</option>
      <option value="<OCR_WITH_REGION>">OCR with Region</option>
      <option value="<OD>">Object Detection</option>
      <option value="<DENSE_REGION_CAPTION>">Dense Region Caption</option>
      <option value="<CAPTION_TO_PHRASE_GROUNDING>">Caption to Phrase Grounding</option>
      {/* <option value="<REFERRING_EXPRESSION_SEGMENTATION>">Referring Expression Segmentation</option> */}
      {/* <option value="<REGION_TO_SEGMENTATION>">Region to Segmentation</option> */}
      {/* <option value="<OPEN_VOCABULARY_DETECTION>">Open Vocabulary Detection</option> */}
      {/* <option value="<REGION_TO_CATEGORY>">Region to Category</option> */}
      {/* <option value="<REGION_TO_DESCRIPTION>">Region to Description</option> */}
      {/* <option value="<REGION_TO_OCR>">Region to OCR</option> */}
      {/* <option value="<REGION_PROPOSAL>">Region Proposal</option> */}
    </select> -->

    <!-- <div className="flex flex-col">
        <span className="text-sm mb-0.5">Input Image</span>
        <ImageInput className="flex flex-col items-center border border-gray-300 rounded-md cursor-pointer h-[250px]" onImageChange={(file, result) => {
          worker.current.postMessage({ type: 'reset' }); // Reset image cache
          setResult(null);
          setImage(result);
        }} />
      </div> -->


      <!-- {
        task === '<CAPTION_TO_PHRASE_GROUNDING>'
        && (<div className="flex flex-col">
          <span className="text-sm mb-0.5">Text input</span>
          <input className="border rounded-md px-2 py-[3.5px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>)
      } -->




      <!-- {result?.[task] && (<>
        {
          typeof result[task] === 'string'
            ? <p className="pt-4 px-4 text-center max-h-[205px] overflow-y-auto">{result[task]}</p>
            : <pre className="w-full h-full p-2 overflow-y-auto">
              {JSON.stringify(result[task], null, 2)}
            </pre>
        }
        {
          time && <p className="text-sm text-gray-500 absolute bottom-2 bg-white p-1 rounded border">Execution time: {time.toFixed(2)} ms</p>
        }
      </>)
      } -->




      <!-- <button
      className="border px-4 py-2 rounded-lg bg-blue-400 text-white hover:bg-blue-500 disabled:bg-blue-100 disabled:cursor-not-allowed select-none"
      onClick={handleClick}
      disabled={status === 'running' || (status !== null && image === null)}
    >
      {status === null ? 'Load model' :
        status === 'running'
          ? 'Running...'
          : 'Run model'
      }
    </button> -->
<script>

// Timeline
import Timeline from "./ui/Timeline.svelte"
import Detector from "./ui/Detector.svelte"


let prompt = $state("")

let IS_WEBGPU_AVAILABLE = null


let worker = $state({});
let status = $state(null)
let loadingMessage = $state("")
let progressItems = $state([])

// let task = $state("<CAPTION>")
let task = $state("<CAPTION_TO_PHRASE_GROUNDING>")
// let text = $state("")
let text = $state("bird")
// let image = $state(null)
// let image = $state('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/beetle.png')
let image = $state('/bird.jpeg')
let result = $state(null)
let time = $state(null)

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
            console.log(result)
            time = e.data.time
            status = 'ready'
            break
    }
}

const handleClick = () => {
    if (status === null) {
        status = 'loading'
        worker.current.postMessage({ type: 'load' })
    } else {
        status = 'running'
        worker.current.postMessage({
            type: 'run', data: { text, url: image, task }
        })
    }
}

$effect(() => {
    IS_WEBGPU_AVAILABLE = !!navigator.gpu
    if (!worker.current) {
        worker.current = new Worker(new URL('./worker.js', import.meta.url), {
            type: 'module'
        })
    }
    worker.current.addEventListener('message', onMessageReceived)
})


// select another for detection
// worker.current.postMessage({ type: 'reset' }); // Reset image cache
//                     setResult(null);
//                     setImage(result);
</script>