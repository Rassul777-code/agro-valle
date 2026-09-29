import {
useContext,
useMemo,
useState
} from "react"

import {
useNavigate
} from "react-router-dom"

import {
GanadoContext
} from "../context/GanadoContext"

import SolicitudesCompra from "./SolicitudesCompra"


import toroImg from "../assets/toro.jpg"
import vacaImg from "../assets/vaca.jpg"
import caballoImg from "../assets/caballo.jpg"
import cerdoImg from "../assets/cerdo.jpg"
import cabraImg from "../assets/cabra.jpg"
import equiposImg from "../assets/equipos.jpg"



function Inicio(){


const navigate=useNavigate()



const {
ganado,
cargandoGanado
}=useContext(GanadoContext)



const [filtros,setFiltros]=useState({

buscar:"",
tipo:"",
departamento:"",
precioMax:""

})



const categorias=[

{
nombre:"Toro",
imagen:toroImg,
tipo:"Toro"
},

{
nombre:"Vaca",
imagen:vacaImg,
tipo:"Vaca"
},

{
nombre:"Caballo",
imagen:caballoImg,
tipo:"Caballo"
},

{
nombre:"Cerdo",
imagen:cerdoImg,
tipo:"Cerdo"
},

{
nombre:"Cabra",
imagen:cabraImg,
tipo:"Caprino"
},

{
nombre:"Equipos",
imagen:equiposImg,
tipo:"Equipo"
}

]




function cambiarFiltro(e){

const {
name,
value
}=e.target


setFiltros({

...filtros,

[name]:value

})

}





function seleccionarCategoria(tipo){


setFiltros({

...filtros,

tipo:tipo

})


}






const ganadoFiltrado=

useMemo(()=>{


return ganado.filter((animal)=>{


const texto=

`${animal.nombre || ""}

${animal.raza || ""}

${animal.vendedor || ""}`

.toLowerCase()



const coincideBusqueda=

texto.includes(
filtros.buscar.toLowerCase()
)



const coincideTipo=

filtros.tipo

?

animal.tipo===filtros.tipo

:

true



const coincideDepartamento=

filtros.departamento

?

animal.departamento===filtros.departamento

:

true



const precio=

Number(

String(animal.precio || "")

.replace(
" Bs",
""
)

)



const coincidePrecio=

filtros.precioMax

?

precio <= Number(filtros.precioMax)

:

true



return(

coincideBusqueda &&

coincideTipo &&

coincideDepartamento &&

coincidePrecio

)


})


},[
ganado,
filtros
])





return(

<div className="min-h-screen bg-green-50">


<header className="bg-green-700 text-white p-6 rounded-b-3xl">


<div className="max-w-6xl mx-auto">


<div className="flex justify-between items-center flex-wrap gap-4">


<div>

<h1 className="text-3xl font-bold">

Agro Valle

</h1>


<p>

Plataforma boliviana de compra y venta ganadera

</p>


</div>




<div className="flex gap-3 flex-wrap">


<button

onClick={()=>navigate("/mi-cuenta")}

className="bg-white text-green-700 px-5 py-3 rounded-xl font-bold"

>

Mi cuenta

</button>




<button

onClick={()=>navigate("/publicar-solicitud")}

className="bg-green-900 text-white px-5 py-3 rounded-xl font-bold"

>

Busco ganado

</button>




<button

onClick={()=>navigate("/publicar-ganado")}

className="border-2 border-white text-white px-5 py-3 rounded-xl font-bold"

>

Publicar ganado

</button>


</div>


</div>


</div>


</header>


<section className="max-w-6xl mx-auto p-6">



<div className="bg-white rounded-3xl shadow-lg p-6">


<h2 className="text-2xl font-bold text-gray-700">

Encuentra ganado en Bolivia

</h2>




<input

name="buscar"

value={filtros.buscar}

onChange={cambiarFiltro}

placeholder="Buscar toro, raza, vendedor..."

className="w-full border rounded-xl p-3 mt-5"

/>





<h2 className="text-xl font-bold mt-8 mb-4">

Categorías

</h2>




<div className="grid grid-cols-3 md:grid-cols-6 gap-4">


{

categorias.map((cat)=>(


<button

key={cat.nombre}

onClick={()=>seleccionarCategoria(cat.tipo)}

className="bg-white rounded-3xl shadow-lg p-3 hover:scale-105 transition"

>


<img

src={cat.imagen}

alt={cat.nombre}

className="w-full h-24 object-contain"

/>


<p className="text-center font-bold text-green-700 mt-2">

{cat.nombre}

</p>


</button>


))


}


</div>






<div className="grid md:grid-cols-2 gap-4 mt-8">


<select

name="departamento"

value={filtros.departamento}

onChange={cambiarFiltro}

className="border rounded-xl p-3"

>


<option value="">

Departamento

</option>


<option>

Santa Cruz

</option>


<option>

Cochabamba

</option>


<option>

Tarija

</option>


<option>

Beni

</option>


<option>

Chuquisaca

</option>


</select>





<input

type="number"

name="precioMax"

value={filtros.precioMax}

onChange={cambiarFiltro}

placeholder="Precio máximo"

className="border rounded-xl p-3"

/>


</div>



</div>







<div className="flex justify-between items-center mt-8">


<div>


<h2 className="text-xl font-bold">

Ganado disponible

</h2>


<p className="text-gray-600">

{ganadoFiltrado.length} resultados

</p>


</div>



<button

onClick={()=>navigate("/publicar-ganado")}

className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold"

>

Publicar ganado

</button>


</div>







{

cargandoGanado

?

(

<div className="bg-white rounded-3xl shadow p-8 mt-6 text-center">

<p className="text-green-700 font-bold">

Cargando ganado...

</p>

</div>

)



:


ganadoFiltrado.length===0



?

(

<div className="bg-white rounded-3xl shadow p-8 mt-6 text-center">

<p className="text-gray-600">

No se encontró ganado.

</p>

</div>

)



:


(

<div className="grid md:grid-cols-3 gap-6 mt-6">
    {

ganadoFiltrado.map((animal)=>(


<div

key={animal.id}

className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col h-full"

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


<div className="h-52 bg-green-100 flex items-center justify-center text-6xl">

{animal.tipo==="Equipo" ? "🚜" : "🐄"}

</div>


}







<div className="p-5 flex flex-col flex-1">



<div className="flex justify-between items-start gap-2">


<h3 className="text-xl font-bold text-green-700">

{animal.nombre}

</h3>



<span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">

{animal.estado}

</span>


</div>





{/* DATOS SEGÚN TIPO DE PUBLICACIÓN */}

{

animal.tipo==="Equipo"

?

(

<>


<p className="text-gray-600 mt-3">

Equipo: {animal.tipo_equipo || "No especificado"}

</p>


<p className="text-gray-600">

Marca: {animal.marca || "No especificada"}

</p>


</>

)

:

(

<>


<p className="text-gray-600 mt-3">

Raza: {animal.raza}

</p>


<p className="text-gray-600">

Sexo: {animal.sexo}

</p>


</>

)

}





<p className="text-gray-600">

📍 {animal.ubicacion}

</p>




<p className="text-2xl font-bold text-green-700 mt-3">

{animal.precio}

</p>





<div className="mt-auto pt-5">


<button

onClick={()=>navigate(`/ganado/${animal.id}`)}

className="w-full bg-green-700 text-white p-3 rounded-xl font-bold"

>

Ver detalles

</button>


</div>



</div>


</div>


))


}



</div>


)


}



<SolicitudesCompra/>



</section>


</div>


)

}


export default Inicio