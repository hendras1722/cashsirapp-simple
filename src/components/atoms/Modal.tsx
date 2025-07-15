import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { DialogContentText } from '@mui/material'
import { useStyles } from '@/utils/MUI'

export default function Modal({
  children,
  title,
  open,
  contentText,
}: Readonly<{
  children: React.ReactNode
  title: string
  open: {
    value: boolean
  }
  contentText: string
}>) {
  const handleClose = () => {
    open.value = false
  }

  const classes = useStyles()

  return (
    <Dialog
      classes={{
        paper: classes.dialog,
      }}
      open={open.value}
      onClose={handleClose}
      disableEscapeKeyDown
      fullWidth={true}
      maxWidth={'xs'}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        <DialogContentText>{contentText}</DialogContentText>
        {children}
      </DialogContent>
    </Dialog>
  )
}
