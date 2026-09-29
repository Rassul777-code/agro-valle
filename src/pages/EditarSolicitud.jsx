import {useEffect,useState} from "react"
import {useNavigate,useParams} from "react-router-dom"
import {supabase} from "../supabase/client"


function EditarSolicitud(){

const {id}=useParams()
const navigate=useNavigate()

const [cargando,setCargando]=useState(true)
const [guardando,setGuardando]=useState(false)
const [error,setError]=useState("")

const [perfilId,setPerfilId]=useState(null)

const [formulario,setFormulario]=useState({

titulo:"",
tipoGanado:"",
raza:"",
sexo:"",
cantidad:"",
edadMin:"",
edadMax:"",
pesoMin:"",
pesoMax:"",
presupuesto:"",
tipoPresupuesto:"Por cabeza",
departamento:"",
provincia:"",
municipio:"",
urgencia:"Sin urgencia",
descripcion:""

})


useEffect(()=>{

cargarSolicitud()

},[id])



async function cargarSolicitud(){

setCargando(true)
setError("")


try{


const {
data:datosSesion
}=await supabase.auth.getSession()


const usuarioAuth=
datosSesion?.session?.user


if(!usuarioAuth){

navigate("/login")

return

}



const {
data:perfil,
error:errorPerfil
}=await supabase
.from("perfiles")
.select("id")
.eq("auth_id",usuarioAuth.id)
.single()


if(errorPerfil || !perfil){

throw new Error(
"No se pudo encontrar tu perfil."
)

}


setPerfilId(perfil.id)



const {
data:solicitud,
error:errorSolicitud
}=await supabase
.from("solicitudes_compra")
.select("*")
.eq("id",id)
.eq("usuario_id",perfil.id)
.single()


if(errorSolicitud || !solicitud){

throw new Error(
"No se encontró la solicitud o no tienes permiso para editarla."
)

}



setFormulario({

titulo:
solicitud.titulo || "",

tipoGanado:
solicitud.tipo_ganado || "",

raza:
solicitud.raza || "",

sexo:
solicitud.sexo || "",

cantidad:
solicitud.cantidad ?? "",

edadMin:
solicitud.edad_min ?? "",

edadMax:
solicitud.edad_max ?? "",

pesoMin:
solicitud.peso_min ?? "",

pesoMax:
solicitud.peso_max ?? "",

presupuesto:
solicitud.presupuesto ?? "",

tipoPresupuesto:
solicitud.tipo_presupuesto || "Por cabeza",

departamento:
solicitud.departamento || "",

provincia:
solicitud.provincia || "",

municipio:
solicitud.municipio || "",

urgencia:
solicitud.urgencia || "Sin urgencia",

descripcion:
solicitud.descripcion || ""

})


}catch(error){

console.error(
"Error cargando solicitud:",
error
)

setError(
error.message ||
"No se pudo cargar la solicitud."
)

}


setCargando(false)

}



function cambiarFormulario(e){

const {
name,
value
}=e.target


setFormulario({

...formulario,

[name]:value

})

}



async function guardarCambios(e){

e.preventDefault()


if(
!formulario.titulo.trim() ||
!formulario.tipoGanado
){

alert(
"Completa el título y el tipo de ganado."
)

return

}


if(!perfilId){

alert(
"No se pudo verificar tu perfil."
)

return

}


setGuardando(true)


try{


const cambios={

titulo:
formulario.titulo.trim(),

tipo_ganado:
formulario.tipoGanado,

raza:
formulario.raza || null,

sexo:
formulario.sexo || null,

cantidad:
formulario.cantidad
?
Number(formulario.cantidad)
:
null,

edad_min:
formulario.edadMin
?
Number(formulario.edadMin)
:
null,

edad_max:
formulario.edadMax
?
Number(formulario.edadMax)
:
null,

peso_min:
formulario.pesoMin
?
Number(formulario.pesoMin)
:
null,

peso_max:
formulario.pesoMax
?
Number(formulario.pesoMax)
:
null,

presupuesto:
formulario.presupuesto
?
Number(formulario.presupuesto)
:
null,

tipo_presupuesto:
formulario.tipoPresupuesto,

departamento:
formulario.departamento || null,

provincia:
formulario.provincia || null,

municipio:
formulario.municipio || null,

urgencia:
formulario.urgencia,

descripcion:
formulario.descripcion || null

}



const {
error:errorActualizar
}=await supabase
.from("solicitudes_compra")
.update(cambios)
.eq("id",id)
.eq("usuario_id",perfilId)


if(errorActualizar){

throw errorActualizar

}


alert(
"Solicitud actualizada correctamente."
)


navigate(
`/solicitud/${id}`
)


}catch(error){

console.error(
"Error actualizando solicitud:",
error
)

alert(
"Hubo un problema al actualizar la solicitud."
)

}


setGuardando(false)

}
if(cargando){

return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">

<div className="bg-white rounded-3xl shadow-xl p-8 text-center">

<p className="text-green-700 font-bold">

Cargando solicitud...

</p>

</div>

</div>

)

}



if(error){

return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">

<div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">

<h1 className="text-2xl font-bold text-red-600">

No se puede editar

</h1>

<p className="text-gray-600 mt-3">

{error}

</p>

<button
type="button"
onClick={()=>navigate("/mi-cuenta")}
className="w-full bg-green-700 text-white p-4 rounded-xl mt-6 font-bold"
>

Volver a Mi cuenta

</button>

</div>

</div>

)

}



return(

<div className="min-h-screen bg-green-50 p-6">

<div className="max-w-3xl mx-auto">


<button
type="button"
onClick={()=>navigate("/mi-cuenta")}
className="text-green-700 font-bold mb-5"
>

← Volver a Mi cuenta

</button>



<div className="bg-white rounded-3xl shadow-xl p-7 md:p-9">


<h1 className="text-3xl font-bold text-green-700">

Editar solicitud de compra

</h1>


<p className="text-gray-600 mt-2">

Actualiza los datos del ganado que estás buscando.

</p>



<form
onSubmit={guardarCambios}
className="mt-8"
>


<label className="block font-bold text-gray-700">

Título de la solicitud

</label>


<input
type="text"
name="titulo"
value={formulario.titulo}
onChange={cambiarFormulario}
placeholder="Ej: Busco 10 toros Nelore"
className="w-full border rounded-xl p-3 mt-2"
/>



<div className="grid md:grid-cols-2 gap-5 mt-5">


<div>

<label className="block font-bold text-gray-700">

Tipo de ganado

</label>


<select
name="tipoGanado"
value={formulario.tipoGanado}
onChange={cambiarFormulario}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar

</option>

<option value="Toro">

Toro

</option>

<option value="Vaca">

Vaca

</option>

<option value="Bovino">

Bovino

</option>

<option value="Caballo">

Caballo

</option>

<option value="Cerdo">

Cerdo

</option>

<option value="Caprino">

Caprino

</option>

<option value="Ovino">

Ovino

</option>

</select>

</div>



<div>

<label className="block font-bold text-gray-700">

Raza

</label>


<input
type="text"
name="raza"
value={formulario.raza}
onChange={cambiarFormulario}
placeholder="Ej: Nelore"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="block font-bold text-gray-700">

Sexo

</label>


<select
name="sexo"
value={formulario.sexo}
onChange={cambiarFormulario}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Cualquiera

</option>

<option value="Macho">

Macho

</option>

<option value="Hembra">

Hembra

</option>

</select>

</div>



<div>

<label className="block font-bold text-gray-700">

Cantidad

</label>


<input
type="number"
name="cantidad"
value={formulario.cantidad}
onChange={cambiarFormulario}
placeholder="Ej: 10"
min="1"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


</div>



<h2 className="text-xl font-bold text-gray-800 mt-8">

Edad buscada

</h2>


<div className="grid md:grid-cols-2 gap-5 mt-4">


<div>

<label className="block text-gray-600">

Edad mínima

</label>


<input
type="number"
name="edadMin"
value={formulario.edadMin}
onChange={cambiarFormulario}
placeholder="Mínima"
min="0"
step="0.1"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="block text-gray-600">

Edad máxima

</label>


<input
type="number"
name="edadMax"
value={formulario.edadMax}
onChange={cambiarFormulario}
placeholder="Máxima"
min="0"
step="0.1"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


</div>



<h2 className="text-xl font-bold text-gray-800 mt-8">

Peso buscado

</h2>


<div className="grid md:grid-cols-2 gap-5 mt-4">


<div>

<label className="block text-gray-600">

Peso mínimo (kg)

</label>


<input
type="number"
name="pesoMin"
value={formulario.pesoMin}
onChange={cambiarFormulario}
placeholder="Ej: 300"
min="0"
step="0.1"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="block text-gray-600">

Peso máximo (kg)

</label>


<input
type="number"
name="pesoMax"
value={formulario.pesoMax}
onChange={cambiarFormulario}
placeholder="Ej: 500"
min="0"
step="0.1"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


</div>



<h2 className="text-xl font-bold text-gray-800 mt-8">

Presupuesto

</h2>


<div className="grid md:grid-cols-2 gap-5 mt-4">


<div>

<label className="block text-gray-600">

Monto máximo (Bs)

</label>


<input
type="number"
name="presupuesto"
value={formulario.presupuesto}
onChange={cambiarFormulario}
placeholder="Ej: 5000"
min="0"
step="0.01"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="block text-gray-600">

Tipo de presupuesto

</label>


<select
name="tipoPresupuesto"
value={formulario.tipoPresupuesto}
onChange={cambiarFormulario}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="Por cabeza">

Por cabeza

</option>

<option value="Total">

Total

</option>

</select>

</div>


</div>
<h2 className="text-xl font-bold text-gray-800 mt-8">

Ubicación

</h2>


<div className="grid md:grid-cols-3 gap-5 mt-4">


<div>

<label className="block text-gray-600">

Departamento

</label>


<select
name="departamento"
value={formulario.departamento}
onChange={cambiarFormulario}
className="w-full border rounded-xl p-3 mt-2"
>

<option value="">

Seleccionar

</option>

<option value="Santa Cruz">

Santa Cruz

</option>

<option value="Cochabamba">

Cochabamba

</option>

<option value="La Paz">

La Paz

</option>

<option value="Beni">

Beni

</option>

<option value="Pando">

Pando

</option>

<option value="Tarija">

Tarija

</option>

<option value="Chuquisaca">

Chuquisaca

</option>

<option value="Oruro">

Oruro

</option>

<option value="Potosí">

Potosí

</option>

</select>

</div>



<div>

<label className="block text-gray-600">

Provincia

</label>


<input
type="text"
name="provincia"
value={formulario.provincia}
onChange={cambiarFormulario}
placeholder="Provincia"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>



<div>

<label className="block text-gray-600">

Municipio

</label>


<input
type="text"
name="municipio"
value={formulario.municipio}
onChange={cambiarFormulario}
placeholder="Municipio"
className="w-full border rounded-xl p-3 mt-2"
/>

</div>


</div>



<h2 className="text-xl font-bold text-gray-800 mt-8">

Urgencia

</h2>


<select
name="urgencia"
value={formulario.urgencia}
onChange={cambiarFormulario}
className="w-full border rounded-xl p-3 mt-3"
>

<option value="Sin urgencia">

Sin urgencia

</option>

<option value="Esta semana">

Esta semana

</option>

<option value="Este mes">

Este mes

</option>

<option value="Lo antes posible">

Lo antes posible

</option>

</select>



<h2 className="text-xl font-bold text-gray-800 mt-8">

Descripción

</h2>


<textarea
name="descripcion"
value={formulario.descripcion}
onChange={cambiarFormulario}
placeholder="Describe con más detalle el ganado que estás buscando..."
rows="5"
className="w-full border rounded-xl p-3 mt-3"
/>



<div className="grid md:grid-cols-2 gap-4 mt-8">


<button
type="button"
onClick={()=>navigate("/mi-cuenta")}
disabled={guardando}
className="border-2 border-green-700 text-green-700 p-4 rounded-xl font-bold"
>

Cancelar

</button>



<button
type="submit"
disabled={guardando}
className="bg-green-700 text-white p-4 rounded-xl font-bold disabled:opacity-50"
>

{
guardando
?
"Guardando..."
:
"Guardar cambios"
}

</button>


</div>


</form>


</div>


</div>


</div>

)

}


export default EditarSolicitud