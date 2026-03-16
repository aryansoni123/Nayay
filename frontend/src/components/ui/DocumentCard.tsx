import { Document } from "../../types"

interface Props {
  document: Document
}

export default function DocumentCard({ document }: Props) {

  return (
    <div className="p-5 bg-white rounded-xl shadow">

      <p className="font-semibold">{document.name}</p>

      <p className="text-sm text-gray-500">
        {document.size} bytes
      </p>

    </div>
  )
}