"use client"

import NavBar from "./c-cpns/nav-bar"
import {Suspence} from 'react'


const Discover=()=>{

    return(
        <div>
            <NavBar/>
            <Suspence fallback={<div>Loading...</div>}>
                
            </Suspence>
        </div>
    )
}

export default Discover