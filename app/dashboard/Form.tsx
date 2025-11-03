import React from 'react'
import { UserTable } from './UserTable'
import ThemeToggle from '@/components/toggleButton'
import { DialogData } from './dalogue'

export default function UserForm() {
  return (
    <div className='mt-6 mx-4  border-2 bg-gray-200 text-black  dark:bg-gray-900 dark:text-white p-4 rounded-lg'>
        <div className='flex justify-between'>
            <h1>Table of Invoices</h1>
            <div className='flex gap-3'>
              <ThemeToggle/>
               <DialogData/>
            </div>
        </div>
        <UserTable/>
    </div>
  )
}
