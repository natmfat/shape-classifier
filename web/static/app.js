const icons = {
    upload: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 15c.7-1.2 1-2.5.7-3.9-.6-2-2.4-3.5-4.4-3.5h-1.2c-.7-3-3.2-5.2-6.2-5.6-3-.3-5.9 1.3-7.3 4-1.2 2.5-1 6.5.5 8.8m8.7-1.6V21"/><path d="M16 16l-4-4-4 4"/></svg>`,
    loading: `<svg class="loading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
    square: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`,
    triangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18L12 4z"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    circle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`
}

// select elements
const canvas = document.querySelector(".app__canvas")
const [ prediction, refreshButton, penButton, fillButton, uploadButton ] = document.querySelectorAll(".app__buttons button")

// canvas state
const mouse = { x: 0, y: 0, down: false, tool: "pen" }
const pixelSize = 10
let loading = false
let image = []

// handle mouse position
const updateMousePosition = (e, mouseDown) => {
    if(mouseDown) { mouse.down = true }

    const rect = canvas.getBoundingClientRect()
    // mouse.x = e.clientX - rect.left
    // mouse.y = e.clientY - rect.top
    mouse.x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize
    mouse.y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize
}

// add canvas event listeners
const ctx = canvas.getContext("2d")

canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

canvas.addEventListener("mousedown", e => { 
    updateMousePosition(e, true) 

    if(mouse.tool == "fill") {
        const fill = { x: mouse.x, y: mouse.y }
        const queue = [fill]


        let maxLoop = 7000

        while(queue.length > 0 && maxLoop > 0) {
            const pixel = queue.shift()
            if(!image.find(p => p.x === pixel.x && p.y === pixel.y)) {
                image.push(pixel)
                queue.push({ x: pixel.x - pixelSize, y: pixel.y })
                queue.push({ x: pixel.x + pixelSize, y: pixel.y })
                queue.push({ x: pixel.x, y: pixel.y - pixelSize })
                queue.push({ x: pixel.x, y: pixel.y + pixelSize })
            }   
            maxLoop--
        }
    }
})
canvas.addEventListener("mousemove", e => { updateMousePosition(e) })
canvas.addEventListener("mouseup", e => { mouse.down = false })

// add button event listeners
refreshButton.addEventListener("click", () => {
    image = []
    render()
})

uploadButton.addEventListener("click", async () => {
    if(!loading) {
        uploadButton.innerHTML = icons.loading
        loading = true

        const json = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: canvas.toDataURL("image/png").split(',').pop() })
        }).then(res => res.json())
        
        prediction.innerHTML = icons[json.prediction]

        uploadButton.innerHTML = icons.upload
        loading = false
    }
})

penButton.addEventListener("click", () => {
    mouse.tool = "pen"
})

fillButton.addEventListener("click", () => {
    mouse.tool = "fill"
})

const render = () => {

    // clear canvas
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw a circle
    // ctx.beginPath()
    // ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, 2 * Math.PI)
    // ctx.fillStyle = "#eee"
    // ctx.fill()

    // draw image
    for(const pixel of image) {
        ctx.fillStyle = "#000"
        ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize)
    }

    if(mouse.down) {
        switch(mouse.tool) {
            case "pen": {
                const pixel = { x: mouse.x, y: mouse.y }
                if(!image.find(p => p.x === pixel.x && p.y === pixel.y)) { image.push(pixel) }
                break
            }
        }
    }

    

    window.requestAnimationFrame(render)
}

render()