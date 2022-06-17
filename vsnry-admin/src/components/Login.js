import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const { login, currentUser } = useAuth()
    const navigate = useNavigate()

    const marginBottom = {
        marginBottom: "10px"
    }

    const handleChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target
        setCredentials({
            ...credentials, 
            [name]: value
        })
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        //do some error check maybe formik or something
        try {
            setError('')
            setLoading(true)
            await login(credentials)
            setCredentials({ email: "", password: ""})
            navigate('/')
        } catch (error) {
            console.log('this is error from catch in Login.js async fn', error)
            setError("Failed to login")
        }
        setLoading(false)
    }

    return currentUser.success ? (
        <Navigate to='/' />
    ) : (
        <form
            style={{
                display: "flex", 
                flexDirection: "column", 
                width: "30%",
                margin: "0 auto"
            }}
            onSubmit={handleLogin}
        >
            <h1 style={{ textAlign: "center" }}>Login</h1>
            <input
                style={marginBottom}
                onChange={handleChange}
                type="email"
                value={credentials.email}
                autoComplete="off"
                name="email"
                placeholder='email'
            />
            <input
                style={marginBottom}
                onChange={handleChange}
                type="password"
                value={credentials.password}
                autoComplete="off"
                name="password"
                placeholder='password'
            />
            <input style={marginBottom} type="submit" value="Login" disabled={loading} />
			{ error && <span style={{ color: "red" }}>{error}</span> }
            <Link style={{ textAlign: "center" }} to="/register">No account? Register</Link>
        </form>
    )
}