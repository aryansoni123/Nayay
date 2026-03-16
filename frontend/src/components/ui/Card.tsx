interface Props {
  children: React.ReactNode
}

export default function Card({ children }: Props) {

  return (
    <div className="bg-[#E3E3E3] rounded-xl p-6 shadow-inner">
      {children}
    </div>
  )

}