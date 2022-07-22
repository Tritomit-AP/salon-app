import React, { useEffect, useState } from "react"
import jwtDecode from 'jwt-decode'
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useFormik } from "formik"

export default function Dashboard() {
	const [loading, setLoading] = useState(false)

	const { populateDescription, updateDescription, websiteDescription, logout, error } = useAuth()
	const { about, title } = websiteDescription
    const navigate = useNavigate()

	const formik = useFormik({
		initialValues: {
			title: "",
			about: ""
		},
		onSubmit: async (description, {resetForm}) => {
            setLoading(true)
            await updateDescription(description)
			resetForm({})
            setLoading(false)
        }
	})

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
			<Link to='/settings'>My settings</Link>
			<form
				style={{
					display: "flex", 
					flexDirection: "column", 
					width: "30%",
					margin: "0 auto"
				}}
				onSubmit={formik.handleSubmit}
			>
				<h1 style={{ textAlign: "center" }}>Website description</h1>
				<input onChange={formik.handleChange} type="text" value={formik.values.title} name='title' placeholder="title" />
				<input onChange={formik.handleChange} type="text" value={formik.values.about} name='about' placeholder="about" />
            	<button type='submit' disabled={loading}>Update</button>
				<span>
					{title || "Beauty" }
				</span>
				<span>
					{about || "Comes first"}
				</span>
			</form>
			{ error && <span style={{ color: "red" }}>{error}</span> }
			<button onClick={logout}>Logout</button>
		</div>
	)
}