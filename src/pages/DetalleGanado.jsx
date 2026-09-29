import {
useContext,
useEffect,
useState
} from "react"

import {
useNavigate,
useParams
} from "react-router-dom"

import {
GanadoContext
} from "../context/GanadoContext"

import {
supabase
} from "../supabase/client"



function DetalleGanado(){


const {id}=useParams()

const navigate=useNavigate()


const {
ganado,
cargandoGanado
}=useContext(GanadoContext)



const [fotos,setFotos]=useState([])

const [fotoPrincipal,setFotoPrincipal]=useState("")

const [cargandoFotos,setCargandoFotos]=useState(true)

const [errorFotos,setErrorFotos]=useState("")





/*
========================================
BUSCAR PUBLICACIÓN
========================================
*/

const animal=ganado.find(

(item)=>String(item.id)===String(id)

)



const esEquipo=

animal?.tipo==="Equipo"







/*
========================================
CARGAR FOTOS DESDE SUPABASE
========================================
*/

useEffect(()=>{


async function cargarFotos(){


setCargandoFotos(true)

setErrorFotos("")



const {
data,
error
}=await supabase

.from("publicacion_fotos")

.select("*")

.eq(
"publicacion_id",
id
)

.order(
"orden",
{
ascending:true
}

)





if(error){


console.error(
"Error cargando fotografías:",
error
)


setErrorFotos(
"No se pudieron cargar las fotografías."
)


setCargandoFotos(false)


return

}






const fotosEncontradas=

(data || []).map(

(foto)=>foto.url

)





if(

fotosEncontradas.length===0 &&

animal?.imagen

){


setFotos([

animal.imagen

])


setFotoPrincipal(

animal.imagen

)



}else{


setFotos(

fotosEncontradas

)



if(fotosEncontradas.length>0){


setFotoPrincipal(

fotosEncontradas[0]

)


}



}



setCargandoFotos(false)



}



cargarFotos()



},[

id,

animal?.imagen

])








/*
========================================
CARGANDO PUBLICACIONES
========================================
*/

if(cargandoGanado){


return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white rounded-3xl shadow p-8 text-center">


<p className="text-green-700 font-bold">

Cargando publicación...

</p>


</div>


</div>

)

}








/*
========================================
PUBLICACIÓN NO ENCONTRADA
========================================
*/

if(!animal){


return(

<div className="min-h-screen bg-green-50 flex items-center justify-center p-6">


<div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">


<div className="text-5xl">

🐄

</div>


<h1 className="text-2xl font-bold text-green-700 mt-4">

Publicación no encontrada

</h1>


<p className="text-gray-600 mt-3">

Esta publicación ya no existe o no está disponible.

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








/*
========================================
WHATSAPP
========================================
*/

function contactarWhatsApp(){


if(!animal.telefono){


alert(

"El vendedor no tiene un número de WhatsApp registrado."

)


return

}




const telefono=

String(animal.telefono)

.replace(/\D/g,"")





const mensaje=

encodeURIComponent(

`Hola ${animal.vendedor || ""}, vi tu publicación "${animal.nombre}" en Agro Valle y quisiera más información.`

)





window.open(

`https://wa.me/591${telefono}?text=${mensaje}`,

"_blank"

)



}








/*
========================================
VER PERFIL DEL VENDEDOR
========================================
*/

function verPerfilVendedor(){


if(!animal.usuario_id){


alert(

"No se pudo encontrar el perfil de este vendedor."

)


return

}



navigate(

`/perfil-vendedor/${animal.usuario_id}`

)


}








/*
========================================
COMPARTIR PUBLICACIÓN
========================================
*/

function compartirPublicacion(){


const enlace =

`${window.location.origin}/ganado/${animal.id}`



const mensaje =

`Mira esta publicación disponible en Agro Valle

${animal.nombre}

Precio: ${animal.precio}

${enlace}`



if(navigator.share){


navigator.share({

title:"Agro Valle",

text:mensaje,

url:enlace

})


}else{


navigator.clipboard.writeText(mensaje)



alert(

"Publicación copiada para compartir."

)


}

}



return(

<div className="min-h-screen bg-green-50 p-6">


<div className="max-w-5xl mx-auto">


{/* =====================================
VOLVER
===================================== */}

<button
type="button"
onClick={()=>navigate("/")}
className="text-green-700 font-bold mb-5"
>

← Volver al inicio

</button>




<div className="grid lg:grid-cols-2 gap-7">



{/* =====================================
GALERÍA
===================================== */}

<div>


<div className="bg-white rounded-3xl shadow-lg overflow-hidden">


{cargandoFotos ? (

<div className="h-96 bg-green-50 flex items-center justify-center">

<p className="text-green-700 font-bold">

Cargando fotografías...

</p>

</div>

) : fotoPrincipal ? (

<img

src={fotoPrincipal}

alt={animal.nombre}

className="w-full h-96 object-cover"

/>

) : (

<div className="h-96 bg-green-100 flex items-center justify-center text-8xl">

{esEquipo ? "🚜" : "🐄"}

</div>

)}


</div>





{/* MINIATURAS */}

{fotos.length>1 && (

<div className="grid grid-cols-4 gap-3 mt-4">


{fotos.map((foto,index)=>(


<button

type="button"

key={`${foto}-${index}`}

onClick={()=>setFotoPrincipal(foto)}

className={

fotoPrincipal===foto

?

"border-4 border-green-700 rounded-2xl overflow-hidden"

:

"border-2 border-gray-200 rounded-2xl overflow-hidden"

}

>


<img

src={foto}

alt={`Fotografía ${index+1}`}

className="w-full h-24 object-cover"

/>


</button>


))}


</div>

)}



{errorFotos && (

<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-4">

{errorFotos}

</div>

)}



</div>







{/* =====================================
INFORMACIÓN
===================================== */}

<div className="bg-white rounded-3xl shadow-lg p-7">


<div className="flex flex-wrap justify-between items-start gap-3">


<div>


<p className="text-sm text-green-700 font-bold">

{animal.tipo || "Ganado"}

</p>


<h1 className="text-3xl font-bold text-gray-800 mt-1">

{animal.nombre}

</h1>


</div>



<span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">

{animal.estado || "Disponible"}

</span>


</div>





{/* PRECIO */}

<div className="bg-green-50 rounded-2xl p-5 mt-6">


<p className="text-sm text-gray-500">

Precio

</p>


<p className="text-3xl font-bold text-green-700 mt-1">

{animal.precio}

</p>



{animal.tipoPrecio && (

<p className="text-gray-600 mt-1">

{animal.tipoPrecio}

</p>

)}



</div>
{/* DATOS DE ANIMAL O EQUIPO */}

{esEquipo ? (

<div className="grid grid-cols-2 gap-4 mt-6">


<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Tipo de equipo

</p>

<p className="font-bold mt-1">

{animal.tipo_equipo || "No especificado"}

</p>

</div>



<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Marca

</p>

<p className="font-bold mt-1">

{animal.marca || "No especificada"}

</p>

</div>



<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Modelo

</p>

<p className="font-bold mt-1">

{animal.modelo || "No especificado"}

</p>

</div>



<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Año

</p>

<p className="font-bold mt-1">

{animal.anio || "No especificado"}

</p>

</div>



<div className="border rounded-2xl p-4 col-span-2">

<p className="text-sm text-gray-500">

Condición

</p>

<p className="font-bold mt-1">

{animal.condicion || "No especificada"}

</p>

</div>


</div>

) : (

<div className="grid grid-cols-2 gap-4 mt-6">


<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Raza

</p>

<p className="font-bold mt-1">

{animal.raza || "No especificada"}

</p>

</div>



<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Sexo

</p>

<p className="font-bold mt-1">

{animal.sexo || "No especificado"}

</p>

</div>



<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Edad

</p>

<p className="font-bold mt-1">

{animal.edad || "No especificada"}

</p>

</div>



<div className="border rounded-2xl p-4">

<p className="text-sm text-gray-500">

Peso

</p>

<p className="font-bold mt-1">

{animal.peso || "No especificado"}

</p>

</div>


</div>

)}





{/* ESTADO DE SALUD SOLO PARA ANIMALES */}

{!esEquipo && animal.salud && (

<div className="mt-6">


<h2 className="font-bold text-lg">

Estado de salud

</h2>


<p className="text-gray-600 mt-2">

{animal.salud}

</p>


</div>

)}






{/* DESCRIPCIÓN */}

{animal.descripcion && (

<div className="mt-6">


<h2 className="font-bold text-lg">

Descripción

</h2>


<p className="text-gray-600 mt-2 whitespace-pre-line">

{animal.descripcion}

</p>


</div>

)}







{/* UBICACIÓN */}

<div className="mt-6">


<h2 className="font-bold text-lg">

Ubicación

</h2>


<p className="text-gray-600 mt-2">

📍 {animal.ubicacion || "No especificada"}

</p>


</div>





{/* VENDEDOR */}

<div className="border-t mt-7 pt-6">


<p className="text-sm text-gray-500">

Publicado por

</p>


<p className="font-bold text-lg">

{animal.vendedor || "Vendedor Agro Valle"}

</p>



{animal.telefono && (

<p className="text-gray-600 mt-1">

WhatsApp: {animal.telefono}

</p>

)}



{animal.usuario_id && (

<button

type="button"

onClick={verPerfilVendedor}

className="w-full border-2 border-green-700 text-green-700 p-3 rounded-xl mt-4 font-bold"

>

Ver perfil del vendedor

</button>

)}


</div>







{/* BOTÓN WHATSAPP */}

<button

type="button"

onClick={contactarWhatsApp}

className="w-full bg-green-700 text-white p-4 rounded-xl mt-6 font-bold"

>

Contactar por WhatsApp

</button>







{/* BOTÓN COMPARTIR */}

<button

type="button"

onClick={compartirPublicacion}

className="w-full border-2 border-green-700 text-green-700 p-4 rounded-xl mt-3 font-bold"

>

Compartir publicación

</button>




</div>



</div>



</div>


</div>

)

}


export default DetalleGanado