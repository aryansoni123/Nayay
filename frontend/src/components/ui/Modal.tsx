import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

import {
  modalVariants,
  backdropVariants
} from "../../animations/variants"

interface Props {

  isOpen: boolean
  onClose: () => void
  children: ReactNode

}

export default function Modal({
  isOpen,
  onClose,
  children
}: Props) {

  return (

    <AnimatePresence>

      {isOpen && (

        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-[420px] shadow-xl"
          >

            {children}

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  )

}