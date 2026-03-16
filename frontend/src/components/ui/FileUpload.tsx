import { useRef } from "react"

interface Props {
  onUpload: (file: File) => void
}

export default function FileUpload({ onUpload }: Props) {

  const inputRef = useRef<HTMLInputElement>(null)

  const open = () => {
    inputRef.current?.click()
  }

  return (
    <div className="border-2 border-dashed p-6 rounded-xl text-center">

      <p className="mb-3">Upload Document</p>

      <button
        onClick={open}
        className="px-4 py-2 bg-[#C67C4E] text-white rounded"
      >
        Choose File
      </button>

      <input
        type="file"
        hidden
        ref={inputRef}
        onChange={(e) => {
          if (!e.target.files) return
          onUpload(e.target.files[0])
        }}
      />

    </div>
  )
}