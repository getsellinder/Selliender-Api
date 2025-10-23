import React from 'react'
import { useNavigate } from 'react-router-dom'

const PageNotfound = () => {
    let navigate=useNavigate()
  return (
    <div>
        <h1>Page not found 404</h1>
        <button onClick={()=>navigate("/google/login")}>login</button>
    </div>
  )
}

export default PageNotfound