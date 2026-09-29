import {
useContext,
useEffect,
useMemo,
useState
} from "react"

import {
useNavigate
} from "react-router-dom"

import {
GanadoContext
} from "../context/GanadoContext"

import {
supabase
} from "../supabase/client"



function MiCuenta(){


const navigate=useNavigate()



const {

ganado,

cargandoGanado,

cargarGanado,

cambiarEstadoGanado

}=useContext(GanadoContext)



const [eliminandoId,setEliminandoId]=useState(null)

const [solicitudes,setSolicitudes]=useState([])

const [cargandoSolicitudes,setCargandoSolicitudes]=useState(true)

const [cambiandoSolicitudId,setCambiandoSolicitudId]=useState(null)



const usuarioGuardado=
localStorage.getItem(
"usuarioAgroValle"
)



let usuario=null


try{

usuario=
usuarioGuardado
?
JSON.parse(usuarioGuardado)
:
null


}catch(error){

console.log(error)

usuario=null

}



/*
====================================
MIS PUBLICACIONES
====================================
*/


const misPublicaciones=
useMemo(()=>{


if(!usuario?.id){

return []

}


return ganado.filter(

(animal)=>

String(animal.usuario_id)===

String(usuario.id)

)


},[
ganado,
usuario?.id
])



/*
====================================
ESTADÍSTICAS
====================================
*/


const totalPublicaciones=
misPublicaciones.length



const disponibles=
misPublicaciones.filter(

(animal)=>

animal.estado==="Disponible"

).length



const reservados=
misPublicaciones.filter(

(animal)=>

animal.estado==="Reservado"

).length



const vendidos=
misPublicaciones.filter(

(animal)=>

animal.estado==="Vendido"

).length





/*
====================================
MIS SOLICITUDES DE COMPRA
====================================
*/


useEffect(()=>{


if(usuario?.id){

cargarSolicitudes()

}else{

setSolicitudes([])

setCargandoSolicitudes(false)

}


},[usuario?.id])




async function cargarSolicitudes(){


if(!usuario?.id){

setSolicitudes([])

setCargandoSolicitudes(false)

return

}


setCargandoSolicitudes(true)


try{


const {
data,
error
}=await supabase
.from("solicitudes_compra")
.select("*")
.eq("usuario_id",usuario.id)
.order(
"creado_en",
{
ascending:false
}
)


if(error){

throw error

}


setSolicitudes(
data || []
)


}catch(error){


console.log(
"Error cargando solicitudes:",
error
)


setSolicitudes([])


}


setCargandoSolicitudes(false)


}




async function cambiarEstadoSolicitud(
id,
nuevoEstado
){


if(!usuario?.id){

return

}


setCambiandoSolicitudId(id)


try{


const {
error
}=await supabase
.from("solicitudes_compra")
.update({
estado:nuevoEstado
})
.eq("id",id)
.eq("usuario_id",usuario.id)


if(error){

throw error

}


setSolicitudes(

(solicitudesActuales)=>

solicitudesActuales.map(

(solicitud)=>

solicitud.id===id

?

{
...solicitud,
estado:nuevoEstado
}

:

solicitud

)

)


}catch(error){


console.log(
"Error cambiando estado de solicitud:",
error
)


alert(
"No se pudo cambiar el estado de la solicitud."
)


}


setCambiandoSolicitudId(null)


}




async function eliminarSolicitud(id){


const confirmar=
window.confirm(
"¿Seguro que quieres eliminar esta solicitud de compra?"
)


if(!confirmar){

return

}


if(!usuario?.id){

return

}


setCambiandoSolicitudId(id)


try{


const {
error
}=await supabase
.from("solicitudes_compra")
.delete()
.eq("id",id)
.eq("usuario_id",usuario.id)


if(error){

throw error

}


setSolicitudes(

(solicitudesActuales)=>

solicitudesActuales.filter(

(solicitud)=>

solicitud.id!==id

)

)


alert(
"Solicitud eliminada correctamente."
)


}catch(error){


console.log(
"Error eliminando solicitud:",
error
)


alert(
"No se pudo eliminar la solicitud."
)


}


setCambiandoSolicitudId(null)


}




function formatearPresupuesto(precio){


if(
precio===null ||
precio===undefined ||
precio===""
){

return "A convenir"

}


const numero=
Number(precio)


if(
Number.isNaN(numero)
){

return `${precio} Bs`

}


return `${numero.toLocaleString("es-BO")} Bs`


}




function obtenerUbicacionSolicitud(
solicitud
){


const ubicacion=[

solicitud.municipio,

solicitud.provincia,

solicitud.departamento

]

.filter(Boolean)

.join(" - ")


return(
ubicacion ||
"Ubicación no especificada"
)


}





/*
====================================
CERRAR SESIÓN
====================================
*/


async function cerrarSesion(){


const confirmar=
window.confirm(
"¿Quieres cerrar sesión en Agro Valle?"
)


if(!confirmar){

return

}


await supabase.auth.signOut()


localStorage.removeItem(
"usuarioAgroValle"
)


navigate("/")


}





/*
====================================
ELIMINAR PUBLICACIÓN
====================================
*/


async function eliminarPublicacion(id){


const confirmar=
window.confirm(
"¿Eliminar esta publicación?"
)


if(!confirmar){

return

}


setEliminandoId(id)


try{


const {
data:fotos
}=await supabase
.from("publicacion_fotos")
.select("ruta_storage")
.eq("publicacion_id",id)


const rutas=

(fotos || [])

.map(
(foto)=>foto.ruta_storage
)

.filter(Boolean)


if(rutas.length>0){


await supabase
.storage
.from("ganado")
.remove(rutas)


}


await supabase
.from("publicacion_fotos")
.delete()
.eq("publicacion_id",id)


await supabase
.from("publicaciones")
.delete()
.eq("id",id)


await cargarGanado()


alert(
"Publicación eliminada correctamente."
)


}catch(error){


console.log(error)


alert(
"No se pudo eliminar."
)


}


setEliminandoId(null)


}
if(!usuario){


return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white rounded-3xl shadow-xl p-8 text-center">


<h1 className="text-2xl font-bold text-green-700">

No tienes una cuenta

</h1>


<button

onClick={()=>navigate("/registro")}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-6 font-bold"

>

Crear cuenta

</button>


</div>


</div>

)

}



return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-4xl mx-auto">


<div className="flex justify-between items-center mb-6">


<div>

<h1 className="text-3xl font-bold text-green-700">

Mi cuenta

</h1>


<p className="text-gray-600">

Panel de administración Agro Valle

</p>

</div>


<button

onClick={()=>navigate("/")}

className="border-2 border-green-700 text-green-700 px-5 py-3 rounded-xl font-bold"

>

Volver

</button>


</div>





{/* PERFIL */}


<div className="bg-white rounded-3xl shadow-lg p-7">


<div className="flex items-center gap-5">


<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">

👤

</div>


<div>


<h2 className="text-2xl font-bold text-green-700">

{usuario.nombre}

</h2>


<p className="text-gray-500">

{usuario.tipoCuenta==="ganaderia"
?
"Ganadería / Empresa"
:
"Persona"}

</p>


</div>


</div>



<div className="grid md:grid-cols-2 gap-4 mt-6">


<div className="bg-green-50 p-4 rounded-xl">

<p className="text-sm text-gray-500">

WhatsApp

</p>

<p className="font-bold">

{usuario.telefono}

</p>

</div>


<div className="bg-green-50 p-4 rounded-xl">

<p className="text-sm text-gray-500">

Departamento

</p>

<p className="font-bold">

{usuario.departamento}

</p>

</div>


<div className="bg-green-50 p-4 rounded-xl">

<p className="text-sm text-gray-500">

Provincia

</p>

<p className="font-bold">

{usuario.provincia}

</p>

</div>


<div className="bg-green-50 p-4 rounded-xl">

<p className="text-sm text-gray-500">

Municipio

</p>

<p className="font-bold">

{usuario.municipio}

</p>

</div>


</div>


</div>





{/* ESTADÍSTICAS */}


<div className="bg-white rounded-3xl shadow-lg p-7 mt-6">


<h2 className="text-2xl font-bold text-green-700">

Resumen de publicaciones

</h2>



<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">


<div className="bg-green-50 rounded-xl p-4">

<p className="text-gray-500">

Total

</p>

<p className="text-3xl font-bold">

{totalPublicaciones}

</p>

</div>



<div className="bg-green-50 rounded-xl p-4">

<p className="text-gray-500">

Disponible

</p>

<p className="text-3xl font-bold text-green-700">

{disponibles}

</p>

</div>



<div className="bg-yellow-50 rounded-xl p-4">

<p className="text-gray-500">

Reservado

</p>

<p className="text-3xl font-bold text-yellow-700">

{reservados}

</p>

</div>



<div className="bg-red-50 rounded-xl p-4">

<p className="text-gray-500">

Vendido

</p>

<p className="text-3xl font-bold text-red-700">

{vendidos}

</p>

</div>


</div>


</div>





{/* PUBLICACIONES */}


<div className="bg-white rounded-3xl shadow-lg p-7 mt-6">


<div className="flex justify-between items-center">


<h2 className="text-2xl font-bold text-green-700">

Mis publicaciones

</h2>


<button

onClick={()=>navigate("/publicar-ganado")}

className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold"

>

Publicar

</button>


</div>



{
cargandoGanado

?

(

<p className="mt-6 text-green-700 font-bold">

Cargando...

</p>

)

:

misPublicaciones.length===0

?

(

<p className="mt-6 text-gray-600">

No tienes publicaciones todavía.

</p>

)

:

(

<div className="grid md:grid-cols-2 gap-5 mt-6">


{

misPublicaciones.map((animal)=>(


<div

key={animal.id}

className="border rounded-2xl overflow-hidden"

>


{

animal.imagen

?

<img

src={animal.imagen}

alt={animal.nombre}

className="w-full h-44 object-cover"

/>

:

<div className="h-44 bg-green-100 flex items-center justify-center text-5xl">

🐄

</div>

}



<div className="p-5">


<h3 className="font-bold text-green-700 text-xl">

{animal.nombre}

</h3>


<p className="text-gray-600">

{animal.raza}

</p>


<p className="font-bold mt-2">

{animal.precio}

</p>


<p className="mt-2">

Estado:

<span className="font-bold ml-2">

{animal.estado}

</span>

</p>





{/* CAMBIO DE ESTADO */}


<div className="grid grid-cols-3 gap-2 mt-4">


<button

onClick={()=>
cambiarEstadoGanado(
animal.id,
"Disponible"
)
}

className="bg-green-100 text-green-700 p-2 rounded-xl text-xs font-bold"

>

Disponible

</button>



<button

onClick={()=>
cambiarEstadoGanado(
animal.id,
"Reservado"
)
}

className="bg-yellow-100 text-yellow-700 p-2 rounded-xl text-xs font-bold"

>

Reservado

</button>



<button

onClick={()=>
cambiarEstadoGanado(
animal.id,
"Vendido"
)
}

className="bg-red-100 text-red-700 p-2 rounded-xl text-xs font-bold"

>

Vendido

</button>


</div>



<button

onClick={()=>navigate(`/ganado/${animal.id}`)}

className="w-full bg-green-700 text-white p-3 rounded-xl mt-4 font-bold"

>

Ver publicación

</button>



<button

onClick={()=>navigate(`/editar-ganado/${animal.id}`)}

className="w-full border-2 border-green-700 text-green-700 p-3 rounded-xl mt-3 font-bold"

>

Editar

</button>



<button

disabled={eliminandoId===animal.id}

onClick={()=>eliminarPublicacion(animal.id)}

className="w-full border-2 border-red-500 text-red-600 p-3 rounded-xl mt-3 font-bold"

>

{
eliminandoId===animal.id
?
"Eliminando..."
:
"Eliminar"
}

</button>


</div>


</div>


))


}


</div>

)

}


</div>
{/* MIS SOLICITUDES DE COMPRA */}


<div className="bg-white rounded-3xl shadow-lg p-7 mt-6">


<div className="flex justify-between items-center flex-wrap gap-4">


<div>

<h2 className="text-2xl font-bold text-green-700">

Mis solicitudes de compra

</h2>


<p className="text-gray-600 mt-1">

Administra el ganado que estás buscando.

</p>

</div>



<button

onClick={()=>navigate("/publicar-solicitud")}

className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold"

>

Nueva solicitud

</button>


</div>



{

cargandoSolicitudes

?

(

<p className="mt-6 text-green-700 font-bold">

Cargando solicitudes...

</p>

)

:

solicitudes.length===0

?

(

<div className="mt-6 bg-green-50 rounded-2xl p-6 text-center">


<p className="text-gray-600">

No tienes solicitudes de compra todavía.

</p>


<button

onClick={()=>navigate("/publicar-solicitud")}

className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold mt-4"

>

Publicar solicitud

</button>


</div>

)

:

(

<div className="grid md:grid-cols-2 gap-5 mt-6">


{

solicitudes.map((solicitud)=>(


<div

key={solicitud.id}

className="border rounded-2xl p-5"

>


<div className="flex justify-between items-start gap-3">


<div>


<p className="text-sm text-green-700 font-bold">

BUSCO

</p>


<h3 className="font-bold text-gray-800 text-xl mt-1">

{solicitud.titulo}

</h3>


</div>



<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">

{solicitud.estado}

</span>


</div>



<div className="mt-4 space-y-2">


<p className="text-gray-600">

<span className="font-bold">

Tipo:

</span>{" "}

{solicitud.tipo_ganado}

</p>



<p className="text-gray-600">

<span className="font-bold">

Raza:

</span>{" "}

{solicitud.raza || "Cualquier raza"}

</p>



<p className="text-gray-600">

<span className="font-bold">

Cantidad:

</span>{" "}

{
solicitud.cantidad
?
`${solicitud.cantidad} animales`
:
"No especificada"
}

</p>



<p className="text-gray-600">

<span className="font-bold">

Ubicación:

</span>{" "}

{obtenerUbicacionSolicitud(solicitud)}

</p>


</div>



<div className="bg-green-50 rounded-xl p-4 mt-4">


<p className="text-sm text-gray-500">

Presupuesto

</p>


<p className="text-xl font-bold text-green-700">

{formatearPresupuesto(
solicitud.presupuesto
)}

</p>


{solicitud.presupuesto && (

<p className="text-sm text-gray-600">

{solicitud.tipo_presupuesto || "Por cabeza"}

</p>

)}


</div>



<p className="mt-4">

Estado actual:

<span className="font-bold ml-2">

{solicitud.estado}

</span>

</p>



<div className="grid grid-cols-2 gap-2 mt-4">


<button

disabled={
cambiandoSolicitudId===solicitud.id
}

onClick={()=>
cambiarEstadoSolicitud(
solicitud.id,
"Activa"
)
}

className="bg-green-100 text-green-700 p-2 rounded-xl text-xs font-bold disabled:opacity-50"

>

Activa

</button>



<button

disabled={
cambiandoSolicitudId===solicitud.id
}

onClick={()=>
cambiarEstadoSolicitud(
solicitud.id,
"En negociación"
)
}

className="bg-yellow-100 text-yellow-700 p-2 rounded-xl text-xs font-bold disabled:opacity-50"

>

En negociación

</button>



<button

disabled={
cambiandoSolicitudId===solicitud.id
}

onClick={()=>
cambiarEstadoSolicitud(
solicitud.id,
"Compra realizada"
)
}

className="bg-blue-100 text-blue-700 p-2 rounded-xl text-xs font-bold disabled:opacity-50"

>

Compra realizada

</button>



<button

disabled={
cambiandoSolicitudId===solicitud.id
}

onClick={()=>
cambiarEstadoSolicitud(
solicitud.id,
"Cancelada"
)
}

className="bg-red-100 text-red-700 p-2 rounded-xl text-xs font-bold disabled:opacity-50"

>

Cancelada

</button>


</div>



{

cambiandoSolicitudId===solicitud.id

&&

(

<p className="text-sm text-green-700 font-bold mt-3">

Procesando...

</p>

)

}



<button

onClick={()=>
navigate(
`/solicitud/${solicitud.id}`
)
}

className="w-full bg-green-700 text-white p-3 rounded-xl mt-4 font-bold"

>

Ver solicitud

</button>



<button

onClick={()=>
navigate(
`/editar-solicitud/${solicitud.id}`
)
}

className="w-full border-2 border-green-700 text-green-700 p-3 rounded-xl mt-3 font-bold"

>

Editar solicitud

</button>



<button

disabled={
cambiandoSolicitudId===solicitud.id
}

onClick={()=>
eliminarSolicitud(
solicitud.id
)
}

className="w-full border-2 border-red-500 text-red-600 p-3 rounded-xl mt-3 font-bold disabled:opacity-50"

>

{
cambiandoSolicitudId===solicitud.id
?
"Procesando..."
:
"Eliminar solicitud"
}

</button>


</div>


))


}


</div>

)

}


</div>





{/* CUENTA */}


<div className="bg-white rounded-3xl shadow-lg p-7 mt-6">


<button

onClick={()=>navigate("/registro")}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl font-bold"

>

Editar datos personales

</button>



<button

onClick={cerrarSesion}

className="w-full border-2 border-red-500 text-red-600 p-4 rounded-xl mt-3 font-bold"

>

Cerrar sesión

</button>


</div>




</div>


</div>

)

}


export default MiCuenta