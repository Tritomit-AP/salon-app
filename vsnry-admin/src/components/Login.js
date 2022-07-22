import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'
import { useFormik } from 'formik'
import * as yup from 'yup'

export default function Login() {
    const [loading, setLoading] = useState(false)
    const { login, currentUser, error } = useAuth()
    const { success, user: { providedAuth } } = currentUser
    const navigate = useNavigate()

    const marginBottom = {
        marginBottom: "10px"
    }

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: yup.object({
            email: yup.string().email("Invalid email address").required("The email is required"),
            password: yup.string().required("The password is required")
        }),
        onSubmit: async (credentials, {resetForm}) => {
            setLoading(true)
            await login(credentials)
            resetForm({})
            setLoading(false)
        } 
    })

    useEffect(() => {
        if (success && !providedAuth) navigate("/confirm-login")
    }, [success, providedAuth])
    return (
        <form
            style={{
                display: "flex", 
                flexDirection: "column", 
                width: "30%",
                margin: "0 auto"
            }}
            onSubmit={formik.handleSubmit}
        >
            <h1 style={{ textAlign: "center" }}>Login</h1>
            <input
                style={marginBottom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type="text"
                value={formik.values.email}
                autoComplete="off"
                name="email"
                placeholder='Email'
            />
            {formik.errors.email && formik.touched.email && (
                <span style={{ color: "red" }}>{formik.errors.email}</span>
            )}
            <input
                style={marginBottom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type="password"
                value={formik.values.password}
                autoComplete="off"
                name="password"
                placeholder='Password'
            />
            {formik.errors.password && formik.touched.password && (
                <span style={{ color: "red" }}>{formik.errors.password}</span>
            )}
            <button type='submit' disabled={loading} style={marginBottom}>Login</button>
            {error && <span style={{ color: "red" }}>{error}</span>}
        </form>
    )
}