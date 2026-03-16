interface Props {
  act: string
  section: string
  description: string
}

export default function LawCard({
  act,
  section,
  description,
}: Props) {

  return (
    <div className="p-6 bg-white rounded-xl shadow">

      <h3 className="font-bold">{act}</h3>

      <p>Section {section}</p>

      <p className="text-sm mt-2">
        {description}
      </p>

    </div>
  )
}