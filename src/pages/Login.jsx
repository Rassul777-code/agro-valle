import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {supabase} from "../supabase/client"


function Login(){

const navigate=useNavigate()

const [correo,setCorreo]=useState("")
const [password,setPassword]=useState("")

const [cargando,setCargando]=useState(false)
const [error,setError]=useState("")


async function iniciarSesion(){

setError("")


if(!correo || !password){

setError(
"Ingresa tu correo electrónico y contraseña."
)

return

}


setCargando(true)


try{

const {data,error:loginError}=
await supabase.auth.signInWithPassword({

email:correo,

password:password

})


if(loginError){

console.error(
"Error al iniciar sesión:",
loginError
)

setError(
"Correo o contraseña incorrectos."
)

setCargando(false)

return

}


if(!data.user){

setError(
"No se pudo iniciar sesión."
)

setCargando(false)

return

}



/*
=====================================
BUSCAR PERFIL DEL USUARIO
=====================================
*/

const {data:perfil,error:perfilError}=
await supabase
.from("perfiles")
.select("*")
.eq("auth_id",data.user.id)
.maybeSingle()


if(perfilError){

console.error(
"Error buscando perfil:",
perfilError
)

setError(
"No se pudo cargar tu perfil."
)

setCargando(false)

return

}



/*
=====================================
SI TODAVÍA NO EXISTE PERFIL
LO CREAMOS CON LOS METADATOS
=====================================
*/

let perfilUsuario=perfil


if(!perfil){

const metadata=
data.user.user_metadata || {}


const {data:nuevoPerfil,error:crearError}=
await supabase
.from("perfiles")
.insert({

auth_id:data.user.id,

nombre:
metadata.nombre || "Usuario Agro Valle",

telefono:
metadata.telefono || "",

tipo_cuenta:
metadata.tipo_cuenta || "persona",

departamento:
metadata.departamento || "",

provincia:
metadata.provincia || "",

municipio:
metadata.municipio || ""

})
.select()
.single()


if(crearError){

console.error(
"Error creando perfil:",
crearError
)

setError(
"No se pudo crear tu perfil."
)

setCargando(false)

return

}


perfilUsuario=nuevoPerfil

}



/*
=====================================
GUARDAR DATOS PARA LA INTERFAZ ACTUAL
=====================================
*/

const usuarioAgroValle={

id:perfilUsuario.id,

authId:data.user.id,

tipoCuenta:
perfilUsuario.tipo_cuenta,

nombre:
perfilUsuario.nombre,

telefono:
perfilUsuario.telefono,

correo:
data.user.email,

departamento:
perfilUsuario.departamento,

provincia:
perfilUsuario.provincia,

municipio:
perfilUsuario.municipio,

nombreGanaderia:
perfilUsuario.nombre_ganaderia,

tipoProductor:
perfilUsuario.tipo_productor,

tipoGanado:
perfilUsuario.tipo_ganado,

cantidadAnimales:
perfilUsuario.cantidad_animales,

razasPrincipales:
perfilUsuario.razas_principales,

fotoGanaderia:
perfilUsuario.foto_ganaderia

}


localStorage.setItem(
"usuarioAgroValle",
JSON.stringify(usuarioAgroValle)
)


setCargando(false)


navigate("/")


}catch(errorGeneral){

console.error(
"Error inesperado:",
errorGeneral
)

setError(
"Ocurrió un error al iniciar sesión."
)

setCargando(false)

}

}



return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">

<div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">


<h1 className="text-3xl font-bold text-green-700">

Iniciar sesión

</h1>


<p className="text-gray-600 mt-2">

Ingresa a tu cuenta de Agro Valle

</p>



<label className="block font-bold mt-7">

Correo electrónico

</label>


<input

type="email"

value={correo}

onChange={(e)=>setCorreo(e.target.value)}

autoComplete="email"

className="w-full border rounded-xl p-3 mt-2"

placeholder="usuario@gmail.com"

/>



<label className="block font-bold mt-5">

Contraseña

</label>


<input

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

autoComplete="current-password"

className="w-full border rounded-xl p-3 mt-2"

placeholder="Tu contraseña"

/>



{error && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-5">

{error}

</div>

)}



<button

type="button"

onClick={iniciarSesion}

disabled={cargando}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-7 font-bold disabled:opacity-50"

>

{
cargando
? "Ingresando..."
: "Iniciar sesión"
}

</button>



<button

type="button"

onClick={()=>navigate("/registro")}

disabled={cargando}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold"

>

Crear una cuenta

</button>



<button

type="button"

onClick={()=>navigate("/")}

disabled={cargando}

className="w-full text-gray-600 p-3 mt-2 font-bold"

>

Volver al inicio

</button>


</div>

</div>

)

}


export default Login