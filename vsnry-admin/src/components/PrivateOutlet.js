import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateOutlet() {
    const { currentUser } = useAuth()
    const { user, token } = currentUser

    return (
        user && token ? <Outlet /> : <Navigate to="/login" />
    )
}
