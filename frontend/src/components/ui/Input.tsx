interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}

export default function Input({
  value,
  onChange,
  placeholder,
}: Props) {

  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 rounded-xl border border-gray-300"
    />
  )

}