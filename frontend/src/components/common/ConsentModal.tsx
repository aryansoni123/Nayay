import Button from "../ui/Button"

interface Props {
  onAccept: () => void
  onDecline: () => void
}

export default function ConsentModal({
  onAccept,
  onDecline,
}: Props) {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">

      <div className="bg-white p-6 rounded-xl w-96">

        <h2 className="text-lg font-bold mb-3">
          Consent Required
        </h2>

        <p className="text-sm mb-4">
          By uploading documents you consent to legal
          analysis by AI.
        </p>

        <div className="flex gap-3">

          <Button onClick={onAccept}>
            Accept
          </Button>

          <Button
            variant="secondary"
            onClick={onDecline}
          >
            Decline
          </Button>

        </div>

      </div>

    </div>
  )
}