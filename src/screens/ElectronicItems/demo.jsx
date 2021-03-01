const { useEffect } = require("react")

function useOnScreen(options) {
    // need ref that points to the DOM that keeps track of visibility
    // ref does not need to keep track of a DOM on screen
    const ref = useRef() // ref is initially { current: null }
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        // You can control how much of the element is visible before Intersection Observer callback is called by putting in the options

        // The callback in IntersectionObserver() is what is called every time the element you are observing changes; get the the one entry you are observing by deconstructing the array; the entry tells a lot about the element you are watching
        const observer = new IntersectionObserver(([entry]) => {
            // keep track of whether the element we are watching is visible so create a visible hook

            // entry.isIntersecting tells us if the element is visible on the screen or not
            setVisible(entry.isIntersecting)
        }, options)

        if(ref.current) { // if there is a dom element in ref, tell the observe to observe the dom element 
            observer.observe(ref.current)
        }

        return () => {
            // if there is a current element that ref is referencing to
            if(ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [ref, options])

    // Want to to return back is the ref and whether the DOM element ref refers to is visible or not
    return [ref, visible] //ref is a reference 
}

function App() {
    // const ref = { current: null }
    // const visible = false
    const [ref, visible]= useOnScreen({rootMargin: '300px'}) // pass in the options to useOnScreen()

    return (
        <div>
            <div>

            </div>
            <div
            ref={ref}
            >
            {visible ? <div></div> : <h1></h1>}
            </div>
        </div>
    )
}