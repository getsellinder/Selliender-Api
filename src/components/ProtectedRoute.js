import React, { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";
const ProtectedRoute = (props) => {
    let Cmp = props;
    const history = useNavigate();
    useEffect(() => {
        if (!localStorage.getItem('authToken'))
            history('/')
    }, [])
    return (
        <>
            <Cmp />
            {/* {...props} */}
        </>
    )
}

export default ProtectedRoute