import {useEffect,useState} from "react"
import {useNavigate} from "react-router-dom"
import {supabase} from "../supabase/client"


function SolicitudesCompra(){

const navigate=useNavigate()

const [solicitudes,setSolicitudes]=useState([])
const [cargando,setCargando]=useState(true)
const [error,setError]=useState("")


useEffect(()=>{

cargarSolicitudes()

},[])



async function cargarSolicitudes(){

setCargando(true)
setError("")

try{

const {
data,
error:errorSolicitudes
}=await supabase
.from("solicitudes_compra")
.select("*")
.eq("estado","Activa")
.order("creado_en",{
ascending:false
})


if(errorSolicitudes){

throw errorSolicitudes

}


setSolicitudes(data || [])


}catch(error){

console.error(
"Error cargando solicitudes:",
error
)

setError(
"No se pudieron cargar las solicitudes de compra."
)

}

setCargando(false)

}



function formatearPrecio(precio){

if(
precio===null ||
precio===undefined ||
precio===""
){

return "A convenir"

}


const numero=Number(precio)


if(Number.isNaN(numero)){

return `${precio} Bs`

}


return `${numero.toLocaleString("es-BO")} Bs`

}



function obtenerUbicacion(solicitud){

const partes=[
solicitud.municipio,
solicitud.provincia,
solicitud.departamento
]
.filter(Boolean)


if(partes.length===0){

return "Ubicación no especificada"

}


return partes.join(" - ")

}



function obtenerCantidad(solicitud){

if(
solicitud.cantidad===null ||
solicitud.cantidad===undefined ||
solicitud.cantidad===""
){

return "Cantidad no especificada"

}


return `${solicitud.cantidad} animales`

}



if(cargando){

return(

<div className="bg-white rounded-3xl shadow-lg p-8 mt-8 text-center">

<p className="text-green-700 font-bold">

Cargando solicitudes de compra...

</p>

</div>

)

}



if(error){

return(

<div className="bg-white rounded-3xl shadow-lg p-8 mt-8 text-center">

<p className="text-red-600 font-bold">

{error}

</p>

</div>

)

}



return(

<div className="mt-10">


<div className="flex justify-between items-center flex-wrap gap-4">


<div>

<h2 className="text-2xl font-bold text-gray-800">

Solicitudes de compra

</h2>


<p className="text-gray-600 mt-1">

Productores y compradores que están buscando ganado

</p>

</div>



<button
type="button"
onClick={()=>navigate("/publicar-solicitud")}
className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
>

Publicar solicitud

</button>


</div>



{solicitudes.length===0 ? (

<div className="bg-white rounded-3xl shadow-lg p-8 mt-6 text-center">

<p className="text-gray-600">

Todavía no hay solicitudes de compra activas.

</p>


<button
type="button"
onClick={()=>navigate("/publicar-solicitud")}
className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold mt-5"
>

Publicar la primera solicitud

</button>

</div>

) : (

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {solicitudes.map((solicitud)=>(

<div
key={solicitud.id}
className="bg-white rounded-3xl shadow-lg p-6"
>


<div className="flex justify-between items-start gap-3">


<div>

<p className="text-sm font-bold text-green-700">

BUSCAN

</p>


<h3 className="text-xl font-bold text-gray-800 mt-1">

{solicitud.titulo}

</h3>

</div>



<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">

{solicitud.estado}

</span>


</div>



<div className="mt-5 space-y-2">


<p className="text-gray-600">

<span className="font-bold text-gray-700">

Tipo:

</span>{" "}

{solicitud.tipo_ganado}

</p>



<p className="text-gray-600">

<span className="font-bold text-gray-700">

Raza:

</span>{" "}

{solicitud.raza || "Cualquier raza"}

</p>



<p className="text-gray-600">

<span className="font-bold text-gray-700">

Cantidad:

</span>{" "}

{obtenerCantidad(solicitud)}

</p>



<p className="text-gray-600">

<span className="font-bold text-gray-700">

Ubicación:

</span>{" "}

{obtenerUbicacion(solicitud)}

</p>


</div>



<div className="bg-green-50 rounded-2xl p-4 mt-5">


<p className="text-sm text-gray-500">

Presupuesto

</p>


<p className="text-xl font-bold text-green-700 mt-1">

{formatearPrecio(solicitud.presupuesto)}

</p>


{solicitud.presupuesto && (

<p className="text-sm text-gray-600 mt-1">

{solicitud.tipo_presupuesto || "Por cabeza"}

</p>

)}


</div>



{solicitud.urgencia && (

<div className="mt-4">

<p className="text-sm text-gray-500">

Urgencia

</p>


<p className="font-bold text-gray-700">

{solicitud.urgencia}

</p>

</div>

)}



<button
type="button"
onClick={()=>navigate(`/solicitud/${solicitud.id}`)}
className="w-full bg-green-700 text-white p-3 rounded-xl mt-6 font-bold"
>

Ver solicitud

</button>


</div>

))}


</div>

)}


</div>

)

}


export default SolicitudesCompra