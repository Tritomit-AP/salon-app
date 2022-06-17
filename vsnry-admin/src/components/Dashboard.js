import React, { useEffect, useState } from "react"
import jwtDecode from 'jwt-decode'
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function Dashboard() {
	const [description, setDescription] = useState({
		title: "",
		about: ""
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	const { populateDescription, updateDescription, websiteDescription, logout } = useAuth()
	const { about, title } = websiteDescription
    const navigate = useNavigate()

	const handleChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target
        setDescription({
            ...description, 
            [name]: value
        })
    }

	const handleUpdate = async (e) => {
		e.preventDefault()
		//do some error check maybe
		try {
			setError("")
			setLoading(true)
			await updateDescription(description)
			setDescription({
				title: "",
				about: ""
			})
		} catch (error) {
			console.log('this is error from catch in Dashboard.js handleUpdate async fn', error)
			setError("Failed to update")
		}
		setLoading(false)
	}

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            const user = jwtDecode(token)
            if (!user) {
                localStorage.removeItem("token")
                navigate("/login")
            } else {
                populateDescription()
            }
        }
    }, [])

    return (
		<div>
			<form
				style={{
					display: "flex", 
					flexDirection: "column", 
					width: "30%",
					margin: "0 auto"
				}}
				onSubmit={handleUpdate}
			>
				<h1 style={{ textAlign: "center" }}>Website description</h1>
				<input onChange={handleChange} type="text" value={description.title} name='title' placeholder="title" />
				<input onChange={handleChange} type="text" value={description.about} name='about' placeholder="about" />
				<input type="submit" value="Update" disabled={loading} />
				<span>
					{title || "Default title"}
				</span>
				<span>
					{about || "Default about"}
				</span>
			</form>
			{ error && <span style={{ color: "red" }}>{error}</span> }
			<button onClick={logout}>Logout</button>
		</div>
	)
}