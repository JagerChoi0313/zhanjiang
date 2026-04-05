"use client"

import {Suspense} from 'react'


const Discover=()=>{

    return(
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                
            </Suspense>
        </div>
    )
}

export default Discover