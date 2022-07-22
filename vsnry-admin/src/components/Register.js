import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
    const [credentials, setCredentials] = useState({
        name: "",
        email: "",
        password: ""
    })

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

    async function handleRegister(e) {
        e.preventDefault()
        const response = await fetch('http://localhost:1337/users/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                credentials
            })
        })

        const data = await response.json()
        
        if(data.status === 'ok') {
            navigate('/login')
        }
    }
    
    return (
        <form
            style={{
                display: "flex", 
                flexDirection: "column", 
                width: "30%",
                margin: "0 auto"
            }}
            onSubmit={handleRegister}
        >
            <h1 style={{ textAlign: "center" }}>Register</h1>
            <input
                style={marginBottom}
                onChange={handleChange}
                type="text"
                value={credentials.name}
                autoComplete="off"
                name="name"
                placeholder='name'
            />
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
            <button type="submit" style={marginBottom}>Register</button>
            <Link style={{ textAlign: "center" }} to="/login">Already registered? Login</Link>
        </form>
    )
}
