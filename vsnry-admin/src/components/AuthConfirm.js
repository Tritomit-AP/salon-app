import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'
import { useFormik } from 'formik'
import * as yup from 'yup'

export default function AuthConfirm() {
    const [loading, setLoading] = useState(false)
    const { authConfirm, currentUser, error } = useAuth()
    const { success, user, user: { providedAuth } } = currentUser
    const navigate = useNavigate()

    const marginBottom = {
        marginBottom: "10px"
    }

    const formik = useFormik({
        initialValues: { authCode: "" },
        validationSchema: yup.object({
            authCode: yup.string().required("The authentication code is required").min(6, "The authentication code must have 6 digits"),
        }),
        onSubmit: async (authCode, {resetForm}) => {
            setLoading(true)
            await authConfirm(authCode, user)
            resetForm({})
            setLoading(false)
        }
    }) 
    
    useEffect(() => {
        if (success && providedAuth) navigate("/")
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
            <h1 style={{ textAlign: "center" }}>Confirm your identity</h1>
            <h4 style={{ textAlign: "center" }}>Please enter the 6 digit code you have just received on your email address.</h4>
            <span style={{ textAlign: "center" }}>Note: if you refresh this page, you will have to login again, thus receive a new code. This will automatically make the previous one invalid.</span>
            <input
                style={marginBottom}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type="text"
                value={formik.values.authCode}
                autoComplete="off"
                name="authCode"
                placeholder='Authentication code'
                maxLength={6}
            />
            {formik.errors.authCode && formik.touched.authCode && (
                <span style={{ color: "red" }}>{formik.errors.authCode}</span>
            )}
            <input style={marginBottom} type="submit" value="Confirm" disabled={loading} />
			{error && <span style={{ color: "red" }}>{error}</span>}
        </form>
    )
}