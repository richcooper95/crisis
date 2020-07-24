import React from 'react'
import { Menu, Close } from '@material-ui/icons';

const SidebarIcon = ({handleClick, isOpen}) => {
  return <span onClick={handleClick}>
    {isOpen ? <Close /> : <Menu />}
  </span>
}

export default SidebarIcon