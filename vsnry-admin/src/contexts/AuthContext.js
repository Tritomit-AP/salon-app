import React, { useContext, useState } from 'react'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState({
        success: localStorage.getItem("success") || false,
        user: localStorage.getItem("user") || {},
        token: localStorage.getItem("token") || "",
    })
    const [error, setError] = useState("")
    const [websiteDescription, setWebsiteDescription] = useState({})

    async function login(credentials) {
        setError("")
        try {
            const response = await fetch('http://localhost:1337/users/login', {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
            },
                body: JSON.stringify({ credentials })
            })
        
            const data = await response.json()
            if(data.success) {
                setCurrentUser(data)
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError("Something went wrong. Please try again.")
        }
    }

    async function authConfirm({authCode}, user) {
        setError("")
        const { _id: userId, email, name } = user
        try {
            const response = await fetch('http://localhost:1337/auth-confirm', {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
            },
                body: JSON.stringify({ authCode, userId, email, name })
            })
        
            const data = await response.json()
            const { user, token, success } = data
            if(success) {
                localStorage.setItem("token", token)
                localStorage.setItem("user", JSON.stringify(user))
                localStorage.setItem("success", success)
                setCurrentUser(data)
            } else {
                setError(data.error)
            }
        } catch (error) {
            setError("Something went wrong. Please try again.")
        }
    }

    function logout() {
        setError("")
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("success")
        setCurrentUser({
            success: false,
            user: {},
            token: ""
        })
    }

    async function populateDescription() {
        setError("")
        try {
            const response = await fetch("http://localhost:1337/api/description", {
                headers: {
                    "Authorization": `Bearer ${currentUser.token}`,
                },
            })

            const data = await response.json()
            const descriptionData = data.description[0]
            setWebsiteDescription({
                ...websiteDescription, 
                title: descriptionData.title,
                about: descriptionData.about
            })
        } catch (error) {
            setError("Something went wrong. Please try again.")
        }
        
    }

    async function updateDescription(description) {
        setError("")
        try {
            const response = await fetch("http://localhost:1337/api/description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(description)
            })

            const data = await response.json()
            const newDescriptionData = data.newDescription[0]
            setWebsiteDescription({
                ...websiteDescription,
                title: newDescriptionData.title,
                about: newDescriptionData.about
            })
        } catch (error) {
            setError("Something went wrong. Please try again.")
        }
    }

    const value = {
        currentUser,
        setCurrentUser,
        error,
        login,
        authConfirm,
        logout,
        populateDescription,
        updateDescription,
        websiteDescription
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}