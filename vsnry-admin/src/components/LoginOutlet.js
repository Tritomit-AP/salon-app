import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginOutlet({ children: login }) {
    const { currentUser } = useAuth()
    const { user, token } = currentUser
    
    return (
        user && token ? <Navigate to="/" /> : login 
    )
}
