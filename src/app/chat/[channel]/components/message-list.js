import { EllipsisVertical } from 'lucide-react';
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"

const userCanDelete = (message, user) => {
  return user.publicMetadata.isMod || message.clientId === user.id
}

const MessageList = ({ messages, user, onDelete }) => {

  const createLi = message =>
    <li
      key={message.id}
      className="flex justify-between bg-slate-50 p-3 my-2 group" >

      <div className="flex items-center">
        <Avatar className="mr-2">
          <AvatarImage src={message.data.avatarUrl} />
        </Avatar>
        <p>{message.data.text}</p>
      </div>

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer">
            <EllipsisVertical size={16} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              disabled={!userCanDelete(message, user)}
              onClick={() => onDelete(message.extras.timeserial)}>
              Delete</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </li>

  return <div><ul> {messages.map(createLi)} </ul></div>

}
export default MessageList