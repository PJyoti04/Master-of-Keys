import React from 'react'
import ProfileDisplay from '../components/dashboard/ProfileDisplay'
import { Outlet } from 'react-router-dom'

function Dashboard() {
  return (
    <div className=''>
        {/* <ProfileDisplay /> */}
        <Outlet />
    </div>
  )
}

export default Dashboard