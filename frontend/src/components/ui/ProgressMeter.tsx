interface Props {
  value: number
}

export default function ProgressMeter({ value }: Props) {

  return (
    <div className="w-full bg-gray-200 h-4 rounded-full">

      <div
        className="bg-[#C67C4E] h-4 rounded-full"
        style={{ width: `${value}%` }}
      />

    </div>
  )
}