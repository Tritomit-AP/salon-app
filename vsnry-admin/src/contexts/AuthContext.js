import React, { useContext, useState } from 'react'

const AuthContext = React.createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState({
        success: localStorage.getItem("success") || false,
        user: JSON.parse(localStorage.getItem("user")) || {},
        token: localStorage.getItem("token") || ""
    })
    const [websiteDescription, setWebsiteDescription] = useState({})
    
    async function login(credentials) {
        const response = await fetch('http://localhost:1337/users/login', {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json"
            },
                body: JSON.stringify({ credentials })
            })
        
        const data = await response.json()
        const { user, token, success } = data
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("success", success)
        setCurrentUser(data)
        return data
    }

    function logout() {
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
        return data
    }

    async function updateDescription(description) {
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
    }

    const value = {
        currentUser,
        login,
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