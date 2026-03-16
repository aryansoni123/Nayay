import { Variants } from "framer-motion"

/* ---------------- PAGE ---------------- */

export const pageVariants: Variants = {

  initial: {
    opacity: 0,
    y: 20
  },

  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut"
    }
  },

  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.25
    }
  }

}

/* ---------------- CONTAINER ---------------- */

export const containerVariants: Variants = {

  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }

}

/* ---------------- ITEM ---------------- */

export const itemVariants: Variants = {

  hidden: {
    opacity: 0,
    y: 15
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25
    }
  }

}

/* ---------------- BUTTON ---------------- */

export const buttonVariants: Variants = {

  hover: {
    scale: 1.05,
    transition: {
      duration: 0.15
    }
  },

  tap: {
    scale: 0.96
  }

}

/* ---------------- CARD ---------------- */

export const cardVariants: Variants = {

  hover: {
    y: -4,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)"
  }

}

/* ---------------- CHAT MESSAGE ---------------- */

export const messageVariants: Variants = {

  hidden: {
    opacity: 0,
    y: 10
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  }

}

/* ---------------- PROGRESS METER ---------------- */

export const meterVariants: Variants = {

  hidden: {
    width: 0
  },

  visible: (value: number) => ({
    width: `${value}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  })

}

/* ---------------- MODAL ---------------- */

export const modalVariants: Variants = {

  hidden: {
    opacity: 0,
    scale: 0.95
  },

  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25
    }
  },

  exit: {
    opacity: 0,
    scale: 0.95
  }

}

/* ---------------- BACKDROP ---------------- */

export const backdropVariants: Variants = {

  hidden: {
    opacity: 0
  },

  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },

  exit: {
    opacity: 0
  }

}