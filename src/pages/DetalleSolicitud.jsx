import {
useEffect,
useState
} from "react"

import {
useNavigate,
useParams
} from "react-router-dom"

import {
supabase
} from "../supabase/client"



function DetalleSolicitud(){


const {id}=useParams()

const navigate=useNavigate()



const [solicitud,setSolicitud]=useState(null)

const [comprador,setComprador]=useState(null)

const [cargando,setCargando]=useState(true)

const [error,setError]=useState("")



/*
========================================
DATOS DEL USUARIO CONECTADO
========================================
*/

const [usuarioActual,setUsuarioActual]=useState(null)

const [perfilActual,setPerfilActual]=useState(null)



/*
========================================
OFERTAS
========================================
*/

const [mostrarOferta,setMostrarOferta]=useState(false)

const [misPublicaciones,setMisPublicaciones]=useState([])

const [cargandoPublicaciones,setCargandoPublicaciones]=useState(false)

const [publicacionSeleccionada,setPublicacionSeleccionada]=useState("")

const [precioOfrecido,setPrecioOfrecido]=useState("")

const [mensajeOferta,setMensajeOferta]=useState("")

const [enviandoOferta,setEnviandoOferta]=useState(false)

const [errorOferta,setErrorOferta]=useState("")

const [ofertaEnviada,setOfertaEnviada]=useState(false)





useEffect(()=>{


cargarSolicitud()

cargarUsuarioActual()


},[id])





/*
========================================
CARGAR SOLICITUD
========================================
*/

async function cargarSolicitud(){


setCargando(true)

setError("")


try{


const {
data,
error:errorSolicitud
}=await supabase
.from("solicitudes_compra")
.select("*")
.eq(
"id",
id
)
.single()



if(errorSolicitud){

throw errorSolicitud

}



setSolicitud(
data
)



if(data.usuario_id){


const {
data:datosComprador,
error:errorComprador
}=await supabase
.from("perfiles")
.select("*")
.eq(
"id",
data.usuario_id
)
.single()



if(errorComprador){


console.error(
"Error cargando comprador:",
errorComprador
)


}else{


setComprador(
datosComprador
)


}


}



}catch(error){


console.error(
"Error cargando solicitud:",
error
)


setError(
"No se pudo cargar esta solicitud de compra."
)


}



setCargando(false)


}





/*
========================================
CARGAR USUARIO ACTUAL
========================================
*/

async function cargarUsuarioActual(){


try{


const {
data,
error:usuarioError
}=await supabase.auth.getUser()



if(
usuarioError ||
!data?.user
){


setUsuarioActual(null)

setPerfilActual(null)

return

}



setUsuarioActual(
data.user
)



/*
========================================
BUSCAR PERFIL DE AGRO VALLE
========================================
*/

const {
data:perfil,
error:perfilError
}=await supabase
.from("perfiles")
.select("*")
.eq(
"auth_id",
data.user.id
)
.single()



if(perfilError){


console.error(
"Error cargando perfil actual:",
perfilError
)


setPerfilActual(null)

return

}



setPerfilActual(
perfil
)


}catch(error){


console.error(
"Error verificando usuario:",
error
)


}


}





/*
========================================
ABRIR FORMULARIO PARA OFRECER
========================================
*/

async function abrirFormularioOferta(){


setErrorOferta("")

setOfertaEnviada(false)



/*
----------------------------------------
DEBE ESTAR CONECTADO
----------------------------------------
*/

if(
!usuarioActual ||
!perfilActual
){


const irLogin=
window.confirm(
"Necesitas iniciar sesión para enviar una oferta. ¿Quieres iniciar sesión?"
)


if(irLogin){

navigate("/login")

}


return

}



/*
----------------------------------------
NO PUEDE OFERTAR A SU PROPIA SOLICITUD
----------------------------------------
*/

if(
String(perfilActual.id)===
String(solicitud.usuario_id)
){


setErrorOferta(
"No puedes enviar una oferta a tu propia solicitud de compra."
)


return

}



setMostrarOferta(true)

setCargandoPublicaciones(true)

setPublicacionSeleccionada("")

setPrecioOfrecido("")

setMensajeOferta("")



try{


/*
========================================
CARGAR PUBLICACIONES DISPONIBLES
DEL USUARIO
========================================
*/

const {
data,
error:publicacionesError
}=await supabase
.from("publicaciones")
.select("*")
.eq(
"usuario_id",
perfilActual.id
)
.eq(
"estado",
"Disponible"
)
.order(
"created_at",
{
ascending:false
}
)



if(publicacionesError){

throw publicacionesError

}



/*
========================================
FILTRAR PUBLICACIONES COMPATIBLES
========================================
*/

const publicaciones=
data || []



const tipoBuscado=
String(
solicitud.tipo_ganado || ""
)
.toLowerCase()
.trim()



const publicacionesCompatibles=
publicaciones.filter(
(publicacion)=>{


const tipoPublicacion=
String(
publicacion.tipo || ""
)
.toLowerCase()
.trim()



/*
Si por alguna razón la solicitud no
tiene tipo, mostramos todas las
publicaciones disponibles.
*/

if(!tipoBuscado){

return true

}



return(
tipoPublicacion===tipoBuscado
)


}
)



setMisPublicaciones(
publicacionesCompatibles
)



}catch(error){


console.error(
"Error cargando publicaciones:",
error
)


setErrorOferta(
"No se pudieron cargar tus publicaciones disponibles."
)


setMisPublicaciones([])


}



setCargandoPublicaciones(false)


}





/*
========================================
CERRAR FORMULARIO DE OFERTA
========================================
*/

function cerrarFormularioOferta(){


if(enviandoOferta){

return

}


setMostrarOferta(false)

setErrorOferta("")

setPublicacionSeleccionada("")

setPrecioOfrecido("")

setMensajeOferta("")


}





/*
========================================
SELECCIONAR PUBLICACIÓN
========================================
*/

function seleccionarPublicacion(idPublicacion){


setPublicacionSeleccionada(
String(idPublicacion)
)


setErrorOferta("")



const publicacion=
misPublicaciones.find(
(item)=>
String(item.id)===
String(idPublicacion)
)



if(
publicacion &&
publicacion.precio
){


setPrecioOfrecido(
String(publicacion.precio)
)


}


}
/*
========================================
ENVIAR OFERTA
========================================
*/

async function enviarOferta(){


setErrorOferta("")



if(
!usuarioActual ||
!perfilActual
){

setErrorOferta(
"Debes iniciar sesión para enviar una oferta."
)

return

}



if(!publicacionSeleccionada){

setErrorOferta(
"Selecciona una de tus publicaciones para ofrecer."
)

return

}



if(
precioOfrecido &&
Number(precioOfrecido)<=0
){

setErrorOferta(
"El precio ofrecido debe ser mayor a 0."
)

return

}



if(
String(perfilActual.id)===
String(solicitud.usuario_id)
){

setErrorOferta(
"No puedes enviar una oferta a tu propia solicitud."
)

return

}



setEnviandoOferta(true)



try{


/*
========================================
COMPROBAR QUE LA PUBLICACIÓN
PERTENECE AL USUARIO
========================================
*/

const publicacion=

misPublicaciones.find(

(item)=>
String(item.id)===
String(publicacionSeleccionada)

)



if(!publicacion){

throw new Error(
"La publicación seleccionada no es válida."
)

}





/*
========================================
COMPROBAR SI YA EXISTE UNA OFERTA
========================================
*/

const {
data:ofertaExistente,
error:errorComprobacion
}=await supabase

.from("ofertas_solicitud")

.select("id")

.eq(
"solicitud_id",
solicitud.id
)

.eq(
"publicacion_id",
publicacion.id
)

.maybeSingle()



if(errorComprobacion){

throw errorComprobacion

}



if(ofertaExistente){


setErrorOferta(
"Ya ofreciste esta publicación para esta solicitud."
)


setEnviandoOferta(false)

return

}





/*
========================================
GUARDAR OFERTA
========================================
*/

const nuevaOferta={

solicitud_id:
solicitud.id,

publicacion_id:
publicacion.id,

usuario_id:
perfilActual.id,

mensaje:
mensajeOferta.trim() || null,

precio_ofrecido:
precioOfrecido
?
Number(precioOfrecido)
:
null,

estado:
"Pendiente"

}



const {
error:errorInsertar
}=await supabase

.from("ofertas_solicitud")

.insert(
nuevaOferta
)



if(errorInsertar){

throw errorInsertar

}





/*
========================================
OFERTA ENVIADA
========================================
*/

setOfertaEnviada(true)

setPublicacionSeleccionada("")

setPrecioOfrecido("")

setMensajeOferta("")



}catch(error){


console.error(
"Error enviando oferta:",
error
)



if(
error?.code==="23505"
){

setErrorOferta(
"Ya ofreciste esta publicación para esta solicitud."
)

}else{


setErrorOferta(
error?.message ||
"No se pudo enviar la oferta."
)


}


}



setEnviandoOferta(false)


}





/*
========================================
WHATSAPP
========================================
*/

function contactarWhatsApp(){


const numero=
solicitud?.telefono ||
comprador?.telefono



if(!numero){


alert(
"El comprador no tiene un número de WhatsApp registrado."
)

return

}



let telefono=
String(numero)
.replace(/\D/g,"")



if(!telefono.startsWith("591")){

telefono=`591${telefono}`

}



const mensaje=
encodeURIComponent(

`Hola ${comprador?.nombre || ""}, vi tu solicitud "${solicitud.titulo}" en Agro Valle y quisiera conversar contigo sobre una posible oferta.`

)



window.open(

`https://wa.me/${telefono}?text=${mensaje}`,

"_blank"

)


}





/*
========================================
VER PERFIL DEL COMPRADOR
========================================
*/

function verPerfilComprador(){


if(!solicitud?.usuario_id){


alert(
"No se pudo encontrar el perfil del comprador."
)

return

}



navigate(
`/perfil-vendedor/${solicitud.usuario_id}`
)


}





/*
========================================
FORMATEAR PRECIO
========================================
*/

function formatearPrecio(precio){


if(
precio===null ||
precio===undefined ||
precio===""
){

return ""

}



const numero=
Number(precio)



if(Number.isNaN(numero)){

return precio

}



return numero.toLocaleString(
"es-BO"
)


}





/*
========================================
OBTENER UBICACIÓN
========================================
*/

function obtenerUbicacion(){


if(!solicitud){

return "No especificada"

}



const ubicacion=[

solicitud.municipio,

solicitud.provincia,

solicitud.departamento

]
.filter(Boolean)
.join(" - ")



return(
ubicacion ||
"No especificada"
)


}





/*
========================================
OBTENER EDAD
========================================
*/

function obtenerEdad(){


if(
solicitud.edad_min!==null &&
solicitud.edad_min!==undefined &&
solicitud.edad_max!==null &&
solicitud.edad_max!==undefined
){

return(
`${solicitud.edad_min} - ${solicitud.edad_max}`
)

}



if(
solicitud.edad_min!==null &&
solicitud.edad_min!==undefined
){

return(
`Desde ${solicitud.edad_min}`
)

}



if(
solicitud.edad_max!==null &&
solicitud.edad_max!==undefined
){

return(
`Hasta ${solicitud.edad_max}`
)

}



return "No especificada"


}





/*
========================================
OBTENER PESO
========================================
*/

function obtenerPeso(){


if(
solicitud.peso_min!==null &&
solicitud.peso_min!==undefined &&
solicitud.peso_max!==null &&
solicitud.peso_max!==undefined
){

return(
`${solicitud.peso_min} - ${solicitud.peso_max} kg`
)

}



if(
solicitud.peso_min!==null &&
solicitud.peso_min!==undefined
){

return(
`Desde ${solicitud.peso_min} kg`
)

}



if(
solicitud.peso_max!==null &&
solicitud.peso_max!==undefined
){

return(
`Hasta ${solicitud.peso_max} kg`
)

}



return "No especificado"


}





/*
========================================
CARGANDO
========================================
*/

if(cargando){


return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white rounded-3xl shadow-lg p-8 text-center">


<p className="text-green-700 font-bold">

Cargando solicitud...

</p>


</div>


</div>

)

}





/*
========================================
SOLICITUD NO ENCONTRADA
========================================
*/

if(error || !solicitud){


return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">


<div className="text-5xl">

🐂

</div>


<h1 className="text-2xl font-bold text-red-600 mt-4">

Solicitud no encontrada

</h1>


<p className="text-gray-600 mt-3">

{
error ||
"Esta solicitud ya no existe."
}

</p>


<button

type="button"

onClick={()=>navigate("/")}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-6 font-bold"

>

Volver al inicio

</button>


</div>


</div>

)

}





return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-4xl mx-auto">


<button

type="button"

onClick={()=>navigate("/")}

className="text-green-700 font-bold mb-5"

>

← Volver al inicio

</button>




<div className="bg-white rounded-3xl shadow-xl p-7 md:p-9">


<div className="flex flex-wrap justify-between items-start gap-4">


<div>


<p className="text-sm text-green-700 font-bold">

SOLICITUD DE COMPRA

</p>


<h1 className="text-3xl font-bold text-gray-800 mt-1">

{solicitud.titulo}

</h1>


<p className="text-gray-500 mt-2">

Buscando {solicitud.tipo_ganado}

</p>


</div>




<span

className={

solicitud.estado==="Activa"

?

"bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm"

:

solicitud.estado==="En negociación"

?

"bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold text-sm"

:

solicitud.estado==="Compra realizada"

?

"bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm"

:

"bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm"

}

>

{
solicitud.estado ||
"Activa"
}

</span>


</div>





{solicitud.urgencia && (

<div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-6">


<p className="text-sm text-gray-500">

¿Cuándo necesita comprar?

</p>


<p className="font-bold text-green-800 mt-1">

{solicitud.urgencia}

</p>


</div>

)}





<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-7">


<div className="border rounded-2xl p-4">


<p className="text-sm text-gray-500">

Tipo de ganado

</p>


<p className="font-bold mt-1">

{
solicitud.tipo_ganado ||
"No especificado"
}

</p>


</div>




<div className="border rounded-2xl p-4">


<p className="text-sm text-gray-500">

Raza

</p>


<p className="font-bold mt-1">

{
solicitud.raza ||
"Cualquier raza"
}

</p>


</div>




<div className="border rounded-2xl p-4">


<p className="text-sm text-gray-500">

Sexo

</p>


<p className="font-bold mt-1">

{
solicitud.sexo ||
"Cualquiera"
}

</p>


</div>




<div className="border rounded-2xl p-4">


<p className="text-sm text-gray-500">

Cantidad

</p>


<p className="font-bold mt-1">

{
solicitud.cantidad
?
`${solicitud.cantidad} animales`
:
"No especificada"
}

</p>


</div>




<div className="border rounded-2xl p-4">


<p className="text-sm text-gray-500">

Edad buscada

</p>


<p className="font-bold mt-1">

{obtenerEdad()}

</p>


</div>




<div className="border rounded-2xl p-4">


<p className="text-sm text-gray-500">

Peso buscado

</p>


<p className="font-bold mt-1">

{obtenerPeso()}

</p>


</div>


</div>
{/* PRESUPUESTO */}

<div className="bg-green-50 rounded-2xl p-5 mt-7">


<p className="text-sm text-gray-500">

Presupuesto máximo

</p>


{solicitud.presupuesto ? (

<>


<p className="text-3xl font-bold text-green-700 mt-1">

{formatearPrecio(solicitud.presupuesto)} Bs

</p>


<p className="text-gray-600 mt-1">

{
solicitud.tipo_presupuesto ||
"Por cabeza"
}

</p>


</>

) : (

<p className="font-bold text-gray-700 mt-1">

A convenir

</p>

)}


</div>





{/* UBICACIÓN */}

<div className="mt-7">


<h2 className="text-lg font-bold text-gray-800">

Ubicación donde busca comprar

</h2>


<p className="text-gray-600 mt-2">

📍 {obtenerUbicacion()}

</p>


</div>





{/* DESCRIPCIÓN */}

{solicitud.descripcion && (

<div className="mt-7">


<h2 className="text-lg font-bold text-gray-800">

Descripción

</h2>


<p className="text-gray-600 mt-2 whitespace-pre-line">

{solicitud.descripcion}

</p>


</div>

)}





{/* COMPRADOR */}

<div className="border-t mt-8 pt-6">


<p className="text-sm text-gray-500">

Solicitud publicada por

</p>


<p className="text-xl font-bold text-gray-800 mt-1">

{
comprador?.nombre_ganaderia ||
comprador?.nombre ||
"Comprador Agro Valle"
}

</p>



{comprador?.nombre_ganaderia && comprador?.nombre && (

<p className="text-gray-600 mt-1">

Responsable: {comprador.nombre}

</p>

)}



{solicitud.telefono && (

<p className="text-gray-600 mt-2">

WhatsApp: {solicitud.telefono}

</p>

)}



{solicitud.usuario_id && (

<button

type="button"

onClick={verPerfilComprador}

className="w-full border-2 border-green-700 text-green-700 p-3 rounded-xl mt-4 font-bold"

>

Ver perfil del comprador

</button>

)}


</div>





{/* =====================================
SISTEMA DE OFERTAS
===================================== */}


{!mostrarOferta && (

<button

type="button"

onClick={abrirFormularioOferta}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-6 font-bold"

>

Tengo ganado/equipo para ofrecer

</button>

)}





{/* ERROR AL ABRIR OFERTA */}

{errorOferta && !mostrarOferta && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-4">

{errorOferta}

</div>

)}






{/* =====================================
FORMULARIO DE OFERTA
===================================== */}

{mostrarOferta && (

<div className="border-2 border-green-200 bg-green-50 rounded-3xl p-5 mt-6">


<div className="flex justify-between items-start gap-4">


<div>


<h2 className="text-xl font-bold text-green-800">

Enviar una oferta

</h2>


<p className="text-sm text-gray-600 mt-1">

Selecciona una de tus publicaciones disponibles.

</p>


</div>



<button

type="button"

onClick={cerrarFormularioOferta}

disabled={enviandoOferta}

className="text-gray-500 font-bold text-xl"

>

×

</button>


</div>





{/* CARGANDO PUBLICACIONES */}

{cargandoPublicaciones ? (

<div className="bg-white rounded-2xl p-5 mt-5 text-center">


<p className="text-green-700 font-bold">

Cargando tus publicaciones...

</p>


</div>

) : misPublicaciones.length===0 ? (

<div className="bg-white rounded-2xl p-5 mt-5">


<p className="font-bold text-gray-800">

No tienes publicaciones compatibles disponibles.

</p>


<p className="text-sm text-gray-600 mt-2">

Para enviar una oferta necesitas tener una publicación disponible del tipo que busca el comprador.

</p>


<button

type="button"

onClick={()=>navigate("/publicar-ganado")}

className="w-full bg-green-700 text-white p-3 rounded-xl mt-4 font-bold"

>

Crear una publicación

</button>


</div>

) : (

<>


{/* PUBLICACIONES DISPONIBLES */}

<div className="grid sm:grid-cols-2 gap-4 mt-5">


{misPublicaciones.map((publicacion)=>(


<button

type="button"

key={publicacion.id}

onClick={()=>
seleccionarPublicacion(
publicacion.id
)
}

className={

String(publicacionSeleccionada)===
String(publicacion.id)

?

"bg-white border-2 border-green-700 rounded-2xl overflow-hidden text-left"

:

"bg-white border-2 border-gray-200 rounded-2xl overflow-hidden text-left"

}

>


{publicacion.imagen ? (

<img

src={publicacion.imagen}

alt={publicacion.nombre}

className="w-full h-36 object-cover"

/>

) : (

<div className="w-full h-36 bg-green-100 flex items-center justify-center text-5xl">

{
publicacion.tipo==="Equipo"
?
"🚜"
:
"🐄"
}

</div>

)}



<div className="p-4">


<div className="flex justify-between items-start gap-2">


<p className="font-bold text-green-700">

{publicacion.nombre}

</p>



{String(publicacionSeleccionada)===
String(publicacion.id) && (

<span className="bg-green-700 text-white text-xs px-2 py-1 rounded-lg">

Seleccionado

</span>

)}


</div>



{publicacion.tipo==="Equipo" ? (

<>


<p className="text-sm text-gray-600 mt-2">

Equipo: {
publicacion.tipo_equipo ||
"No especificado"
}

</p>


<p className="text-sm text-gray-600">

Marca: {
publicacion.marca ||
"No especificada"
}

</p>


</>

) : (

<>


<p className="text-sm text-gray-600 mt-2">

Raza: {
publicacion.raza ||
"No especificada"
}

</p>


<p className="text-sm text-gray-600">

Sexo: {
publicacion.sexo ||
"No especificado"
}

</p>


</>

)}



<p className="font-bold text-gray-800 mt-2">

{formatearPrecio(publicacion.precio)} Bs

</p>


</div>


</button>


))}


</div>





{/* PRECIO OFRECIDO */}

<label className="block font-bold mt-6">

Precio que ofreces (Bs)

</label>


<input

type="number"

min="0"

step="0.01"

value={precioOfrecido}

onChange={(e)=>
setPrecioOfrecido(
e.target.value
)
}

placeholder="Ej: 8500"

className="w-full bg-white border rounded-xl p-3 mt-2"

/>





{/* MENSAJE */}

<label className="block font-bold mt-5">

Mensaje para el comprador

</label>


<textarea

value={mensajeOferta}

onChange={(e)=>
setMensajeOferta(
e.target.value
)
}

rows="4"

placeholder="Ej: Tengo este animal disponible. Está vacunado y puedo coordinar transporte."

className="w-full bg-white border rounded-xl p-3 mt-2"

/>





{/* ERROR */}

{errorOferta && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-5">

{errorOferta}

</div>

)}





{/* OFERTA ENVIADA */}

{ofertaEnviada && (

<div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl mt-5">

<p className="font-bold">

Oferta enviada correctamente.

</p>


<p className="text-sm mt-1">

El comprador podrá revisar tu publicación y tu propuesta.

</p>

</div>

)}





{/* ENVIAR */}

<button

type="button"

onClick={enviarOferta}

disabled={
enviandoOferta ||
!publicacionSeleccionada
}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"

>

{
enviandoOferta
?
"Enviando oferta..."
:
"Enviar oferta"
}

</button>


</>

)}


</div>

)}






{/* =====================================
WHATSAPP
===================================== */}

<button

type="button"

onClick={contactarWhatsApp}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-4 font-bold"

>

Contactar por WhatsApp

</button>


<p className="text-sm text-gray-500 text-center mt-3">

También puedes contactar directamente al comprador por WhatsApp.

</p>



</div>


</div>


</div>

)

}


export default DetalleSolicitud