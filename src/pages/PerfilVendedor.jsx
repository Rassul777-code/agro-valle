import {useEffect,useState} from "react"
import {useNavigate,useParams} from "react-router-dom"
import {supabase} from "../supabase/client"


function PerfilVendedor(){

const {id}=useParams()

const navigate=useNavigate()

const [perfil,setPerfil]=useState(null)

const [publicaciones,setPublicaciones]=useState([])

const [cargando,setCargando]=useState(true)

const [error,setError]=useState("")


useEffect(()=>{

cargarPerfil()

},[id])


async function cargarPerfil(){

setCargando(true)

setError("")


try{


const {
data:datosPerfil,
error:errorPerfil
}=await supabase

.from("perfiles")

.select("*")

.eq("id",id)

.single()


if(errorPerfil){

throw errorPerfil

}


setPerfil(datosPerfil)



const {
data:datosPublicaciones,
error:errorPublicaciones
}=await supabase

.from("publicaciones")

.select("*")

.eq("usuario_id",id)

.order("creado_en",{
ascending:false
})


if(errorPublicaciones){

throw errorPublicaciones

}


setPublicaciones(
datosPublicaciones || []
)


}catch(error){

console.log(error)

setError(
"No se pudo cargar el perfil del vendedor."
)

}


setCargando(false)

}



function abrirWhatsApp(){

if(!perfil?.telefono){

return

}


let telefono=
perfil.telefono
.replace(/\D/g,"")


if(!telefono.startsWith("591")){

telefono=`591${telefono}`

}


const mensaje=
`Hola ${perfil.nombre || ""}, vi tus publicaciones en Agro Valle y quisiera realizar una consulta.`


window.open(

`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,

"_blank"

)

}



function formatearPrecio(precio){

const numero=Number(precio)

if(Number.isNaN(numero)){

return precio

}


return numero.toLocaleString("es-BO")

}



if(cargando){

return(

<div className="min-h-screen bg-green-50 flex items-center justify-center">

<div className="bg-white p-8 rounded-3xl shadow">

Cargando perfil...

</div>

</div>

)

}



if(error || !perfil){

return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">

<div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">

<h1 className="text-2xl font-bold text-red-600">

No se pudo cargar el perfil

</h1>


<p className="text-gray-600 mt-3">

{error}

</p>


<button

onClick={()=>navigate("/")}

className="w-full bg-green-700 text-white p-3 rounded-xl mt-6 font-bold"

>

Volver al inicio

</button>

</div>

</div>

)

}



const nombreMostrar=

perfil.nombre_ganaderia ||

perfil.nombre ||

"Vendedor Agro Valle"



const ubicacion=[

perfil.municipio,

perfil.provincia,

perfil.departamento

]
.filter(Boolean)
.join(" - ")



return(

<div className="min-h-screen bg-green-50">


{/* ENCABEZADO */}

<div className="bg-green-800 text-white">

<div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

<button

onClick={()=>navigate(-1)}

className="font-bold"

>

← Volver

</button>


<h1 className="text-xl font-bold">

Agro Valle

</h1>

</div>

</div>



<div className="max-w-6xl mx-auto p-6">


{/* PERFIL DEL VENDEDOR */}

<div className="bg-white rounded-3xl shadow-xl overflow-hidden">


<div className="bg-green-700 h-32">

</div>


<div className="p-6 md:p-8">


<div className="flex flex-col md:flex-row md:items-center gap-6">


{/* FOTO */}

<div className="-mt-20">


{

perfil.foto_ganaderia

?

<img

src={perfil.foto_ganaderia}

alt={nombreMostrar}

className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"

/>

:

<div className="w-32 h-32 rounded-full bg-green-100 border-4 border-white shadow-lg flex items-center justify-center text-5xl">

🐂

</div>

}


</div>



<div className="flex-1">


<h2 className="text-3xl font-bold text-gray-800">

{nombreMostrar}

</h2>



{

perfil.nombre_ganaderia &&

perfil.nombre && (

<p className="text-gray-600 mt-1">

Responsable: {perfil.nombre}

</p>

)

}



{

ubicacion && (

<p className="text-gray-600 mt-2">

📍 {ubicacion}

</p>

)

}



<p className="text-green-700 font-bold mt-2">

{publicaciones.length}

{

publicaciones.length===1

?

" publicación"

:

" publicaciones"

}

</p>


</div>



{

perfil.telefono && (

<button

onClick={abrirWhatsApp}

className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"

>

Contactar por WhatsApp

</button>

)

}


</div>





{/* DATOS GANADERÍA */}

{

perfil.nombre_ganaderia && (

<div className="border-t mt-7 pt-6">


<h3 className="text-xl font-bold text-green-700">

Información de la ganadería

</h3>


<div className="grid md:grid-cols-3 gap-4 mt-4">


{

perfil.tipo_productor && (

<div className="bg-green-50 rounded-xl p-4">

<p className="text-sm text-gray-500">

Tipo de productor

</p>

<p className="font-bold">

{perfil.tipo_productor}

</p>

</div>

)

}



{

perfil.tipo_ganado && (

<div className="bg-green-50 rounded-xl p-4">

<p className="text-sm text-gray-500">

Tipo de ganado

</p>

<p className="font-bold">

{perfil.tipo_ganado}

</p>

</div>

)

}



{

perfil.cantidad_animales && (

<div className="bg-green-50 rounded-xl p-4">

<p className="text-sm text-gray-500">

Cantidad de animales

</p>

<p className="font-bold">

{perfil.cantidad_animales}

</p>

</div>

)

}


</div>



{

perfil.razas_principales && (

<div className="mt-4">

<p className="text-gray-500">

Razas principales

</p>

<p className="font-bold text-gray-800">

{perfil.razas_principales}

</p>

</div>

)

}


</div>

)

}


</div>

</div>





{/* PUBLICACIONES */}

<div className="mt-10">


<h2 className="text-2xl font-bold text-green-800">

Publicaciones del vendedor

</h2>


<p className="text-gray-600 mt-1">

Ganado y productos publicados en Agro Valle

</p>




{

publicaciones.length===0

?

<div className="bg-white rounded-2xl p-8 text-center mt-6 shadow">

<p className="text-gray-600">

Este vendedor todavía no tiene publicaciones.

</p>

</div>


:

<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">


{

publicaciones.map((animal)=>(


<div

key={animal.id}

className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-xl transition"


>


{

animal.imagen

?

<img

src={animal.imagen}

alt={animal.nombre}

className="w-full h-52 object-cover"

/>

:

<div className="w-full h-52 bg-green-100 flex items-center justify-center text-5xl">

🐂

</div>

}



<div className="p-5">


<div className="flex justify-between items-start gap-3">


<h3 className="text-xl font-bold text-gray-800">

{animal.nombre}

</h3>


<span className={

animal.estado==="Disponible"

?

"bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold"

:

animal.estado==="Reservado"

?

"bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold"

:

"bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold"

}>

{animal.estado}

</span>


</div>



<p className="text-gray-600 mt-2">

{animal.raza}

</p>



<p className="text-2xl font-bold text-green-700 mt-3">

{formatearPrecio(animal.precio)} Bs

</p>



{

animal.ubicacion && (

<p className="text-sm text-gray-500 mt-2">

📍 {animal.ubicacion}

</p>

)

}



<button

onClick={()=>
navigate(`/ganado/${animal.id}`)
}

className="w-full bg-green-700 text-white p-3 rounded-xl mt-5 font-bold"

>

Ver detalles

</button>


</div>


</div>


))

}


</div>

}


</div>


</div>


</div>

)

}


export default PerfilVendedor