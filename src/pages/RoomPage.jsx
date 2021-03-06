import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { IoIosCreate, IoIosTrash } from 'react-icons/io'

import Table from '../components/Table'
import Panel from '../components/Panel'
import Toaster from '../components/Toaster'
import { TextField } from '../components/inputs'
import { Button, IconButton } from '../components/buttons'
import { ConfirmationDialog } from '../components/Dialog'
import RoomForm from '../components/forms/RoomForm'

import { privateApi } from '../utils/request'

const RoomPage = () => {
  const [tableData, setTableData] = useState({ meta: {}, data: [] })
  const [isLoading, setIsLoading] = useState(false)

  const [isAdd, setIsAdd] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [isDelete, setIsDelete] = useState(false)

  const [editedItem, setEditedItem] = useState(null)
  const [deletedItem, setDeletedItem] = useState(null)

  const defaultToastState = {
    isShow: false,
    type: 'default',
    duration: 4000, // remove duration property to prevent autoclose after 4s
  }
  const [toast, setToast] = useState(defaultToastState)

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: ({ name }) => name,
    },
    {
      key: 'created_at',
      label: 'Created at',
      render: ({ created_at }) => dayjs(created_at).format('dddd, MMMM D YYYY'),
    },
    {
      key: 'options',
      label: 'Options',
      render: item => (
        <div className="flex items-center">
          <button
            className="p-1 text-gray-400 hover:text-yellow-400"
            onClick={() => {
              setIsEdit(true)
              setEditedItem(item)
            }}
          >
            <IoIosCreate size={22} />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-red-400"
            onClick={() => {
              setIsDelete(true)
              setDeletedItem(item)
            }}
          >
            <IoIosTrash size={22} />
          </button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    onLoadPage()
  }, [])

  async function onLoadPage() {
    setIsLoading(true)

    const response = await privateApi()
      .get('rooms')
      .catch(error => {
        if (error.response.status == 404) {
          setToast({
            ...toast,
            isShow: true,
            type: 'warning',
            title: 'Not Found',
            message: "There's no room!",
          })
          setIsLoading(false)
        }
      })

    if (response && response.data.data) {
      const data = response.data.data
      const newTableData = {
        meta: { count: data.length },
        data,
      }
      setIsLoading(false)
      setTableData(newTableData)
    }
  }

  async function onCommitAdd(values) {
    const response = await privateApi().post('rooms', { ...values })

    if (response) {
      setIsAdd(false)
      onLoadPage()
      setToast({
        ...toast,
        isShow: true,
        type: 'primary',
        title: 'Room Created',
        message: 'A new room has been created!',
      })
    }
  }

  async function onCommitEdit(values) {
    const response = await privateApi().put(`rooms/${editedItem.id}`, {
      ...values,
    })

    if (response) {
      onCancelEdit()
      onLoadPage()
      setToast({
        ...toast,
        isShow: true,
        type: 'primary',
        title: 'Room Updated',
        message: `${editedItem.name} has been updated successfully!`,
      })
    }
  }

  function onCancelEdit() {
    setIsEdit(false)
    setEditedItem(null)
  }

  async function onCommitDelete(item) {
    const response = await privateApi().delete(`rooms/${item.id}`)

    if (response) {
      onCancelDelete()
      onLoadPage()
      setToast({
        ...toast,
        isShow: true,
        type: 'primary',
        title: 'Room Deleted',
        message: `${deletedItem.name} has been deleted!`,
      })
    }
  }

  function onCancelDelete() {
    setIsDelete(false)
    setDeletedItem(null)
  }

  return (
    <div>
      <Toaster
        isShow={toast.isShow}
        type={toast.type}
        duration={toast.duration}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ ...toast, ...defaultToastState })}
      />

      <Panel title="Room" size="small" isOpen={isAdd} onClose={() => setIsAdd(false)}>
        <RoomForm onSubmit={onCommitAdd} onCancel={() => setIsAdd(false)} />
      </Panel>

      <Panel title="Room" size="small" isOpen={isEdit} onClose={() => onCancelEdit()}>
        <RoomForm
          initialValues={editedItem}
          onSubmit={onCommitEdit}
          onCancel={() => onCancelEdit()}
        />
      </Panel>

      <ConfirmationDialog
        isOpen={isDelete}
        onClose={() => onCancelDelete()}
        onAccept={() => onCommitDelete(deletedItem)}
        color="danger"
        title="Delete Room"
        descriptions="Are you sure want to delete this room?"
      />

      <div className="flex items-center bg-white py-4 px-6 shadow mb-6 rounded">
        <h1 className="text-2xl font-medium text-gray-600">Room</h1>
        <span className="ml-auto text-gray-600">{dayjs().format('dddd, MMMM D YYYY')}</span>
      </div>

      <div className="bg-white py-4 px-6 shadow mb-8 rounded">
        <div className="mb-6 flex">
          <div>
            <Button color="primary" icon="add" size="small" onClick={() => setIsAdd(true)}>
              Add Room
            </Button>
          </div>
          <div className="ml-auto flex">
            <div className="mr-1 w-64">
              <TextField noMargin size="small" name="name" placeholder="Find room" />
            </div>
            <IconButton icon="search" size="small" />
          </div>
        </div>

        <Table tableData={tableData} columns={columns} loading={isLoading} />
      </div>
    </div>
  )
}

export default RoomPage
