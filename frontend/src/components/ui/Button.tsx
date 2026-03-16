import { motion } from "framer-motion"

interface Props {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary"
}

export default function Button({
  children,
  onClick,
  variant = "primary",
}: Props) {

  const base =
    "px-5 py-3 rounded-xl font-medium transition"

  const styles = {
    primary: "bg-[#C67C4E] text-white",
    secondary: "bg-[#E3E3E3]",
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </motion.button>
  )
}