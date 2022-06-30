import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthConfirmOutlet({ children: authConfirm }) {
    const { currentUser } = useAuth()
    const { success, user: { providedAuth }, user, token } = currentUser

    return (
        user && token ? <Navigate to="/" /> :
        success && !providedAuth ? authConfirm : <Navigate to="/login" />
    )
}