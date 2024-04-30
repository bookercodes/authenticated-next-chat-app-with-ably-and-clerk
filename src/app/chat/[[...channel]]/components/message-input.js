import { useState } from "react"
import { Input } from "@/components/ui/input"

const MessageInput = ({ onSubmit, readOnly }) => {
  const [input, setInput] = useState('')

  const handleChange = e => {
    setInput(e.target.value)
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={input}
        onChange={handleChange}
        disabled={readOnly}
        placeholder={readOnly ? "You can't post here because you're not a mod." : "Your message here"}
      />
    </form>
  )
}
export default MessageInput