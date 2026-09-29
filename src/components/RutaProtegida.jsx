import {
Navigate
} from "react-router-dom"

import {
useEffect,
useState
} from "react"

import {
supabase
} from "../supabase/client"



function RutaProtegida({children}){


const [cargando,setCargando]=useState(true)

const [sesion,setSesion]=useState(null)



useEffect(()=>{


async function verificarSesion(){


const {
data
}=await supabase.auth.getSession()



setSesion(
data.session
)


setCargando(false)


}



verificarSesion()



},[])



if(cargando){

return(

<div className="min-h-screen bg-green-50 flex items-center justify-center">

<p className="text-green-700 font-bold">

Verificando sesión...

</p>

</div>

)

}



if(!sesion){

return(

<Navigate to="/login"/>

)

}



return children


}


export default RutaProtegida