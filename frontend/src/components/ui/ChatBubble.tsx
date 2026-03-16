import { Message } from "../../types"

interface Props {
  message: Message
}

export default function ChatBubble({ message }: Props) {

  const isUser = message.role === "user"

  return (
    <div
      className={`p-3 rounded-xl max-w-md ${
        isUser
          ? "bg-[#C67C4E] text-white ml-auto"
          : "bg-[#E3E3E3]"
      }`}
    >
      {message.content}
    </div>
  )
}