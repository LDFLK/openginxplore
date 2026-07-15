import { useEffect, useRef } from "react";

export default function useClickOutside(ref, callback) {

    const savedCallbackRef = useRef(callback)

    useEffect(() => {
        savedCallbackRef.current = callback
    }, [callback])

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                savedCallbackRef.current(event)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("touchstart", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside)
        }

    }, [ref])

}