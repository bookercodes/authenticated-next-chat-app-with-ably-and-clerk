import { useState } from "react"
import { Input } from "@/components/ui/input"

const MessageInput = ({ onSubmit }) => {
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
        placeholder="Type a message"
      />
    </form>
  )
}
export default MessageInput