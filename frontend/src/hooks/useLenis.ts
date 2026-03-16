import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"

export default function useLenis() {

  useEffect(() => {

    const lenis = new Lenis({
      smooth: true,
      lerp: 0.08,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }

  }, [])

}