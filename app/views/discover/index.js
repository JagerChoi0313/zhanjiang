"use client"

import NavBar from "./c-cpns/nav-bar"
import {Suspense} from 'react'


const Discover=()=>{

    return(
        <div>
            <NavBar/>
            <Suspense fallback={<div>Loading...</div>}>
                
            </Suspense>
        </div>
    )
}

export default Discover