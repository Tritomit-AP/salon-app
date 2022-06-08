import React, { useState } from 'react'
import { Link } from "react-router-dom"

export default function Login() {
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    })

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

    const handleLogin = (e) => {
        e.preventDefault()
        console.log("login")
    }

    return (
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
            <input style={marginBottom} type="submit" value="Login" />
            <Link style={{ textAlign: "center" }} to="/register">No account? Register</Link>
        </form>
    )
}
