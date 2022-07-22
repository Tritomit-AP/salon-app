import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../contexts/AuthContext"
import { useFormik } from "formik"
import * as yup from 'yup'

export default function Settings() {
    const [loading, setLoading] = useState(false)
    const [isMyInputFocused, setIsMyInputFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { login, currentUser, error } = useAuth()
    const { success, user: { providedAuth } } = currentUser
    const navigate = useNavigate()
    const minEight = new RegExp(/^(?=.{8,})/)
    const oneLowercase = new RegExp(/^(?=.*[a-z])/)
    const oneUppercase = new RegExp(/^(?=.*[A-Z])/)
    const oneNumber = new RegExp(/^(?=.*[0-9])/)
    const oneSpecial = new RegExp(/^(?=.*[!@#\$%\^&\*])/)

    const flex = {
        display: "flex", 
        flexDirection: "column", 
        width: "30%",
        margin: "0 auto"
    }

    const formik = useFormik({
        initialValues: {
            newEmail: "",
            currentPassword: "",
            newPassword: ""
        },
        validationSchema: yup.object().shape({
            newEmail: yup.string().email("Invalid email address"),
            currentPassword: yup
                .string()
                .when("newPassword", {
                    is: (newPassword) => newPassword,
                    then: yup.string().required('For setting a new password, the current password is required')
                }),
            newPassword: yup
                .string()
                .when("currentPassword", {
                    is: (currentPassword) => currentPassword,
                    then: yup.string().required("Please enter your new password")
                })
                .min(8, "The new password must be at least 8 characters long")
                .matches(oneLowercase, "The new password must contain at least one lowercase character")
                .matches(oneUppercase, "The new password must contain at least one uppercase character")
                .matches(oneNumber, "The new password must contain at least one number")
                .matches(oneSpecial, "The new password must contain at least one special character")
        }, [[ "currentPassword", "newPassword" ]]),
        onSubmit: async (newCredentials, {resetForm}) => {
            setLoading(true)
            // await login(newCredentials)
            // resetForm({})
            console.log(newCredentials)
            setLoading(false)
        } 
    })

    const handleBlur = (e) => {
        setIsMyInputFocused(false)
        formik.handleBlur(e)
    }

    const handleValidation = (condition) => {
        return formik.values.newPassword.match(condition)
    }
    
    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Settings</h1>
            <form onSubmit={formik.handleSubmit} style={flex}>
                <span>Leave either of the email or password fields empty to keep the current credentials.</span>
                <input
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type="text"
                    value={formik.values.newEmail}
                    name='newEmail'
                    autoComplete='new-email'
                    placeholder="update email"
                />
                {formik.errors.newEmail && formik.touched.newEmail && (
                    <span style={{ color: "red" }}>{formik.errors.newEmail}</span>
                )}
				<input
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.currentPassword}
                    type="password"
                    name='currentPassword'
                    autoComplete='new-password'
                    placeholder="your current password"
                />
                {formik.errors.currentPassword && formik.touched.currentPassword && (
                    <span style={{ color: "red" }}>{formik.errors.currentPassword}</span>
                )}
                <div>
                    <input
                        onChange={formik.handleChange}
                        onFocus={() => setIsMyInputFocused(true)}
                        onBlur={(e) => handleBlur(e)}
                        value={formik.values.newPassword}
                        type={showPassword ? "text" : "password"}
                        name='newPassword'
                        autoComplete='new-password'
                        placeholder="the new password"
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ textDecoration: showPassword ? "line-through" : "none", cursor: "pointer" }}
                    >SHOW
                    </span>
                </div>
                {formik.errors.newPassword && formik.touched.newPassword && (
                    <span style={{ color: "red" }}>{formik.errors.newPassword}</span>
                )}
                {isMyInputFocused && (
                    <div style={flex}>
                        <span style={{ color: handleValidation(minEight) && "darkcyan" }}>8 characters long</span>
                        <span style={{ color: handleValidation(oneLowercase) && "darkcyan" }}>contains one lowercase character</span>
                        <span style={{ color: handleValidation(oneUppercase) && "darkcyan" }}>contains one uppercase character</span>
                        <span style={{ color: handleValidation(oneNumber) && "darkcyan" }}>contains one number</span>
                        <span style={{ color: handleValidation(oneSpecial) && "darkcyan" }}>contains one special character</span>
                    </div>
                )}        
                <button 
                    type='submit'
                    disabled={
                        loading || ((
                            formik.values.newEmail ||
                            formik.values.currentPassword ||
                            formik.values.newPassword
                        ) ? false : true)
                    }
                >
                    Update
                </button>
            </form>
			{ error && <span style={{ color: "red" }}>{error}</span> }
            <Link to='/'>Go back</Link>
        </div>
    )
}