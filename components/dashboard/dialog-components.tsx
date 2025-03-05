import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"

interface NewFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderName: string
  setFolderName: (name: string) => void
  onCreateFolder: () => Promise<void> | void
}

export function NewFolderDialog({
  open,
  onOpenChange,
  folderName,
  setFolderName,
  onCreateFolder
}: NewFolderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogDescription>
          Enter a name for your new folder
        </DialogDescription>
        <Input
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="mt-4"
        />
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onCreateFolder}>
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => Promise<void> | void
  isDeleting: boolean
}

export function DeleteFileDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  isDeleting
}: DeleteFileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Delete File</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this file? This action cannot be undone.
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
