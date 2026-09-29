import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {supabase} from "../supabase/client"


function Registro(){

const navigate=useNavigate()

const [tipoCuenta,setTipoCuenta]=useState("ganaderia")

const [datos,setDatos]=useState({
nombre:"",
telefono:"",
correo:"",
password:"",
departamento:"",
provincia:"",
municipio:""
})

const [cargando,setCargando]=useState(false)
const [error,setError]=useState("")


function cambiarDato(e){

const {name,value}=e.target

setDatos({
...datos,
[name]:value
})

}


async function continuar(){

setError("")

if(
!datos.nombre ||
!datos.telefono ||
!datos.correo ||
!datos.password ||
!datos.departamento ||
!datos.provincia ||
!datos.municipio
){

setError("Completa todos los datos para continuar.")

return

}


if(datos.password.length<6){

setError(
"La contraseña debe tener al menos 6 caracteres."
)

return

}


setCargando(true)


try{


const {data,error:authError}=
await supabase.auth.signUp({

email:datos.correo,

password:datos.password,

options:{

data:{

nombre:datos.nombre,

telefono:datos.telefono,

tipo_cuenta:tipoCuenta,

departamento:datos.departamento,

provincia:datos.provincia,

municipio:datos.municipio

}

}

})


if(authError){

console.error(
"Error de registro:",
authError
)

setError(authError.message)

setCargando(false)

return

}


if(!data.user){

setError(
"No se pudo crear la cuenta."
)

setCargando(false)

return

}



/*
========================================
SI EL USUARIO YA TIENE SESIÓN
CREAMOS SU PERFIL
========================================
*/

if(data.session){

const {error:perfilError}=
await supabase
.from("perfiles")
.insert({

auth_id:data.user.id,

nombre:datos.nombre,

telefono:datos.telefono,

tipo_cuenta:tipoCuenta,

departamento:datos.departamento,

provincia:datos.provincia,

municipio:datos.municipio

})


if(perfilError){

console.error(
"Error al crear perfil:",
perfilError
)

setError(
"No se pudo guardar el perfil: " +
perfilError.message
)

setCargando(false)

return

}

}



/*
========================================
DATOS TEMPORALES PARA LA INTERFAZ
========================================
*/

const usuarioTemporal={

authId:data.user.id,

tipoCuenta:tipoCuenta,

nombre:datos.nombre,

telefono:datos.telefono,

correo:datos.correo,

departamento:datos.departamento,

provincia:datos.provincia,

municipio:datos.municipio

}


localStorage.setItem(
"usuarioAgroValle",
JSON.stringify(usuarioTemporal)
)



/*
========================================
SI SUPABASE EXIGE CONFIRMAR CORREO
========================================
*/

if(!data.session){

setCargando(false)

alert(
"Cuenta creada correctamente. Revisa tu correo electrónico y confirma tu cuenta."
)

navigate("/")

return

}



/*
========================================
SI EL USUARIO YA ESTÁ AUTENTICADO
========================================
*/

setCargando(false)


if(tipoCuenta==="ganaderia"){

navigate("/registro-ganaderia")

}else{

navigate("/")

}


}catch(errorGeneral){

console.error(
"Error inesperado:",
errorGeneral
)

setError(
"Ocurrió un error al crear la cuenta. Inténtalo nuevamente."
)

setCargando(false)

}

}



return(

<div className="min-h-screen bg-green-50 p-6">

<div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8">


<h1 className="text-3xl font-bold text-green-700">

Crear cuenta

</h1>


<p className="text-gray-600 mt-2">

Regístrate en Agro Valle

</p>



{/* TIPO DE CUENTA */}

<div className="grid grid-cols-2 gap-3 mt-6">


<button

type="button"

onClick={()=>setTipoCuenta("persona")}

className={

tipoCuenta==="persona"

? "bg-green-600 text-white p-3 rounded-xl"

: "border-2 border-green-600 text-green-700 p-3 rounded-xl"

}

>

Persona

</button>



<button

type="button"

onClick={()=>setTipoCuenta("ganaderia")}

className={

tipoCuenta==="ganaderia"

? "bg-green-600 text-white p-3 rounded-xl"

: "border-2 border-green-600 text-green-700 p-3 rounded-xl"

}

>

Ganadería / Empresa

</button>


</div>



{/* NOMBRE */}

<label className="block font-bold mt-6">

Nombre completo

</label>


<input

name="nombre"

value={datos.nombre}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

placeholder="Ej: Carlos Mendoza"

/>



{/* TELEFONO */}

<label className="block font-bold mt-4">

Teléfono / WhatsApp

</label>


<input

name="telefono"

value={datos.telefono}

onChange={cambiarDato}

type="tel"

className="w-full border rounded-xl p-3 mt-2"

placeholder="Ej: 70012345"

/>



{/* CORREO */}

<label className="block font-bold mt-4">

Correo electrónico

</label>


<input

name="correo"

value={datos.correo}

onChange={cambiarDato}

type="email"

autoComplete="email"

className="w-full border rounded-xl p-3 mt-2"

placeholder="Ej: usuario@gmail.com"

/>



{/* CONTRASEÑA */}

<label className="block font-bold mt-4">

Contraseña

</label>


<input

name="password"

value={datos.password}

onChange={cambiarDato}

type="password"

autoComplete="new-password"

className="w-full border rounded-xl p-3 mt-2"

placeholder="Mínimo 6 caracteres"

/>


<p className="text-sm text-gray-500 mt-2">

Usa una contraseña de mínimo 6 caracteres.

</p>



{/* DEPARTAMENTO */}

<label className="block font-bold mt-4">

Departamento

</label>


<select

name="departamento"

value={datos.departamento}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="">

Seleccionar departamento

</option>


<option value="Santa Cruz">

Santa Cruz

</option>


<option value="Cochabamba">

Cochabamba

</option>


<option value="Tarija">

Tarija

</option>


<option value="Beni">

Beni

</option>


<option value="Chuquisaca">

Chuquisaca

</option>


<option value="La Paz">

La Paz

</option>


<option value="Oruro">

Oruro

</option>


<option value="Potosí">

Potosí

</option>


<option value="Pando">

Pando

</option>


</select>



{/* PROVINCIA */}

<label className="block font-bold mt-4">

Provincia

</label>


<input

name="provincia"

value={datos.provincia}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

placeholder="Ej: Manuel María Caballero"

/>



{/* MUNICIPIO */}

<label className="block font-bold mt-4">

Municipio

</label>


<input

name="municipio"

value={datos.municipio}

onChange={cambiarDato}

className="w-full border rounded-xl p-3 mt-2"

placeholder="Ej: Comarapa"

/>



{/* ERROR */}

{error && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-5">

{error}

</div>

)}



{/* CONTINUAR */}

<button

type="button"

onClick={continuar}

disabled={cargando}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-7 font-bold disabled:opacity-50 disabled:cursor-not-allowed"

>

{

cargando

? "Creando cuenta..."

: "Continuar"

}

</button>



{/* VOLVER */}

<button

type="button"

onClick={()=>navigate("/")}

disabled={cargando}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold disabled:opacity-50"

>

Volver

</button>


</div>

</div>

)

}


export default Registro